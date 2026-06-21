"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface EmployeeSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EmployeeSearchBar({ value, onChange }: EmployeeSearchBarProps) {
  return (
    <div className="relative max-w-md w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6A6A71] transition-colors group-focus-within:text-blue-400" />
      <Input
        placeholder="Search employees by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9 bg-white border-[#E1E6EC] rounded-xl focus:border-[#3279F9] focus:ring-[3px] focus:ring-[rgba(50,121,249,0.1)] transition-all duration-300"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-[#F8F9FC] text-[#6A6A71] hover:text-[#121317]"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
