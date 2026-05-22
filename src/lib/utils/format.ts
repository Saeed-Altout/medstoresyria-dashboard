import type { OrderStatus, MaintenanceStatus, User } from "@/types";

export function formatPrice(amount: string | number): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return `$${num.toFixed(2)}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} · ${time}`;
}

export function getFullName(
  u: Pick<User, "first_name" | "last_name">,
): string {
  return `${u.first_name} ${u.last_name}`;
}

export function getOrderStatusColor(s: OrderStatus): string {
  const map: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
    rejected: "bg-red-100 text-red-800",
  };
  return map[s];
}

export function getMaintenanceStatusColor(s: MaintenanceStatus): string {
  const map: Record<MaintenanceStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    assigned: "bg-blue-100 text-blue-800",
    in_progress: "bg-purple-100 text-purple-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-gray-100 text-gray-800",
  };
  return map[s];
}
