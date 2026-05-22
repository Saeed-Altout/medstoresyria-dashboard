"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api/products.api";
import { formatPrice } from "@/lib/utils/format";
import type { UserRole } from "@/types";

export default function ProductsPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "products")) {
      router.replace("/overview");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts({ page: 1, limit: 20 }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      {isLoading && <p className="text-muted-foreground">{tCommon("loading")}</p>}
      {data && (
        <div className="rounded-lg border divide-y">
          {data.data.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{p.name}</p>
                <p className="text-sm text-muted-foreground">
                  {p.category?.name ?? "—"} · {t(p.condition === "new" ? "condition_new" : "condition_used")}
                </p>
              </div>
              <div className="text-end">
                <p className="font-semibold">{formatPrice(p.price_usd)}</p>
                <p className="text-sm text-muted-foreground">{t("stock")}: {p.stock_qty}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
