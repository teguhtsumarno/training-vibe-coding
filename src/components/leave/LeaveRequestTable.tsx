"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import LeaveStatusBadge from "@/components/leave/LeaveStatusBadge";
import { type LeaveRequestWithRelations } from "@/types/leave";
import { type Employee } from "@/types/employee";
import { Check, X, Calendar, Edit, Trash, Clock } from "lucide-react";

interface LeaveRequestTableProps {
  leaveRequests: LeaveRequestWithRelations[];
  employees: Employee[];
  userRole: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onDelete?: (id: string) => void;
  onViewHistory?: (id: string) => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function LeaveRequestTable({
  leaveRequests,
  employees,
  userRole,
  onApprove,
  onReject,
  onDelete,
  onViewHistory,
}: LeaveRequestTableProps) {
  if (leaveRequests.length === 0) {
    return (
      <div className="text-center py-16 border border-[#E1E6EC] p-8 max-w-md mx-auto mt-10">
        <div className="mx-auto w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-[#E1E6EC] mb-4 text-blue-500">
          <Calendar className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-heading font-bold text-[#121317]">No leave requests found</h3>
        <p className="text-sm text-[#6A6A71] mt-2">Create a new leave request to get started in the system.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-[#E1E6EC]">
      <Table>
        <TableHeader className="bg-[#F8F9FC] border-b border-[#E1E6EC]">
          <TableRow className="border-b border-[#E1E6EC] hover:bg-transparent">
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Employee</TableHead>
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Jenis Cuti</TableHead>
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Start Date</TableHead>
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">End Date</TableHead>
            <TableHead className="hidden sm:table-cell font-heading font-semibold text-[#121317] tracking-wider">Reason</TableHead>
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider">Status</TableHead>
            <TableHead className="font-heading font-semibold text-[#121317] tracking-wider text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaveRequests.map((request) => {
            const employee = employees.find((emp) => emp.id === request.employeeId);
            return (
              <TableRow 
                key={request.id}
                className="border-b border-[#E1E6EC] hover:bg-blue-500/5 transition-colors duration-300"
              >
                <TableCell className="font-medium text-[#121317]">
                  {employee?.name ?? "Unknown"}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    {request.leaveType?.name ?? "—"}
                  </span>
                </TableCell>
                <TableCell className="text-[#6A6A71]">{formatDate(request.startDate)}</TableCell>
                <TableCell className="text-[#6A6A71]">{formatDate(request.endDate)}</TableCell>
                <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-[#6A6A71]">
                  {request.reason}
                </TableCell>
                <TableCell>
                  <LeaveStatusBadge status={request.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {((userRole === "admin" && (request.status === "PENDING_APPROVAL1" || request.status === "PENDING_APPROVAL2")) ||
                      (userRole === "approval1" && request.status === "PENDING_APPROVAL1") ||
                      (userRole === "approval2" && request.status === "PENDING_APPROVAL2")) && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onApprove(request.id)}
                          className="h-8 w-8"
                        >
                          <Check className="h-4 w-4" />
                          <span className="sr-only">Approve</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onReject(request.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                        </Button>
                      </>
                    )}

                    {request.status === "PENDING_APPROVAL1" && (userRole === "admin" || userRole === "user") && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          className="h-8 w-8"
                        >
                          <Link href={`/leave/edit/${request.id}`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Link>
                        </Button>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(request.id)}
                            className="h-8 w-8"
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        )}
                      </>
                    )}
                    {onViewHistory && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onViewHistory(request.id)}
                        className="h-8 w-8"
                      >
                        <Clock className="h-4 w-4" />
                        <span className="sr-only">History</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
