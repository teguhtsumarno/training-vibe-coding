"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import { getLeaveRequestById, updateLeaveRequest } from "@/services/leave-storage";
import { type LeaveRequest } from "@/types/leave";
import { type LeaveRequestFormValues } from "@/validators/leave-validator";
import { ROUTES } from "@/constants";
import { ArrowLeft, FileEdit } from "lucide-react";
import Link from "next/link";

export default function EditLeavePage() {
  const params = useParams();
  const router = useRouter();
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const id = params.id as string;

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      try {
        const req = await getLeaveRequestById(id);
        if (req) {
          if (req.status !== "PENDING_APPROVAL1") {
            toast.error("Only leave requests with Pending L1 status can be edited.");
            router.push(ROUTES.LEAVE);
            return;
          }
          setLeaveRequest(req);
        } else {
          toast.error("Leave request not found");
          router.push(ROUTES.LEAVE);
        }
      } catch (error) {
        console.error("Error loading leave request:", error);
        toast.error("Failed to load leave request");
        router.push(ROUTES.LEAVE);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaveRequest();
  }, [id, router]);

  const handleSubmit = async (data: LeaveRequestFormValues) => {
    try {
      await updateLeaveRequest(id, data);
      toast.success("Leave request updated successfully");
      router.push(ROUTES.LEAVE);
    } catch (error) {
      console.error("Error updating leave request:", error);
      toast.error("Failed to update leave request");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E1E6EC] border-t-[#3279F9]" />
          <p className="text-[14.5px] text-[#6A6A71]">Loading leave request...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (!leaveRequest) return null;

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
              <FileEdit className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-[24px] font-heading font-medium text-[#121317]">Edit Leave Request</h1>
              <p className="text-[14.5px] text-[#6A6A71]">Update your pending leave request details</p>
            </div>
          </div>
        </div>

        <LeaveRequestForm
          defaultValues={{
            employeeId: leaveRequest.employeeId,
            approval1Id: leaveRequest.approval1Id,
            leaveTypeId: leaveRequest.leaveTypeId || "",
            startDate: leaveRequest.startDate,
            endDate: leaveRequest.endDate,
            reason: leaveRequest.reason,
          }}
          onSubmit={handleSubmit}
          isEdit
        />
      </div>
    </ProtectedRoute>
  );
}
