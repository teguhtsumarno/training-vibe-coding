import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, isBcryptHash } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username dan password wajib diisi" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { username },
    });

    if (!employee || !employee.password) {
      return NextResponse.json({ success: false, error: "Username atau password salah" }, { status: 401 });
    }

    // Try bcrypt first, then legacy hash, then plaintext (for migration)
    const isMatch = await verifyPassword(password, employee.password);

    if (isMatch) {
      // Migrate to bcrypt if not already using it
      if (!isBcryptHash(employee.password)) {
        const bcryptHash = await hashPassword(password);
        await prisma.employee.update({
          where: { id: employee.id },
          data: { password: bcryptHash },
        });
        console.log(`[Auth] Migrated password for ${username} to bcrypt`);
      }

      return NextResponse.json({
        success: true,
        session: {
          username: employee.username || username,
          role: employee.role,
          employeeId: employee.id,
          isAuthenticated: true,
          loginAt: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({ success: false, error: "Username atau password salah" }, { status: 401 });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ success: false, error: "Terjadi kesalahan pada server" }, { status: 500 });
  }
}
