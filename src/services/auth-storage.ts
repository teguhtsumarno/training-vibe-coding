import { AuthSession } from "@/types/auth";
import { STORAGE_KEYS } from "@/constants";

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) return false;
    const json = await res.json();
    if (json.success && json.session) {
      localStorage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(json.session));
      return true;
    }
  } catch (error) {
    console.error("Failed to login via API:", error);
  }
  return false;
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const data = localStorage.getItem(STORAGE_KEYS.AUTH_SESSION);
  if (!data) return null;

  try {
    return JSON.parse(data) as AuthSession;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const session = getSession();
  return session !== null && session.isAuthenticated;
}
