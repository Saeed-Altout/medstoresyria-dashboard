"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders } from "@/lib/api/orders.api";
import type { UserRole } from "@/types";

export default function OrdersPage() {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "orders")) {
      router.replace("/overview");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders({ page: 1, limit: 20 }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      {isLoading && <p className="text-muted-foreground">{tCommon("loading")}</p>}
      {data && (
        <p className="text-muted-foreground">
          {data.meta.total} {tCommon("results")}
        </p>
      )}
    </div>
  );
}
