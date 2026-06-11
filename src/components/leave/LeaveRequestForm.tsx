"use client";

import { useEffect, useState } from "react";
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
import { type Employee } from "@/types/employee";
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
    defaultValues: defaultValues || { employeeId: "", approval1Id: "", startDate: "", endDate: "", reason: "" },
  });

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  useEffect(() => {
    const fetchEmps = async () => {
      const allEmps = await getAllEmployees();
      setApprovers(allEmps.filter((e) => e.role === "approval1"));
      if (isAdmin) {
        setEmployees(allEmps);
      } else if (session?.employeeId) {
        setValue("employeeId", session.employeeId);
      }
    };
    fetchEmps();
  }, [isAdmin, session, setValue]);

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

        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-xl shadow-md shadow-red-500/20 py-2.5 font-semibold transition-all duration-300 border-0"
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
