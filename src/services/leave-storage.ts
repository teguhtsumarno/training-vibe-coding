import { LeaveRequest, LeaveStatus } from "@/types/leave";
import { getSession } from "./auth-storage";

export async function getAllLeaveRequests(): Promise<LeaveRequest[]> {
  try {
    const res = await fetch("/api/leave-requests");
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return [];
  }
}

export async function getLeaveRequestById(id: string): Promise<LeaveRequest | undefined> {
  try {
    const requests = await getAllLeaveRequests();
    return requests.find((request) => request.id === id);
  } catch (error) {
    console.error(`Error fetching leave request ${id}:`, error);
    return undefined;
  }
}

export async function getLeaveRequestsByEmployeeId(
  employeeId: string
): Promise<LeaveRequest[]> {
  try {
    const requests = await getAllLeaveRequests();
    return requests.filter((request) => request.employeeId === employeeId);
  } catch (error) {
    console.error(`Error fetching leave requests for employee ${employeeId}:`, error);
    return [];
  }
}

export async function createLeaveRequest(
  data: Omit<LeaveRequest, "id" | "status">
): Promise<LeaveRequest> {
  const res = await fetch("/api/leave-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to create leave request");
  }
  return json.data;
}

export async function approveLeaveRequest(id: string, actionRole: string): Promise<LeaveRequest> {
  const session = getSession();
  const nextStatus = actionRole === "approval1" ? "PENDING_APPROVAL2" : "APPROVED";
  const res = await fetch(`/api/leave-requests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: nextStatus,
      actorId: session?.employeeId,
    }),
  });
  
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to approve leave request");
  }
  return json.data;
}

export async function rejectLeaveRequest(id: string): Promise<LeaveRequest> {
  const session = getSession();
  const res = await fetch(`/api/leave-requests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "REJECTED",
      actorId: session?.employeeId,
    }),
  });
  
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to reject leave request");
  }
  return json.data;
}

export async function deleteLeaveRequestsByEmployeeId(employeeId: string): Promise<void> {
  // Cascaded automatically in PostgreSQL via Prisma onDelete: Cascade on the foreign key relation
}

export async function getCountByStatus(status: LeaveStatus): Promise<number> {
  const requests = await getAllLeaveRequests();
  return requests.filter((request) => request.status === status).length;
}

export async function updateLeaveRequest(
  id: string,
  data: Partial<LeaveRequest>
): Promise<LeaveRequest> {
  const res = await fetch(`/api/leave-requests/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to update leave request");
  }
  return json.data;
}

export async function deleteLeaveRequest(id: string): Promise<void> {
  const res = await fetch(`/api/leave-requests/${id}`, {
    method: "DELETE",
  });
  
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to delete leave request");
  }
}

export async function getLeaveRequestHistory(id: string): Promise<any[]> {
  try {
    const res = await fetch(`/api/leave-requests/${id}/history`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error(`Error fetching history for leave request ${id}:`, error);
    return [];
  }
}
