"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { LeaveRequest, LeaveStatus } from "@/types/leave";
import * as leaveStorage from "@/services/leave-storage";

export type StatusFilter = LeaveStatus | "ALL";

export function useLeaveRequests() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaveRequests = useCallback(async () => {
    setIsLoading(true);
    const data = await leaveStorage.getAllLeaveRequests();
    setLeaveRequests(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLeaveRequests();
  }, [loadLeaveRequests]);

  const addLeaveRequest = useCallback(
    async (data: Omit<LeaveRequest, "id" | "status">): Promise<LeaveRequest> => {
      const newRequest = await leaveStorage.createLeaveRequest(data);
      loadLeaveRequests();
      return newRequest;
    },
    [loadLeaveRequests]
  );

  const approve = useCallback(
    async (id: string, actionRole: string): Promise<LeaveRequest> => {
      const updated = await leaveStorage.approveLeaveRequest(id, actionRole);
      loadLeaveRequests();
      return updated;
    },
    [loadLeaveRequests]
  );

  const reject = useCallback(
    async (id: string): Promise<LeaveRequest> => {
      const updated = await leaveStorage.rejectLeaveRequest(id);
      loadLeaveRequests();
      return updated;
    },
    [loadLeaveRequests]
  );

  const filteredRequests = useMemo(() => {
    if (statusFilter === "ALL") return leaveRequests;
    return leaveRequests.filter((request) => request.status === statusFilter);
  }, [leaveRequests, statusFilter]);

  const pendingCount = useMemo(
    () => leaveRequests.filter((r) => r.status.startsWith("PENDING")).length,
    [leaveRequests]
  );

  const approvedCount = useMemo(
    () => leaveRequests.filter((r) => r.status === "APPROVED").length,
    [leaveRequests]
  );

  const rejectedCount = useMemo(
    () => leaveRequests.filter((r) => r.status === "REJECTED").length,
    [leaveRequests]
  );

  return {
    leaveRequests,
    filteredRequests,
    statusFilter,
    isLoading,
    pendingCount,
    approvedCount,
    rejectedCount,
    loadLeaveRequests,
    addLeaveRequest,
    approve,
    reject,
    setStatusFilter,
  };
}
