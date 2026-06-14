"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconPencil, IconPhoto, IconTrash } from "@tabler/icons-react";
import type { Category } from "@/types";

export interface FlatCategory extends Omit<Category, "children"> {
  parentName?: string;
}

export function flattenTree(cats: Category[], parentName?: string): FlatCategory[] {
  return cats.flatMap((c) => [
    {
      id: c.id,
      slug: c.slug,
      imageUrl: c.imageUrl,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      name: c.name,
      description: c.description,
      translations: c.translations,
      parentName,
    },
    ...flattenTree(c.children ?? [], c.name),
  ]);
}

export function findInTree(cats: Category[], id: string): Category | null {
  for (const c of cats) {
    if (c.id === id) return c;
    const found = findInTree(c.children ?? [], id);
    if (found) return found;
  }
  return null;
}

interface GetCategoryColumnsArgs {
  tName: string;
  tParent: string;
  tSortOrder: string;
  tActive: string;
  tInactive: string;
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

export function getCategoryColumns({
  tName,
  tParent,
  tSortOrder,
  tActive,
  tInactive,
  categories,
  onEdit,
  onDelete,
}: GetCategoryColumnsArgs): ColumnDef<FlatCategory>[] {
  return [
    {
      accessorKey: "name",
      header: tName,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-9 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
            {row.original.imageUrl ? (
              <Image
                src={row.original.imageUrl}
                alt={row.original.name}
                width={36}
                height={36}
                className="size-9 object-cover"
                unoptimized
              />
            ) : (
              <IconPhoto className="size-4 text-muted-foreground" />
            )}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-sm">{row.original.name}</span>
            <span className="text-xs text-muted-foreground font-mono">{row.original.slug}</span>
          </div>
        </div>
      ),
    },
    {
      id: "parent",
      header: tParent,
      cell: ({ row }) =>
        row.original.parentName ?? <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "sortOrder",
      header: tSortOrder,
    },
    {
      id: "status",
      header: "",
      cell: ({ row }) =>
        row.original.isActive
          ? <Badge variant="secondary">{tActive}</Badge>
          : <Badge variant="outline" className="text-muted-foreground">{tInactive}</Badge>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const full = findInTree(categories, row.original.id);
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => { if (full) onEdit(full); }}
            >
              <IconPencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              onClick={() => onDelete(row.original.id)}
            >
              <IconTrash className="size-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];
}
