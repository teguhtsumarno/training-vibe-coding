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
import { Pencil, Trash2, User } from "lucide-react";

interface EmployeeTableProps {
  employees: Employee[];
  onDelete: (employee: Employee) => void;
}

export default function EmployeeTable({ employees, onDelete }: EmployeeTableProps) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-16 bg-[#09090b] rounded-2xl border border-white/5 p-8 max-w-md mx-auto shadow-lg shadow-red-500/5 mt-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-4 text-red-500">
          <User className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-heading font-bold text-white">No employees found</h3>
        <p className="text-sm text-muted-foreground mt-2">Add your first employee to get started in the system.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#09090b] shadow-xl shadow-blue-500/5">
      <Table>
        <TableHeader className="bg-black/40 border-b border-white/5">
          <TableRow className="border-b border-white/5 hover:bg-transparent">
            <TableHead className="font-heading font-semibold text-white tracking-wider">Name</TableHead>
            <TableHead className="font-heading font-semibold text-white tracking-wider">Department</TableHead>
            <TableHead className="font-heading font-semibold text-white tracking-wider">Position</TableHead>
            <TableHead className="font-heading font-semibold text-white tracking-wider text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow 
              key={employee.id}
              className="border-b border-white/5 hover:bg-blue-500/5 transition-colors duration-300"
            >
              <TableCell className="font-medium text-white">{employee.name}</TableCell>
              <TableCell className="text-muted-foreground">{employee.department}</TableCell>
              <TableCell className="text-muted-foreground">{employee.position}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
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
                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
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
