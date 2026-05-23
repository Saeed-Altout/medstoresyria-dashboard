"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPencil, IconToggleLeft, IconToggleRight } from "@tabler/icons-react";
import { formatDate, getFullName } from "@/lib/utils/format";
import type { User } from "@/types";

interface GetUserColumnsArgs {
  tName: string;
  tRole: string;
  tActive: string;
  tInactive: string;
  tCreatedAt: string;
  tActivate: string;
  tDeactivate: string;
  onEdit: (user: User) => void;
  onToggle: (user: User) => void;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  sales: "Sales",
  warehouse: "Warehouse",
  accountant: "Accountant",
  technician: "Technician",
  delivery: "Delivery",
};

export function getUserColumns({
  tName,
  tRole,
  tActive,
  tInactive,
  tCreatedAt,
  tActivate,
  tDeactivate,
  onEdit,
  onToggle,
}: GetUserColumnsArgs): ColumnDef<User>[] {
  return [
    {
      id: "name",
      header: tName,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{getFullName(row.original)}</span>
          <span className="text-xs text-muted-foreground">{row.original.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) =>
        row.original.phone ? (
          <span className="text-sm">{row.original.phone}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "role",
      header: tRole,
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {ROLE_LABELS[row.original.role] ?? row.original.role}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="secondary">{tActive}</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">{tInactive}</Badge>
        ),
    },
    {
      id: "createdAt",
      header: tCreatedAt,
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {(row.original as User & { created_at?: string }).created_at
            ? formatDate((row.original as User & { created_at?: string }).created_at!)
            : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onEdit(row.original)}
          >
            <IconPencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            title={row.original.is_active ? tDeactivate : tActivate}
            onClick={() => onToggle(row.original)}
          >
            {row.original.is_active
              ? <IconToggleRight className="size-4 text-green-600" />
              : <IconToggleLeft className="size-4 text-muted-foreground" />}
          </Button>
        </div>
      ),
    },
  ];
}
