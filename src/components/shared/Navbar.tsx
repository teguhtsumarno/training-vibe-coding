"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";
import { LogOut } from "lucide-react";

const getNavLinks = (role?: string) => {
  const links: { href: string; label: string }[] = [{ href: ROUTES.DASHBOARD, label: "Dashboard" }];
  
  if (role === "admin") {
    links.push({ href: ROUTES.EMPLOYEES, label: "Employees" });
    links.push({ href: ROUTES.LEAVE, label: "All Leave Requests" });
  } else if (role === "approval1" || role === "approval2") {
    links.push({ href: ROUTES.LEAVE, label: "Approvals" });
  } else {
    links.push({ href: ROUTES.LEAVE, label: "My Leave" });
  }
  
  return links;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout } = useAuth();

  if (([ROUTES.LOGIN, ROUTES.CODE_REVIEW] as string[]).includes(pathname)) {
    return null;
  }

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="sticky top-4 z-50 w-full max-w-7xl mx-auto px-4 hidden md:block">
      <div className="flex h-16 items-center px-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md shadow-lg shadow-blue-500/5 justify-between">
        <Link
          href={ROUTES.DASHBOARD}
          className="mr-8 font-heading font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 transition-opacity hover:opacity-90"
        >
          Leave Management
        </Link>

        <nav className="flex items-center gap-2 flex-1">
          {getNavLinks(session?.role).map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
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

        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="rounded-xl font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
