"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";
import { Mail, Send, Shield, Server, Eye, EyeOff } from "lucide-react";

type SmtpForm = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
  enabled: boolean;
};

const DEFAULT_FORM: SmtpForm = {
  host: "",
  port: 587,
  secure: false,
  user: "",
  password: "",
  fromName: "Leave Management System",
  fromEmail: "",
  enabled: true,
};

export default function SmtpSettingsPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [form, setForm] = useState<SmtpForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [hasExisting, setHasExisting] = useState(false);
  const [passwordEdited, setPasswordEdited] = useState(false);

  useEffect(() => {
    if (session && session.role !== "admin") {
      router.push(ROUTES.DASHBOARD);
    }
  }, [session, router]);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/smtp-settings");
      const json = await res.json();
      if (json.success && json.data) {
        setForm({ ...json.data, password: "" });
        setHasExisting(true);
        setPasswordEdited(false);
      }
    } catch {
      // No settings yet
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!form.host || !form.user || !form.fromEmail) {
      toast.error("Host, User, dan From Email wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, enabled: form.enabled === true };
      console.log("[SMTP Save] Sending:", JSON.stringify({ ...payload, password: "***" }));
      const res = await fetch("/api/smtp-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Pengaturan SMTP berhasil disimpan");
        setHasExisting(true);
        // Preserve the enabled state from what we sent, since response data is reliable
        setForm({ ...json.data, enabled: json.data.enabled });
      } else {
        toast.error(json.error || "Gagal menyimpan");
      }
    } catch {
      toast.error("Gagal menyimpan pengaturan SMTP");
    }
    setSaving(false);
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error("Masukkan email tujuan test");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/smtp-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          testRecipient: testEmail,
        }),
      });
      const json = await res.json();
      if (json.success) {
        toast.success("Email test berhasil dikirim! Periksa inbox Anda.");
      } else {
        toast.error(json.error || "Gagal mengirim test email");
      }
    } catch {
      toast.error("Gagal mengirim test email");
    }
    setTesting(false);
  };

  const updateField = (field: keyof SmtpForm, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (session?.role !== "admin") return null;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen p-4 sm:p-8 pt-24 md:pt-8">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-heading font-medium tracking-tight text-[#121317]">
              Pengaturan SMTP
            </h1>
            <p className="text-sm text-[#6A6A71] mt-1">
              Konfigurasi server email untuk notifikasi pengajuan cuti
            </p>
          </div>

          {loading ? (
            <div className="text-center py-16 text-[#6A6A71]">Loading...</div>
          ) : (
            <div className="space-y-6">
              {/* Status Card */}
              <div className={`rounded-2xl border p-5 shadow-lg ${
                hasExisting && form.enabled
                  ? "bg-emerald-500/5 border-emerald-500/20 shadow-emerald-500/5"
                  : "bg-amber-500/5 border-amber-500/20 shadow-amber-500/5"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                      hasExisting && form.enabled
                        ? "bg-emerald-500/20 border-emerald-500/30"
                        : "bg-amber-500/20 border-amber-500/30"
                    }`}>
                      <Mail className={`h-5 w-5 ${hasExisting && form.enabled ? "text-emerald-400" : "text-amber-400"}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#121317] text-sm">
                        {hasExisting
                          ? form.enabled ? "Notifikasi Email Aktif" : "Notifikasi Email Nonaktif"
                          : "Belum Dikonfigurasi"
                        }
                      </h3>
                      <p className="text-xs text-[#6A6A71]">
                        {hasExisting
                          ? form.enabled ? `Server: ${form.host}:${form.port}` : "Notifikasi email dinonaktifkan"
                          : "Isi konfigurasi di bawah untuk mengaktifkan notifikasi email"
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#6A6A71]">{form.enabled ? "ON" : "OFF"}</span>
                    <Switch
                      checked={form.enabled}
                      onCheckedChange={(checked) => updateField("enabled", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* SMTP Configuration Form */}
              <div className="bg-white border border-[#E1E6EC] rounded-2xl p-6 sm:p-8  space-y-6">
                <div className="flex items-center gap-2 mb-2">
                  <Server className="h-4 w-4 text-blue-400" />
                  <h2 className="font-heading font-bold text-[#121317] text-base tracking-wide">Server SMTP</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2 space-y-2">
                    <Label className="text-sm font-semibold text-[#121317] tracking-wide">SMTP Host</Label>
                    <Input
                      value={form.host}
                      onChange={(e) => updateField("host", e.target.value)}
                      placeholder="smtp.gmail.com"
                      className="bg-white border-[#E1E6EC] rounded-xl focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#121317] tracking-wide">Port</Label>
                    <Input
                      type="number"
                      value={form.port}
                      onChange={(e) => updateField("port", Number(e.target.value))}
                      placeholder="587"
                      className="bg-white border-[#E1E6EC] rounded-xl focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FC] border border-[#E1E6EC]">
                  <div>
                    <span className="text-sm font-semibold text-[#121317]">SSL/TLS (Secure)</span>
                    <p className="text-xs text-[#6A6A71]">Aktifkan untuk port 465</p>
                  </div>
                  <Switch
                    checked={form.secure}
                    onCheckedChange={(checked) => updateField("secure", checked)}
                  />
                </div>

                <hr className="border-[#E1E6EC]" />
                
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-purple-400" />
                  <h2 className="font-heading font-bold text-[#121317] text-base tracking-wide">Autentikasi</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#121317] tracking-wide">Username / Email</Label>
                    <Input
                      value={form.user}
                      onChange={(e) => updateField("user", e.target.value)}
                      placeholder="user@example.com"
                      className="bg-white border-[#E1E6EC] rounded-xl focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#121317] tracking-wide">Password / App Password</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => {
                          updateField("password", e.target.value);
                          setPasswordEdited(true);
                        }}
                        placeholder={hasExisting && !passwordEdited ? "Password tersimpan (kosongkan jika tidak ingin mengubah)" : "Masukkan password"}
                        className="bg-white border-[#E1E6EC] rounded-xl focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-300 pr-10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6A6A71] hover:text-[#121317] transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <hr className="border-[#E1E6EC]" />
                
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-red-400" />
                  <h2 className="font-heading font-bold text-[#121317] text-base tracking-wide">Pengirim</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#121317] tracking-wide">Nama Pengirim</Label>
                    <Input
                      value={form.fromName}
                      onChange={(e) => updateField("fromName", e.target.value)}
                      placeholder="Leave Management System"
                      className="bg-white border-[#E1E6EC] rounded-xl focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-[#121317] tracking-wide">Email Pengirim</Label>
                    <Input
                      value={form.fromEmail}
                      onChange={(e) => updateField("fromEmail", e.target.value)}
                      placeholder="noreply@company.com"
                      className="bg-white border-[#E1E6EC] rounded-xl focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-[#E1E6EC]">
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    variant="cta" className="flex-1"
                  >
                    {saving ? "Menyimpan..." : "Simpan Pengaturan"}
                  </Button>
                </div>
              </div>

              {/* Test Email Section */}
              <div className="bg-white border border-[#E1E6EC] rounded-2xl p-6 sm:p-8  space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Send className="h-4 w-4 text-emerald-400" />
                  <h2 className="font-heading font-bold text-[#121317] text-base tracking-wide">Test Koneksi SMTP</h2>
                </div>
                <p className="text-sm text-[#6A6A71]">
                  Kirim email test untuk memastikan konfigurasi SMTP sudah benar.
                </p>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-[#121317] tracking-wide">Email Tujuan Test</Label>
                  <Input
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="bg-white border-[#E1E6EC] rounded-xl focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-300"
                  />
                </div>

                <Button
                  onClick={handleTest}
                  disabled={testing || !testEmail}
                  variant="outline"
                  className="w-full border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 hover:border-emerald-500/30 rounded-xl py-2.5 font-semibold transition-all duration-300"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {testing ? "Mengirim..." : "Kirim Test Email"}
                </Button>
              </div>

              {/* Info Card */}
              <div className="bg-blue-500/5 border border-[#E1E6EC] rounded-2xl p-5 space-y-3">
                <h3 className="font-heading font-bold text-blue-400 text-sm">📧 Kapan email dikirim?</h3>
                <ul className="space-y-2 text-sm text-[#6A6A71]">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">1.</span>
                    <span><strong className="text-[#121317]">Employee mengajukan cuti</strong> → Notifikasi ke Approval L1</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">2.</span>
                    <span><strong className="text-[#121317]">Approval L1 menyetujui</strong> → Notifikasi ke Approval L2</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5">3.</span>
                    <span><strong className="text-[#121317]">Approval L2 menyetujui</strong> → Notifikasi ke Employee (cuti disetujui)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">4.</span>
                    <span><strong className="text-[#121317]">Cuti ditolak</strong> → Notifikasi ke Employee (cuti ditolak)</span>
                  </li>
                </ul>
                <p className="text-xs text-[#6A6A71]/60 mt-2">
                  💡 Email notifikasi dikirim ke field <strong>email</strong> pada data employee. Pastikan field email sudah terisi dengan alamat email yang valid.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
