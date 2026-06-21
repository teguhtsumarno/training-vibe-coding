"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import EmployeeForm from "@/components/employee/EmployeeForm";
import { createEmployee } from "@/services/employee-storage";
import { type EmployeeFormValues } from "@/validators/employee-validator";
import { ROUTES } from "@/constants";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";

export default function NewEmployeePage() {
  const router = useRouter();

  const handleSubmit = async (data: EmployeeFormValues) => {
    try {
      await createEmployee(data);
      toast.success("Employee created successfully");
      router.push(ROUTES.EMPLOYEES);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membuat data karyawan";
      toast.error(message);
    }
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href={ROUTES.EMPLOYEES}
          className="inline-flex items-center gap-1.5 text-[14.5px] text-[#45474D] hover:text-[#121317] transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#121317]">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-heading font-medium text-[#121317]">Add New Employee</h1>
              <p className="text-[14.5px] text-[#6A6A71]">Create a new employee record in the system</p>
            </div>
          </div>
        </div>

        <EmployeeForm onSubmit={handleSubmit} />
      </div>
    </ProtectedRoute>
  );
}
