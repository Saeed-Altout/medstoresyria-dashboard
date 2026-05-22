"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { type ColumnDef, type Row } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { IconDotsVertical } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import {
  getOrders,
  confirmOrder,
  rejectOrder,
  prepareOrder,
  shipOrder,
  deliverOrder,
  cancelOrder,
} from "@/lib/api/orders.api";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PageHeader } from "@/components/shared/PageHeader";
import { DateRangePicker } from "@/components/shared/DateRangePicker";
import { formatPrice, formatDate } from "@/lib/utils/format";
import type {
  Order,
  OrderStatus,
  OrderFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

export default function OrdersPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && !canAccess(user.role, "orders")) router.replace("/overview");
  }, [user, router]);

  const [filters, setFilters] = useState<OrderFilters>({ page: 1 });
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<Order>, AxiosError>({
    queryKey: ["orders", filters],
    queryFn: () => getOrders(filters),
    placeholderData: (prev) => prev,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["orders"] });
    queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
  }

  const confirmMutation = useMutation<void, AxiosError, string>({
    mutationFn: confirmOrder,
    onSuccess: () => {
      invalidate();
      toast.success(t("action_confirm") + " ✓");
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const rejectMutation = useMutation<
    void,
    AxiosError,
    { id: string; reason: string }
  >({
    mutationFn: ({ id, reason }) => rejectOrder(id, reason),
    onSuccess: () => {
      invalidate();
      toast.success(t("action_reject") + " ✓");
      setRejectDialogId(null);
      setRejectReason("");
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const prepareMutation = useMutation<void, AxiosError, string>({
    mutationFn: prepareOrder,
    onSuccess: () => {
      invalidate();
      toast.success(t("action_prepare") + " ✓");
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const shipMutation = useMutation<void, AxiosError, string>({
    mutationFn: shipOrder,
    onSuccess: () => {
      invalidate();
      toast.success(t("action_ship") + " ✓");
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const deliverMutation = useMutation<void, AxiosError, string>({
    mutationFn: deliverOrder,
    onSuccess: () => {
      invalidate();
      toast.success(t("action_deliver") + " ✓");
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const cancelMutation = useMutation<void, AxiosError, string>({
    mutationFn: cancelOrder,
    onSuccess: () => {
      invalidate();
      toast.success(t("action_cancel") + " ✓");
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  function getAvailableActions(
    order: Order,
  ): { label: string; onClick: () => void; destructive?: boolean }[] {
    const role = user?.role;
    const s = order.status;
    const actions: { label: string; onClick: () => void; destructive?: boolean }[] =
      [];

    if (role === "admin" || role === "sales") {
      if (s === "pending") {
        actions.push({
          label: t("action_confirm"),
          onClick: () => confirmMutation.mutate(order.id),
        });
        actions.push({
          label: t("action_reject"),
          onClick: () => {
            setRejectDialogId(order.id);
            setRejectReason("");
          },
          destructive: true,
        });
      }
      if (s === "pending" || s === "confirmed" || s === "preparing") {
        actions.push({
          label: t("action_cancel"),
          onClick: () => cancelMutation.mutate(order.id),
          destructive: true,
        });
      }
    }
    if (role === "admin" || role === "warehouse") {
      if (s === "confirmed") {
        actions.push({
          label: t("action_prepare"),
          onClick: () => prepareMutation.mutate(order.id),
        });
      }
      if (s === "preparing") {
        actions.push({
          label: t("action_ship"),
          onClick: () => shipMutation.mutate(order.id),
        });
      }
    }
    if (role === "admin" || role === "delivery") {
      if (s === "shipped") {
        actions.push({
          label: t("action_deliver"),
          onClick: () => deliverMutation.mutate(order.id),
        });
      }
    }
    return actions;
  }

  const columns: ColumnDef<Order>[] = [
    {
      accessorKey: "order_number",
      header: t("order_number"),
      cell: ({ row }: { row: Row<Order> }) => (
        <span className="font-mono text-sm">{row.original.order_number}</span>
      ),
    },
    {
      id: "customer",
      header: t("customer"),
      cell: ({ row }: { row: Row<Order> }) => (
        <div>
          <p className="font-medium text-sm">{row.original.customer_name}</p>
          <p className="text-xs text-muted-foreground">
            {row.original.customer_phone}
          </p>
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
      cell: ({ row }: { row: Row<Order> }) => row.original.items.length,
    },
    {
      accessorKey: "total_usd",
      header: t("total"),
      cell: ({ row }: { row: Row<Order> }) =>
        formatPrice(row.original.total_usd),
    },
    {
      accessorKey: "status",
      header: tCommon("status"),
      cell: ({ row }: { row: Row<Order> }) => (
        <StatusBadge kind="order" status={row.original.status} />
      ),
    },
    {
      accessorKey: "created_at",
      header: tCommon("date"),
      cell: ({ row }: { row: Row<Order> }) =>
        formatDate(row.original.created_at),
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }: { row: Row<Order> }) => {
        const actions = getAvailableActions(row.original);
        return (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() =>
                router.push(`/orders/${row.original.id}`)
              }
            >
              View
            </Button>
            {actions.length > 0 && (
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
            )}
          </div>
        );
      },
    },
  ];

  function handleSearch(value: string) {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setFilters((f) => ({ ...f, search: value || undefined, page: 1 }));
    }, 400);
  }

  function handleStatusChange(value: string) {
    setFilters((f) => ({
      ...f,
      status: (value === "all" ? undefined : value) as OrderStatus | undefined,
      page: 1,
    }));
  }

  function handleDateChange(range: { from: string; to: string }) {
    setDateRange(range);
    setFilters((f) => ({
      ...f,
      dateFrom: range.from || undefined,
      dateTo: range.to || undefined,
      page: 1,
    }));
  }

  const toolbar = (
    <div className="flex items-center gap-3 flex-wrap">
      <Select onValueChange={handleStatusChange} defaultValue="all">
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t("all_statuses")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("all_statuses")}</SelectItem>
          {(
            [
              "pending",
              "confirmed",
              "preparing",
              "shipped",
              "delivered",
              "cancelled",
              "rejected",
            ] as OrderStatus[]
          ).map((s) => (
            <SelectItem key={s} value={s}>
              {t(`status_${s}` as Parameters<typeof t>[0])}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DateRangePicker value={dateRange} onChange={handleDateChange} />
    </div>
  );

  if (!user) return null;

  return (
    <div className="space-y-5">
      <PageHeader title={t("title")} />

      <DataTable<Order>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        searchable
        onSearch={handleSearch}
        toolbar={toolbar}
      />

      <Dialog
        open={rejectDialogId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDialogId(null);
            setRejectReason("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_reject")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">{t("reject_reason")}</Label>
            <Textarea
              id="reject-reason"
              placeholder={t("reject_reason_placeholder")}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogId(null);
                setRejectReason("");
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => {
                if (rejectDialogId) {
                  rejectMutation.mutate({
                    id: rejectDialogId,
                    reason: rejectReason,
                  });
                }
              }}
            >
              {t("action_reject")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
