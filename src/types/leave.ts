export type LeaveStatus = "PENDING_APPROVAL1" | "PENDING_APPROVAL2" | "APPROVED" | "REJECTED";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  approval1Id: string;
  leaveTypeId?: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
};

export type LeaveType = {
  id: string;
  name: string;
  defaultBalance: number;
  description?: string;
};

export type EmployeeLeaveBalance = {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  balance: number;
  leaveType?: LeaveType;
};

export type ApprovalHistory = {
  id: string;
  leaveRequestId: string;
  action: string;
  actorId: string | null;
  actorName: string;
  message: string | null;
  createdAt: string;
};

export type LeaveRequestWithRelations = LeaveRequest & {
  leaveType?: { id: string; name: string } | null;
};
