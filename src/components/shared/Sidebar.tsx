"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";
import { getNavLinks, getRoleLabel, getInitials } from "@/lib/navigation";
import { Menu, LogOut, User } from "lucide-react";



export default function Sidebar() {
  const [open, setOpen] = useState(false);
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
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center border-b border-[#E1E6EC] bg-white px-4 justify-between">
        {/* Left: Hamburger + Title */}
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="rounded-full hover:bg-[rgba(183,191,217,0.09)]" />}>
              <Menu className="h-5 w-5 text-[#121317]" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-white border-r border-[#E1E6EC] p-0 flex flex-col">
              {/* Header */}
              <SheetHeader className="p-6 pb-4">
                <SheetTitle className="text-left font-heading font-medium text-xl tracking-wider text-[#121317]">
                  Leave Management
                </SheetTitle>
              </SheetHeader>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-1 px-4 flex-1">
                {getNavLinks(session?.role).map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`px-4 py-2.5 rounded-[9999px] text-[14.5px] font-medium transition-all duration-200 ${
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

              {/* User Profile Section at bottom */}
              <div className="border-t border-[#E1E6EC] p-4">
                <div className="flex items-center gap-3 px-2 py-2 mb-2">
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
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-[9999px] px-4 py-2.5 text-[14.5px] font-medium text-[#FF0000] transition-all duration-200 hover:bg-[rgba(255,0,0,0.04)] cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="ml-3 font-heading font-medium text-lg tracking-wide text-[#121317]">
            Leave Management
          </span>
        </div>

        {/* Right: User Avatar on mobile header */}
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#3279F9] text-white text-[13px] font-medium">
            {getInitials(session?.username)}
          </div>
        </div>
      </div>
    </div>
  );
}
