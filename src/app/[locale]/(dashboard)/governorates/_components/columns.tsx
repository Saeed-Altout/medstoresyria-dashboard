"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconPencil } from "@tabler/icons-react";
import type { Governorate } from "@/types";

interface Args {
  t: (k: string) => string;
  onEdit: (gov: Governorate) => void;
}

export function getGovernorateColumns({ t, onEdit }: Args): ColumnDef<Governorate>[] {
  return [
    {
      accessorKey: "name",
      header: t("name_en"),
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{row.original.name}</span>
          {row.original.name_local && (
            <span className="text-xs text-muted-foreground" dir="rtl">
              {row.original.name_local}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "delivery_fee_usd",
      header: t("delivery_fee"),
      cell: ({ row }) => (
        <span className="font-mono text-sm">${row.original.delivery_fee_usd}</span>
      ),
    },
    {
      accessorKey: "is_active",
      header: t("status"),
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge variant="default" className="text-xs">{t("active")}</Badge>
        ) : (
          <Badge variant="secondary" className="text-xs">{t("inactive")}</Badge>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={() => onEdit(row.original)}
          >
            <IconPencil className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
