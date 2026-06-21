"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEmployeeById } from "@/services/employee-storage";
import { getEmployeeLeaveBalances } from "@/services/leave-type-storage";
import { type Employee } from "@/types/employee";
import { type EmployeeLeaveBalance } from "@/types/leave";
import { ROUTES } from "@/constants";
import { ArrowLeft, Wallet, Save, Loader2, RotateCcw } from "lucide-react";

export default function EmployeeBalancesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [balances, setBalances] = useState<EmployeeLeaveBalance[]>([]);
  const [editedBalances, setEditedBalances] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [emp, bal] = await Promise.all([
        getEmployeeById(id),
        getEmployeeLeaveBalances(id),
      ]);
      if (!emp) {
        toast.error("Employee not found");
        router.push(ROUTES.EMPLOYEES);
        return;
      }
      setEmployee(emp);
      setBalances(bal);
      // Initialize edited values
      const initial: Record<string, number> = {};
      bal.forEach((b) => {
        initial[b.leaveTypeId] = b.balance;
      });
      setEditedBalances(initial);
      setIsLoading(false);
    };
    fetchData();
  }, [id, router]);

  const handleBalanceChange = (leaveTypeId: string, value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num) && num >= 0) {
      setEditedBalances((prev) => ({ ...prev, [leaveTypeId]: num }));
    }
  };

  const handleSave = async (leaveTypeId: string) => {
    const newBalance = editedBalances[leaveTypeId];
    if (newBalance === undefined) return;

    setSavingId(leaveTypeId);
    try {
      const res = await fetch(`/api/employees/${id}/leave-balances`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveTypeId, balance: newBalance }),
      });
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || "Failed to update balance");
      }
      // Update local state
      setBalances((prev) =>
        prev.map((b) =>
          b.leaveTypeId === leaveTypeId ? { ...b, balance: newBalance } : b
        )
      );
      toast.success("Balance updated successfully");
    } catch (error: any) {
      console.error("Failed to update balance:", error);
      toast.error(error.message || "Failed to update balance");
    } finally {
      setSavingId(null);
    }
  };

  const handleReset = (leaveTypeId: string, originalBalance: number) => {
    setEditedBalances((prev) => ({ ...prev, [leaveTypeId]: originalBalance }));
  };

  const hasChanged = (leaveTypeId: string, originalBalance: number) => {
    return editedBalances[leaveTypeId] !== undefined && editedBalances[leaveTypeId] !== originalBalance;
  };

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={["admin"]}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E1E6EC] border-t-[#3279F9]" />
          <p className="text-[14.5px] text-[#6A6A71]">Loading balance data...</p>
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
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-heading font-medium text-[#121317]">Leave Balances</h1>
              <p className="text-[14.5px] text-[#6A6A71]">
                Managing balances for <span className="font-medium text-[#121317]">{employee.name}</span> — {employee.department}
              </p>
            </div>
          </div>
        </div>

        {/* Employee Info Card */}
        <div className="bg-[#EFF2F7] rounded-[16px] p-5 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-[12px] text-[#6A6A71] mb-0.5">Name</p>
              <p className="text-[14.5px] font-medium text-[#121317]">{employee.name}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6A6A71] mb-0.5">Department</p>
              <p className="text-[14.5px] font-medium text-[#121317]">{employee.department}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6A6A71] mb-0.5">Position</p>
              <p className="text-[14.5px] font-medium text-[#121317]">{employee.position}</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6A6A71] mb-0.5">Role</p>
              <p className="text-[14.5px] font-medium text-[#121317] capitalize">{employee.role}</p>
            </div>
          </div>
        </div>

        {/* Balance Table */}
        <div className="bg-white border border-[#E1E6EC] rounded-[16px] overflow-hidden">
          {balances.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#EFF2F7] flex items-center justify-center mb-4">
                <Wallet className="h-6 w-6 text-[#6A6A71]" />
              </div>
              <h3 className="text-[16px] font-medium text-[#121317]">No leave types found</h3>
              <p className="text-[14.5px] text-[#6A6A71] mt-1">Create leave types first to manage balances.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-[#F8F9FC] border-b border-[#E1E6EC]">
                <TableRow className="border-b border-[#E1E6EC] hover:bg-transparent">
                  <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Leave Type</TableHead>
                  <TableHead className="font-heading font-semibold text-[#121317] tracking-wider w-[140px]">Balance (Days)</TableHead>
                  <TableHead className="font-heading font-semibold text-[#121317] tracking-wider text-right w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {balances.map((balance) => {
                  const leaveType = (balance as any).leaveType;
                  const changed = hasChanged(balance.leaveTypeId, balance.balance);
                  const isSaving = savingId === balance.leaveTypeId;

                  return (
                    <TableRow
                      key={balance.leaveTypeId}
                      className="border-b border-[#E1E6EC] hover:bg-[rgba(50,121,249,0.02)] transition-colors duration-200"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-[#121317]">{leaveType?.name || "Unknown"}</p>
                          {leaveType?.description && (
                            <p className="text-[12px] text-[#6A6A71] mt-0.5">{leaveType.description}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={editedBalances[balance.leaveTypeId] ?? balance.balance}
                          onChange={(e) => handleBalanceChange(balance.leaveTypeId, e.target.value)}
                          disabled={isSaving}
                          className="h-9 w-[100px] bg-white border-[#E1E6EC] rounded-lg text-[16px] text-center font-medium text-[#121317] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200 disabled:opacity-50"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          {changed && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReset(balance.leaveTypeId, balance.balance)}
                              disabled={isSaving}
                              className="h-8 w-8 rounded-lg text-[#6A6A71] hover:text-[#121317] hover:bg-[rgba(183,191,217,0.09)]"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          <Button
                            variant="cta"
                            size="sm"
                            onClick={() => handleSave(balance.leaveTypeId)}
                            disabled={!changed || isSaving}
                            className="h-8 px-3 text-[13px] disabled:opacity-40"
                          >
                            {isSaving ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Save className="h-3.5 w-3.5 mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
