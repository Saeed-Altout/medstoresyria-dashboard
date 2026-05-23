"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MaintenanceStatus } from "@/types";

interface MaintenanceToolbarProps {
  status: MaintenanceStatus | "all";
  onStatusChange: (status: MaintenanceStatus | undefined) => void;
}

export function MaintenanceToolbar({ status, onStatusChange }: MaintenanceToolbarProps) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");

  return (
    <Select
      value={status}
      onValueChange={(v) => onStatusChange(v === "all" ? undefined : (v as MaintenanceStatus))}
    >
      <SelectTrigger size="sm" className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{tCommon("all")}</SelectItem>
        <SelectItem value="pending">{t("status_pending")}</SelectItem>
        <SelectItem value="assigned">{t("status_assigned")}</SelectItem>
        <SelectItem value="in_progress">{t("status_in_progress")}</SelectItem>
        <SelectItem value="completed">{t("status_completed")}</SelectItem>
        <SelectItem value="cancelled">{t("status_cancelled")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
