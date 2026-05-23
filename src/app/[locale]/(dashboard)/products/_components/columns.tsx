"use client";

import { type ColumnDef, type Row } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconDotsVertical } from "@tabler/icons-react";
import { formatPrice } from "@/lib/utils/format";
import type { ProductListItem } from "@/types";

interface GetProductColumnsArgs {
  t: (key: string) => string;
  tCommon: (key: string) => string;
  onView: (product: ProductListItem) => void;
  onDelete: (id: string) => void;
}

export function getProductColumns({
  t,
  tCommon,
  onView,
  onDelete,
}: GetProductColumnsArgs): ColumnDef<ProductListItem>[] {
  return [
    {
      id: "image",
      header: "",
      cell: ({ row }: { row: Row<ProductListItem> }) => (
        <div className="size-10 rounded-md overflow-hidden bg-muted shrink-0">
          {row.original.primaryImageUrl ? (
            <Image
              src={row.original.primaryImageUrl}
              alt={row.original.name}
              width={40}
              height={40}
              className="object-cover size-10"
            />
          ) : (
            <div className="size-10 bg-muted" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: tCommon("name"),
      cell: ({ row }: { row: Row<ProductListItem> }) => (
        <button
          type="button"
          className="text-start hover:underline"
          onClick={() => onView(row.original)}
        >
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-xs text-muted-foreground font-mono">{row.original.slug}</p>
        </button>
      ),
    },
    {
      id: "brand",
      header: t("brand"),
      cell: ({ row }: { row: Row<ProductListItem> }) =>
        row.original.brand?.name ?? "—",
    },
    {
      id: "category",
      header: t("category"),
      cell: ({ row }: { row: Row<ProductListItem> }) =>
        row.original.category?.name ?? "—",
    },
    {
      id: "condition",
      header: t("condition"),
      cell: ({ row }: { row: Row<ProductListItem> }) => (
        <Badge variant="outline">
          {row.original.condition === "new" ? t("condition_new") : t("condition_used")}
        </Badge>
      ),
    },
    {
      accessorKey: "price_usd",
      header: t("price"),
      cell: ({ row }: { row: Row<ProductListItem> }) =>
        formatPrice(row.original.price_usd),
    },
    {
      accessorKey: "stock_qty",
      header: t("stock"),
    },
    {
      id: "is_featured",
      header: t("featured"),
      cell: ({ row }: { row: Row<ProductListItem> }) =>
        row.original.is_featured ? (
          <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-xs">
            {t("featured")}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-xs">—</span>
        ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }: { row: Row<ProductListItem> }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <IconDotsVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(row.original)}>
              {tCommon("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(row.original.id)}
            >
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];
}
