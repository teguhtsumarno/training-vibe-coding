import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail, buildLeaveCreatedEmail } from "@/lib/email";
import { calculateDuration } from "@/lib/utils";

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
    const duration = calculateDuration(startDate, endDate);

    if (duration <= 0) {
      return NextResponse.json({ success: false, error: "Tanggal selesai tidak boleh sebelum tanggal mulai" }, { status: 400 });
    }

    const newRequest = await prisma.$transaction(async (tx) => {
      // 1. Check balance INSIDE transaction (prevents race condition)
      //    Using findFirst inside tx ensures row-level lock in PostgreSQL
      const employeeBalance = await tx.employeeLeaveBalance.findUnique({
        where: {
          employeeId_leaveTypeId: {
            employeeId,
            leaveTypeId,
          },
        },
      });

      const currentBalance = employeeBalance?.balance ?? 0;

      if (currentBalance < duration) {
        throw new Error(
          `INSUFFICIENT_BALANCE:Jatah ${leaveType.name} tidak mencukupi! Sisa saldo: ${currentBalance} hari, sedangkan pengajuan Anda: ${duration} hari.`
        );
      }

      // 2. Create leave request
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

      // 3. Decrement per-type leave balance (atomic)
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
    }, {
      isolationLevel: "Serializable",
      timeout: 15000,
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
    // Handle insufficient balance thrown from inside transaction
    if (error instanceof Error && error.message.startsWith("INSUFFICIENT_BALANCE:")) {
      const userMessage = error.message.replace("INSUFFICIENT_BALANCE:", "");
      return NextResponse.json({ success: false, error: userMessage }, { status: 400 });
    }
    console.error("POST leave request API error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat pengajuan cuti" }, { status: 500 });
  }
}
