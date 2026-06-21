import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SeverityKey = "Critical" | "High" | "Medium" | "Low";

interface ReviewRow {
  area: string;
  status: string;
  severity: string;
  finding: string;
  recommendation: string;
}

interface RecommendationItem {
  area: string;
  recommendation: string;
  severity: string;
}

const SEVERITIES: SeverityKey[] = ["Critical", "High", "Medium", "Low"];

const severityStyles: Record<SeverityKey, { badge: string; bar: string; icon: ReactNode }> = {
  Critical: {
    badge: "bg-red-500/10 text-red-600 border border-red-500/20",
    bar: "bg-red-500",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  High: {
    badge: "bg-orange-500/10 text-orange-600 border border-orange-500/20",
    bar: "bg-orange-500",
    icon: <CircleX className="h-4 w-4" />,
  },
  Medium: {
    badge: "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20",
    bar: "bg-yellow-500",
    icon: <Clock3 className="h-4 w-4" />,
  },
  Low: {
    badge: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20",
    bar: "bg-emerald-500",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
};

async function getReviewReport() {
  try {
    const reportPath = path.join(process.cwd(), "Code_Review_Report.md");
    return await readFile(reportPath, "utf-8");
  } catch {
    return "Code review report tidak ditemukan.";
  }
}

function extractTableValue(report: string, field: string) {
  const match = report.match(new RegExp(`\\|\\s*${field}\\s*\\|\\s*(.+?)\\s*\\|`, "i"));
  return match?.[1]?.trim() ?? "N/A";
}

function extractSeverityCounts(report: string): Record<SeverityKey, number> {
  return SEVERITIES.reduce(
    (acc, severity) => {
      const match = report.match(new RegExp(`\\|\\s*${severity}\\s*\\|\\s*(\\d+)\\s*\\|`, "i"));
      acc[severity] = match ? Number(match[1]) : 0;
      return acc;
    },
    { Critical: 0, High: 0, Medium: 0, Low: 0 } as Record<SeverityKey, number>
  );
}

function extractFinalRecommendation(report: string) {
  const match = report.match(/# Final Recommendation\s*[\r\n]+\s*\*\*(.+?)\*\*/i);
  return match?.[1]?.trim() ?? "UNKNOWN";
}

function extractConclusion(report: string) {
  const match = report.match(/### Conclusion\s*([\s\S]*?)\n\s*---/i);
  return match?.[1]?.trim() ?? "Tidak ada ringkasan kesimpulan.";
}

function cleanMarkdown(value: string) {
  return value
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/\*(.*?)\*/g, "$1")
    .trim();
}

function extractDetailedRows(report: string): ReviewRow[] {
  const section = report.match(/## Detailed Review Report\s*([\s\S]*?)\n\s*---/i)?.[1];
  if (!section) return [];

  return section
    .split("\n")
    .filter((line) => line.startsWith("| **"))
    .map((line) => {
      const cols = line
        .split("|")
        .map((col) => col.trim())
        .filter(Boolean);

      const [area = "-", status = "-", severity = "-", finding = "-", recommendation = "-"] = cols;

      return {
        area: cleanMarkdown(area),
        status: cleanMarkdown(status),
        severity: cleanMarkdown(severity),
        finding: cleanMarkdown(finding),
        recommendation: cleanMarkdown(recommendation),
      };
    });
}

function getRecommendationItems(rows: ReviewRow[]): RecommendationItem[] {
  return rows
    .filter((row) => row.recommendation && row.recommendation !== "-")
    .map((row) => ({
      area: row.area,
      recommendation: row.recommendation,
      severity: row.severity,
    }));
}

function clampPercentage(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function CircularStat({ value, label, caption }: { value: number; label: string; caption: string }) {
  const safeValue = clampPercentage(value);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 transition-transform duration-500 hover:scale-[1.03]">
      <div className="relative h-[140px] w-[140px]">
        <svg className="h-full w-full" viewBox="0 0 140 140">
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="rgba(0,0,0,0.06)"
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
          />
          <circle
            cx="70"
            cy="70"
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: "stroke-dashoffset 0.6s ease" }}
          />
          <defs>
            <linearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#3279F9" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-heading font-medium text-[#121317]">{safeValue}%</span>
          <span className="text-xs uppercase tracking-widest text-[#6A6A71]">{label}</span>
        </div>
      </div>
      <p className="text-xs text-center text-[#6A6A71] max-w-[160px]">{caption}</p>
    </div>
  );
}

function SeverityBadge({ level }: { level: string }) {
  const normalized = level as SeverityKey;
  const style = severityStyles[normalized];

  if (!style) {
    return (
      <Badge variant="outline" className="border-[#E1E6EC] text-[#6A6A71]">
        {level || "—"}
      </Badge>
    );
  }

  return (
    <Badge className={cn("gap-1 transition-all duration-300 hover:scale-105", style.badge)}>
      {style.icon}
      {normalized}
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPassed = status.toUpperCase() === "PASS";
  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs font-semibold border",
        isPassed
          ? "text-emerald-600 bg-emerald-500/8 border-emerald-500/20"
          : "text-amber-600 bg-amber-500/8 border-amber-500/20"
      )}
    >
      {isPassed && <CheckCircle2 className="h-3 w-3 mr-1" />}
      {status}
    </Badge>
  );
}

export default async function CodeReviewPage() {
  const report = await getReviewReport();
  const severityCounts = extractSeverityCounts(report);
  const reviewDate = extractTableValue(report, "Review Date");
  const reviewer = extractTableValue(report, "Reviewer");
  const applicationName = extractTableValue(report, "Application");
  const version = extractTableValue(report, "Version");
  const finalRecommendation = extractFinalRecommendation(report);
  const conclusion = extractConclusion(report);
  const detailedRows = extractDetailedRows(report);
  const recommendationItems = getRecommendationItems(detailedRows);

  const totalFindings = Object.values(severityCounts).reduce((sum, current) => sum + current, 0);
  const passedChecks = detailedRows.filter((row) => row.status.toUpperCase() === "PASS").length;
  const passRate = detailedRows.length ? (passedChecks / detailedRows.length) * 100 : 0;
  const severityBreakdown = SEVERITIES.map((severity) => ({
    severity,
    count: severityCounts[severity],
    percent: totalFindings ? (severityCounts[severity] / totalFindings) * 100 : 0,
  }));

  const heroHighlights = [
    { label: "Application", value: applicationName },
    { label: "Version", value: version },
    { label: "Reviewer", value: reviewer },
    { label: "Review Date", value: reviewDate },
  ].filter((item) => item.value && item.value !== "N/A");

  const isAllClear = totalFindings === 0 && passRate === 100;

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      {/* Hero Card */}
      <Card className="group relative overflow-hidden border-[#E1E6EC] bg-white transition-all duration-700 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(50,121,249,0.12)]">
        <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden>
          <div className="absolute -left-24 top-10 h-48 w-48 rounded-full bg-blue-500/20 blur-[120px] transition-transform duration-700 group-hover:translate-y-2" />
          <div className="absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-emerald-500/20 blur-[140px] transition-transform duration-700 group-hover:-translate-y-1" />
        </div>
        <CardHeader className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Public Dashboard
            </Badge>
            <Badge variant="outline" className="border-[#E1E6EC] text-[#6A6A71]">
              <span className="font-semibold text-[#121317]">Review Date:</span>&nbsp;{reviewDate}
            </Badge>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-heading font-black tracking-tight text-[#121317] flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-[#3279F9] transition-transform duration-500 group-hover:rotate-6" />
                Code Review Report
              </CardTitle>
              <CardDescription className="mt-2 text-base text-[#6A6A71]">
                Laporan kualitas kode untuk Employee Leave Management System.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge
                className={cn(
                  "px-4 py-2 text-base font-semibold transition-all duration-300",
                  finalRecommendation.toUpperCase() === "APPROVED"
                    ? "bg-emerald-500/10 text-emerald-700 border border-emerald-500/25"
                    : "bg-amber-500/10 text-amber-700 border border-amber-500/25"
                )}
              >
                {finalRecommendation.toUpperCase() === "APPROVED" ? "✅" : "⚠️"} Final Verdict: {finalRecommendation}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {heroHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-[#E1E6EC] bg-[#F8F9FC] px-4 py-3 transition-all duration-300 hover:-translate-y-1"
              >
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#6A6A71]">{item.label}</p>
                <p className="mt-1 text-[15px] font-semibold text-[#121317]">{item.value}</p>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Performance Pulse */}
        <Card className="bg-white border-[#E1E6EC] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(50,121,249,0.1)]">
          <CardHeader>
            <CardTitle className="text-[#121317] flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#3279F9]" />
              Performance Pulse
            </CardTitle>
            <CardDescription className="text-[#6A6A71]">Persentase lolos quality gate dan ringkasan temuan.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CircularStat value={passRate} label="Pass Rate" caption="Persentase area yang memenuhi standar audit." />
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#E1E6EC] bg-[#F8F9FC] p-4 transition-all duration-300 hover:-translate-y-1">
                <p className="text-sm text-[#6A6A71]">Total Findings</p>
                <p className="text-5xl font-heading font-black text-[#121317]">{totalFindings}</p>
                <p className="text-xs text-[#6A6A71] mt-1">
                  {totalFindings === 0 ? "Tidak ada temuan — semua area lolos." : "Mencakup seluruh level severity."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-[#E1E6EC] bg-[#F8F9FC] p-3">
                  <p className="text-xs text-[#6A6A71]">Area Diperiksa</p>
                  <p className="text-2xl font-semibold text-[#121317]">{detailedRows.length}</p>
                </div>
                <div className="rounded-2xl border border-[#E1E6EC] bg-[#F8F9FC] p-3">
                  <p className="text-xs text-[#6A6A71]">Lolos (PASS)</p>
                  <p className="text-2xl font-semibold text-emerald-600">{passedChecks}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card className="bg-white border-[#E1E6EC] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(50,121,249,0.1)]">
          <CardHeader>
            <CardTitle className="text-[#121317]">Severity Distribution</CardTitle>
            <CardDescription className="text-[#6A6A71]">Proporsi temuan berdasarkan tingkat risiko.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAllClear ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 mb-4">
                  <Trophy className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-lg font-heading font-semibold text-[#121317]">All Clear! 🎉</p>
                <p className="text-sm text-[#6A6A71] mt-1 max-w-[240px]">
                  Tidak ada temuan di semua level severity. Semua {detailedRows.length} area diperiksa lolos quality gate.
                </p>
              </div>
            ) : (
              severityBreakdown.map(({ severity, count, percent }) => {
                const styles = severityStyles[severity];
                return (
                  <div key={severity} className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-[#45474D]">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#E1E6EC] bg-[#F8F9FC] text-[#121317]">
                          {styles.icon}
                        </span>
                        <span className="font-semibold">{severity}</span>
                      </div>
                      <span className="font-mono text-[#6A6A71]">
                        {count} · {clampPercentage(percent)}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-[#EFF2F7] overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", styles.bar)}
                        style={{ width: `${clampPercentage(percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actionable Recommendations */}
      <Card className="bg-white border-[#E1E6EC] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(50,121,249,0.1)]">
        <CardHeader>
          <CardTitle className="text-[#121317]">Actionable Recommendations</CardTitle>
          <CardDescription className="text-[#6A6A71]">Prioritas eksekusi berdasarkan temuan report.</CardDescription>
        </CardHeader>
        <CardContent>
          {recommendationItems.length ? (
            <ol className="space-y-4">
              {recommendationItems.map((item, index) => (
                <li key={`${item.area}-${index}`} className="flex gap-3 transition-all duration-300 hover:-translate-y-1">
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-[#3279F9]/10 text-sm font-semibold text-[#3279F9]">
                    {index + 1}
                  </span>
                  <div className="flex-1 rounded-2xl border border-[#E1E6EC] bg-[#F8F9FC] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-[#121317]">{item.area}</p>
                      <SeverityBadge level={item.severity} />
                    </div>
                    <p className="text-sm text-[#6A6A71] mt-1 leading-6">{item.recommendation}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 mb-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-[#121317]">Tidak ada rekomendasi outstanding</p>
              <p className="text-xs text-[#6A6A71] mt-1">Semua rekomendasi sebelumnya telah diimplementasikan.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Findings Matrix */}
      <Card className="bg-white border-[#E1E6EC] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(50,121,249,0.1)]">
        <CardHeader>
          <CardTitle className="text-[#121317] flex items-center gap-2">
            <FileText className="h-5 w-5 text-[#3279F9]" />
            Detailed Findings Matrix
          </CardTitle>
          <CardDescription className="text-[#6A6A71]">
            Ringkasan status dan insight utama setiap area audit ({detailedRows.length} area).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {detailedRows.length ? (
            <div className="overflow-x-auto rounded-2xl border border-[#E1E6EC]">
              <table className="w-full text-sm">
                <thead className="bg-[#F8F9FC] border-b border-[#E1E6EC]">
                  <tr>
                    <th className="px-4 py-3 text-left font-heading font-semibold text-[#121317] tracking-wider">Area</th>
                    <th className="px-4 py-3 text-left font-heading font-semibold text-[#121317] tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left font-heading font-semibold text-[#121317] tracking-wider">Findings</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedRows.map((row, index) => (
                    <tr
                      key={`${row.area}-${index}`}
                      className="border-t border-[#E1E6EC] transition-colors duration-200 hover:bg-[rgba(50,121,249,0.02)]"
                    >
                      <td className="px-4 py-3.5 font-medium text-[#121317] whitespace-nowrap">{row.area}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <StatusBadge status={row.status} />
                          {row.severity !== "-" && <SeverityBadge level={row.severity} />}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm text-[#45474D] leading-6">{row.finding}</p>
                        {row.recommendation !== "-" && (
                          <p className="text-xs text-[#3279F9] mt-2 font-medium">
                            💡 {row.recommendation}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[#6A6A71]">Tidak ada data temuan untuk ditampilkan.</p>
          )}
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="bg-white border-[#E1E6EC] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_60px_rgba(50,121,249,0.1)]">
        <CardHeader>
          <CardTitle className="text-[#121317]">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[#6A6A71] leading-7">{conclusion}</p>
        </CardContent>
      </Card>
    </section>
  );
}
