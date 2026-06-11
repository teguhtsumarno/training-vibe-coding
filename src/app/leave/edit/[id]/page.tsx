"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PageHeader from "@/components/shared/PageHeader";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import { getLeaveRequestById, updateLeaveRequest } from "@/services/leave-storage";
import { type LeaveRequest } from "@/types/leave";
import { type LeaveRequestFormValues } from "@/validators/leave-validator";
import { ROUTES } from "@/constants";

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
          // Validate status is PENDING_APPROVAL1
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
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  if (!leaveRequest) return null;

  return (
    <ProtectedRoute>
      <PageHeader title="Edit Leave Request" description="Update your pending leave request details" />
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
    </ProtectedRoute>
  );
}
