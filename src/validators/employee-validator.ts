import { z } from "zod";

export const employeeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "approval1", "approval2", "admin"]),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
