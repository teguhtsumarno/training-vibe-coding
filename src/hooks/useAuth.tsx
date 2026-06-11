"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AuthSession } from "@/types/auth";
import * as authStorage from "@/services/auth-storage";
import { ROUTES } from "@/constants";

interface AuthContextType {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load session on mount
  useEffect(() => {
    const currentSession = authStorage.getSession();
    setSession(currentSession);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      const success = await authStorage.login(username, password);
      if (success) {
        const currentSession = authStorage.getSession();
        setSession(currentSession);
      }
      return success;
    },
    []
  );

  const logout = useCallback(() => {
    authStorage.logout();
    setSession(null);
    router.push(ROUTES.LOGIN);
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        isAuthenticated: session?.isAuthenticated ?? false,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
