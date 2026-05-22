"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "@/i18n/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IconArrowLeft, IconDownload, IconFileInvoice } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useDirection } from "@/lib/hooks/useDirection";
import {
  getOrderById,
  confirmOrder,
  rejectOrder,
  prepareOrder,
  shipOrder,
  deliverOrder,
  cancelOrder,
} from "@/lib/api/orders.api";
import { generateInvoice, downloadInvoice } from "@/lib/api/invoices.api";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatPrice, formatDate, formatDateTime } from "@/lib/utils/format";
import type { Order, ApiResponse, Invoice } from "@/types";

export default function OrderDetailPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const params = useParams<{ locale: string; id: string }>();
  const router = useRouter();
  const { iconClass } = useDirection();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && !canAccess(user.role, "orders")) router.replace("/overview");
  }, [user, router]);

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: order, isLoading } = useQuery<Order, AxiosError>({
    queryKey: ["order", params.id],
    queryFn: () => getOrderById(params.id),
    enabled: !!params.id,
  });

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ["order", params.id] });
    queryClient.invalidateQueries({ queryKey: ["orders"] });
  }

  const confirmMutation = useMutation<void, AxiosError, string>({
    mutationFn: confirmOrder,
    onSuccess: () => { invalidate(); toast.success(t("action_confirm") + " ✓"); },
    onError: (err) => { toast.error((err.response?.data as ApiResponse<null>)?.message); },
  });

  const rejectMutation = useMutation<void, AxiosError, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => rejectOrder(id, reason),
    onSuccess: () => {
      invalidate();
      toast.success(t("action_reject") + " ✓");
      setRejectDialogOpen(false);
      setRejectReason("");
    },
    onError: (err) => { toast.error((err.response?.data as ApiResponse<null>)?.message); },
  });

  const prepareMutation = useMutation<void, AxiosError, string>({
    mutationFn: prepareOrder,
    onSuccess: () => { invalidate(); toast.success(t("action_prepare") + " ✓"); },
    onError: (err) => { toast.error((err.response?.data as ApiResponse<null>)?.message); },
  });

  const shipMutation = useMutation<void, AxiosError, string>({
    mutationFn: shipOrder,
    onSuccess: () => { invalidate(); toast.success(t("action_ship") + " ✓"); },
    onError: (err) => { toast.error((err.response?.data as ApiResponse<null>)?.message); },
  });

  const deliverMutation = useMutation<void, AxiosError, string>({
    mutationFn: deliverOrder,
    onSuccess: () => { invalidate(); toast.success(t("action_deliver") + " ✓"); },
    onError: (err) => { toast.error((err.response?.data as ApiResponse<null>)?.message); },
  });

  const cancelMutation = useMutation<void, AxiosError, string>({
    mutationFn: cancelOrder,
    onSuccess: () => { invalidate(); toast.success(t("action_cancel") + " ✓"); },
    onError: (err) => { toast.error((err.response?.data as ApiResponse<null>)?.message); },
  });

  const generateInvoiceMutation = useMutation<Invoice, AxiosError, string>({
    mutationFn: generateInvoice,
    onSuccess: () => { invalidate(); toast.success(t("generate_invoice") + " ✓"); },
    onError: (err) => { toast.error((err.response?.data as ApiResponse<null>)?.message); },
  });

  async function handleDownload(invoiceId: string, invoiceNumber: string) {
    setIsDownloading(true);
    try {
      const blob = await downloadInvoice(invoiceId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed");
    } finally {
      setIsDownloading(false);
    }
  }

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {tCommon("loading")}
      </div>
    );
  }

  if (!order) return null;

  const role = user.role;
  const s = order.status;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Back + title */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/orders")}>
          <IconArrowLeft className={`size-4 ${iconClass}`} />
        </Button>
        <div>
          <h1 className="text-xl font-bold">{t("detail_title")}</h1>
          <p className="text-sm text-muted-foreground font-mono">{order.order_number}</p>
        </div>
        <div className="ms-auto">
          <StatusBadge kind="order" status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer info */}
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <h2 className="font-semibold">{t("customer_info")}</h2>
            <Separator />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">{tCommon("name")}</dt>
              <dd className="font-medium">{order.customer_name}</dd>
              <dt className="text-muted-foreground">{tCommon("email")}</dt>
              <dd>{order.customer_email}</dd>
              <dt className="text-muted-foreground">{tCommon("phone")}</dt>
              <dd>{order.customer_phone}</dd>
              {order.notes && (
                <>
                  <dt className="text-muted-foreground">{tCommon("notes")}</dt>
                  <dd className="text-muted-foreground">{order.notes}</dd>
                </>
              )}
            </dl>
          </div>

          {/* Delivery info */}
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <h2 className="font-semibold">{t("delivery_info")}</h2>
            <Separator />
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted-foreground">{t("governorate")}</dt>
              <dd>{order.governorate.name_local ?? order.governorate.name}</dd>
              <dt className="text-muted-foreground">{t("address")}</dt>
              <dd>{order.address_detail}</dd>
            </dl>
          </div>

          {/* Items */}
          <div className="rounded-lg border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b">
              <h2 className="font-semibold">{t("order_items")}</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon("name")}</TableHead>
                  <TableHead className="text-center">{t("quantity")}</TableHead>
                  <TableHead className="text-end">{t("price")}</TableHead>
                  <TableHead className="text-end">{t("total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name_snapshot}</TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-end">
                      {formatPrice(item.product_price_snapshot)}
                    </TableCell>
                    <TableCell className="text-end font-medium">
                      {formatPrice(item.total_usd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={3} className="text-end text-muted-foreground">
                    {t("subtotal")}
                  </TableCell>
                  <TableCell className="text-end">{formatPrice(order.subtotal_usd)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-end text-muted-foreground">
                    {t("delivery_fee")}
                  </TableCell>
                  <TableCell className="text-end">{formatPrice(order.delivery_fee_usd)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={3} className="text-end font-semibold">
                    {t("grand_total")}
                  </TableCell>
                  <TableCell className="text-end font-bold">
                    {formatPrice(order.total_usd)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          {/* Status Timeline */}
          <div className="rounded-lg border bg-card p-5 space-y-3">
            <h2 className="font-semibold">{t("timeline")}</h2>
            <Separator />
            <div className="space-y-3">
              {order.statusLogs.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className="mt-0.5">
                    <StatusBadge kind="order" status={log.status as Order["status"]} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {log.note && (
                      <p className="text-muted-foreground">{log.note}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                      {log.user && ` · ${log.user.first_name} ${log.user.last_name}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rejection reason */}
          {order.rejection_reason && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
              <p className="text-sm font-medium text-destructive mb-1">
                {t("rejection_reason")}
              </p>
              <p className="text-sm">{order.rejection_reason}</p>
            </div>
          )}
        </div>

        {/* Right column — sticky actions */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-5 space-y-4 lg:sticky lg:top-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">{tCommon("status")}</p>
              <StatusBadge kind="order" status={order.status} />
            </div>

            <Separator />

            <div className="space-y-2">
              {/* Confirm */}
              {(role === "admin" || role === "sales") && s === "pending" && (
                <Button
                  className="w-full"
                  disabled={confirmMutation.isPending}
                  onClick={() => confirmMutation.mutate(order.id)}
                >
                  {t("action_confirm")}
                </Button>
              )}

              {/* Prepare */}
              {(role === "admin" || role === "warehouse") && s === "confirmed" && (
                <Button
                  className="w-full"
                  disabled={prepareMutation.isPending}
                  onClick={() => prepareMutation.mutate(order.id)}
                >
                  {t("action_prepare")}
                </Button>
              )}

              {/* Ship */}
              {(role === "admin" || role === "warehouse") && s === "preparing" && (
                <Button
                  className="w-full"
                  disabled={shipMutation.isPending}
                  onClick={() => shipMutation.mutate(order.id)}
                >
                  {t("action_ship")}
                </Button>
              )}

              {/* Deliver */}
              {(role === "admin" || role === "delivery") && s === "shipped" && (
                <Button
                  className="w-full"
                  disabled={deliverMutation.isPending}
                  onClick={() => deliverMutation.mutate(order.id)}
                >
                  {t("action_deliver")}
                </Button>
              )}

              {/* Reject */}
              {(role === "admin" || role === "sales") && s === "pending" && (
                <Button
                  variant="outline"
                  className="w-full text-destructive border-destructive/30"
                  onClick={() => { setRejectDialogOpen(true); setRejectReason(""); }}
                >
                  {t("action_reject")}
                </Button>
              )}

              {/* Cancel */}
              {(role === "admin" || role === "sales") &&
                (s === "pending" || s === "confirmed" || s === "preparing") && (
                  <Button
                    variant="outline"
                    className="w-full text-destructive border-destructive/30"
                    disabled={cancelMutation.isPending}
                    onClick={() => cancelMutation.mutate(order.id)}
                  >
                    {t("action_cancel")}
                  </Button>
                )}
            </div>

            {/* Invoice section */}
            <Separator />
            <div className="space-y-2">
              {order.invoice ? (
                <>
                  <p className="text-xs text-muted-foreground font-mono">
                    {order.invoice.invoice_number}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isDownloading}
                    onClick={() =>
                      handleDownload(order.invoice!.id, order.invoice!.invoice_number)
                    }
                  >
                    <IconDownload className="size-4 me-2" />
                    {t("download_invoice")}
                  </Button>
                </>
              ) : (
                canAccess(user.role, "invoices") && (
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={generateInvoiceMutation.isPending}
                    onClick={() => generateInvoiceMutation.mutate(order.id)}
                  >
                    <IconFileInvoice className="size-4 me-2" />
                    {t("generate_invoice")}
                  </Button>
                )
              )}
            </div>

            {/* Placed at */}
            <div className="text-xs text-muted-foreground pt-1">
              {formatDateTime(order.created_at)}
            </div>
          </div>
        </div>
      </div>

      {/* Reject dialog */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => { if (!open) { setRejectDialogOpen(false); setRejectReason(""); } }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirm_reject")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason-detail">{t("reject_reason")}</Label>
            <Textarea
              id="reject-reason-detail"
              placeholder={t("reject_reason_placeholder")}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setRejectDialogOpen(false); setRejectReason(""); }}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || rejectMutation.isPending}
              onClick={() => {
                rejectMutation.mutate({ id: order.id, reason: rejectReason });
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
