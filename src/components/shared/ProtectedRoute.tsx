"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const { session, isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !session) {
      router.replace(ROUTES.LOGIN);
    } else if (allowedRoles && !allowedRoles.includes(session.role)) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isLoading, isAuthenticated, session, router, allowedRoles]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const isAllowed = session && (!allowedRoles || allowedRoles.includes(session.role));

  if (!isAuthenticated || !isAllowed) {
    return null;
  }

  return <>{children}</>;
}
