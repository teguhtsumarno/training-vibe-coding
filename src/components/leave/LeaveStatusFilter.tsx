"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaveStatusFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export default function LeaveStatusFilter({ value, onChange }: LeaveStatusFilterProps) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val || "")}>
      <SelectTrigger className="w-[180px] bg-[#09090b] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent className="bg-[#09090b] border border-white/5 rounded-xl">
        <SelectItem value="ALL" className="focus:bg-blue-500/10 focus:text-white cursor-pointer">All Statuses</SelectItem>
        <SelectItem value="PENDING_APPROVAL1" className="focus:bg-blue-500/10 focus:text-white cursor-pointer">Pending L1</SelectItem>
        <SelectItem value="PENDING_APPROVAL2" className="focus:bg-blue-500/10 focus:text-white cursor-pointer">Pending L2</SelectItem>
        <SelectItem value="APPROVED" className="focus:bg-blue-500/10 focus:text-white cursor-pointer">Approved</SelectItem>
        <SelectItem value="REJECTED" className="focus:bg-blue-500/10 focus:text-white cursor-pointer">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}
