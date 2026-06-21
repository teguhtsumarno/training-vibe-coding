"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import EmployeeForm from "@/components/employee/EmployeeForm";
import { getEmployeeById, updateEmployee } from "@/services/employee-storage";
import { type Employee } from "@/types/employee";
import { type EmployeeFormValues } from "@/validators/employee-validator";
import { ROUTES } from "@/constants";
import { ArrowLeft, UserCog } from "lucide-react";
import Link from "next/link";

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
    try {
      await updateEmployee(id, data);
      toast.success("Employee updated successfully");
      router.push(ROUTES.EMPLOYEES);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal memperbarui data karyawan";
      toast.error(message);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E1E6EC] border-t-[#3279F9]" />
          <p className="text-[14.5px] text-[#6A6A71]">Loading employee data...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!employee) return null;

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
              <UserCog className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-heading font-medium text-[#121317]">Edit Employee</h1>
              <p className="text-[14.5px] text-[#6A6A71]">Editing {employee.name}&apos;s information</p>
            </div>
          </div>
        </div>

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
      </div>
    </ProtectedRoute>
  );
}
