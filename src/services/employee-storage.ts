import { Employee } from "@/types/employee";

export function hashPassword(password: string): string {
  if (!password) return password;
  return typeof btoa === "function" ? btoa(password).split("").reverse().join("") : Buffer.from(password).toString("base64").split("").reverse().join("");
}

export async function getAllEmployees(): Promise<Employee[]> {
  try {
    const res = await fetch("/api/employees");
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    return [];
  }
}

export async function getEmployeeById(id: string): Promise<Employee | undefined> {
  try {
    const res = await fetch(`/api/employees/${id}`);
    if (!res.ok) return undefined;
    const json = await res.json();
    return json.success ? json.data : undefined;
  } catch (error) {
    console.error(`Error fetching employee ${id}:`, error);
    return undefined;
  }
}

export async function createEmployee(data: Omit<Employee, "id">): Promise<Employee> {
  const res = await fetch("/api/employees", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to create employee");
  }
  return json.data;
}

export async function updateEmployee(
  id: string,
  data: Partial<Employee>
): Promise<Employee> {
  const res = await fetch(`/api/employees/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to update employee");
  }
  return json.data;
}

export async function deleteEmployee(id: string): Promise<void> {
  const res = await fetch(`/api/employees/${id}`, {
    method: "DELETE",
  });
  
  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || "Failed to delete employee");
  }
}

export async function searchEmployees(query: string): Promise<Employee[]> {
  const employees = await getAllEmployees();
  const lowerQuery = query.toLowerCase();
  return employees.filter((employee) =>
    employee.name.toLowerCase().includes(lowerQuery)
  );
}
