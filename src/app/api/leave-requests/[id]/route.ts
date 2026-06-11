import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, employeeId, approval1Id, startDate, endDate, reason, actorId } = body;

    if (!status && !employeeId && !approval1Id && !startDate && !endDate && !reason) {
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
      reason !== undefined
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

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(employeeId !== undefined && { employeeId }),
        ...(approval1Id !== undefined && { approval1Id }),
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
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
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

    await prisma.leaveRequest.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Leave request deleted successfully" });
  } catch (error) {
    console.error("DELETE leave request API error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete leave request" }, { status: 500 });
  }
}
