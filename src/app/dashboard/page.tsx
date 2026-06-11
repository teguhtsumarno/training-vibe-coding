"use client";

import ProtectedRoute from "@/components/shared/ProtectedRoute";
import PageHeader from "@/components/shared/PageHeader";
import DashboardGrid from "@/components/dashboard/DashboardGrid";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <PageHeader
        title="Dashboard"
        description="Overview of your employee leave management"
      />
      <DashboardGrid />
    </ProtectedRoute>
  );
}
