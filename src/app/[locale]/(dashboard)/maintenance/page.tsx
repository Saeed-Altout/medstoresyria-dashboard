"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMaintenanceRequests } from "@/lib/api/maintenance.api";
import { formatDate, getMaintenanceStatusColor } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

export default function MaintenancePage() {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "maintenance")) {
      router.replace("/overview");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: () => getMaintenanceRequests({ page: 1, limit: 20 }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      {isLoading && <p className="text-muted-foreground">{tCommon("loading")}</p>}
      {data && (
        <div className="rounded-lg border divide-y">
          {data.data.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/40"
              onClick={() => router.push(`/maintenance/${req.id}`)}
            >
              <div>
                <p className="font-medium">#{req.request_number} — {req.device_type}</p>
                <p className="text-sm text-muted-foreground">{req.customer_name}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{formatDate(req.created_at)}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getMaintenanceStatusColor(req.status))}>
                  {t(`status_${req.status}`)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
