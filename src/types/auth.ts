import { UserRole } from "./employee";

export type AuthSession = {
  username: string;
  role: UserRole;
  employeeId?: string;
  isAuthenticated: boolean;
  loginAt: string;
};
