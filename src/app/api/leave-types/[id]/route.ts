import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const leaveType = await prisma.leaveType.findUnique({ where: { id } });

    if (!leaveType) {
      return NextResponse.json({ success: false, error: "Jenis cuti tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: leaveType });
  } catch (error) {
    console.error("GET leave type by ID API error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil data jenis cuti" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, defaultBalance, description } = body;

    const existing = await prisma.leaveType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Jenis cuti tidak ditemukan" }, { status: 404 });
    }

    // Check name uniqueness if name is being changed
    if (name && name !== existing.name) {
      const nameExists = await prisma.leaveType.findUnique({ where: { name } });
      if (nameExists) {
        return NextResponse.json({ success: false, error: "Jenis cuti dengan nama ini sudah ada" }, { status: 400 });
      }
    }

    const updated = await prisma.leaveType.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(defaultBalance !== undefined && { defaultBalance: Number(defaultBalance) }),
        ...(description !== undefined && { description: description || null }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT leave type API error:", error);
    return NextResponse.json({ success: false, error: "Gagal memperbarui jenis cuti" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await prisma.leaveType.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Jenis cuti tidak ditemukan" }, { status: 404 });
    }

    // Check if any leave requests reference this type
    const activeRequests = await prisma.leaveRequest.count({
      where: { leaveTypeId: id },
    });

    if (activeRequests > 0) {
      return NextResponse.json({
        success: false,
        error: `Tidak dapat menghapus jenis cuti ini karena masih ada ${activeRequests} pengajuan cuti yang menggunakan jenis cuti ini.`,
      }, { status: 400 });
    }

    // Delete the leave type (cascades to EmployeeLeaveBalance)
    await prisma.leaveType.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Jenis cuti berhasil dihapus" });
  } catch (error) {
    console.error("DELETE leave type API error:", error);
    return NextResponse.json({ success: false, error: "Gagal menghapus jenis cuti" }, { status: 500 });
  }
}
