"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useGetInventoryAlerts,
  useGetInventoryLogs,
  useInventoryLogFilters,
} from "@/lib/hooks/inventory";
import { useDebouncedSearch } from "@/hooks/use-table-filters";
import { getInventoryColumns } from "./_components/columns";
import { getLogColumns } from "./_components/log-columns";
import { AdjustStockDialog } from "./_components/adjust-stock-dialog";
import type { InventorySnapshot, UserRole } from "@/types";

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "inventory")) router.replace("/overview");
  }, [user, router]);

  const [adjustItem, setAdjustItem] = useState<InventorySnapshot | null>(null);

  const { data: alerts, isLoading: alertsLoading } = useGetInventoryAlerts();

  const { filters, setPage, setLimit } = useInventoryLogFilters();
  const { data: logs, isLoading: logsLoading } = useGetInventoryLogs(filters);
  const logsMeta = logs?.meta ?? { page: filters.page ?? 1, limit: filters.limit ?? 10, total: 0, totalPages: 1 };
  const handleLogSearch = useDebouncedSearch(useInventoryLogFilters.getState().setSearch);

  const alertColumns = useMemo(
    () =>
      getInventoryColumns({
        tCurrentStock: t("current_stock"),
        tMinLevel: t("min_level"),
        tStatusOk: t("status_ok"),
        tStatusLow: t("status_low"),
        tStatusOut: t("status_out"),
        tAdjust: t("adjust"),
        onAdjust: setAdjustItem,
      }),
    [t],
  );

  const logColumns = useMemo(
    () =>
      getLogColumns({
        tLogTypeIn: t("log_type_in"),
        tLogTypeOut: t("log_type_out"),
        tLogTypeAdjustment: t("log_type_adjustment"),
        tReference: t("reference"),
        tBy: t("by"),
      }),
    [t],
  );

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      <Header title={t("title")} />

      <Tabs defaultValue="stock">
        <TabsList>
          <TabsTrigger value="stock">{t("tab_stock")}</TabsTrigger>
          <TabsTrigger value="logs">{t("tab_logs")}</TabsTrigger>
        </TabsList>

        <TabsContent value="stock" className="mt-4">
          <DataTable
            columns={alertColumns}
            data={alerts ?? []}
            isLoading={alertsLoading}
          />
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <DataTable
            columns={logColumns}
            data={logs?.data ?? []}
            isLoading={logsLoading}
            meta={logsMeta}
            onPageChange={setPage}
            onLimitChange={setLimit}
            searchable
            onSearch={handleLogSearch}
          />
        </TabsContent>
      </Tabs>

      <AdjustStockDialog
        item={adjustItem}
        open={adjustItem !== null}
        onOpenChange={(o) => { if (!o) setAdjustItem(null); }}
      />
    </div>
  );
}
