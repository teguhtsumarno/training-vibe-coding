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

interface LeaveActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: "approve" | "reject";
  onConfirm: () => void;
}

export default function LeaveActionDialog({
  open,
  onOpenChange,
  action,
  onConfirm,
}: LeaveActionDialogProps) {
  const isApprove = action === "approve";

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className={`bg-[#09090b] border border-white/5 rounded-2xl max-w-md p-6 shadow-2xl ${
        isApprove ? "shadow-blue-500/5" : "shadow-red-500/5"
      }`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-heading font-extrabold text-white text-xl">
            {isApprove ? "Approve Leave Request" : "Reject Leave Request"}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed mt-2">
            {isApprove
              ? "Are you sure you want to approve this leave request? The employee will be granted leave for the requested dates."
              : "Are you sure you want to reject this leave request? The employee's request status will be updated to rejected."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 gap-3">
          <AlertDialogCancel className="border-white/10 hover:border-white/20 bg-transparent text-muted-foreground hover:text-white rounded-xl py-2 px-4 transition-all duration-300">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={`py-2 px-4 font-semibold transition-all duration-300 border-0 rounded-xl shadow-md cursor-pointer ${
              isApprove
                ? "bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white shadow-blue-900/20"
                : "bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white shadow-red-900/20"
            }`}
          >
            {isApprove ? "Approve" : "Reject"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
