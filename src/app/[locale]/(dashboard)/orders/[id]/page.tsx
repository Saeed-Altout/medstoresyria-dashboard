"use client";

import { useTranslations } from "next-intl";
import { useParams } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { getOrderById } from "@/lib/api/orders.api";
import { formatPrice, formatDateTime, getFullName } from "@/lib/utils/format";

export default function OrderDetailPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const { id } = useParams<{ id: string }>();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
  });

  if (isLoading) return <p className="text-muted-foreground">{tCommon("loading")}</p>;
  if (!order) return <p className="text-muted-foreground">{tCommon("no_data")}</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{t("detail_title")} #{order.order_number}</h1>
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold">{t("customer_info")}</h2>
        <p>{order.customer_name}</p>
        <p className="text-muted-foreground">{order.customer_email}</p>
        <p className="text-muted-foreground">{order.customer_phone}</p>
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold">{t("order_items")}</h2>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.product_name_snapshot} × {item.quantity}</span>
            <span>{formatPrice(item.total_usd)}</span>
          </div>
        ))}
        <div className="border-t pt-2 flex justify-between font-bold">
          <span>{t("grand_total")}</span>
          <span>{formatPrice(order.total_usd)}</span>
        </div>
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold">{t("timeline")}</h2>
        {order.statusLogs.map((log) => (
          <div key={log.id} className="flex gap-3 text-sm">
            <span className="text-muted-foreground">{formatDateTime(log.created_at)}</span>
            <span className="font-medium">{log.status}</span>
            {log.user && <span className="text-muted-foreground">— {getFullName(log.user)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
