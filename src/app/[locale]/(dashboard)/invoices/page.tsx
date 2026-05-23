"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getInvoices, downloadInvoice } from "@/lib/api/invoices.api";
import { Header } from "@/components/header";
import { formatDate, formatPrice } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";

export default function InvoicesPage() {
  const t = useTranslations("invoices");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "invoices")) {
      router.replace("/overview");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: getInvoices,
  });

  const { mutate: download, isPending: downloading } = useMutation<Blob, Error, string>({
    mutationFn: downloadInvoice,
    onSuccess: (blob, id) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
  });

  return (
    <div className="space-y-5">
      <Header title={t("title")} />
      {isLoading && <p className="text-muted-foreground">{tCommon("loading")}</p>}
      {data && (
        <div className="rounded-lg border divide-y">
          {data.data.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">#{inv.invoice_number}</p>
                <p className="text-sm text-muted-foreground">{t("order_number")}: #{inv.order.order_number}</p>
                <p className="text-sm text-muted-foreground">{inv.order.customer_name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-end">
                  <p className="font-semibold">{formatPrice(inv.order.total_usd)}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(inv.created_at)}</p>
                </div>
                <Button size="sm" variant="outline" disabled={downloading} onClick={() => download(inv.id)}>
                  {downloading ? t("downloading") : t("download")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
