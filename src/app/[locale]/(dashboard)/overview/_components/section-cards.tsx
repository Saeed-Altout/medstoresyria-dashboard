"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { IconPackage, IconShoppingCart, IconCurrencyDollar, IconTruck } from "@tabler/icons-react";
import { getSalesSummary } from "@/lib/api/reports.api";
import { getInventoryAlerts } from "@/lib/api/inventory.api";
import { formatPrice } from "@/lib/utils/format";

function getMonthRange() {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth(), 1);
  return {
    from: from.toISOString().split("T")[0],
    to: to.toISOString().split("T")[0],
  };
}

function CardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-24 mt-1" />
      </CardHeader>
      <CardFooter>
        <Skeleton className="h-4 w-48" />
      </CardFooter>
    </Card>
  );
}

export function SectionCards() {
  const t = useTranslations("overview");
  const { from, to } = getMonthRange();

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["sales-summary", from, to],
    queryFn: () => getSalesSummary(from, to),
  });

  const { data: alerts, isLoading: alertsLoading } = useQuery({
    queryKey: ["inventory-alerts"],
    queryFn: getInventoryAlerts,
  });

  if (summaryLoading || alertsLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  const lowStockCount = alerts?.filter((a) => a.status !== "ok").length ?? 0;
  const pendingOrders = summary
    ? summary.totalOrders - summary.deliveredOrders - summary.cancelledOrders - summary.rejectedOrders
    : 0;

  return (
    <div className="grid grid-cols-1 gap-5 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("revenue")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary ? formatPrice(summary.totalRevenue) : "—"}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 items-center font-medium">
            <IconCurrencyDollar className="size-4" />
            {t("this_month")}
          </div>
          <div className="text-muted-foreground">
            Avg: {summary ? formatPrice(summary.avgOrderValue) : "—"} / order
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("total_orders")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {summary?.totalOrders ?? 0}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 items-center font-medium">
            <IconShoppingCart className="size-4" />
            {t("this_month")}
          </div>
          <div className="text-muted-foreground">
            {summary?.deliveredOrders ?? 0} delivered
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("pending_orders")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {pendingOrders}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 items-center font-medium">
            <IconTruck className="size-4" />
            {t("pending_orders")}
          </div>
          <div className="text-muted-foreground">
            {summary?.cancelledOrders ?? 0} cancelled · {summary?.rejectedOrders ?? 0} rejected
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>{t("low_stock")}</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {lowStockCount}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="flex gap-2 items-center font-medium">
            <IconPackage className="size-4" />
            {t("low_stock")}
          </div>
          <div className="text-muted-foreground">
            {lowStockCount > 0 ? (
              <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                Needs attention
              </Badge>
            ) : (
              "All stock levels OK"
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
