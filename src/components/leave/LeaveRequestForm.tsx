"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leaveRequestSchema, type LeaveRequestFormValues } from "@/validators/leave-validator";
import { getAllEmployees } from "@/services/employee-storage";
import { getAllLeaveTypes, getEmployeeLeaveBalances } from "@/services/leave-type-storage";
import { type Employee } from "@/types/employee";
import { type LeaveType, type EmployeeLeaveBalance } from "@/types/leave";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";

interface LeaveRequestFormProps {
  onSubmit: (data: LeaveRequestFormValues) => void;
  defaultValues?: Partial<LeaveRequestFormValues>;
  isEdit?: boolean;
}

export default function LeaveRequestForm({ onSubmit, defaultValues, isEdit = false }: LeaveRequestFormProps) {
  const router = useRouter();
  const { session } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [approvers, setApprovers] = useState<Employee[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employeeBalances, setEmployeeBalances] = useState<EmployeeLeaveBalance[]>([]);

  const isAdmin = session?.role === "admin";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveRequestFormValues>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: defaultValues || { employeeId: "", approval1Id: "", leaveTypeId: "", startDate: "", endDate: "", reason: "" },
  });

  const selectedEmployeeId = watch("employeeId");
  const selectedLeaveTypeId = watch("leaveTypeId");
  const startDate = watch("startDate");
  const endDate = watch("endDate");

  // Fetch all employees/approvers + leave types on mount
  useEffect(() => {
    const fetchData = async () => {
      const [allEmps, allLeaveTypes] = await Promise.all([
        getAllEmployees(),
        getAllLeaveTypes(),
      ]);
      setApprovers(allEmps.filter((e) => e.role === "approval1"));
      setLeaveTypes(allLeaveTypes);
      if (isAdmin) {
        setEmployees(allEmps);
      } else if (session?.employeeId) {
        setValue("employeeId", session.employeeId);
      }
    };
    fetchData();
  }, [isAdmin, session, setValue]);

  // Load default form values if editing
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  // Fetch the selected employee's per-type balances
  useEffect(() => {
    if (!selectedEmployeeId) {
      setEmployeeBalances([]);
      return;
    }
    const fetchBalances = async () => {
      const balances = await getEmployeeLeaveBalances(selectedEmployeeId);
      setEmployeeBalances(balances);
    };
    fetchBalances();
  }, [selectedEmployeeId]);

  // Get the balance for the selected leave type
  const selectedBalance = useMemo(() => {
    if (!selectedLeaveTypeId || employeeBalances.length === 0) return null;
    const found = employeeBalances.find((b) => b.leaveTypeId === selectedLeaveTypeId);
    return found ? found.balance : 0;
  }, [selectedLeaveTypeId, employeeBalances]);

  // Calculate current request duration
  const duration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    if (isNaN(timeDiff)) return 0;
    const days = Math.round(timeDiff / (1000 * 3600 * 24)) + 1;
    return days > 0 ? days : 0;
  }, [startDate, endDate]);

  // Calculate old duration if editing (so we can refund it locally for balance comparison)
  const oldDuration = useMemo(() => {
    if (!isEdit || !defaultValues?.startDate || !defaultValues?.endDate) return 0;
    const start = new Date(defaultValues.startDate);
    const end = new Date(defaultValues.endDate);
    const days = Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    return days > 0 ? days : 0;
  }, [isEdit, defaultValues]);

  // Calculate effective available balance for this form (handles edits correctly)
  const availableBalance = useMemo(() => {
    if (selectedBalance === null) return null;
    return isEdit ? selectedBalance + oldDuration : selectedBalance;
  }, [selectedBalance, isEdit, oldDuration]);

  const isBalanceInsufficient = availableBalance !== null && duration > availableBalance;

  // Get the selected leave type name
  const selectedLeaveTypeName = useMemo(() => {
    if (!selectedLeaveTypeId) return "";
    const found = leaveTypes.find((lt) => lt.id === selectedLeaveTypeId);
    return found ? found.name : "";
  }, [selectedLeaveTypeId, leaveTypes]);

  return (
    <div className="bg-[#09090b] border border-white/5 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-blue-500/5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {isAdmin && (
          <div className="space-y-2">
            <Label htmlFor="employeeId" className="text-sm font-semibold text-white tracking-wide">Employee</Label>
            <Select 
              value={watch("employeeId")} 
              onValueChange={(value) => setValue("employeeId", value as string)}
            >
              <SelectTrigger className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300">
                <SelectValue placeholder="Select an employee">
                  {watch("employeeId") ? employees.find(emp => emp.id === watch("employeeId"))?.name : undefined}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-[#09090b] border border-white/5 rounded-xl">
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id} className="focus:bg-blue-500/10 focus:text-white cursor-pointer">
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && (
              <p className="text-xs font-medium text-red-500">{errors.employeeId.message}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="leaveTypeId" className="text-sm font-semibold text-white tracking-wide">Jenis Cuti</Label>
          <Select 
            value={watch("leaveTypeId")} 
            onValueChange={(value) => setValue("leaveTypeId", value as string)}
          >
            <SelectTrigger className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300">
              <SelectValue placeholder="Pilih jenis cuti">
                {watch("leaveTypeId") ? leaveTypes.find(lt => lt.id === watch("leaveTypeId"))?.name : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#09090b] border border-white/5 rounded-xl">
              {leaveTypes.map((lt) => {
                const balance = employeeBalances.find((b) => b.leaveTypeId === lt.id);
                return (
                  <SelectItem key={lt.id} value={lt.id} className="focus:bg-blue-500/10 focus:text-white cursor-pointer">
                    {lt.name} {balance ? `(Sisa: ${balance.balance} hari)` : ""}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {errors.leaveTypeId && (
            <p className="text-xs font-medium text-red-500">{errors.leaveTypeId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="approval1Id" className="text-sm font-semibold text-white tracking-wide">Approval L1</Label>
          <Select 
            value={watch("approval1Id")} 
            onValueChange={(value) => setValue("approval1Id", value as string)}
          >
            <SelectTrigger className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300">
              <SelectValue placeholder="Select Approval L1">
                {watch("approval1Id") ? approvers.find(emp => emp.id === watch("approval1Id"))?.name : undefined}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-[#09090b] border border-white/5 rounded-xl">
              {approvers.map((emp) => (
                <SelectItem key={emp.id} value={emp.id} className="focus:bg-blue-500/10 focus:text-white cursor-pointer">
                  {emp.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.approval1Id && (
            <p className="text-xs font-medium text-red-500">{errors.approval1Id.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-sm font-semibold text-white tracking-wide">Start Date</Label>
            <Input 
              id="startDate" 
              type="date" 
              {...register("startDate")} 
              className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
            />
            {errors.startDate && (
              <p className="text-xs font-medium text-red-500">{errors.startDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-sm font-semibold text-white tracking-wide">End Date</Label>
            <Input 
              id="endDate" 
              type="date" 
              {...register("endDate")} 
              className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
            />
            {errors.endDate && (
              <p className="text-xs font-medium text-red-500">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="reason" className="text-sm font-semibold text-white tracking-wide">Reason</Label>
          <Textarea
            id="reason"
            placeholder="Enter reason for leave"
            rows={4}
            {...register("reason")}
            className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300 resize-none"
          />
          {errors.reason && (
            <p className="text-xs font-medium text-red-500">{errors.reason.message}</p>
          )}
        </div>

        {startDate && endDate && duration > 0 && (
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Durasi Pengajuan:</span>
              <span className="font-semibold text-white">{duration} Hari</span>
            </div>
            {selectedLeaveTypeName && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Jenis Cuti:</span>
                <span className="font-semibold text-white">{selectedLeaveTypeName}</span>
              </div>
            )}
            {selectedBalance !== null && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sisa Saldo {selectedLeaveTypeName}:</span>
                <span className="font-semibold text-white">
                  {isEdit ? `${selectedBalance} Hari (ditambah ${oldDuration} Hari pengajuan ini)` : `${selectedBalance} Hari`}
                </span>
              </div>
            )}
            {isBalanceInsufficient && (
              <div className="text-xs font-semibold text-red-400 mt-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl">
                ⚠️ Jatah {selectedLeaveTypeName} tidak mencukupi! Durasi pengajuan melebihi sisa saldo cuti Anda.
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <Button 
            type="submit" 
            disabled={isSubmitting || isBalanceInsufficient}
            className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-xl shadow-md shadow-red-500/20 py-2.5 font-semibold transition-all duration-300 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : isEdit ? "Update Leave Request" : "Submit Leave Request"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(ROUTES.LEAVE)}
            className="flex-1 border-white/10 hover:border-white/20 bg-transparent text-muted-foreground hover:text-white rounded-xl py-2.5 transition-all duration-300"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
