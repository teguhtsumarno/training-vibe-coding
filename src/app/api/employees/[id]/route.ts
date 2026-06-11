import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function hashPassword(password: string): string {
  if (!password) return password;
  return typeof btoa === "function" ? btoa(password).split("").reverse().join("") : Buffer.from(password).toString("base64").split("").reverse().join("");
}

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
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error("GET employee by ID API error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch employee" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    const { name, department, position, username, password, role } = body;

    // Check username uniqueness if changing
    if (username && username !== existing.username) {
      const uExists = await prisma.employee.findUnique({
        where: { username },
      });
      if (uExists) {
        return NextResponse.json({ success: false, error: "Username already exists" }, { status: 400 });
      }
    }

    const updated = await prisma.employee.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(username !== undefined && { username: username || null }),
        ...(password !== undefined && password !== "" && { password: hashPassword(password) }),
        ...(role !== undefined && { role }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("PUT employee API error:", error);
    return NextResponse.json({ success: false, error: "Failed to update employee" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Employee not found" }, { status: 404 });
    }

    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Employee deleted successfully" });
  } catch (error) {
    console.error("DELETE employee API error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete employee" }, { status: 500 });
  }
}
