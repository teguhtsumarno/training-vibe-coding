export type LeaveStatus = "PENDING_APPROVAL1" | "PENDING_APPROVAL2" | "APPROVED" | "REJECTED";

export type LeaveRequest = {
  id: string;
  employeeId: string;
  approval1Id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
};
