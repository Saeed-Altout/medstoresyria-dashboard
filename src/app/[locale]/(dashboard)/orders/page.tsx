"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import {
  useOrderFilters,
  useGetOrders,
  useConfirmOrder,
  useRejectOrder,
  usePrepareOrder,
  useShipOrder,
  useDeliverOrder,
  useCancelOrder,
} from "@/lib/hooks/orders";
import { useDebouncedSearch } from "@/hooks/use-table-filters";
import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import { getOrderColumns, type OrderAction } from "./_components/columns";
import { OrdersToolbar } from "./_components/orders-toolbar";
import { RejectDialog } from "./_components/reject-dialog";
import { OrderDetailSheet } from "./_components/order-detail-sheet";
import type { Order, OrderStatus } from "@/types";

export default function OrdersPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !canAccess(user.role, "orders")) router.replace("/overview");
  }, [user, router]);

  // ── Filter state ──────────────────────────────────────────────────────────
  const { filters, setPage, setLimit, setSearch, setFilter, resetFilters } = useOrderFilters();

  // ── Sheet / dialog state ──────────────────────────────────────────────────
  const [viewOrderId, setViewOrderId] = useState<string | null>(null);
  const [rejectDialogId, setRejectDialogId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data, isLoading } = useGetOrders(filters);
  const meta = data?.meta ?? { page: filters.page ?? 1, limit: filters.limit ?? 10, total: 0, totalPages: 1 };

  // ── Mutations ─────────────────────────────────────────────────────────────
  const confirmMutation = useConfirmOrder();
  const rejectMutation  = useRejectOrder();
  const prepareMutation = usePrepareOrder();
  const shipMutation    = useShipOrder();
  const deliverMutation = useDeliverOrder();
  const cancelMutation  = useCancelOrder();

  // ── Debounced search ──────────────────────────────────────────────────────
  const handleSearch = useDebouncedSearch(setSearch);

  // ── Row actions per role/status ───────────────────────────────────────────
  function getActions(order: Order): OrderAction[] {
    const role = user?.role;
    const s = order.status;
    const actions: OrderAction[] = [];

    if (role === "admin" || role === "sales") {
      if (s === "pending") {
        actions.push({ label: t("action_confirm"), onClick: () => confirmMutation.mutate(order.id) });
        actions.push({ label: t("action_reject"), onClick: () => { setRejectDialogId(order.id); setRejectReason(""); }, destructive: true });
      }
      if (s === "pending" || s === "confirmed" || s === "preparing") {
        actions.push({ label: t("action_cancel"), onClick: () => cancelMutation.mutate(order.id), destructive: true });
      }
    }
    if (role === "admin" || role === "warehouse") {
      if (s === "confirmed") actions.push({ label: t("action_prepare"), onClick: () => prepareMutation.mutate(order.id) });
      if (s === "preparing") actions.push({ label: t("action_ship"), onClick: () => shipMutation.mutate(order.id) });
    }
    if (role === "admin" || role === "delivery") {
      if (s === "shipped") actions.push({ label: t("action_deliver"), onClick: () => deliverMutation.mutate(order.id) });
    }
    return actions;
  }

  const columns = useMemo(
    () =>
      getOrderColumns({
        t: (k) => t(k as Parameters<typeof t>[0]),
        tCommon: (k) => tCommon(k as Parameters<typeof tCommon>[0]),
        onView: setViewOrderId,
        onReject: (id) => { setRejectDialogId(id); setRejectReason(""); },
        getActions,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user?.role],
  );

  if (!user) return null;

  return (
    <div className="space-y-5">
      <Header title={t("title")} />

      <DataTable<Order>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        meta={meta}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchable
        onSearch={handleSearch}
        toolbar={
          <OrdersToolbar
            onStatusChange={(status) => setFilter("status", status as OrderStatus | undefined)}
            onDateChange={(range) => {
              setFilter("dateFrom", range.from || undefined);
              setFilter("dateTo", range.to || undefined);
            }}
            onReset={resetFilters}
          />
        }
      />

      <OrderDetailSheet
        orderId={viewOrderId}
        onClose={() => setViewOrderId(null)}
      />

      <RejectDialog
        open={rejectDialogId !== null}
        reason={rejectReason}
        isPending={rejectMutation.isPending}
        onReasonChange={setRejectReason}
        onCancel={() => { setRejectDialogId(null); setRejectReason(""); }}
        onConfirm={() => {
          if (rejectDialogId) {
            rejectMutation.mutate(
              { id: rejectDialogId, reason: rejectReason },
              { onSuccess: () => { setRejectDialogId(null); setRejectReason(""); } },
            );
          }
        }}
      />
    </div>
  );
}
