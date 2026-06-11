"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";
import { getAllLeaveRequests } from "@/services/leave-storage";
import { getAllEmployees } from "@/services/employee-storage";
import { type LeaveRequest } from "@/types/leave";
import { type Employee } from "@/types/employee";
import { ROUTES } from "@/constants";
import { ChevronLeft, ChevronRight, Calendar, Users, Clock } from "lucide-react";

const DAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

type LeaveOnDay = {
  employee: Employee;
  request: LeaveRequest & { leaveType?: { id: string; name: string } | null };
};

function isDateInRange(date: Date, startDate: string, endDate: string): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d >= start && d <= end;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// Color palette for employees (cycles through)
const EMPLOYEE_COLORS = [
  { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400", dot: "bg-blue-500" },
  { bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400", dot: "bg-emerald-500" },
  { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400", dot: "bg-amber-500" },
  { bg: "bg-purple-500/20", border: "border-purple-500/30", text: "text-purple-400", dot: "bg-purple-500" },
  { bg: "bg-pink-500/20", border: "border-pink-500/30", text: "text-pink-400", dot: "bg-pink-500" },
  { bg: "bg-cyan-500/20", border: "border-cyan-500/30", text: "text-cyan-400", dot: "bg-cyan-500" },
  { bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400", dot: "bg-orange-500" },
  { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400", dot: "bg-red-500" },
];

export default function CalendarPage() {
  const router = useRouter();
  const { session } = useAuth();
  const [allRequests, setAllRequests] = useState<(LeaveRequest & { leaveType?: { id: string; name: string } | null })[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Detail dialog state
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; date: Date | null; leaves: LeaveOnDay[] }>({
    open: false,
    date: null,
    leaves: [],
  });

  // Redirect non-allowed roles
  useEffect(() => {
    if (session && session.role !== "admin" && session.role !== "approval1" && session.role !== "approval2") {
      router.push(ROUTES.DASHBOARD);
    }
  }, [session, router]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [reqs, emps] = await Promise.all([
      getAllLeaveRequests(),
      getAllEmployees(),
    ]);
    setAllRequests(reqs);
    setEmployees(emps);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Build employee color map
  const employeeColorMap = useMemo(() => {
    const map = new Map<string, typeof EMPLOYEE_COLORS[0]>();
    employees.forEach((emp, idx) => {
      map.set(emp.id, EMPLOYEE_COLORS[idx % EMPLOYEE_COLORS.length]);
    });
    return map;
  }, [employees]);

  // Filter only APPROVED and PENDING requests (not REJECTED)
  const activeRequests = useMemo(() => {
    return allRequests.filter((r) => r.status !== "REJECTED");
  }, [allRequests]);

  // Build leaves for each day of the current month
  const calendarData = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const result: Map<number, LeaveOnDay[]> = new Map();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const leavesOnDay: LeaveOnDay[] = [];

      activeRequests.forEach((req) => {
        if (isDateInRange(date, req.startDate, req.endDate)) {
          const employee = employees.find((e) => e.id === req.employeeId);
          if (employee) {
            leavesOnDay.push({ employee, request: req });
          }
        }
      });

      if (leavesOnDay.length > 0) {
        result.set(day, leavesOnDay);
      }
    }

    return result;
  }, [currentYear, currentMonth, activeRequests, employees]);

  // Today's leaves
  const todayLeaves = useMemo(() => {
    const todayDate = new Date();
    const leaves: LeaveOnDay[] = [];
    activeRequests.forEach((req) => {
      if (isDateInRange(todayDate, req.startDate, req.endDate)) {
        const employee = employees.find((e) => e.id === req.employeeId);
        if (employee) {
          leaves.push({ employee, request: req });
        }
      }
    });
    return leaves;
  }, [activeRequests, employees]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleGoToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const handleDayClick = (day: number) => {
    const date = new Date(currentYear, currentMonth, day);
    const leaves = calendarData.get(day) || [];
    setDetailDialog({ open: true, date, leaves });
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const isCurrentMonth = currentMonth === today.getMonth() && currentYear === today.getFullYear();

  if (session && session.role !== "admin" && session.role !== "approval1" && session.role !== "approval2") {
    return null;
  }

  return (
    <ProtectedRoute allowedRoles={["admin", "approval1", "approval2"]}>
      <div className="min-h-screen p-4 sm:p-8 pt-24 md:pt-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-heading font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
              Kalender Cuti
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Lihat siapa saja yang sedang cuti per bulan</p>
          </div>

          {/* Today's Summary Card */}
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-5 shadow-lg shadow-blue-500/5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h2 className="font-heading font-bold text-white text-lg">Hari Ini — {today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</h2>
                <p className="text-sm text-muted-foreground">
                  {todayLeaves.length === 0
                    ? "Tidak ada karyawan yang sedang cuti"
                    : `${todayLeaves.length} karyawan sedang cuti`}
                </p>
              </div>
            </div>
            {todayLeaves.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {todayLeaves.map((item, idx) => {
                  const color = employeeColorMap.get(item.employee.id) || EMPLOYEE_COLORS[0];
                  return (
                    <div
                      key={`today-${idx}`}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                      <span>{item.employee.name}</span>
                      {item.request.leaveType && (
                        <span className="opacity-60">• {item.request.leaveType.name}</span>
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.request.status === "APPROVED" 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {item.request.status === "APPROVED" ? "Approved" : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevMonth}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-xl font-heading font-bold text-white min-w-[200px] text-center">
                {MONTHS[currentMonth]} {currentYear}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextMonth}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {!isCurrentMonth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoToday}
                className="rounded-xl text-sm font-medium text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-blue-500/20 transition-all duration-300"
              >
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                Hari Ini
              </Button>
            )}
          </div>

          {/* Calendar Grid */}
          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading...</div>
          ) : (
            <div className="rounded-2xl border border-white/5 bg-[#09090b] shadow-xl shadow-blue-500/5 overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-black/40 border-b border-white/5">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="py-3 text-center text-xs font-heading font-semibold text-muted-foreground tracking-widest uppercase"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before the 1st */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-[100px] border-b border-r border-white/5 bg-black/20" />
                ))}

                {/* Actual days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = isCurrentMonth && day === today.getDate();
                  const leavesOnDay = calendarData.get(day) || [];
                  const hasLeaves = leavesOnDay.length > 0;

                  return (
                    <div
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`min-h-[100px] border-b border-r border-white/5 p-1.5 cursor-pointer transition-all duration-200 hover:bg-white/5 relative ${
                        isToday ? "bg-blue-500/5 ring-1 ring-inset ring-blue-500/30" : ""
                      }`}
                    >
                      {/* Day number */}
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                            isToday
                              ? "bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-md shadow-red-500/20"
                              : hasLeaves
                              ? "text-white"
                              : "text-muted-foreground"
                          }`}
                        >
                          {day}
                        </span>
                        {hasLeaves && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-white/5 px-1.5 py-0.5 rounded-md">
                            {leavesOnDay.length}
                          </span>
                        )}
                      </div>

                      {/* Leave indicators */}
                      <div className="space-y-0.5">
                        {leavesOnDay.slice(0, 3).map((item, idx) => {
                          const color = employeeColorMap.get(item.employee.id) || EMPLOYEE_COLORS[0];
                          return (
                            <div
                              key={`${day}-${idx}`}
                              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium truncate ${color.bg} ${color.text} border ${color.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${color.dot}`} />
                              <span className="truncate">{item.employee.name}</span>
                            </div>
                          );
                        })}
                        {leavesOnDay.length > 3 && (
                          <div className="text-[10px] text-muted-foreground font-medium pl-1">
                            +{leavesOnDay.length - 3} lainnya
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Fill remaining cells */}
                {(() => {
                  const totalCells = firstDay + daysInMonth;
                  const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
                  return Array.from({ length: remaining }).map((_, i) => (
                    <div key={`fill-${i}`} className="min-h-[100px] border-b border-r border-white/5 bg-black/20" />
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="bg-[#09090b] border border-white/5 rounded-2xl p-4 shadow-lg">
            <h3 className="text-sm font-heading font-semibold text-white mb-3">Legenda Karyawan</h3>
            <div className="flex flex-wrap gap-2">
              {employees.map((emp) => {
                const color = employeeColorMap.get(emp.id) || EMPLOYEE_COLORS[0];
                return (
                  <div
                    key={emp.id}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${color.bg} ${color.text} border ${color.border}`}
                  >
                    <span className={`w-2 h-2 rounded-full ${color.dot}`} />
                    {emp.name}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({ ...detailDialog, open })}>
        <DialogContent className="bg-[#09090b] border border-white/10 text-white rounded-2xl max-w-md w-full shadow-2xl shadow-blue-500/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
              {detailDialog.date
                ? detailDialog.date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                : "Detail Cuti"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {detailDialog.leaves.length === 0
                ? "Tidak ada karyawan yang cuti pada tanggal ini"
                : `${detailDialog.leaves.length} karyawan cuti pada tanggal ini`}
            </DialogDescription>
          </DialogHeader>

          {detailDialog.leaves.length > 0 ? (
            <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-1">
              {detailDialog.leaves.map((item, idx) => {
                const color = employeeColorMap.get(item.employee.id) || EMPLOYEE_COLORS[0];
                const start = new Date(item.request.startDate);
                const end = new Date(item.request.endDate);
                const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;

                return (
                  <div
                    key={`detail-${idx}`}
                    className={`p-4 rounded-xl border ${color.border} ${color.bg} space-y-2`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${color.dot}`} />
                        <span className={`font-semibold text-sm ${color.text}`}>{item.employee.name}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase ${
                        item.request.status === "APPROVED"
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}>
                        {item.request.status === "APPROVED" ? "Approved" : item.request.status.replace("PENDING_", "Pending ")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Departemen</span>
                        <span className="text-white/80">{item.employee.department}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Jenis Cuti</span>
                        <span className="text-white/80">{item.request.leaveType?.name || "—"}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Periode</span>
                        <span className="text-white/80">
                          {start.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} — {end.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Durasi</span>
                        <span className="text-white/80">{duration} Hari</span>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      <span className="block text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-0.5">Alasan</span>
                      <span className="text-white/70">{item.request.reason}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-3">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">Semua karyawan sedang bekerja pada tanggal ini</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}
