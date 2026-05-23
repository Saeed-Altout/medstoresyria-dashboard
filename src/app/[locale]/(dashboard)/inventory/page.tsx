"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getInventoryAlerts } from "@/lib/api/inventory.api";
import { Header } from "@/components/header";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export default function InventoryPage() {
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "inventory")) {
      router.replace("/overview");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["inventory-alerts"],
    queryFn: getInventoryAlerts,
  });

  const statusClass = (status: "ok" | "low" | "out") => {
    if (status === "ok") return "bg-green-100 text-green-800";
    if (status === "low") return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="space-y-5">
      <Header title={t("title")} />
      {isLoading && <p className="text-muted-foreground">{tCommon("loading")}</p>}
      {data && (
        <div className="rounded-lg border divide-y">
          {data.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.category}</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">
                  {t("current_stock")}: {item.stock_qty} / {t("min_level")}: {item.stock_min}
                </span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusClass(item.status))}>
                  {t(`status_${item.status}`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
