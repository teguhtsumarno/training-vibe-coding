"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { type Employee } from "@/types/employee";

interface EmployeeDeleteDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function EmployeeDeleteDialog({
  employee,
  open,
  onOpenChange,
  onConfirm,
}: EmployeeDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[#09090b] border border-white/5 rounded-2xl max-w-md p-6 shadow-2xl shadow-red-500/5">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading font-extrabold text-white text-xl">Delete Employee</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed mt-2">
            Are you sure you want to delete <strong className="text-red-400 font-semibold">{employee?.name}</strong>? This
            will also delete all their leave requests. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3">
          <AlertDialogCancel className="border-white/10 hover:border-white/20 bg-transparent text-muted-foreground hover:text-white rounded-xl py-2 px-4 transition-all duration-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white rounded-xl py-2 px-4 font-semibold transition-all duration-300 border-0 shadow-md shadow-red-900/20 cursor-pointer"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
