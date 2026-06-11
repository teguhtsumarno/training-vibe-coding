"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PageHeader from "@/components/shared/PageHeader";
import EmployeeForm from "@/components/employee/EmployeeForm";
import { createEmployee } from "@/services/employee-storage";
import { type EmployeeFormValues } from "@/validators/employee-validator";
import { ROUTES } from "@/constants";

export default function NewEmployeePage() {
  const router = useRouter();

  const handleSubmit = async (data: EmployeeFormValues) => {
    await createEmployee(data);
    toast.success("Employee created successfully");
    router.push(ROUTES.EMPLOYEES);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageHeader title="Add New Employee" description="Create a new employee record" />
      <EmployeeForm onSubmit={handleSubmit} />
    </ProtectedRoute>
  );
}
