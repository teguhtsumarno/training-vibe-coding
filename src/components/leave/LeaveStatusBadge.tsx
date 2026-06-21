import { Badge } from "@/components/ui/badge";
import { type LeaveStatus } from "@/types/leave";

interface LeaveStatusBadgeProps {
  status: LeaveStatus;
}

const statusConfig: Record<LeaveStatus, { label: string; className: string }> = {
  PENDING_APPROVAL1: {
    label: "Pending L1",
    className: "border-[#E1E6EC] text-[#6A6A71] bg-transparent hover:bg-transparent rounded-full px-2.5 py-0.5 text-xs font-medium",
  },
  PENDING_APPROVAL2: {
    label: "Pending L2",
    className: "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/10 rounded-full px-2.5 py-0.5 text-xs font-medium",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/10 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-full px-2.5 py-0.5 text-xs font-semibold",
  },
};

export default function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  const config = statusConfig[status as LeaveStatus] || {
    label: status || "Unknown",
    className: "border-[#E1E6EC] text-[#6A6A71] bg-transparent hover:bg-transparent rounded-full px-2.5 py-0.5 text-xs font-medium",
  };
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
