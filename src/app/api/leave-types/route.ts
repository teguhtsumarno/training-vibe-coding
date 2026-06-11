import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const leaveTypes = await prisma.leaveType.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: leaveTypes });
  } catch (error) {
    console.error("GET leave types API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch leave types" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, defaultBalance, description } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    // Check uniqueness
    const existing = await prisma.leaveType.findUnique({ where: { name } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Jenis cuti dengan nama ini sudah ada" }, { status: 400 });
    }

    const leaveType = await prisma.$transaction(async (tx) => {
      // 1. Create the leave type
      const created = await tx.leaveType.create({
        data: {
          name,
          defaultBalance: defaultBalance !== undefined ? Number(defaultBalance) : 12,
          description: description || null,
        },
      });

      // 2. Auto-assign balance to all existing employees
      const allEmployees = await tx.employee.findMany({ select: { id: true } });
      if (allEmployees.length > 0) {
        await tx.employeeLeaveBalance.createMany({
          data: allEmployees.map((emp) => ({
            employeeId: emp.id,
            leaveTypeId: created.id,
            balance: created.defaultBalance,
          })),
        });
      }

      return created;
    });

    return NextResponse.json({ success: true, data: leaveType }, { status: 201 });
  } catch (error) {
    console.error("POST leave type API error:", error);
    return NextResponse.json({ success: false, error: "Failed to create leave type" }, { status: 500 });
  }
}
