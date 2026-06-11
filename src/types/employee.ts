export type UserRole = "user" | "approval1" | "approval2" | "admin";

export type Employee = {
  id: string;
  name: string;
  department: string;
  position: string;
  username?: string;
  password?: string;
  role: UserRole;
};
