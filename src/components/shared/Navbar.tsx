"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";
import { getNavLinks, getRoleLabel, getInitials } from "@/lib/navigation";
import { LogOut, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



export default function Navbar() {
  const pathname = usePathname();
  const { session, logout, isLoading, isAuthenticated } = useAuth();

  // Hide on login, code-review, or when not authenticated
  if (([ROUTES.LOGIN, ROUTES.CODE_REVIEW] as string[]).includes(pathname)) {
    return null;
  }

  if (isLoading || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 hidden md:block">
      <div className="flex h-16 items-center px-6 rounded-[16px] border border-[#E1E6EC] bg-white shadow-sm justify-between">
        <Link
          href={ROUTES.DASHBOARD}
          className="mr-8 font-heading font-medium text-xl tracking-wider text-[#121317] transition-opacity hover:opacity-90"
        >
          Leave Management
        </Link>

        <nav className="flex items-center gap-1 flex-1">
          {getNavLinks(session?.role).map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-full text-[14.5px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-[rgba(50,121,249,0.1)] text-[#3279F9]"
                    : "text-[#45474D] hover:text-[#121317] hover:bg-[rgba(183,191,217,0.09)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* User Profile Dropdown */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2.5 rounded-[9999px] px-1.5 py-1.5 pr-3 transition-all duration-200 hover:bg-[rgba(183,191,217,0.09)] outline-none cursor-pointer select-none"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3279F9] text-white text-[13px] font-medium">
                {getInitials(session?.username)}
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-[14.5px] font-medium text-[#121317]">
                  {session?.username || "User"}
                </span>
                <span className="text-[12px] text-[#6A6A71] leading-none">
                  {getRoleLabel(session?.role)}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 text-[#6A6A71]" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" sideOffset={8} className="w-56">
              <div className="px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#3279F9] text-white text-[14px] font-medium shrink-0">
                    {getInitials(session?.username)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14.5px] font-medium text-[#121317]">
                      {session?.username || "User"}
                    </span>
                    <span className="text-[12px] text-[#6A6A71]">
                      {getRoleLabel(session?.role)}
                    </span>
                  </div>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="px-3 py-2 cursor-pointer" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2 text-[#FF0000]" />
                <span className="text-[#FF0000]">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
