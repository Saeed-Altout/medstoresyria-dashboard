"use client";

import { useTranslations } from "next-intl";
import { IconFileInvoice, IconDownload, IconLoader2 } from "@tabler/icons-react";
import {
  AppSheet,
  AppSheetContent,
  AppSheetHeader,
  AppSheetBody,
  AppSheetFooter,
  AppSheetTitle,
  AppSheetDescription,
} from "@/components/app-sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/status-badge";
import { useGetOrderById } from "@/lib/hooks/orders";
import { useGenerateInvoice, useDownloadInvoice } from "@/lib/hooks/invoices";
import { formatPrice, formatDateTime } from "@/lib/utils/format";
import type { OrderStatus } from "@/types";

interface OrderDetailSheetProps {
  orderId: string | null;
  onClose: () => void;
}

export function OrderDetailSheet({ orderId, onClose }: OrderDetailSheetProps) {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");

  const { data: order, isLoading, isFetching } = useGetOrderById(orderId ?? "");

  // `items` and `status_logs` are only present on the detail endpoint response.
  // The list-query cache can seed this hook with a partial object, so guard both.
  const items = order?.items ?? [];
  const statusLogs = order?.status_logs ?? [];
  const hasDetailData = items.length > 0 || statusLogs.length > 0 || (order && !isLoading && !isFetching);
  const generateInvoice = useGenerateInvoice();
  const downloadInvoice = useDownloadInvoice();

  return (
    <AppSheet open={orderId !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AppSheetContent size="lg">
        {/* ── Header ── */}
        <AppSheetHeader>
          <AppSheetTitle>
            {order ? order.order_number : "—"}
          </AppSheetTitle>
          {order && (
            <AppSheetDescription>
              <StatusBadge kind="order" status={order.status as OrderStatus} />
            </AppSheetDescription>
          )}
        </AppSheetHeader>

        {/* ── Body ── */}
        <AppSheetBody>
          {(isLoading || isFetching) && (
            <div className="flex items-center justify-center h-40">
              <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {order && hasDetailData && (
            <div className="space-y-5">

              {/* Customer info */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {t("customer_info")}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <Row label={tCommon("name")} value={order.customer_name} />
                  <Row label={tCommon("phone")} value={order.customer_phone} />
                  {order.customer_email && (
                    <Row label={tCommon("email")} value={order.customer_email} />
                  )}
                  {order.user ? (
                    <Row
                      label={t("guest_order")}
                      value={`${order.user.first_name} ${order.user.last_name}`}
                    />
                  ) : null}
                </div>
              </section>

              <Separator />

              {/* Delivery info */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {t("delivery_info")}
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <Row
                    label={t("governorate")}
                    value={order.governorate.name_local ?? order.governorate.name}
                  />
                  <Row label={t("address")} value={order.address_detail} />
                  {order.notes && (
                    <div className="col-span-2">
                      <Row label={tCommon("notes")} value={order.notes} />
                    </div>
                  )}
                </div>
              </section>

              {order.rejection_reason && (
                <>
                  <Separator />
                  <section>
                    <p className="text-xs font-semibold uppercase tracking-wide text-destructive mb-2">
                      {t("rejection_reason")}
                    </p>
                    <p className="text-sm">{order.rejection_reason}</p>
                  </section>
                </>
              )}

              <Separator />

              {/* Order items */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  {t("order_items")}
                </p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm py-1.5 border-b last:border-0">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_name_snapshot}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(item.product_price_snapshot)} × {item.quantity}
                        </p>
                      </div>
                      <span className="font-medium shrink-0 ms-4">{formatPrice(item.total_usd)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("subtotal")}</span>
                    <span>{formatPrice(order.subtotal_usd)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>{t("delivery_fee")}</span>
                    <span>{formatPrice(order.delivery_fee_usd)}</span>
                  </div>
                  <div className="flex justify-between font-semibold border-t pt-1 mt-1">
                    <span>{t("grand_total")}</span>
                    <span>{formatPrice(order.total_usd)}</span>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Timeline */}
              <section>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  {t("timeline")}
                </p>
                <ol className="relative border-s border-border ms-2 space-y-4">
                  {statusLogs.map((log) => (
                    <li key={log.id} className="ms-4">
                      <span className="absolute -start-1.5 mt-1 size-3 rounded-full border-2 border-background bg-primary" />
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge kind="order" status={log.status as OrderStatus} />
                        <span className="text-xs text-muted-foreground">{formatDateTime(log.created_at)}</span>
                      </div>
                      {log.user && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {log.user.first_name} {log.user.last_name}
                        </p>
                      )}
                      {log.note && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">{log.note}</p>
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            </div>
          )}
        </AppSheetBody>

        {/* ── Footer ── */}
        {order && (
          <AppSheetFooter>
            {!order.invoice ? (
              <Button
                size="sm"
                variant="outline"
                disabled={generateInvoice.isPending}
                onClick={() => generateInvoice.mutate(order.id)}
              >
                {generateInvoice.isPending
                  ? <IconLoader2 className="size-3.5 me-1.5 animate-spin" />
                  : <IconFileInvoice className="size-3.5 me-1.5" />}
                {t("generate_invoice")}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                disabled={downloadInvoice.isPending}
                onClick={() =>
                  downloadInvoice.mutate({
                    id: order.invoice!.id,
                    invoiceNumber: order.invoice!.invoice_number,
                  })
                }
              >
                {downloadInvoice.isPending
                  ? <IconLoader2 className="size-3.5 me-1.5 animate-spin" />
                  : <IconDownload className="size-3.5 me-1.5" />}
                {t("download_invoice")}
              </Button>
            )}
          </AppSheetFooter>
        )}
      </AppSheetContent>
    </AppSheet>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
