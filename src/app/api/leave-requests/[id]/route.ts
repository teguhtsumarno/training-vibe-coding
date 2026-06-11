import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildApprovalL1Email, buildFinalApprovalEmail, buildRejectionEmail } from "@/lib/email";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, employeeId, approval1Id, leaveTypeId, startDate, endDate, reason, actorId } = body;

    if (!status && !employeeId && !approval1Id && !startDate && !endDate && !reason && !leaveTypeId) {
      return NextResponse.json({ success: false, error: "No update fields provided" }, { status: 400 });
    }

    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 });
    }

    // Determine the history action
    let action: string | null = null;
    let computedActorId = actorId;

    if (status !== undefined && status !== existing.status) {
      if (status === "PENDING_APPROVAL2") {
        action = "APPROVED_L1";
      } else if (status === "APPROVED") {
        action = "APPROVED";
      } else if (status === "REJECTED") {
        action = "REJECTED";
      }
    } else if (
      employeeId !== undefined ||
      approval1Id !== undefined ||
      startDate !== undefined ||
      endDate !== undefined ||
      reason !== undefined ||
      leaveTypeId !== undefined
    ) {
      action = "UPDATED";
      if (!computedActorId) {
        computedActorId = employeeId || existing.employeeId;
      }
    }

    let actorNameResolved = "System";
    if (computedActorId) {
      const actor = await prisma.employee.findUnique({ where: { id: computedActorId } });
      if (actor) {
        actorNameResolved = actor.name;
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Calculate duration change if dates are updated
      const newStartDate = startDate || existing.startDate;
      const newEndDate = endDate || existing.endDate;
      let durationDiff = 0;

      if (startDate !== undefined || endDate !== undefined) {
        const oldStart = new Date(existing.startDate);
        const oldEnd = new Date(existing.endDate);
        const oldDuration = Math.round((oldEnd.getTime() - oldStart.getTime()) / (1000 * 3600 * 24)) + 1;

        const newStart = new Date(newStartDate);
        const newEnd = new Date(newEndDate);
        const newDuration = Math.round((newEnd.getTime() - newStart.getTime()) / (1000 * 3600 * 24)) + 1;

        durationDiff = newDuration - oldDuration;
      }

      // Use existing leaveTypeId for balance operations
      const targetLeaveTypeId = existing.leaveTypeId;

      // 3. Handle edit duration changes (per leave type)
      if (durationDiff !== 0 && targetLeaveTypeId) {
        const balance = await tx.employeeLeaveBalance.findUnique({
          where: {
            employeeId_leaveTypeId: {
              employeeId: existing.employeeId,
              leaveTypeId: targetLeaveTypeId,
            },
          },
        });

        if (!balance || balance.balance < durationDiff) {
          throw new Error("INSUFFICIENT_BALANCE");
        }
        
        await tx.employeeLeaveBalance.update({
          where: {
            employeeId_leaveTypeId: {
              employeeId: existing.employeeId,
              leaveTypeId: targetLeaveTypeId,
            },
          },
          data: { balance: { decrement: durationDiff } },
        });
      }

      // 4. Handle rejection refund (per leave type)
      if (status === "REJECTED" && existing.status !== "REJECTED" && targetLeaveTypeId) {
        const start = new Date(existing.startDate);
        const end = new Date(existing.endDate);
        const currentDuration = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

        await tx.employeeLeaveBalance.update({
          where: {
            employeeId_leaveTypeId: {
              employeeId: existing.employeeId,
              leaveTypeId: targetLeaveTypeId,
            },
          },
          data: { balance: { increment: currentDuration } },
        });
      }

      // 5. Update request
      return tx.leaveRequest.update({
        where: { id },
        data: {
          ...(status !== undefined && { status }),
          ...(employeeId !== undefined && { employeeId }),
          ...(approval1Id !== undefined && { approval1Id }),
          ...(leaveTypeId !== undefined && { leaveTypeId }),
          ...(startDate !== undefined && { startDate }),
          ...(endDate !== undefined && { endDate }),
          ...(reason !== undefined && { reason }),
          ...(action && {
            history: {
              create: {
                action,
                actorId: computedActorId || null,
                actorName: actorNameResolved,
              },
            },
          }),
        },
        include: {
          history: true,
          leaveType: true,
        },
      });
    });

    // Send email notifications based on status change
    if (status !== undefined && status !== existing.status) {
      try {
        const leaveTypeName = updated.leaveType?.name || "Cuti";
        console.log("[Email Debug] Status changed:", existing.status, "→", status);

        if (status === "PENDING_APPROVAL2") {
          // L1 approved → notify all approval2 users
          const approver1 = await prisma.employee.findUnique({ where: { id: existing.approval1Id } });
          const approval2Users = await prisma.employee.findMany({ where: { role: "approval2" } });
          console.log("[Email Debug] Found", approval2Users.length, "approval2 users");
          const empData = await prisma.employee.findUnique({ where: { id: existing.employeeId } });
          for (const a2 of approval2Users) {
            if (a2.email) {
              const emailData = buildApprovalL1Email({
                employeeName: empData?.name || "Employee",
                leaveTypeName,
                startDate: existing.startDate,
                endDate: existing.endDate,
                reason: existing.reason,
                approver1Name: approver1?.name || "Approver L1",
                approver2Name: a2.name,
              });
              const result = await sendEmail({ to: a2.email, ...emailData });
              console.log("[Email Debug] L1→L2 email to", a2.email, "result:", result);
            } else {
              console.log("[Email Debug] approval2 user", a2.name, "has no email, skipping");
            }
          }
        } else if (status === "APPROVED") {
          // L2 approved → notify employee
          const employee = await prisma.employee.findUnique({ where: { id: existing.employeeId } });
          console.log("[Email Debug] Employee:", employee?.name, "email:", employee?.email);
          if (employee?.email) {
            const emailData = buildFinalApprovalEmail({
              employeeName: employee.name,
              leaveTypeName,
              startDate: existing.startDate,
              endDate: existing.endDate,
            });
            const result = await sendEmail({ to: employee.email, ...emailData });
            console.log("[Email Debug] Approval email to", employee.email, "result:", result);
          } else {
            console.log("[Email Debug] Employee has no email, skipping notification");
          }
        } else if (status === "REJECTED") {
          // Rejected → notify employee
          const employee = await prisma.employee.findUnique({ where: { id: existing.employeeId } });
          console.log("[Email Debug] Employee:", employee?.name, "email:", employee?.email);
          if (employee?.email) {
            const emailData = buildRejectionEmail({
              employeeName: employee.name,
              leaveTypeName,
              startDate: existing.startDate,
              endDate: existing.endDate,
              rejectorName: actorNameResolved,
            });
            const result = await sendEmail({ to: employee.email, ...emailData });
            console.log("[Email Debug] Rejection email to", employee.email, "result:", result);
          } else {
            console.log("[Email Debug] Employee has no email, skipping notification");
          }
        }
      } catch (emailError) {
        console.error("[Email Debug] Failed to send notification:", emailError);
      }
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ success: false, error: "Jatah cuti tidak mencukupi" }, { status: 400 });
    }
    console.error("PUT leave request API error:", error);
    return NextResponse.json({ success: false, error: "Failed to update leave request" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Leave request not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Refund balance if status was NOT REJECTED (per leave type)
      if (existing.status !== "REJECTED" && existing.leaveTypeId) {
        const start = new Date(existing.startDate);
        const end = new Date(existing.endDate);
        const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

        await tx.employeeLeaveBalance.update({
          where: {
            employeeId_leaveTypeId: {
              employeeId: existing.employeeId,
              leaveTypeId: existing.leaveTypeId,
            },
          },
          data: { balance: { increment: duration } },
        });
      }

      await tx.leaveRequest.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Leave request deleted successfully" });
  } catch (error) {
    console.error("DELETE leave request API error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete leave request" }, { status: 500 });
  }
}
