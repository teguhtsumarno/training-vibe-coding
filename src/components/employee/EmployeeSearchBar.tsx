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
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-blue-400" />
      <Input
        placeholder="Search employees by name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-9 pr-9 bg-[#09090b] border-white/10 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500/25 transition-all duration-300"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white"
          onClick={() => onChange("")}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}
