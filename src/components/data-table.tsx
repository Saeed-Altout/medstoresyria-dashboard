"use client"

import * as React from "react"
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type Row,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table"
import { useTranslations } from "next-intl"
import { useDirection } from "@/hooks/use-direction"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { TableSkeleton } from "@/components/table-skeleton"
import { EmptyState } from "@/components/empty-state"
import {
  IconTable,
  IconGripVertical,
  IconChevronLeft,
  IconChevronRight,
  IconChevronsLeft,
  IconChevronsRight,
} from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaginationMeta } from "@/types"

// ─── Drag handle & draggable row ─────────────────────────────────────────────

interface DragHandleProps { id: number }
function DragHandle({ id }: DragHandleProps) {
  const { attributes, listeners } = useSortable({ id })
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 text-muted-foreground hover:bg-transparent cursor-grab"
    >
      <IconGripVertical className="size-3.5" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  )
}

function DraggableRow<T extends { id: number }>({ row }: { row: Row<T> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({ id: row.original.id })
  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface DataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  /** Nodes rendered at the start of the toolbar (left side). */
  searchable?: boolean
  onSearch?: (value: string) => void
  /** Filter controls rendered between search and actions. */
  toolbar?: React.ReactNode
  /** Action buttons rendered at the end of the toolbar (right side). */
  actions?: React.ReactNode
  isLoading?: boolean
  draggable?: boolean
  meta?: PaginationMeta
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
}

// ─── Component ───────────────────────────────────────────────────────────────

export function DataTable<T extends object>({
  columns,
  data: externalData,
  searchable = false,
  onSearch,
  toolbar,
  actions,
  isLoading = false,
  draggable = false,
  meta,
  onPageChange,
  onLimitChange,
}: DataTableProps<T>) {
  const t = useTranslations("common")
  const { iconClass } = useDirection()

  const [internalData, setInternalData] = React.useState(() => externalData)
  React.useEffect(() => { setInternalData(externalData) }, [externalData])

  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])

  const sortableId = React.useId()
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  )

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => draggable ? (internalData as Array<{ id: number }>).map((r) => r.id) : [],
    [draggable, internalData],
  )

  const table = useReactTable({
    data: internalData,
    columns,
    state: { sorting, columnVisibility, rowSelection, columnFilters },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: draggable ? getPaginationRowModel() : undefined,
    getSortedRowModel: getSortedRowModel(),
    manualPagination: !draggable,
    pageCount: !draggable ? (meta?.totalPages ?? -1) : undefined,
  })

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (active && over && active.id !== over.id) {
      setInternalData((prev) => {
        const arr = prev as Array<{ id: number }>
        const oldIndex = dataIds.indexOf(active.id)
        const newIndex = dataIds.indexOf(over.id)
        return arrayMove(arr, oldIndex, newIndex) as T[]
      })
    }
  }

  const hasToolbar = searchable || toolbar || actions
  const hasPagination = !draggable && !!meta
  const from = meta ? (meta.page - 1) * meta.limit + 1 : 0
  const to = meta ? Math.min(meta.page * meta.limit, meta.total) : 0

  const tableBody = isLoading ? (
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
  ) : draggable ? (
    <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
      {table.getRowModel().rows.map((row) => (
        <DraggableRow key={row.id} row={row as Row<{ id: number }>} />
      ))}
    </SortableContext>
  ) : (
    <>
      {table.getRowModel().rows.map((row) => (
        <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
          {row.getVisibleCells().map((cell) => (
            <TableCell key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  )

  return (
    <Card className="gap-0 py-0">
      {hasToolbar && (
        <CardHeader className="border-b px-4 py-3">
          {searchable && (
            <Input
              placeholder={t("search")}
              className="h-8 w-48 text-sm"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          )}
          {(toolbar || actions) && (
            <CardAction>
              <div className="flex items-center gap-2 flex-wrap">
                {toolbar}
                {actions}
              </div>
            </CardAction>
          )}
        </CardHeader>
      )}

      <CardContent className="p-0">
        {draggable ? (
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <Table>
              <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {hg.headers.map((header) => (
                      <TableHead key={header.id} colSpan={header.colSpan}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>{tableBody}</TableBody>
            </Table>
          </DndContext>
        ) : (
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>{tableBody}</TableBody>
          </Table>
        )}
      </CardContent>

      {hasPagination && (
        <CardFooter className="border-t px-4 py-3 flex items-center justify-between gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-2 shrink-0">
            <span className="whitespace-nowrap">{t("rows_per_page")}</span>
            <Select
              value={String(meta!.limit)}
              onValueChange={(v) => onLimitChange?.(Number(v))}
            >
              <SelectTrigger className="h-8 w-16 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <span className="whitespace-nowrap">
            {t("showing")} {from}–{to} {t("of")} {meta!.total} {t("results")}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={meta!.page <= 1}
              onClick={() => onPageChange?.(1)}
            >
              <IconChevronsLeft className={`size-4 ${iconClass}`} />
              <span className="sr-only">{t("first_page")}</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={meta!.page <= 1}
              onClick={() => onPageChange?.(meta!.page - 1)}
            >
              <IconChevronLeft className={`size-4 ${iconClass}`} />
              <span className="sr-only">{t("previous")}</span>
            </Button>
            <span className="tabular-nums font-medium px-2 whitespace-nowrap">
              {meta!.page} / {meta!.totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={meta!.page >= meta!.totalPages}
              onClick={() => onPageChange?.(meta!.page + 1)}
            >
              <IconChevronRight className={`size-4 ${iconClass}`} />
              <span className="sr-only">{t("next")}</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              disabled={meta!.page >= meta!.totalPages}
              onClick={() => onPageChange?.(meta!.totalPages)}
            >
              <IconChevronsRight className={`size-4 ${iconClass}`} />
              <span className="sr-only">{t("last_page")}</span>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

// ─── Re-exports ───────────────────────────────────────────────────────────────

export { DragHandle }

export function selectColumn<T>(): ColumnDef<T> {
  return {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  }
}
