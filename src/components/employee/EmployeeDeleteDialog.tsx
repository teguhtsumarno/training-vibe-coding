"use client";

import { Loader2 } from "lucide-react";
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
  loading?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export default function EmployeeDeleteDialog({
  employee,
  open,
  loading = false,
  onOpenChange,
  onConfirm,
}: EmployeeDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
      <AlertDialogContent className="bg-white border border-[#E1E6EC] rounded-2xl max-w-md p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading font-medium text-[#121317] text-xl">Delete Employee</AlertDialogTitle>
          <AlertDialogDescription className="text-[#6A6A71] text-sm leading-relaxed mt-2">
            Are you sure you want to delete <strong className="text-red-400 font-semibold">{employee?.name}</strong>? This
            will also delete all their leave requests. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3">
          <AlertDialogCancel
            disabled={loading}
            className="border border-[#E1E6EC] bg-white text-[#45474D] hover:bg-[rgba(183,191,217,0.09)] hover:text-[#121317] rounded-[9999px] py-2 px-5 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            variant="destructive"
            className="py-2 px-5 rounded-[9999px] cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </span>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
