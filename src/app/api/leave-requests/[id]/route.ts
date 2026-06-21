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
    const { status, employeeId, approval1Id, leaveTypeId, startDate, endDate, reason, actorId, message } = body;

    if (!status && !employeeId && !approval1Id && !startDate && !endDate && !reason && !leaveTypeId) {
      return NextResponse.json({ success: false, error: "Tidak ada data yang diperbarui" }, { status: 400 });
    }

    const existing = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Pengajuan cuti tidak ditemukan" }, { status: 404 });
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
                message: message || null,
              },
            },
          }),
        },
        include: {
          history: true,
          leaveType: true,
        },
      });
    }, { timeout: 15000 });

    // Fire-and-forget: send email notifications in background (non-blocking)
    if (status !== undefined && status !== existing.status) {
      (async () => {
        try {
          const leaveTypeName = updated.leaveType?.name || "Cuti";
          console.log("[Email] Status changed:", existing.status, "→", status);

          if (status === "PENDING_APPROVAL2") {
            const approver1 = await prisma.employee.findUnique({ where: { id: existing.approval1Id } });
            const approval2Users = await prisma.employee.findMany({ where: { role: "approval2" } });
            const empData = await prisma.employee.findUnique({ where: { id: existing.employeeId } });
            for (const a2 of approval2Users) {
              if (a2.email) {
                const emailData = buildApprovalL1Email({
                  employeeName: empData?.name || "Karyawan",
                  leaveTypeName,
                  startDate: existing.startDate,
                  endDate: existing.endDate,
                  reason: existing.reason,
                  approver1Name: approver1?.name || "Approval L1",
                  approver2Name: a2.name,
                });
                sendEmail({ to: a2.email, ...emailData }).then(r => console.log("[Email] L1→L2 to", a2.email, ":", r));
              }
            }
          } else if (status === "APPROVED") {
            const employee = await prisma.employee.findUnique({ where: { id: existing.employeeId } });
            if (employee?.email) {
              const emailData = buildFinalApprovalEmail({
                employeeName: employee.name,
                leaveTypeName,
                startDate: existing.startDate,
                endDate: existing.endDate,
              });
              sendEmail({ to: employee.email, ...emailData }).then(r => console.log("[Email] Approval to", employee.email, ":", r));
            }
          } else if (status === "REJECTED") {
            const employee = await prisma.employee.findUnique({ where: { id: existing.employeeId } });
            if (employee?.email) {
              const emailData = buildRejectionEmail({
                employeeName: employee.name,
                leaveTypeName,
                startDate: existing.startDate,
                endDate: existing.endDate,
                rejectorName: actorNameResolved,
              });
              sendEmail({ to: employee.email, ...emailData }).then(r => console.log("[Email] Rejection to", employee.email, ":", r));
            }
          }
        } catch (emailError) {
          console.error("[Email] Background send failed:", emailError);
        }
      })();
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    if (error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json({ success: false, error: "Jatah cuti tidak mencukupi" }, { status: 400 });
    }
    console.error("PUT leave request API error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui pengajuan cuti" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Pengajuan cuti tidak ditemukan" }, { status: 404 });
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
    return NextResponse.json({ success: false, error: "Gagal menghapus pengajuan cuti" }, { status: 500 });
  }
}
