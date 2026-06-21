import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET() {
  try {
    const employees = await prisma.employee.findMany();
    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error("GET employees API error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data karyawan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, department, position, username, password, email, role } = body;

    if (!name || !department || !position || !role) {
      return NextResponse.json({ success: false, error: "Data yang diperlukan belum lengkap" }, { status: 400 });
    }

    // Check unique username if provided
    if (username) {
      const existing = await prisma.employee.findUnique({
        where: { username },
      });
      if (existing) {
        return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 400 });
      }
    }

    const newEmployee = await prisma.$transaction(async (tx) => {
      // 1. Create employee
      const emp = await tx.employee.create({
        data: {
          name,
          department,
          position,
          username: username || null,
          password: password ? await hashPassword(password) : null,
          email: email || null,
          role,
        },
      });

      // 2. Auto-assign leave balances only for role "user"
      if (role === "user") {
        const leaveTypes = await tx.leaveType.findMany();
        if (leaveTypes.length > 0) {
          await tx.employeeLeaveBalance.createMany({
            data: leaveTypes.map((lt) => ({
              employeeId: emp.id,
              leaveTypeId: lt.id,
              balance: lt.defaultBalance,
            })),
          });
        }
      }

      return emp;
    });

    return NextResponse.json({ success: true, data: newEmployee }, { status: 201 });
  } catch (error) {
    console.error("POST employee API error:", error);
    return NextResponse.json({ success: false, error: "Gagal membuat data karyawan" }, { status: 500 });
  }
}
