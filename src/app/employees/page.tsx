"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PageHeader from "@/components/shared/PageHeader";
import EmployeeTable from "@/components/employee/EmployeeTable";
import EmployeeSearchBar from "@/components/employee/EmployeeSearchBar";
import EmployeeDeleteDialog from "@/components/employee/EmployeeDeleteDialog";
import { getAllEmployees, deleteEmployee } from "@/services/employee-storage";
import { deleteLeaveRequestsByEmployeeId } from "@/services/leave-storage";
import { type Employee } from "@/types/employee";
import { ROUTES } from "@/constants";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadEmployees = async () => {
    const data = await getAllEmployees();
    setEmployees(data);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter((emp) => emp.name.toLowerCase().includes(query));
  }, [employees, searchQuery]);

  const handleDeleteClick = (employee: Employee) => {
    setDeleteTarget(employee);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      setDeleteLoading(true);
      try {
        await deleteEmployee(deleteTarget.id);
        await deleteLeaveRequestsByEmployeeId(deleteTarget.id);
        toast.success(`Employee "${deleteTarget.name}" deleted successfully`);
        loadEmployees();
      } catch (error) {
        console.error("Failed to delete employee:", error);
        toast.error("Failed to delete employee");
      } finally {
        setDeleteLoading(false);
      }
    }
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <PageHeader
        title="Employees"
        description="Manage your employee records"
        action={
          <Button asChild variant="cta" className="px-5 cursor-pointer">
            <Link href={ROUTES.EMPLOYEES_NEW}>
              <Plus className="h-4 w-4 mr-2" />
              Add Employee
            </Link>
          </Button>
        }
      />
      <div className="space-y-4">
        <EmployeeSearchBar value={searchQuery} onChange={setSearchQuery} />
        <EmployeeTable employees={filteredEmployees} onDelete={handleDeleteClick} />
      </div>
      <EmployeeDeleteDialog
        employee={deleteTarget}
        open={deleteDialogOpen}
        loading={deleteLoading}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </ProtectedRoute>
  );
}
