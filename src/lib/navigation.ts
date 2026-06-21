import { ROUTES } from "@/constants";

export function getNavLinks(role?: string) {
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
  if (role === "admin" || role === "approval1" || role === "approval2") {
    links.push({ href: ROUTES.CALENDAR, label: "Calendar" });
  }
  return links;
}

export function getRoleLabel(role?: string) {
  switch (role) {
    case "admin": return "Administrator";
    case "approval1": return "Approval Level 1";
    case "approval2": return "Approval Level 2";
    case "user": return "Employee";
    default: return "User";
  }
}

export function getInitials(username?: string) {
  if (!username) return "U";
  return username.slice(0, 2).toUpperCase();
}
