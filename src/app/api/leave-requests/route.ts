import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const requests = await prisma.leaveRequest.findMany();
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("GET leave requests API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch leave requests" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, approval1Id, startDate, endDate, reason } = body;

    if (!employeeId || !approval1Id || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    const newRequest = await prisma.leaveRequest.create({
      data: {
        employeeId,
        approval1Id,
        startDate,
        endDate,
        reason,
        status: "PENDING_APPROVAL1", // Default status
        history: {
          create: {
            action: "CREATED",
            actorId: employeeId,
            actorName: employee ? employee.name : "Employee",
          },
        },
      },
      include: {
        history: true,
      },
    });

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    console.error("POST leave request API error:", error);
    return NextResponse.json({ success: false, error: "Failed to create leave request" }, { status: 500 });
  }
}
