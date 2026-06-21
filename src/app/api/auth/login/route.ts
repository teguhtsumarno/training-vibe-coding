import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

// Legacy hash for backward compatibility during migration
function legacyHash(password: string): string {
  if (!password) return password;
  return typeof btoa === "function" ? btoa(password).split("").reverse().join("") : Buffer.from(password).toString("base64").split("").reverse().join("");
}

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
    let isMatch = false;
    const isBcryptHash = employee.password.startsWith("$2a$") || employee.password.startsWith("$2b$");

    if (isBcryptHash) {
      isMatch = await bcrypt.compare(password, employee.password);
    } else {
      // Legacy: check old Base64+Reverse hash or plaintext
      isMatch = employee.password === legacyHash(password) || employee.password === password;
    }

    if (isMatch) {
      // Migrate to bcrypt if not already using it
      if (!isBcryptHash) {
        const bcryptHash = await bcrypt.hash(password, SALT_ROUNDS);
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
