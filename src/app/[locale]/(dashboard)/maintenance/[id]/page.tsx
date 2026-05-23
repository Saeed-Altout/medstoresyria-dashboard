"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconArrowLeft, IconUserPlus, IconRefresh } from "@tabler/icons-react";
import { useGetMaintenanceById } from "@/lib/hooks/maintenance";
import { formatDateTime, getFullName } from "@/lib/utils/format";
import { AssignDialog } from "./_components/assign-dialog";
import { UpdateStatusDialog } from "./_components/update-status-dialog";
import type { MaintenanceStatus } from "@/types";

const STATUS_VARIANT: Record<MaintenanceStatus, "secondary" | "outline" | "destructive"> = {
  pending: "outline",
  assigned: "secondary",
  in_progress: "secondary",
  completed: "secondary",
  cancelled: "outline",
};

const CAN_ASSIGN: MaintenanceStatus[] = ["pending"];
const CAN_UPDATE: MaintenanceStatus[] = ["assigned", "in_progress"];

export default function MaintenanceDetailPage() {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();

  const [assignOpen, setAssignOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const { data: req, isLoading } = useGetMaintenanceById(id);

  const isAdmin = user?.role === "admin";
  const isTechnician = user?.role === "technician";

  if (isLoading) return <p className="text-muted-foreground p-4">{tCommon("loading")}</p>;
  if (!req) return <p className="text-muted-foreground p-4">{tCommon("no_data")}</p>;

  const canAssign = isAdmin && CAN_ASSIGN.includes(req.status);
  const canUpdate = (isAdmin || isTechnician) && CAN_UPDATE.includes(req.status);

  const STATUS_LABELS: Record<MaintenanceStatus, string> = {
    pending: t("status_pending"),
    assigned: t("status_assigned"),
    in_progress: t("status_in_progress"),
    completed: t("status_completed"),
    cancelled: t("status_cancelled"),
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="size-8" onClick={() => router.back()}>
          <IconArrowLeft className="size-4" />
        </Button>
        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-xl font-semibold">#{req.request_number}</h1>
          <Badge variant={STATUS_VARIANT[req.status]}>{STATUS_LABELS[req.status]}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {canAssign && (
            <Button size="sm" variant="outline" onClick={() => setAssignOpen(true)}>
              <IconUserPlus data-icon="inline-start" />
              {t("assign_title")}
            </Button>
          )}
          {canUpdate && (
            <Button size="sm" onClick={() => setStatusOpen(true)}>
              <IconRefresh data-icon="inline-start" />
              {t("update_status")}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("customer_info")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm">
            <p className="font-medium">{req.customer_name}</p>
            <p className="text-muted-foreground">{req.customer_email}</p>
            <p className="text-muted-foreground">{req.customer_phone}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("device_info")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm">
            <p className="font-medium">{req.device_type}</p>
            <p className="text-muted-foreground capitalize">{req.visit_type === "home" ? t("visit_home") : t("visit_office")}</p>
            {req.description && <p className="text-muted-foreground">{req.description}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("technician")}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5 text-sm">
            <p className="font-medium">
              {req.technician ? getFullName(req.technician) : t("unassigned")}
            </p>
            <p className="text-muted-foreground">
              {t("scheduled")}: {req.scheduled_at ? formatDateTime(req.scheduled_at) : t("not_scheduled")}
            </p>
            {req.notes && <p className="text-muted-foreground">{req.notes}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("timeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {(req.status_logs ?? []).map((log, i) => (
                <div key={log.id}>
                  {i > 0 && <Separator className="my-2" />}
                  <div className="flex gap-3 text-sm">
                    <span className="text-muted-foreground shrink-0">{formatDateTime(log.created_at)}</span>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{STATUS_LABELS[log.status as MaintenanceStatus] ?? log.status}</span>
                      {log.note && <span className="text-muted-foreground">{log.note}</span>}
                      {log.user && (
                        <span className="text-xs text-muted-foreground">
                          {log.user.first_name} {log.user.last_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {req.status_logs?.length === 0 && (
                <p className="text-sm text-muted-foreground">{tCommon("no_data")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AssignDialog requestId={req.id} open={assignOpen} onOpenChange={setAssignOpen} />
      {canUpdate && (
        <UpdateStatusDialog
          requestId={req.id}
          currentStatus={req.status}
          open={statusOpen}
          onOpenChange={setStatusOpen}
        />
      )}
    </div>
  );
}
