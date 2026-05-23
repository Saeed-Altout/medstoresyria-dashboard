"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getSalesSummary,
  getTopProducts,
  getInventorySnapshot,
  getMaintenanceSummary,
} from "@/lib/api/reports.api";
import { Header } from "@/components/header";
import { formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserRole } from "@/types";

export default function ReportsPage() {
  const t = useTranslations("reports");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const today = new Date().toISOString().slice(0, 10);
  const monthStart = today.slice(0, 8) + "01";
  const [from, setFrom] = useState(monthStart);
  const [to, setTo] = useState(today);
  const [applied, setApplied] = useState({ from: monthStart, to: today });

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "reports")) {
      router.replace("/overview");
    }
  }, [user, router]);

  const { data: summary } = useQuery({
    queryKey: ["sales-summary", applied.from, applied.to],
    queryFn: () => getSalesSummary(applied.from, applied.to),
  });

  const { data: topProducts } = useQuery({
    queryKey: ["top-products", applied.from, applied.to],
    queryFn: () => getTopProducts(applied.from, applied.to, 10),
  });

  const { data: inventoryData } = useQuery({
    queryKey: ["inventory-snapshot"],
    queryFn: getInventorySnapshot,
  });

  const { data: maintenanceReport } = useQuery({
    queryKey: ["maintenance-summary", applied.from, applied.to],
    queryFn: () => getMaintenanceSummary(applied.from, applied.to),
  });

  return (
    <div className="space-y-5">
      <Header title={t("title")} />
      <div className="flex items-center gap-3 flex-wrap">
        <label className="text-sm">{t("from")}</label>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
        <label className="text-sm">{t("to")}</label>
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
        <Button onClick={() => setApplied({ from, to })}>{t("apply")}</Button>
      </div>
      <Tabs defaultValue="sales">
        <TabsList>
          <TabsTrigger value="sales">{t("tab_sales")}</TabsTrigger>
          <TabsTrigger value="products">{t("tab_products")}</TabsTrigger>
          <TabsTrigger value="inventory">{t("tab_inventory")}</TabsTrigger>
          <TabsTrigger value="maintenance">{t("tab_maintenance")}</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="mt-4">
          {summary ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {([
                ["total_revenue", formatPrice(summary.totalRevenue)],
                ["total_orders", String(summary.totalOrders)],
                ["avg_order", formatPrice(summary.avgOrderValue)],
                ["delivered_orders", String(summary.deliveredOrders)],
              ] as const).map(([key, val]) => (
                <div key={key} className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">{t(key)}</p>
                  <p className="text-2xl font-bold">{val}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{tCommon("loading")}</p>
          )}
        </TabsContent>
        <TabsContent value="products" className="mt-4">
          {topProducts ? (
            <div className="rounded-lg border divide-y">
              {topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-4">
                  <p className="font-medium">{p.name}</p>
                  <div className="text-end">
                    <p className="text-sm">{t("units_sold")}: {p.totalQuantitySold}</p>
                    <p className="font-semibold">{formatPrice(p.totalRevenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{tCommon("loading")}</p>
          )}
        </TabsContent>
        <TabsContent value="inventory" className="mt-4">
          {inventoryData ? (
            <div className="rounded-lg border divide-y">
              {inventoryData.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm">{item.stock_qty} / {item.stock_min}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">{tCommon("loading")}</p>
          )}
        </TabsContent>
        <TabsContent value="maintenance" className="mt-4">
          {maintenanceReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">{t("completed")}</p>
                  <p className="text-2xl font-bold">{maintenanceReport.completed}/{maintenanceReport.total}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">{t("completion_rate")}</p>
                  <p className="text-2xl font-bold">{maintenanceReport.completionRate}</p>
                </div>
              </div>
              <div className="rounded-lg border divide-y">
                {maintenanceReport.byTechnician.map((tech) => (
                  <div key={tech.technicianId} className="flex items-center justify-between p-4">
                    <p className="font-medium">{tech.technicianName}</p>
                    <p className="text-sm">{t("assigned")}: {tech.assigned} · {t("completed")}: {tech.completed}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">{tCommon("loading")}</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
