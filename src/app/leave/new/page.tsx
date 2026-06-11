"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PageHeader from "@/components/shared/PageHeader";
import LeaveRequestForm from "@/components/leave/LeaveRequestForm";
import { createLeaveRequest } from "@/services/leave-storage";
import { type LeaveRequestFormValues } from "@/validators/leave-validator";
import { ROUTES } from "@/constants";

export default function NewLeavePage() {
  const router = useRouter();

  const handleSubmit = async (data: LeaveRequestFormValues) => {
    await createLeaveRequest(data);
    toast.success("Leave request submitted successfully");
    router.push(ROUTES.LEAVE);
  };

  return (
    <ProtectedRoute>
      <PageHeader title="New Leave Request" description="Submit a new leave request" />
      <LeaveRequestForm onSubmit={handleSubmit} />
    </ProtectedRoute>
  );
}
