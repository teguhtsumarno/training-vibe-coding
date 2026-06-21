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
      <SelectTrigger className="w-[180px] bg-white border-[#E1E6EC] rounded-xl focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-300">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent className="bg-white border border-[#E1E6EC] rounded-xl">
        <SelectItem value="ALL" className="focus:bg-[rgba(183,191,217,0.09)] focus:text-[#121317] cursor-pointer">All Statuses</SelectItem>
        <SelectItem value="PENDING_APPROVAL1" className="focus:bg-[rgba(183,191,217,0.09)] focus:text-[#121317] cursor-pointer">Pending L1</SelectItem>
        <SelectItem value="PENDING_APPROVAL2" className="focus:bg-[rgba(183,191,217,0.09)] focus:text-[#121317] cursor-pointer">Pending L2</SelectItem>
        <SelectItem value="APPROVED" className="focus:bg-[rgba(183,191,217,0.09)] focus:text-[#121317] cursor-pointer">Approved</SelectItem>
        <SelectItem value="REJECTED" className="focus:bg-[rgba(183,191,217,0.09)] focus:text-[#121317] cursor-pointer">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}
