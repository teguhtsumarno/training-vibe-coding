import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id },
    });

    if (!leaveRequest) {
      return NextResponse.json({ success: false, error: "Pengajuan cuti tidak ditemukan" }, { status: 404 });
    }

    const history = await prisma.approvalHistory.findMany({
      where: { leaveRequestId: id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    console.error("GET leave request history API error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil riwayat persetujuan" }, { status: 500 });
  }
}
