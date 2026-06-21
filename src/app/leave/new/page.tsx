"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import { createLeaveRequest } from "@/services/leave-storage";
import { type LeaveRequestFormValues } from "@/validators/leave-validator";
import { ROUTES } from "@/constants";
import { ArrowLeft, FilePlus } from "lucide-react";
import Link from "next/link";

export default function NewLeavePage() {
  const router = useRouter();

  const handleSubmit = async (data: LeaveRequestFormValues) => {
    await createLeaveRequest(data);
    toast.success("Leave request submitted successfully");
    router.push(ROUTES.LEAVE);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <Link
          href={ROUTES.LEAVE}
          className="inline-flex items-center gap-1.5 text-[14.5px] text-[#45474D] hover:text-[#121317] transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leave Requests
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#121317]">
              <FilePlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-heading font-medium text-[#121317]">New Leave Request</h1>
              <p className="text-[14.5px] text-[#6A6A71]">Submit a new leave request for approval</p>
            </div>
          </div>
        </div>

        <LeaveRequestForm onSubmit={handleSubmit} />
      </div>
    </ProtectedRoute>
  );
}
