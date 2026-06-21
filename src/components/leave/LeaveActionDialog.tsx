"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  loading?: boolean;
  onConfirm: (message: string) => void;
}

export default function LeaveActionDialog({
  open,
  onOpenChange,
  action,
  loading = false,
  onConfirm,
}: LeaveActionDialogProps) {
  const isApprove = action === "approve";
  const [message, setMessage] = useState("");

  const handleConfirm = () => {
    onConfirm(message);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (loading) return;
    if (!newOpen) setMessage("");
    onOpenChange(newOpen);
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="bg-white border border-[#E1E6EC] rounded-[16px] max-w-md p-0 overflow-hidden">
        <div className="p-6 pb-4">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-heading font-medium text-[#121317] text-[20px]">
              {isApprove ? "Approve Leave Request" : "Reject Leave Request"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#6A6A71] text-[14.5px] leading-relaxed mt-2">
              {isApprove
                ? "Are you sure you want to approve this leave request?"
                : "Are you sure you want to reject this leave request?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <div className="px-6 pb-4">
          <div className="space-y-1.5">
            <Label className="text-[14.5px] font-medium text-[#121317]">
              Message {isApprove ? "(optional)" : ""}
            </Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                isApprove
                  ? "Add a note for the employee (optional)..."
                  : "Reason for rejection..."
              }
              rows={3}
              disabled={loading}
              className="bg-white border-[#E1E6EC] rounded-lg px-3.5 py-3 text-[16px] text-[#121317] placeholder:text-[#AAB1CC] focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-200 resize-none disabled:opacity-50"
            />
          </div>
        </div>

        <div className="border-t border-[#E1E6EC] bg-[#F8F9FC] px-6 py-4 flex items-center justify-end gap-3">
          <AlertDialogCancel
            disabled={loading}
            className="border border-[#E1E6EC] bg-white text-[#45474D] hover:bg-[rgba(183,191,217,0.09)] hover:text-[#121317] rounded-[9999px] py-2 px-5 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            variant={isApprove ? "cta" : "destructive"}
            className="py-2 px-5 rounded-[9999px] cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              isApprove ? "Approve" : "Reject"
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
