import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

async function getSmtpSettings() {
  try {
    const settings = await prisma.smtpSettings.findUnique({
      where: { id: "singleton" },
    });
    return settings;
  } catch {
    return null;
  }
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const settings = await getSmtpSettings();
    if (!settings) {
      console.log("[Email] SMTP settings not found in database, skipping email.");
      return false;
    }
    if (!settings.enabled) {
      console.log("[Email] SMTP is disabled, skipping email.");
      return false;
    }

    console.log(`[Email] Connecting to SMTP: ${settings.host}:${settings.port} (secure: ${settings.secure})`);
    console.log(`[Email] Auth user: ${settings.user}`);
    console.log(`[Email] Sending to: ${payload.to}`);

    const transporter = nodemailer.createTransport({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: {
        user: settings.user,
        pass: settings.password,
      },
    });

    const info = await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });

    console.log(`[Email] ✅ Sent to ${payload.to}: ${payload.subject} (messageId: ${info.messageId})`);
    return true;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Email] ❌ Failed to send email to ${payload.to}:`, message);
    return false;
  }
}

// ---- Email Templates ----

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function emailWrapper(title: string, body: string): string {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626, #2563eb); padding: 24px 32px; border-radius: 16px 16px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 20px; font-weight: 700;">${title}</h1>
        <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">Leave Management System</p>
      </div>
      <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; border: 1px solid #e5e7eb; border-top: none;">
        ${body}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
          Email ini dikirim secara otomatis oleh Leave Management System. Silakan login untuk melakukan tindakan lebih lanjut.
        </p>
      </div>
    </div>
  `;
}

export function buildLeaveCreatedEmail(params: {
  employeeName: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  approverName: string;
}) {
  const body = `
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Halo <strong>${params.approverName}</strong>,
    </p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      <strong>${params.employeeName}</strong> telah mengajukan permohonan cuti yang memerlukan persetujuan Anda.
    </p>
    <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <table style="width: 100%; font-size: 14px; color: #374151;">
        <tr><td style="padding: 4px 0; font-weight: 600; width: 140px;">Jenis Cuti</td><td style="padding: 4px 0;">${params.leaveTypeName}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Tanggal Mulai</td><td style="padding: 4px 0;">${formatDate(params.startDate)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Tanggal Selesai</td><td style="padding: 4px 0;">${formatDate(params.endDate)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Alasan</td><td style="padding: 4px 0;">${params.reason}</td></tr>
      </table>
    </div>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Silakan login ke sistem untuk <strong>menyetujui</strong> atau <strong>menolak</strong> pengajuan ini.
    </p>
  `;

  return {
    subject: `📋 Pengajuan Cuti Baru dari ${params.employeeName}`,
    html: emailWrapper("Pengajuan Cuti Baru", body),
  };
}

export function buildApprovalL1Email(params: {
  employeeName: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  approver1Name: string;
  approver2Name: string;
}) {
  const body = `
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Halo <strong>${params.approver2Name}</strong>,
    </p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Pengajuan cuti dari <strong>${params.employeeName}</strong> telah disetujui oleh <strong>${params.approver1Name}</strong> (Approval L1) dan memerlukan persetujuan akhir dari Anda.
    </p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <table style="width: 100%; font-size: 14px; color: #374151;">
        <tr><td style="padding: 4px 0; font-weight: 600; width: 140px;">Jenis Cuti</td><td style="padding: 4px 0;">${params.leaveTypeName}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Tanggal Mulai</td><td style="padding: 4px 0;">${formatDate(params.startDate)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Tanggal Selesai</td><td style="padding: 4px 0;">${formatDate(params.endDate)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Alasan</td><td style="padding: 4px 0;">${params.reason}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Disetujui oleh</td><td style="padding: 4px 0;">${params.approver1Name} (L1) ✅</td></tr>
      </table>
    </div>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Silakan login ke sistem untuk memberikan persetujuan akhir.
    </p>
  `;

  return {
    subject: `✅ Cuti ${params.employeeName} Disetujui L1 — Menunggu Approval L2`,
    html: emailWrapper("Menunggu Approval L2", body),
  };
}

export function buildFinalApprovalEmail(params: {
  employeeName: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
}) {
  const body = `
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Halo <strong>${params.employeeName}</strong>,
    </p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Selamat! Pengajuan cuti Anda telah <strong style="color: #16a34a;">disetujui sepenuhnya</strong>. 🎉
    </p>
    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <table style="width: 100%; font-size: 14px; color: #374151;">
        <tr><td style="padding: 4px 0; font-weight: 600; width: 140px;">Jenis Cuti</td><td style="padding: 4px 0;">${params.leaveTypeName}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Tanggal Mulai</td><td style="padding: 4px 0;">${formatDate(params.startDate)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Tanggal Selesai</td><td style="padding: 4px 0;">${formatDate(params.endDate)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Status</td><td style="padding: 4px 0; color: #16a34a; font-weight: 700;">✅ APPROVED</td></tr>
      </table>
    </div>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Selamat menikmati waktu cuti Anda!
    </p>
  `;

  return {
    subject: `🎉 Cuti Anda Telah Disetujui!`,
    html: emailWrapper("Cuti Disetujui", body),
  };
}

export function buildRejectionEmail(params: {
  employeeName: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  rejectorName: string;
}) {
  const body = `
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Halo <strong>${params.employeeName}</strong>,
    </p>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Mohon maaf, pengajuan cuti Anda telah <strong style="color: #dc2626;">ditolak</strong> oleh <strong>${params.rejectorName}</strong>.
    </p>
    <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 16px 0;">
      <table style="width: 100%; font-size: 14px; color: #374151;">
        <tr><td style="padding: 4px 0; font-weight: 600; width: 140px;">Jenis Cuti</td><td style="padding: 4px 0;">${params.leaveTypeName}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Tanggal Mulai</td><td style="padding: 4px 0;">${formatDate(params.startDate)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Tanggal Selesai</td><td style="padding: 4px 0;">${formatDate(params.endDate)}</td></tr>
        <tr><td style="padding: 4px 0; font-weight: 600;">Status</td><td style="padding: 4px 0; color: #dc2626; font-weight: 700;">❌ REJECTED</td></tr>
      </table>
    </div>
    <p style="color: #374151; font-size: 15px; line-height: 1.6;">
      Saldo cuti Anda telah dikembalikan. Silakan hubungi atasan untuk informasi lebih lanjut.
    </p>
  `;

  return {
    subject: `❌ Pengajuan Cuti Anda Ditolak`,
    html: emailWrapper("Cuti Ditolak", body),
  };
}
