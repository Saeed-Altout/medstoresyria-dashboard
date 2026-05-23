"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils/format";
import type { InventoryLog } from "@/types";

interface GetLogColumnsArgs {
  tLogTypeIn: string;
  tLogTypeOut: string;
  tLogTypeAdjustment: string;
  tReference: string;
  tBy: string;
}

function TypeBadge({ type, labels }: { type: InventoryLog["type"]; labels: { in: string; out: string; adjustment: string } }) {
  if (type === "in") return <Badge variant="secondary">{labels.in}</Badge>;
  if (type === "out") return <Badge variant="outline" className="text-muted-foreground">{labels.out}</Badge>;
  return <Badge variant="outline">{labels.adjustment}</Badge>;
}

export function getLogColumns({ tLogTypeIn, tLogTypeOut, tLogTypeAdjustment, tReference, tBy }: GetLogColumnsArgs): ColumnDef<InventoryLog>[] {
  return [
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.product?.name ?? "—"}</span>,
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => (
        <TypeBadge
          type={row.original.type}
          labels={{ in: tLogTypeIn, out: tLogTypeOut, adjustment: tLogTypeAdjustment }}
        />
      ),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.quantity}</span>,
    },
    {
      accessorKey: "reason",
      header: "Reason",
      cell: ({ row }) => <span className="text-sm capitalize text-muted-foreground">{row.original.reason}</span>,
    },
    {
      id: "reference",
      header: tReference,
      cell: ({ row }) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.original.reference_id ?? "—"}
        </span>
      ),
    },
    {
      id: "user",
      header: tBy,
      cell: ({ row }) =>
        row.original.user
          ? <span className="text-sm">{row.original.user.first_name} {row.original.user.last_name}</span>
          : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDateTime(row.original.created_at)}</span>,
    },
  ];
}
