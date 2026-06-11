import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function hashPassword(password: string): string {
  if (!password) return password;
  return typeof btoa === "function" ? btoa(password).split("").reverse().join("") : Buffer.from(password).toString("base64").split("").reverse().join("");
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password are required" }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({
      where: { username },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 });
    }

    const isMatch = employee.password === password || employee.password === hashPassword(password);

    if (isMatch) {
      // Migrate plaintext password to hashed if it was stored as plaintext
      if (employee.password === password) {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { password: hashPassword(password) },
        });
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

    return NextResponse.json({ success: false, error: "Invalid username or password" }, { status: 401 });
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
