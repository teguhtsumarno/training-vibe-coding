"use client";

import { useEffect, useState } from "react";
import { Users, Clock, CheckCircle, XCircle } from "lucide-react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { getAllEmployees } from "@/services/employee-storage";
import { getAllLeaveRequests } from "@/services/leave-storage";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardGrid() {
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  const { session } = useAuth();

  useEffect(() => {
    if (!session) return;

    const fetchData = async () => {
      const allRequests = await getAllLeaveRequests();
      let visibleRequests = [];

      if (session.role === "admin") {
        const emps = await getAllEmployees();
        setTotalEmployees(emps.length);
        visibleRequests = allRequests;
      } else {
        if (session.role === "approval1") {
          visibleRequests = allRequests.filter(req => req.employeeId === session.employeeId || req.status === "PENDING_APPROVAL1");
        } else if (session.role === "approval2") {
          visibleRequests = allRequests.filter(req => req.employeeId === session.employeeId || req.status === "PENDING_APPROVAL2");
        } else {
          visibleRequests = allRequests.filter(req => req.employeeId === session.employeeId);
        }
      }

      setPendingCount(visibleRequests.filter((r) => r.status.startsWith("PENDING")).length);
      setApprovedCount(visibleRequests.filter((r) => r.status === "APPROVED").length);
      setRejectedCount(visibleRequests.filter((r) => r.status === "REJECTED").length);
    };

    fetchData();
  }, [session]);

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {session?.role === "admin" && (
        <DashboardCard
          title="Total Employees"
          value={totalEmployees}
          description="Registered employees"
          icon={<Users className="h-5 w-5" />}
          variant="blue"
        />
      )}
      <DashboardCard
        title="Pending Requests"
        value={pendingCount}
        description="Awaiting approval"
        icon={<Clock className="h-5 w-5" />}
        variant="red"
      />
      <DashboardCard
        title="Approved Requests"
        value={approvedCount}
        description="Approved leave requests"
        icon={<CheckCircle className="h-5 w-5" />}
        variant="blue"
      />
      <DashboardCard
        title="Rejected Requests"
        value={rejectedCount}
        description="Rejected leave requests"
        icon={<XCircle className="h-5 w-5" />}
        variant="red"
      />
    </div>
  );
}
