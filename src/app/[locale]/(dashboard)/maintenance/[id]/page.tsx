"use client";

import { useTranslations } from "next-intl";
import { useParams } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMaintenanceById } from "@/lib/api/maintenance.api";
import { formatDateTime, getFullName } from "@/lib/utils/format";

export default function MaintenanceDetailPage() {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const { id } = useParams<{ id: string }>();

  const { data: req, isLoading } = useQuery({
    queryKey: ["maintenance", id],
    queryFn: () => getMaintenanceById(id),
  });

  if (isLoading) return <p className="text-muted-foreground">{tCommon("loading")}</p>;
  if (!req) return <p className="text-muted-foreground">{tCommon("no_data")}</p>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">#{req.request_number}</h1>
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold">{t("customer_info")}</h2>
        <p>{req.customer_name}</p>
        <p className="text-muted-foreground">{req.customer_email}</p>
        <p className="text-muted-foreground">{req.customer_phone}</p>
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold">{t("device_info")}</h2>
        <p>{req.device_type}</p>
        <p className="text-muted-foreground">{req.description}</p>
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold">{t("technician")}</h2>
        <p>{req.technician ? getFullName(req.technician) : t("unassigned")}</p>
        <p className="text-muted-foreground">
          {t("scheduled")}: {req.scheduled_at ? formatDateTime(req.scheduled_at) : t("not_scheduled")}
        </p>
      </div>
      <div className="rounded-lg border p-4 space-y-2">
        <h2 className="font-semibold">{t("timeline")}</h2>
        {(req.status_logs ?? []).map((log) => (
          <div key={log.id} className="flex gap-3 text-sm">
            <span className="text-muted-foreground">{formatDateTime(log.created_at)}</span>
            <span className="font-medium">{log.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
