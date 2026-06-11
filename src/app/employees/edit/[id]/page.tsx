"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PageHeader from "@/components/shared/PageHeader";
import EmployeeForm from "@/components/employee/EmployeeForm";
import { getEmployeeById, updateEmployee } from "@/services/employee-storage";
import { type Employee } from "@/types/employee";
import { type EmployeeFormValues } from "@/validators/employee-validator";
import { ROUTES } from "@/constants";

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const fetchEmployee = async () => {
      const emp = await getEmployeeById(id);
      if (emp) {
        setEmployee(emp);
      } else {
        toast.error("Employee not found");
        router.push(ROUTES.EMPLOYEES);
      }
      setIsLoading(false);
    };
    fetchEmployee();
  }, [id, router]);

  const handleSubmit = async (data: EmployeeFormValues) => {
    await updateEmployee(id, data);
    toast.success("Employee updated successfully");
    router.push(ROUTES.EMPLOYEES);
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!employee) return null;

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageHeader title="Edit Employee" description={`Editing ${employee.name}`} />
      <EmployeeForm
        defaultValues={{
          name: employee.name,
          department: employee.department,
          position: employee.position,
          username: employee.username || "",
          password: employee.password || "",
          email: employee.email || "",
          role: employee.role || "user",
        }}
        onSubmit={handleSubmit}
        isEdit
      />
    </ProtectedRoute>
  );
}
