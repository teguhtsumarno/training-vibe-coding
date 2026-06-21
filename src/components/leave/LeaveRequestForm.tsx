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
import { ArrowRight, CalendarDays, FileText, AlertTriangle } from "lucide-react";
import { calculateDuration } from "@/lib/utils";

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

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

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

  const selectedBalance = useMemo(() => {
    if (!selectedLeaveTypeId || employeeBalances.length === 0) return null;
    const found = employeeBalances.find((b) => b.leaveTypeId === selectedLeaveTypeId);
    return found ? found.balance : 0;
  }, [selectedLeaveTypeId, employeeBalances]);

  const duration = useMemo(() => {
    if (!startDate || !endDate) return 0;
    return calculateDuration(startDate, endDate);
  }, [startDate, endDate]);

  const oldDuration = useMemo(() => {
    if (!isEdit || !defaultValues?.startDate || !defaultValues?.endDate) return 0;
    return calculateDuration(defaultValues.startDate, defaultValues.endDate);
  }, [isEdit, defaultValues]);

  const availableBalance = useMemo(() => {
    if (selectedBalance === null) return null;
    return isEdit ? selectedBalance + oldDuration : selectedBalance;
  }, [selectedBalance, isEdit, oldDuration]);

  const isBalanceInsufficient = availableBalance !== null && duration > availableBalance;

  const selectedLeaveTypeName = useMemo(() => {
    if (!selectedLeaveTypeId) return "";
    const found = leaveTypes.find((lt) => lt.id === selectedLeaveTypeId);
    return found ? found.name : "";
  }, [selectedLeaveTypeId, leaveTypes]);

  const selectTriggerClasses = "h-11 bg-white border-[#E1E6EC] rounded-lg text-[16px] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200";
  const inputClasses = "h-11 bg-white border-[#E1E6EC] rounded-lg px-3.5 text-[16px] text-[#121317] placeholder:text-[#AAB1CC] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border border-[#E1E6EC] rounded-[16px] overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Section: Leave Details */}
          <div className="p-8 space-y-5">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF2F7]">
                <FileText className="h-4 w-4 text-[#3279F9]" />
              </div>
              <h3 className="text-[16px] font-medium text-[#121317]">Leave Details</h3>
            </div>

            {isAdmin && (
              <div className="space-y-1.5">
                <Label htmlFor="employeeId" className="text-[14.5px] font-medium text-[#121317]">Employee</Label>
                <Select 
                  value={watch("employeeId")} 
                  onValueChange={(value) => setValue("employeeId", value as string)}
                >
                  <SelectTrigger className={selectTriggerClasses}>
                    <SelectValue placeholder="Select an employee">
                      {watch("employeeId") ? employees.find(emp => emp.id === watch("employeeId"))?.name : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="cursor-pointer">
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.employeeId && (
                  <p className="text-[14.5px] text-[#FF0000]">{errors.employeeId.message}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="leaveTypeId" className="text-[14.5px] font-medium text-[#121317]">Leave Type</Label>
                <Select 
                  value={watch("leaveTypeId")} 
                  onValueChange={(value) => setValue("leaveTypeId", value as string)}
                >
                  <SelectTrigger className={selectTriggerClasses}>
                    <SelectValue placeholder="Select type">
                      {watch("leaveTypeId") ? leaveTypes.find(lt => lt.id === watch("leaveTypeId"))?.name : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((lt) => {
                      const balance = employeeBalances.find((b) => b.leaveTypeId === lt.id);
                      return (
                        <SelectItem key={lt.id} value={lt.id} className="cursor-pointer">
                          {lt.name} {balance ? `(${balance.balance} days)` : ""}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {errors.leaveTypeId && (
                  <p className="text-[14.5px] text-[#FF0000]">{errors.leaveTypeId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="approval1Id" className="text-[14.5px] font-medium text-[#121317]">Approval L1</Label>
                <Select 
                  value={watch("approval1Id")} 
                  onValueChange={(value) => setValue("approval1Id", value as string)}
                >
                  <SelectTrigger className={selectTriggerClasses}>
                    <SelectValue placeholder="Select approver">
                      {watch("approval1Id") ? approvers.find(emp => emp.id === watch("approval1Id"))?.name : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {approvers.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id} className="cursor-pointer">
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.approval1Id && (
                  <p className="text-[14.5px] text-[#FF0000]">{errors.approval1Id.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E1E6EC]" />

          {/* Section: Schedule */}
          <div className="p-8 space-y-5">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF2F7]">
                <CalendarDays className="h-4 w-4 text-[#3279F9]" />
              </div>
              <h3 className="text-[16px] font-medium text-[#121317]">Schedule & Reason</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-[14.5px] font-medium text-[#121317]">Start Date</Label>
                <Input 
                  id="startDate" 
                  type="date" 
                  {...register("startDate")} 
                  className={inputClasses}
                />
                {errors.startDate && (
                  <p className="text-[14.5px] text-[#FF0000]">{errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-[14.5px] font-medium text-[#121317]">End Date</Label>
                <Input 
                  id="endDate" 
                  type="date" 
                  {...register("endDate")} 
                  className={inputClasses}
                />
                {errors.endDate && (
                  <p className="text-[14.5px] text-[#FF0000]">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reason" className="text-[14.5px] font-medium text-[#121317]">Reason</Label>
              <Textarea
                id="reason"
                placeholder="Describe the reason for your leave request..."
                rows={4}
                {...register("reason")}
                className="bg-white border-[#E1E6EC] rounded-lg px-3.5 py-3 text-[16px] text-[#121317] placeholder:text-[#AAB1CC] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200 resize-none"
              />
              {errors.reason && (
                <p className="text-[14.5px] text-[#FF0000]">{errors.reason.message}</p>
              )}
            </div>

            {/* Summary Card */}
            {startDate && endDate && duration > 0 && (
              <div className="rounded-[16px] bg-[#EFF2F7] p-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="h-4 w-4 text-[#3279F9]" />
                  <span className="text-[14.5px] font-medium text-[#121317]">Request Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-[#E1E6EC]">
                    <p className="text-[12px] text-[#6A6A71] mb-0.5">Duration</p>
                    <p className="text-[16px] font-medium text-[#121317]">{duration} Day{duration > 1 ? "s" : ""}</p>
                  </div>
                  {selectedLeaveTypeName && (
                    <div className="bg-white rounded-lg p-3 border border-[#E1E6EC]">
                      <p className="text-[12px] text-[#6A6A71] mb-0.5">Leave Type</p>
                      <p className="text-[16px] font-medium text-[#121317]">{selectedLeaveTypeName}</p>
                    </div>
                  )}
                  {selectedBalance !== null && (
                    <div className="bg-white rounded-lg p-3 border border-[#E1E6EC] col-span-2">
                      <p className="text-[12px] text-[#6A6A71] mb-0.5">Available Balance ({selectedLeaveTypeName})</p>
                      <p className="text-[16px] font-medium text-[#121317]">
                        {isEdit ? `${selectedBalance} Days (+${oldDuration} refund from current request)` : `${selectedBalance} Days`}
                      </p>
                    </div>
                  )}
                </div>
                {isBalanceInsufficient && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-[#FF0000] bg-[rgba(255,0,0,0.02)] px-4 py-3 mt-2">
                    <AlertTriangle className="h-4 w-4 text-[#FF0000] shrink-0 mt-0.5" />
                    <p className="text-[14.5px] text-[#FF0000]">
                      Insufficient balance! The requested duration exceeds your available {selectedLeaveTypeName} balance.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#E1E6EC] bg-[#F8F9FC] px-8 py-5">
            <div className="flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(ROUTES.LEAVE)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="cta"
                size="lg"
                disabled={isSubmitting || isBalanceInsufficient}
                className="px-6 group"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isEdit ? "Update Request" : "Submit Request"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
