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
    return NextResponse.json({ success: false, error: "Gagal mengambil data saldo cuti" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Jenis cuti dan jumlah saldo wajib diisi" }, { status: 400 });
    }

    const balanceNum = Number(balance);
    if (isNaN(balanceNum) || balanceNum < 0) {
      return NextResponse.json({ success: false, error: "Jumlah saldo tidak boleh negatif" }, { status: 400 });
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
    return NextResponse.json({ success: false, error: "Gagal memperbarui saldo cuti" }, { status: 500 });
  }
}
