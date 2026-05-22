"use client";

import { useTranslations } from "next-intl";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type HeaderGroup,
  type Row,
  type Cell,
  type Header,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableSkeleton } from "./TableSkeleton";
import { EmptyState } from "./EmptyState";
import { IconTable } from "@tabler/icons-react";
import type { PaginationMeta } from "@/types";

interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  isLoading?: boolean;
  meta?: PaginationMeta;
  onPageChange?: (page: number) => void;
  searchable?: boolean;
  onSearch?: (value: string) => void;
  toolbar?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  meta,
  onPageChange,
  searchable = false,
  onSearch,
  toolbar,
}: DataTableProps<T>) {
  const t = useTranslations("common");

  const table = useReactTable<T>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: meta?.totalPages ?? -1,
  });

  const from = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className="space-y-4">
      {(searchable || toolbar) && (
        <div className="flex items-center justify-between gap-3">
          {searchable && (
            <Input
              placeholder={t("search")}
              className="max-w-xs"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          )}
          {toolbar && <div className="flex items-center gap-2 ms-auto">{toolbar}</div>}
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg: HeaderGroup<T>) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header: Header<T, unknown>) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="p-0">
                  <TableSkeleton rows={5} cols={columns.length} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <EmptyState icon={IconTable} title={t("no_data")} />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row: Row<T>) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell: Cell<T, unknown>) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {t("showing")} {from}–{to} {t("of")} {meta.total} {t("results")}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page <= 1}
              onClick={() => onPageChange?.(meta.page - 1)}
            >
              {t("previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page >= meta.totalPages}
              onClick={() => onPageChange?.(meta.page + 1)}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
