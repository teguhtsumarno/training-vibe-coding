"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Employee } from "@/types/employee";
import { ROUTES } from "@/constants";
import { Pencil, Trash2, User, Wallet } from "lucide-react";

interface EmployeeTableProps {
  employees: Employee[];
  onDelete: (employee: Employee) => void;
}

export default function EmployeeTable({ employees, onDelete }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-[#E1E6EC] p-8 max-w-md mx-auto  mt-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4 text-red-500">
          <User className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-heading font-bold text-[#121317]">No employees found</h3>
        <p className="text-sm text-[#6A6A71] mt-2">Add your first employee to get started in the system.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#E1E6EC] bg-white ">
      <Table>
        <TableHeader className="bg-[#F8F9FC] border-b border-[#E1E6EC]">
          <TableRow className="border-b border-[#E1E6EC] hover:bg-transparent">
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Name</TableHead>
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Department</TableHead>
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Position</TableHead>
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Role</TableHead>
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow 
              key={employee.id}
              className="border-b border-[#E1E6EC] hover:bg-blue-500/5 transition-colors duration-300"
            >
              <TableCell className="font-medium text-[#121317]">{employee.name}</TableCell>
              <TableCell className="text-[#6A6A71]">{employee.department}</TableCell>
              <TableCell className="text-[#6A6A71]">{employee.position}</TableCell>
              <TableCell className="text-[#6A6A71] capitalize">{employee.role}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    asChild 
                    className="h-8 w-8 rounded-lg hover:text-emerald-500 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all duration-300"
                  >
                    <Link href={`/employees/${employee.id}/balances`}>
                      <Wallet className="h-3.5 w-3.5" />
                      <span className="sr-only">Manage Balance</span>
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    asChild 
                    className="h-8 w-8 rounded-lg hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all duration-300"
                  >
                    <Link href={`${ROUTES.EMPLOYEES_EDIT}/${employee.id}`}>
                      <Pencil className="h-3.5 w-3.5" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(employee)}
                    className="h-8 w-8 rounded-lg text-[#6A6A71] hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
