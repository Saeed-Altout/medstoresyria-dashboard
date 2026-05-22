import type { UserRole } from "@/types";

export const ROLE_PERMISSIONS = {
  overview: [
    "admin",
    "sales",
    "warehouse",
    "accountant",
    "technician",
    "delivery",
  ],
  orders: ["admin", "sales", "warehouse", "delivery"],
  products: ["admin", "sales"],
  inventory: ["admin", "warehouse", "sales"],
  maintenance: ["admin", "sales", "technician"],
  invoices: ["admin", "sales", "accountant"],
  reports: ["admin", "accountant"],
  users: ["admin"],
  settings: ["admin"],
} as const satisfies Record<string, readonly UserRole[]>;

export type PermissionSection = keyof typeof ROLE_PERMISSIONS;

export function canAccess(
  role: UserRole | undefined,
  section: PermissionSection,
): boolean {
  if (!role) return false;
  return (ROLE_PERMISSIONS[section] as readonly string[]).includes(role);
}
