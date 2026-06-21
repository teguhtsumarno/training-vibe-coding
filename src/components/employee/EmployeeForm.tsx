"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employeeSchema, type EmployeeFormValues } from "@/validators/employee-validator";
import { ROUTES } from "@/constants";
import { ArrowRight, User, KeyRound } from "lucide-react";
import { type Employee } from "@/types/employee";

interface EmployeeFormProps {
  defaultValues?: EmployeeFormValues;
  onSubmit: (data: EmployeeFormValues) => void;
  isEdit?: boolean;
}

export default function EmployeeForm({ defaultValues, onSubmit, isEdit = false }: EmployeeFormProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: defaultValues ?? { name: "", department: "", position: "", username: "", password: "", email: "", role: "user" },
  });

  const inputClasses = "h-11 bg-white border-[#E1E6EC] rounded-lg px-3.5 text-[16px] text-[#121317] placeholder:text-[#AAB1CC] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white border border-[#E1E6EC] rounded-[16px] overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Section: Personal Info */}
          <div className="p-8 space-y-5">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF2F7]">
                <User className="h-4 w-4 text-[#3279F9]" />
              </div>
              <h3 className="text-[16px] font-medium text-[#121317]">Personal Information</h3>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[14.5px] font-medium text-[#121317]">Full Name</Label>
              <Input 
                id="name" 
                placeholder="e.g. John Doe" 
                {...register("name")} 
                className={inputClasses}
              />
              {errors.name && (
                <p className="text-[14.5px] text-[#FF0000]">{errors.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="department" className="text-[14.5px] font-medium text-[#121317]">Department</Label>
                <Input 
                  id="department" 
                  placeholder="e.g. Engineering" 
                  {...register("department")} 
                  className={inputClasses}
                />
                {errors.department && (
                  <p className="text-[14.5px] text-[#FF0000]">{errors.department.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="position" className="text-[14.5px] font-medium text-[#121317]">Position</Label>
                <Input 
                  id="position" 
                  placeholder="e.g. Software Engineer" 
                  {...register("position")} 
                  className={inputClasses}
                />
                {errors.position && (
                  <p className="text-[14.5px] text-[#FF0000]">{errors.position.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#E1E6EC]" />

          {/* Section: Account & Security */}
          <div className="p-8 space-y-5">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF2F7]">
                <KeyRound className="h-4 w-4 text-[#3279F9]" />
              </div>
              <h3 className="text-[16px] font-medium text-[#121317]">Account & Security</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-[14.5px] font-medium text-[#121317]">Username</Label>
                <Input 
                  id="username" 
                  placeholder="e.g. johndoe" 
                  {...register("username")} 
                  className={inputClasses}
                />
                {errors.username && (
                  <p className="text-[14.5px] text-[#FF0000]">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-[14.5px] font-medium text-[#121317]">Password</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="••••••••" 
                  {...register("password")} 
                  className={inputClasses}
                />
                {errors.password && (
                  <p className="text-[14.5px] text-[#FF0000]">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[14.5px] font-medium text-[#121317]">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="employee@company.com" 
                {...register("email")} 
                className={inputClasses}
              />
              {errors.email && (
                <p className="text-[14.5px] text-[#FF0000]">{errors.email.message}</p>
              )}
              <p className="text-[14.5px] text-[#6A6A71] mt-1">Used for leave request email notifications</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role" className="text-[14.5px] font-medium text-[#121317]">Role</Label>
              <Select onValueChange={(value) => setValue("role", value as Employee["role"])} defaultValue={defaultValues?.role}>
                <SelectTrigger className="h-11 bg-white border-[#E1E6EC] rounded-lg text-[16px] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user" className="cursor-pointer">Employee</SelectItem>
                  <SelectItem value="approval1" className="cursor-pointer">Approval Level 1</SelectItem>
                  <SelectItem value="approval2" className="cursor-pointer">Approval Level 2</SelectItem>
                  <SelectItem value="admin" className="cursor-pointer">Administrator</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-[14.5px] text-[#FF0000]">{errors.role.message}</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-[#E1E6EC] bg-[#F8F9FC] px-8 py-5">
            <div className="flex items-center justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push(ROUTES.EMPLOYEES)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="cta"
                size="lg"
                disabled={isSubmitting}
                className="px-6 group"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isEdit ? "Update Employee" : "Create Employee"}
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
