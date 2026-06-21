import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function GET() {
  try {
    const settings = await prisma.smtpSettings.findUnique({
      where: { id: "singleton" },
    });

    if (!settings) {
      return NextResponse.json({ success: true, data: null });
    }

    // Don't expose password in GET response
    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        password: settings.password ? "••••••••" : "",
      },
    });
  } catch (error) {
    console.error("GET SMTP settings error:", error);
    return NextResponse.json({ success: false, error: "Gagal mengambil pengaturan SMTP" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { host, port, secure, user, password, fromName, fromEmail, enabled } = body;

    if (!host || !user || !fromEmail) {
      return NextResponse.json({ success: false, error: "Host, User, dan From Email wajib diisi" }, { status: 400 });
    }

    const existing = await prisma.smtpSettings.findUnique({
      where: { id: "singleton" },
    });

    const dataToSave = {
      host,
      port: port !== undefined ? Number(port) : 587,
      secure: secure !== undefined ? Boolean(secure) : false,
      user,
      fromName: fromName || "Leave Management System",
      fromEmail,
      enabled: enabled === false ? false : true,
    };

    console.log("[SMTP API] Saving settings - enabled:", enabled, "→", dataToSave.enabled);

    // Only update password if it's provided and not the masked version
    if (password && password !== "••••••••") {
      dataToSave.password = password;
    } else if (existing) {
      dataToSave.password = existing.password;
    } else {
      dataToSave.password = "";
    }

    const settings = await prisma.smtpSettings.upsert({
      where: { id: "singleton" },
      update: dataToSave,
      create: {
        id: "singleton",
        ...dataToSave,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...settings,
        password: "••••••••",
      },
    });
  } catch (error) {
    console.error("PUT SMTP settings error:", error);
    return NextResponse.json({ success: false, error: "Gagal menyimpan pengaturan SMTP" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  // Test SMTP connection
  try {
    const body = await req.json();
    const { host, port, secure, user, password, fromEmail, testRecipient } = body;

    if (!host || !user || !fromEmail || !testRecipient) {
      return NextResponse.json({ success: false, error: "Semua field termasuk penerima uji coba wajib diisi" }, { status: 400 });
    }

    // Get actual password (if masked, read from DB)
    let actualPassword = password;
    if (password === "••••••••") {
      const existing = await prisma.smtpSettings.findUnique({ where: { id: "singleton" } });
      actualPassword = existing?.password || "";
    }

    const transporter = nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: Boolean(secure),
      auth: {
        user,
        pass: actualPassword,
      },
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"Leave Management System" <${fromEmail}>`,
      to: testRecipient,
      subject: "🧪 Test Email — Leave Management System",
      html: `
        <div style="font-family: 'Segoe UI', sans-serif; max-width: 500px; margin: 0 auto; background: white; padding: 32px; border-radius: 16px; border: 1px solid #e5e7eb;">
          <h2 style="color: #16a34a; margin: 0 0 12px;">✅ Koneksi SMTP Berhasil!</h2>
          <p style="color: #374151; font-size: 14px;">Ini adalah email test dari Leave Management System. Konfigurasi SMTP Anda sudah benar.</p>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 16px;">Dikirim pada: ${new Date().toLocaleString("id-ID")}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: "Email uji coba berhasil dikirim" });
  } catch (error: unknown) {
    console.error("SMTP test error:", error);
    const errMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({
      success: false,
      error: `Koneksi SMTP gagal: ${errMessage}`,
    }, { status: 400 });
  }
}
