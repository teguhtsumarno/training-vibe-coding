import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildLeaveCreatedEmail } from "@/lib/email";

export async function GET() {
  try {
    const requests = await prisma.leaveRequest.findMany({
      include: {
        leaveType: true,
      },
    });
    return NextResponse.json({ success: true, data: requests });
  } catch (error) {
    console.error("GET leave requests API error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data pengajuan cuti" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { employeeId, approval1Id, leaveTypeId, startDate, endDate, reason } = body;

    if (!employeeId || !approval1Id || !leaveTypeId || !startDate || !endDate || !reason) {
      return NextResponse.json({ success: false, error: "Data yang diperlukan belum lengkap" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Data karyawan tidak ditemukan" }, { status: 404 });
    }

    // Verify leave type exists
    const leaveType = await prisma.leaveType.findUnique({
      where: { id: leaveTypeId },
    });

    if (!leaveType) {
      return NextResponse.json({ success: false, error: "Jenis cuti tidak ditemukan" }, { status: 404 });
    }

    // Calculate duration in days (inclusive)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

    if (duration <= 0) {
      return NextResponse.json({ success: false, error: "Tanggal selesai tidak boleh sebelum tanggal mulai" }, { status: 400 });
    }

    // Check per-type balance
    const employeeBalance = await prisma.employeeLeaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId: {
          employeeId,
          leaveTypeId,
        },
      },
    });

    const currentBalance = employeeBalance?.balance ?? 0;

    if (currentBalance < duration) {
      return NextResponse.json({ 
        success: false, 
        error: `Jatah ${leaveType.name} tidak mencukupi! Sisa saldo: ${currentBalance} hari, sedangkan pengajuan Anda: ${duration} hari.` 
      }, { status: 400 });
    }

    const newRequest = await prisma.$transaction(async (tx) => {
      // 1. Create leave request
      const reqCreated = await tx.leaveRequest.create({
        data: {
          employeeId,
          approval1Id,
          leaveTypeId,
          startDate,
          endDate,
          reason,
          status: "PENDING_APPROVAL1",
          history: {
            create: {
              action: "CREATED",
              actorId: employeeId,
              actorName: employee.name,
            },
          },
        },
        include: {
          history: true,
          leaveType: true,
        },
      });

      // 2. Decrement per-type leave balance
      await tx.employeeLeaveBalance.update({
        where: {
          employeeId_leaveTypeId: {
            employeeId,
            leaveTypeId,
          },
        },
        data: {
          balance: {
            decrement: duration,
          },
        },
      });

      return reqCreated;
    });

    // Fire-and-forget: send email notification to Approval L1 in background
    (async () => {
      try {
        const approver = await prisma.employee.findUnique({ where: { id: approval1Id } });
        if (approver?.email) {
          const emailData = buildLeaveCreatedEmail({
            employeeName: employee.name,
            leaveTypeName: leaveType.name,
            startDate,
            endDate,
            reason,
            approverName: approver.name,
          });
          sendEmail({ to: approver.email, ...emailData }).then(r => console.log("[Email] Notification to L1:", r));
        }
      } catch (emailError) {
        console.error("[Email] Background send failed:", emailError);
      }
    })();

    return NextResponse.json({ success: true, data: newRequest }, { status: 201 });
  } catch (error) {
    console.error("POST leave request API error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat pengajuan cuti" }, { status: 500 });
  }
}
