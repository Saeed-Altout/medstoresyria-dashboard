"use client";

import { type ColumnDef, type Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { StatusBadge } from "@/components/status-badge";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types";

export interface OrderAction {
  label: string;
  onClick: () => void;
  destructive?: boolean;
}

interface GetOrderColumnsArgs {
  t: (key: string) => string;
  tCommon: (key: string) => string;
  onView: (id: string) => void;
  onReject: (id: string) => void;
  getActions: (order: Order) => OrderAction[];
}

export function getOrderColumns({
  t,
  tCommon,
  onView,
  getActions,
}: GetOrderColumnsArgs): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "order_number",
      header: t("order_number"),
      cell: ({ row }: { row: Row<Order> }) => (
        <button
          className="font-mono text-sm text-primary hover:underline underline-offset-2 cursor-pointer"
          onClick={() => onView(row.original.id)}
        >
          {row.original.order_number}
        </button>
      ),
    },
    {
      id: "customer",
      header: t("customer"),
      cell: ({ row }: { row: Row<Order> }) => (
        <div>
          <p className="font-medium text-sm">{row.original.customer_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.customer_phone}</p>
        </div>
      ),
    },
    {
      id: "governorate",
      header: t("governorate"),
      cell: ({ row }: { row: Row<Order> }) =>
        row.original.governorate.name_local ?? row.original.governorate.name,
    },
    {
      id: "items",
      header: t("items"),
      cell: ({ row }: { row: Row<Order> }) => row.original.items?.length ?? 0,
    },
    {
      accessorKey: "total_usd",
      header: t("total"),
      cell: ({ row }: { row: Row<Order> }) => formatPrice(row.original.total_usd),
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }: { row: Row<Order> }) => (
        <StatusBadge kind="order" status={row.original.status as OrderStatus} />
      ),
    },
    {
      accessorKey: "created_at",
      header: tCommon("date"),
      cell: ({ row }: { row: Row<Order> }) => formatDate(row.original.created_at),
    },
    {
      id: "actions",
      cell: ({ row }: { row: Row<Order> }) => {
        const actions = getActions(row.original);
        if (actions.length === 0) return null;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7">
                <IconDotsVertical className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.label}
                  onClick={action.onClick}
                  className={action.destructive ? "text-destructive" : ""}
                >
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
