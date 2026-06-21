"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PageHeader from "@/components/shared/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import LeaveRequestTable from "@/components/leave/LeaveRequestTable";
import LeaveStatusFilter from "@/components/leave/LeaveStatusFilter";
import LeaveActionDialog from "@/components/leave/LeaveActionDialog";
import {
  getAllLeaveRequests,
  approveLeaveRequest,
  rejectLeaveRequest,
  deleteLeaveRequest,
  getLeaveRequestHistory,
} from "@/services/leave-storage";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAllEmployees } from "@/services/employee-storage";
import { type LeaveRequest } from "@/types/leave";
import { type Employee } from "@/types/employee";
import { ROUTES } from "@/constants";

export default function LeavePage() {
  const { session } = useAuth();
  const [allRequests, setAllRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    action: "approve" | "reject";
    requestId: string;
  }>({ open: false, action: "approve", requestId: "" });
  const [actionLoading, setActionLoading] = useState(false);

  const [employees, setEmployees] = useState<Employee[]>([]);

  const loadData = async () => {
    const [requestsData, employeesData] = await Promise.all([
      getAllLeaveRequests(),
      getAllEmployees()
    ]);
    setAllRequests(requestsData);
    setEmployees(employeesData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const leaveRequests = useMemo(() => {
    if (!session) return [];
    if (session.role === "admin") return allRequests;
    if (session.role === "approval1") {
      return allRequests.filter(req => req.status === "PENDING_APPROVAL1" && req.approval1Id === session.employeeId);
    }
    if (session.role === "approval2") {
      return allRequests.filter(req => req.status === "PENDING_APPROVAL2");
    }
    return allRequests.filter(req => req.employeeId === session.employeeId);
  }, [allRequests, session]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "ALL") return leaveRequests;
    return leaveRequests.filter((req) => req.status === statusFilter);
  }, [leaveRequests, statusFilter]);

  const handleApproveClick = (id: string) => {
    setActionDialog({ open: true, action: "approve", requestId: id });
  };

  const handleRejectClick = (id: string) => {
    setActionDialog({ open: true, action: "reject", requestId: id });
  };

  const handleActionConfirm = async (message: string) => {
    setActionLoading(true);
    try {
      if (actionDialog.action === "approve") {
        await approveLeaveRequest(actionDialog.requestId, session?.role || "user", message);
        toast.success("Leave request approved");
      } else {
        await rejectLeaveRequest(actionDialog.requestId, message);
        toast.success("Leave request rejected");
      }
      loadData();
    } catch (error: any) {
      console.error("Failed to process leave action:", error);
      toast.error(error.message || "Failed to process leave request");
    } finally {
      setActionLoading(false);
      setActionDialog({ ...actionDialog, open: false });
    }
  };
  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this leave request?")) {
      try {
        await deleteLeaveRequest(id);
        toast.success("Leave request deleted successfully");
        loadData();
      } catch (error) {
        console.error("Failed to delete leave request:", error);
        toast.error("Failed to delete leave request");
      }
    }
  };

  const [historyDialog, setHistoryDialog] = useState<{
    open: boolean;
    requestId: string;
  }>({ open: false, requestId: "" });
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const handleViewHistory = async (id: string) => {
    setHistoryDialog({ open: true, requestId: id });
    setIsHistoryLoading(true);
    try {
      const data = await getLeaveRequestHistory(id);
      setHistoryData(data);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load approval history");
    } finally {
      setIsHistoryLoading(false);
    }
  };
  return (
    <ProtectedRoute>
      <PageHeader
        title={session?.role === "admin" ? "All Leave Requests" : session?.role?.startsWith("approval") ? "Approvals" : "My Leave Requests"}
        description={session?.role?.startsWith("approval") ? "Review and manage pending leave requests" : "Manage employee leave requests"}
        action={
          (session?.role === "admin" || session?.role === "user") ? (
            <Button asChild variant="cta" className="px-5 cursor-pointer">
              <Link href={ROUTES.LEAVE_NEW}>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </Button>
          ) : undefined
        }
      />
      <div className="space-y-4">
        <LeaveStatusFilter value={statusFilter} onChange={setStatusFilter} />
        <LeaveRequestTable
          leaveRequests={filteredRequests}
          employees={employees}
          userRole={session?.role || "user"}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          onDelete={handleDeleteClick}
          onViewHistory={handleViewHistory}
        />
      </div>
      <LeaveActionDialog
        open={actionDialog.open}
        onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
        action={actionDialog.action}
        loading={actionLoading}
        onConfirm={handleActionConfirm}
      />

      <Dialog open={historyDialog.open} onOpenChange={(open) => setHistoryDialog({ ...historyDialog, open })}>
        <DialogContent className="bg-white border border-[#E1E6EC] text-[#121317] rounded-2xl max-w-md w-full ">
          <DialogHeader>
            <DialogTitle className="text-xl font-heading font-medium tracking-wide text-[#121317]">
              Approval History
            </DialogTitle>
          </DialogHeader>

          {isHistoryLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
              <p className="text-sm text-[#6A6A71]">Loading history...</p>
            </div>
          ) : historyData.length === 0 ? (
            <div className="text-center py-12 text-[#6A6A71] text-sm">
              No approval history recorded.
            </div>
          ) : (
            <div className="relative border-l border-[#E1E6EC] ml-4 pl-6 space-y-8 my-4 max-h-[60vh] overflow-y-auto">
              {historyData.map((item) => {
                const date = new Date(item.createdAt);
                const prettyDate = date.toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                });

                let dotColor = "bg-blue-500";
                let actionText = item.action;
                let badgeStyle = "text-blue-500 bg-blue-500/10 border-blue-500/25";

                if (item.action === "CREATED") {
                  dotColor = "bg-green-500 ring-4 ring-green-500/20";
                  actionText = "Formulir Diajukan (Created)";
                  badgeStyle = "text-green-500 bg-green-500/10 border-green-500/25";
                } else if (item.action === "UPDATED") {
                  dotColor = "bg-amber-500 ring-4 ring-amber-500/20";
                  actionText = "Formulir Diperbarui (Updated)";
                  badgeStyle = "text-amber-500 bg-amber-500/10 border-amber-500/25";
                } else if (item.action === "APPROVED_L1") {
                  dotColor = "bg-indigo-500 ring-4 ring-indigo-500/20";
                  actionText = "Persetujuan L1 (Approved L1)";
                  badgeStyle = "text-indigo-500 bg-indigo-500/10 border-indigo-500/25";
                } else if (item.action === "APPROVED") {
                  dotColor = "bg-emerald-500 ring-4 ring-emerald-500/20";
                  actionText = "Disetujui Penuh (Approved)";
                  badgeStyle = "text-emerald-500 bg-emerald-500/10 border-emerald-500/25";
                } else if (item.action === "REJECTED") {
                  dotColor = "bg-red-500 ring-4 ring-red-500/20";
                  actionText = "Ditolak (Rejected)";
                  badgeStyle = "text-red-500 bg-red-500/10 border-red-500/25";
                }

                return (
                  <div key={item.id} className="relative">
                    <span className={`absolute -left-[31px] top-1.5 flex h-4 w-4 rounded-full ${dotColor}`} />
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeStyle}`}>
                          {actionText}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-[#121317]">
                        Oleh: {item.actorName || "Sistem"}
                      </p>
                      {item.message && (
                        <div className="bg-[#F8F9FC] border border-[#E1E6EC] rounded-lg px-3 py-2">
                          <p className="text-[14.5px] text-[#45474D] italic">&ldquo;{item.message}&rdquo;</p>
                        </div>
                      )}
                      <p className="text-xs text-[#6A6A71]">
                        {prettyDate} WIB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}