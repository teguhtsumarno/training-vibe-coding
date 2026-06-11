"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
import { Menu, LogOut } from "lucide-react";

const getNavLinks = (role?: string) => {
  const links: { href: string; label: string }[] = [{ href: ROUTES.DASHBOARD, label: "Dashboard" }];
  
  if (role === "admin") {
    links.push({ href: ROUTES.EMPLOYEES, label: "Employees" });
    links.push({ href: ROUTES.LEAVE_TYPES, label: "Leave Types" });
    links.push({ href: ROUTES.SMTP_SETTINGS, label: "SMTP" });
    links.push({ href: ROUTES.LEAVE, label: "All Leave Requests" });
  } else if (role === "approval1" || role === "approval2") {
    links.push({ href: ROUTES.LEAVE, label: "Approvals" });
  } else {
    links.push({ href: ROUTES.LEAVE, label: "My Leave" });
  }

  // Calendar accessible by admin, approval1, approval2
  if (role === "admin" || role === "approval1" || role === "approval2") {
    links.push({ href: ROUTES.CALENDAR, label: "Calendar" });
  }
  
  return links;
};

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();

  if (([ROUTES.LOGIN, ROUTES.CODE_REVIEW] as string[]).includes(pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  return (
    <div className="md:hidden">
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center border-b border-white/10 bg-black/60 backdrop-blur-md px-4 justify-between">
        <div className="flex items-center">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="rounded-xl hover:bg-white/5" />}>
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-[#09090b] border-r border-white/10 p-6 flex flex-col justify-between">
              <div>
                <SheetHeader className="mb-8">
                  <SheetTitle className="text-left font-heading font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
                    Leave Management
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-2">
                  {getNavLinks(session?.role).map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-md shadow-red-500/20 font-semibold"
                            : "text-muted-foreground hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {link.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="ghost"
                  className="w-full justify-start rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <span className="ml-3 font-heading font-bold text-lg tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500">
            Leave Management
          </span>
        </div>
      </div>
    </div>
  );
}
