"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { IconPencil, IconTrash } from "@tabler/icons-react";
import type { Brand } from "@/types";

interface GetBrandColumnsArgs {
  tName: string;
  onEdit: (brand: Brand) => void;
  onDelete: (id: string) => void;
}

export function getBrandColumns({ tName, onEdit, onDelete }: GetBrandColumnsArgs): ColumnDef<Brand>[] {
  return [
    {
      id: "logo",
      header: "",
      cell: ({ row }) => (
        <div className="size-9 rounded-md overflow-hidden bg-muted shrink-0 flex items-center justify-center">
          {row.original.logoUrl ? (
            <Image
              src={row.original.logoUrl}
              alt={row.original.name}
              width={36}
              height={36}
              className="object-contain size-9"
            />
          ) : (
            <span className="text-xs text-muted-foreground font-bold uppercase">
              {row.original.name.slice(0, 2)}
            </span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: tName,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-sm">{row.original.name}</span>
          <span className="text-xs text-muted-foreground font-mono">{row.original.slug}</span>
        </div>
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
            className="size-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(row.original.id)}
          >
            <IconTrash className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
