"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useEffect } from "react";
import type { UserRole } from "@/types";

export default function OverviewPage() {
  const t = useTranslations("overview");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "overview")) {
      router.replace("/login");
    }
  }, [user, router]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(["total_orders", "revenue", "pending_orders", "low_stock"] as const).map(
          (key) => (
            <div key={key} className="rounded-lg border bg-card p-4 flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t(key)}</span>
              <span className="text-2xl font-bold">—</span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
