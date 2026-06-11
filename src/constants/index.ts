export const STORAGE_KEYS = {
  AUTH_SESSION: "auth_session",
  EMPLOYEES: "employees",
  LEAVE_REQUESTS: "leave_requests",
} as const;

export const AUTH_CREDENTIALS = {
  USERNAME: "admin",
  PASSWORD: "admin123",
} as const;

export const ROUTES = {
  LOGIN: "/login",
  CODE_REVIEW: "/code-review",
  DASHBOARD: "/dashboard",
  EMPLOYEES: "/employees",
  EMPLOYEES_NEW: "/employees/new",
  EMPLOYEES_EDIT: "/employees/edit",
  LEAVE: "/leave",
  LEAVE_NEW: "/leave/new",
} as const;
