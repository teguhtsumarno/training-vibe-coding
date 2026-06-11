import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  CircleX,
  Clock3,
  FileText,
  ShieldCheck,
  Sparkles,
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

type CodeReviewPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

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
    badge: "bg-red-500/15 text-red-200 border border-red-500/30",
    bar: "from-red-500 via-pink-500 to-orange-500",
    icon: <AlertTriangle className="h-4 w-4" />,
  },
  High: {
    badge: "bg-orange-500/15 text-orange-200 border border-orange-500/30",
    bar: "from-orange-500 via-amber-500 to-yellow-500",
    icon: <CircleX className="h-4 w-4" />,
  },
  Medium: {
    badge: "bg-yellow-500/15 text-yellow-200 border border-yellow-500/30",
    bar: "from-yellow-500 via-lime-500 to-emerald-400",
    icon: <Clock3 className="h-4 w-4" />,
  },
  Low: {
    badge: "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30",
    bar: "from-emerald-500 via-teal-500 to-cyan-400",
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

function normalizeSeverity(value?: string | string[]): SeverityKey | "ALL" {
  if (!value) return "ALL";
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return "ALL";
  const upper = raw.toUpperCase();
  const match = SEVERITIES.find((severity) => severity.toUpperCase() === upper);
  return match ?? "ALL";
}

function buildFilterHref(value: SeverityKey | "ALL") {
  if (value === "ALL") {
    return "/code-review";
  }
  const params = new URLSearchParams({ severity: value.toLowerCase() });
  return `/code-review?${params.toString()}`;
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
            stroke="rgba(255,255,255,0.08)"
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
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-heading font-extrabold text-white">{safeValue}%</span>
          <span className="text-xs uppercase tracking-widest text-white/60">{label}</span>
        </div>
      </div>
      <p className="text-xs text-center text-muted-foreground max-w-[160px]">{caption}</p>
    </div>
  );
}

function SeverityBadge({ level }: { level: string }) {
  const normalized = level as SeverityKey;
  const style = severityStyles[normalized];

  if (!style) {
    return (
      <Badge variant="outline" className="border-white/15 text-muted-foreground">
        {level}
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

export default async function CodeReviewPage({ searchParams }: CodeReviewPageProps) {
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
  ].filter((item) => item.value && item.value !== "N/A");

  const activeSeverity = normalizeSeverity(searchParams?.severity);
  const severityFilterOptions: (SeverityKey | "ALL")[] = ["ALL", ...SEVERITIES];

  const filteredRows =
    activeSeverity === "ALL"
      ? detailedRows
      : detailedRows.filter((row) => row.severity.toUpperCase() === activeSeverity.toUpperCase());
  const filteredRecommendations =
    activeSeverity === "ALL"
      ? recommendationItems
      : recommendationItems.filter((item) => item.severity.toUpperCase() === activeSeverity.toUpperCase());

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <Card className="group relative overflow-hidden border-white/10 bg-gradient-to-br from-[#050505] via-[#090921] to-[#0f172a] transition-all duration-700 hover:-translate-y-1 hover:border-blue-400/30 hover:shadow-[0_35px_120px_rgba(59,130,246,0.35)] active:scale-[0.995]">
        <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden>
          <div className="absolute -left-24 top-10 h-48 w-48 rounded-full bg-blue-500/30 blur-[120px] transition-transform duration-700 group-hover:translate-y-2" />
          <div className="absolute -right-16 bottom-0 h-52 w-52 rounded-full bg-purple-500/30 blur-[140px] transition-transform duration-700 group-hover:-translate-y-1" />
        </div>
        <CardHeader className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 transition-all duration-300 hover:border-emerald-300/60">
              Public dashboard
            </Badge>
            <Badge variant="outline" className="border-white/15 text-white/80 transition-all duration-300 hover:border-white/40">
              <span className="font-semibold">Review Date:</span>&nbsp;{reviewDate}
            </Badge>
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-3xl md:text-4xl font-heading font-black tracking-tight text-white flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-blue-300 transition-transform duration-500 group-hover:rotate-6" />
                Code Review Intelligence Board
              </CardTitle>
              <CardDescription className="mt-2 text-base text-white/80">
                Snapshot kualitas terbaru untuk Employee Leave Management System.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-3">
              <Badge
                className={cn(
                  "px-4 py-2 text-base font-semibold transition-all duration-300 hover:shadow-[0_0_25px_rgba(34,197,94,0.35)]",
                  finalRecommendation.toUpperCase() === "APPROVED"
                    ? "bg-emerald-500/20 text-emerald-100 border border-emerald-500/40"
                    : "bg-amber-500/15 text-amber-100 border border-amber-500/40"
                )}
              >
                Final Verdict: {finalRecommendation}
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 text-sm text-white/70 sm:grid-cols-3">
            {heroHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-all duration-300 hover:-translate-y-1 hover:border-white/40"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/40">{item.label}</p>
                <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="bg-[#09090b] border-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_20px_70px_rgba(59,130,246,0.25)] active:scale-[0.99]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-400 transition-transform duration-500 hover:rotate-3" />
              Performance Pulse
            </CardTitle>
            <CardDescription>Prosentase lolos quality gate dan ringkasan temuan.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <CircularStat value={passRate} label="Pass Rate" caption="Persentase area yang memenuhi standar audit." />
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 transition-all duration-300 hover:border-white/40 hover:-translate-y-1">
                <p className="text-sm text-muted-foreground">Total Findings</p>
                <p className="text-5xl font-heading font-black text-white">{totalFindings}</p>
                <p className="text-xs text-muted-foreground mt-1">Mencakup seluruh level severity.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-white/40">
                  <p className="text-xs text-white/60">Checks Evaluated</p>
                  <p className="text-2xl font-semibold text-white">{detailedRows.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3 transition-all duration-300 hover:border-white/40">
                  <p className="text-xs text-white/60">Validated (PASS)</p>
                  <p className="text-2xl font-semibold text-emerald-300">{passedChecks}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#09090b] border-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-purple-500/30 hover:shadow-[0_20px_70px_rgba(168,85,247,0.25)]">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-white">Severity Distribution</CardTitle>
                <CardDescription>Proporsi temuan berdasarkan tingkat risiko.</CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {severityFilterOptions.map((option) => {
                const isActive = option === activeSeverity;
                return (
                  <Link
                    key={option}
                    href={buildFilterHref(option)}
                    className={cn(
                      "rounded-2xl border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-all duration-200 hover:-translate-y-0.5 active:scale-95",
                      isActive
                        ? "border-white text-white bg-white/10 shadow-[0_10px_30px_rgba(255,255,255,0.15)]"
                        : "border-white/15 text-white/70 hover:border-white/40"
                    )}
                  >
                    {option === "ALL" ? "All" : option}
                  </Link>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {severityBreakdown.map(({ severity, count, percent }) => {
              const styles = severityStyles[severity];
              return (
                <div key={severity} className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-transform duration-300 hover:scale-105">
                        {styles.icon}
                      </span>
                      <span className="font-semibold">{severity}</span>
                    </div>
                    <span className="font-mono text-white/80">
                      {count} · {clampPercentage(percent)}%
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-500", styles.bar)}
                      style={{ width: `${clampPercentage(percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#09090b] border-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-[0_20px_70px_rgba(16,185,129,0.25)]">
        <CardHeader>
          <CardTitle className="text-white">Actionable Recommendations</CardTitle>
          <CardDescription>Prioritas eksekusi berdasarkan temuan report.</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRecommendations.length ? (
            <ol className="space-y-4">
              {filteredRecommendations.map((item, index) => (
                <li key={`${item.area}-${index}`} className="flex gap-3 transition-all duration-300 hover:-translate-y-1">
                  <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white/80">
                    {index + 1}
                  </span>
                  <div className="flex-1 rounded-2xl border border-white/10 bg-black/20 p-4 transition-all duration-300 hover:border-white/40">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-white">{item.area}</p>
                      <SeverityBadge level={item.severity} />
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 leading-6">{item.recommendation}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada rekomendasi untuk severity ini.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#09090b] border-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_20px_70px_rgba(59,130,246,0.25)]">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-400 transition-transform duration-500 hover:rotate-3" />
            Detailed Findings Matrix
          </CardTitle>
          <CardDescription>
            Ringkasan status + insight utama setiap area audit {activeSeverity !== "ALL" ? `(filtered by ${activeSeverity})` : ""}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRows.length ? (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/5 text-white/70">
                  <tr>
                    <th className="px-4 py-3 text-left">Area</th>
                    <th className="px-4 py-3 text-left">Quality Gate</th>
                    <th className="px-4 py-3 text-left">Insights</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => (
                    <tr
                      key={`${row.area}-${index}`}
                      className="border-t border-white/10 transition-colors duration-200 hover:bg-white/5"
                    >
                      <td className="px-4 py-3 font-medium text-white">{row.area}</td>
                      <td className="px-4 py-3 space-y-2">
                        <Badge
                          variant={row.status.toUpperCase() === "PASS" ? "outline" : "destructive"}
                          className={cn(
                            "border-white/15 text-xs font-semibold transition-all duration-300 hover:scale-[1.03]",
                            row.status.toUpperCase() === "PASS"
                              ? "text-emerald-200"
                              : "text-amber-200 bg-amber-500/15"
                          )}
                        >
                          {row.status}
                        </Badge>
                        <SeverityBadge level={row.severity} />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-white leading-6">{row.finding}</p>
                        <p className="text-xs text-white/60 mt-2">Recommendation: {row.recommendation}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada temuan untuk severity ini.</p>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#09090b] border-white/10 transition-all duration-500 hover:-translate-y-1 hover:border-white/40">
        <CardHeader>
          <CardTitle className="text-white">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-6">{conclusion}</p>
        </CardContent>
      </Card>
    </section>
  );
}
