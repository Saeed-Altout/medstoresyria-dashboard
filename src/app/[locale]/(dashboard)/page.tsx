"use client";

import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import {
  IconShoppingCart,
  IconCurrencyDollar,
  IconClock,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { getSalesSummary } from "@/lib/api/reports.api";
import { getOrders, confirmOrder, rejectOrder } from "@/lib/api/orders.api";
import { getInventoryAlerts } from "@/lib/api/inventory.api";
import { getMaintenanceRequests } from "@/lib/api/maintenance.api";
import { StatsCard } from "@/components/stats-card";
import { StatusBadge } from "@/components/status-badge";
import { formatPrice, formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  SalesSummary,
  PaginatedResponse,
  Order,
  InventorySnapshot,
  MaintenanceRequest,
  ApiResponse,
} from "@/types";

export default function OverviewPage() {
  const t = useTranslations("overview");
  const tOrders = useTranslations("orders");
  const tInventory = useTranslations("inventory");
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split("T")[0];
  const monthStart = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  )
    .toISOString()
    .split("T")[0];

  const { data: summary } = useQuery<SalesSummary, AxiosError>({
    queryKey: ["sales-summary", monthStart, today],
    queryFn: () => getSalesSummary(monthStart, today),
    enabled: canAccess(user?.role, "reports"),
  });

  const { data: pendingOrders } = useQuery<PaginatedResponse<Order>, AxiosError>({
    queryKey: ["pending-orders"],
    queryFn: () => getOrders({ status: "pending", limit: 5 }),
    enabled: canAccess(user?.role, "orders"),
  });

  const { data: inventoryAlerts } = useQuery<InventorySnapshot[], AxiosError>({
    queryKey: ["inventory-alerts"],
    queryFn: getInventoryAlerts,
    enabled: canAccess(user?.role, "inventory"),
  });

  const { data: pendingMaintenance } = useQuery<
    PaginatedResponse<MaintenanceRequest>,
    AxiosError
  >({
    queryKey: ["pending-maintenance"],
    queryFn: () => getMaintenanceRequests({ status: "pending", limit: 5 }),
    enabled: canAccess(user?.role, "maintenance"),
  });

  const confirmMutation = useMutation<string, AxiosError, string>({
    mutationFn: confirmOrder,
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(msg);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const rejectMutation = useMutation<string, AxiosError, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => rejectOrder(id, reason),
    onSuccess: (msg) => {
      queryClient.invalidateQueries({ queryKey: ["pending-orders"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success(msg);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  if (!user) return null;

  const alertCount = inventoryAlerts?.filter((i) => i.status !== "ok").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {canAccess(user.role, "orders") && (
          <StatsCard
            title={t("total_orders")}
            value={summary?.totalOrders ?? pendingOrders?.meta.total ?? "—"}
            icon={IconShoppingCart}
            description={t("this_month")}
          />
        )}
        {canAccess(user.role, "reports") && (
          <StatsCard
            title={t("revenue")}
            value={summary ? formatPrice(summary.totalRevenue) : "—"}
            icon={IconCurrencyDollar}
            description={t("this_month")}
          />
        )}
        {canAccess(user.role, "orders") && (
          <StatsCard
            title={t("pending_orders")}
            value={pendingOrders?.meta.total ?? "—"}
            icon={IconClock}
          />
        )}
        {canAccess(user.role, "inventory") && (
          <StatsCard
            title={t("low_stock")}
            value={alertCount}
            icon={IconAlertTriangle}
          />
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Pending Orders */}
        {canAccess(user.role, "orders") && (
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold">{t("pending_orders_section")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/orders")}
              >
                {tOrders("title")} →
              </Button>
            </div>
            <div className="divide-y">
              {pendingOrders?.data.length === 0 && (
                <p className="text-sm text-muted-foreground p-5 text-center">
                  —
                </p>
              )}
              {pendingOrders?.data.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {order.order_number}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {order.customer_name} · {formatDate(order.created_at)}
                    </p>
                  </div>
                  <span className="text-sm font-medium shrink-0">
                    {formatPrice(order.total_usd)}
                  </span>
                  <StatusBadge kind="order" status={order.status} />
                  {canAccess(user.role, "orders") && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={confirmMutation.isPending}
                        onClick={() => confirmMutation.mutate(order.id)}
                      >
                        {tOrders("action_confirm")}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs text-destructive"
                        disabled={rejectMutation.isPending}
                        onClick={() =>
                          rejectMutation.mutate({ id: order.id, reason: "Rejected from overview" })
                        }
                      >
                        {tOrders("action_reject")}
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Alerts */}
        {canAccess(user.role, "inventory") && (
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold">{t("inventory_alerts_section")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/inventory")}
              >
                {tInventory("title")} →
              </Button>
            </div>
            <div className="divide-y">
              {inventoryAlerts?.filter((i) => i.status !== "ok").length === 0 && (
                <p className="text-sm text-muted-foreground p-5 text-center">—</p>
              )}
              {inventoryAlerts
                ?.filter((i) => i.status !== "ok")
                .map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                    </div>
                    <span className="text-sm shrink-0">
                      {item.stock_qty}/{item.stock_min}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        item.status === "out"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : "bg-yellow-100 text-yellow-800 border-yellow-200"
                      }
                    >
                      {tInventory(
                        `status_${item.status}` as Parameters<
                          typeof tInventory
                        >[0],
                      )}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs shrink-0"
                      onClick={() => router.push("/inventory")}
                    >
                      {tInventory("adjust")}
                    </Button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Pending Maintenance */}
        {canAccess(user.role, "maintenance") && (
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="font-semibold">{t("maintenance_section")}</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/maintenance")}
              >
                →
              </Button>
            </div>
            <div className="divide-y">
              {pendingMaintenance?.data.length === 0 && (
                <p className="text-sm text-muted-foreground p-5 text-center">—</p>
              )}
              {pendingMaintenance?.data.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {req.request_number}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {req.customer_name} · {req.device_type}
                    </p>
                  </div>
                  <StatusBadge kind="maintenance" status={req.status} />
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs shrink-0"
                    onClick={() =>
                      router.push(`/maintenance/${req.id}`)
                    }
                  >
                    →
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
