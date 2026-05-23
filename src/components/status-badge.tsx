"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus, MaintenanceStatus } from "@/types";

type StatusBadgeProps =
  | { kind: "order"; status: OrderStatus }
  | { kind: "maintenance"; status: MaintenanceStatus };

const ORDER_COLORS: Record<OrderStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-purple-100 text-purple-800 border-purple-200",
  shipped:   "bg-indigo-100 text-indigo-800 border-indigo-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
  rejected:  "bg-red-100 text-red-800 border-red-200",
};

const MAINTENANCE_COLORS: Record<MaintenanceStatus, string> = {
  pending:     "bg-yellow-100 text-yellow-800 border-yellow-200",
  assigned:    "bg-blue-100 text-blue-800 border-blue-200",
  in_progress: "bg-purple-100 text-purple-800 border-purple-200",
  completed:   "bg-green-100 text-green-800 border-green-200",
  cancelled:   "bg-gray-100 text-gray-700 border-gray-200",
};

export function StatusBadge(props: StatusBadgeProps) {
  const tOrders = useTranslations("orders");
  const tMaintenance = useTranslations("maintenance");

  if (props.kind === "order") {
    const label = tOrders(`status_${props.status}` as Parameters<typeof tOrders>[0]);
    return (
      <Badge variant="outline" className={cn("font-medium text-xs", ORDER_COLORS[props.status])}>
        {label}
      </Badge>
    );
  }

  const label = tMaintenance(`status_${props.status}` as Parameters<typeof tMaintenance>[0]);
  return (
    <Badge variant="outline" className={cn("font-medium text-xs", MAINTENANCE_COLORS[props.status])}>
      {label}
    </Badge>
  );
}
