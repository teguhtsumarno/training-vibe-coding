import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const balances = await prisma.employeeLeaveBalance.findMany({
      where: { employeeId: id },
      include: {
        leaveType: true,
      },
      orderBy: {
        leaveType: { name: "asc" },
      },
    });

    return NextResponse.json({ success: true, data: balances });
  } catch (error) {
    console.error("GET employee leave balances API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch leave balances" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { leaveTypeId, balance } = body;

    if (!leaveTypeId || balance === undefined) {
      return NextResponse.json({ success: false, error: "leaveTypeId and balance are required" }, { status: 400 });
    }

    const updated = await prisma.employeeLeaveBalance.upsert({
      where: {
        employeeId_leaveTypeId: {
          employeeId: id,
          leaveTypeId,
        },
      },
      update: {
        balance: Number(balance),
      },
      create: {
        employeeId: id,
        leaveTypeId,
        balance: Number(balance),
      },
      include: {
        leaveType: true,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT employee leave balance API error:", error);
    return NextResponse.json({ success: false, error: "Failed to update leave balance" }, { status: 500 });
  }
}
