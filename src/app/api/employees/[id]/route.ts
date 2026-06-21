import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const employee = await prisma.employee.findUnique({
      where: { id },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Data karyawan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error("GET employee by ID API error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data karyawan" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    
    // Check if employee exists
    const existing = await prisma.employee.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Data karyawan tidak ditemukan" }, { status: 404 });
    }

    const { name, department, position, username, password, email, role } = body;

    // Check username uniqueness if changing
    if (username && username !== existing.username) {
      const uExists = await prisma.employee.findUnique({
        where: { username },
      });
      if (uExists) {
        return NextResponse.json({ success: false, error: "Username sudah digunakan" }, { status: 400 });
      }
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(username !== undefined && { username: username || null }),
        ...(password !== undefined && password !== "" && { password: await hashPassword(password) }),
        ...(email !== undefined && { email: email || null }),
        ...(role !== undefined && { role }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT employee API error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui data karyawan" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check if employee exists
    const existing = await prisma.employee.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Data karyawan tidak ditemukan" }, { status: 404 });
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Data karyawan berhasil dihapus" });
  } catch (error) {
    console.error("DELETE employee API error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus data karyawan" }, { status: 500 });
  }
}
