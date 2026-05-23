"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconAdjustments } from "@tabler/icons-react";
import type { InventorySnapshot } from "@/types";

interface GetInventoryColumnsArgs {
  tCurrentStock: string;
  tMinLevel: string;
  tStatusOk: string;
  tStatusLow: string;
  tStatusOut: string;
  tAdjust: string;
  onAdjust: (item: InventorySnapshot) => void;
}

function StatusBadge({ status, labels }: { status: InventorySnapshot["status"]; labels: { ok: string; low: string; out: string } }) {
  if (status === "ok") return <Badge variant="secondary">{labels.ok}</Badge>;
  if (status === "low") return <Badge variant="outline" className="text-amber-600 border-amber-300">{labels.low}</Badge>;
  return <Badge variant="destructive">{labels.out}</Badge>;
}

export function getInventoryColumns({
  tCurrentStock,
  tMinLevel,
  tStatusOk,
  tStatusLow,
  tStatusOut,
  tAdjust,
  onAdjust,
}: GetInventoryColumnsArgs): ColumnDef<InventorySnapshot>[] {
  return [
    {
      accessorKey: "name",
      header: "Product",
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) =>
        row.original.category ? (
          <span className="text-sm text-muted-foreground">{row.original.category}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      accessorKey: "stock_qty",
      header: tCurrentStock,
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.stock_qty}</span>,
    },
    {
      accessorKey: "stock_min",
      header: tMinLevel,
      cell: ({ row }) => <span className="font-mono text-sm text-muted-foreground">{row.original.stock_min}</span>,
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status}
          labels={{ ok: tStatusOk, low: tStatusLow, out: tStatusOut }}
        />
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="h-7" onClick={() => onAdjust(row.original)}>
            <IconAdjustments data-icon="inline-start" className="size-3.5" />
            {tAdjust}
          </Button>
        </div>
      ),
    },
  ];
}
