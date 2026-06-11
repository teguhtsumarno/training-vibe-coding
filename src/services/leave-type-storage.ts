import { LeaveType, EmployeeLeaveBalance } from "@/types/leave";

export async function getAllLeaveTypes(): Promise<LeaveType[]> {
  try {
    const res = await fetch("/api/leave-types");
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching leave types:", error);
    return [];
  }
}

export async function createLeaveType(data: Omit<LeaveType, "id">): Promise<LeaveType> {
  const res = await fetch("/api/leave-types", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to create leave type");
  return json.data;
}

export async function updateLeaveType(id: string, data: Partial<LeaveType>): Promise<LeaveType> {
  const res = await fetch(`/api/leave-types/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to update leave type");
  return json.data;
}

export async function deleteLeaveType(id: string): Promise<void> {
  const res = await fetch(`/api/leave-types/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || "Failed to delete leave type");
}

export async function getEmployeeLeaveBalances(employeeId: string): Promise<EmployeeLeaveBalance[]> {
  try {
    const res = await fetch(`/api/employees/${employeeId}/leave-balances`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching employee leave balances:", error);
    return [];
  }
}
