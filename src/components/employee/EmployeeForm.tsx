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
    defaultValues: defaultValues ?? { name: "", department: "", position: "", username: "", password: "", role: "user" },
  });

  return (
    <div className="bg-[#09090b] border border-white/5 rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl shadow-blue-500/5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-semibold text-white tracking-wide">Name</Label>
          <Input 
            id="name" 
            placeholder="Enter employee name" 
            {...register("name")} 
            className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
          />
          {errors.name && (
            <p className="text-xs font-medium text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-semibold text-white tracking-wide">Department</Label>
          <Input 
            id="department" 
            placeholder="Enter department" 
            {...register("department")} 
            className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
          />
          {errors.department && (
            <p className="text-xs font-medium text-red-500">{errors.department.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="position" className="text-sm font-semibold text-white tracking-wide">Position</Label>
          <Input 
            id="position" 
            placeholder="Enter position" 
            {...register("position")} 
            className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
          />
          {errors.position && (
            <p className="text-xs font-medium text-red-500">{errors.position.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-semibold text-white tracking-wide">Username</Label>
            <Input 
              id="username" 
              placeholder="Enter username" 
              {...register("username")} 
              className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
            />
            {errors.username && (
              <p className="text-xs font-medium text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-white tracking-wide">Password</Label>
            <Input 
              id="password" 
              type="password"
              placeholder="Enter password" 
              {...register("password")} 
              className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
            />
            {errors.password && (
              <p className="text-xs font-medium text-red-500">{errors.password.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="role" className="text-sm font-semibold text-white tracking-wide">Role</Label>
          <Select onValueChange={(value) => setValue("role", value as any)} defaultValue={defaultValues?.role}>
            <SelectTrigger className="bg-[#030303] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent className="bg-[#09090b] border border-white/5 rounded-xl">
              <SelectItem value="user" className="focus:bg-blue-500/10 focus:text-white cursor-pointer">User</SelectItem>
              <SelectItem value="approval1" className="focus:bg-blue-500/10 focus:text-white cursor-pointer">Approval 1</SelectItem>
              <SelectItem value="approval2" className="focus:bg-blue-500/10 focus:text-white cursor-pointer">Approval 2</SelectItem>
              <SelectItem value="admin" className="focus:bg-blue-500/10 focus:text-white cursor-pointer">Admin</SelectItem>
            </SelectContent>
          </Select>
          {errors.role && (
            <p className="text-xs font-medium text-red-500">{errors.role.message}</p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/5">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white rounded-xl shadow-md shadow-red-500/20 py-2.5 font-semibold transition-all duration-300 border-0"
          >
            {isSubmitting ? "Saving..." : isEdit ? "Update Employee" : "Create Employee"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(ROUTES.EMPLOYEES)}
            className="flex-1 border-white/10 hover:border-white/20 bg-transparent text-muted-foreground hover:text-white rounded-xl py-2.5 transition-all duration-300"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
