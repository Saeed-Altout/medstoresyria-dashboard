"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import {
  useGetMaintenanceRequests,
  useMaintenanceFilters,
} from "@/lib/hooks/maintenance";
import { useDebouncedSearch } from "@/hooks/use-table-filters";
import { getMaintenanceColumns } from "./_components/columns";
import { MaintenanceToolbar } from "./_components/maintenance-toolbar";
import type { MaintenanceRequest, MaintenanceStatus, UserRole } from "@/types";

export default function MaintenancePage() {
  const t = useTranslations("maintenance");
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "maintenance")) router.replace("/overview");
  }, [user, router]);

  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "all">("all");

  const { filters, setPage, setLimit, setFilter } = useMaintenanceFilters();
  const { data, isLoading } = useGetMaintenanceRequests(filters);
  const handleSearch = useDebouncedSearch(useMaintenanceFilters.getState().setSearch);

  function handleStatusChange(status: MaintenanceStatus | undefined) {
    setStatusFilter(status ?? "all");
    setFilter("status", status);
  }

  const statusLabels: Record<MaintenanceStatus, string> = {
    pending: t("status_pending"),
    assigned: t("status_assigned"),
    in_progress: t("status_in_progress"),
    completed: t("status_completed"),
    cancelled: t("status_cancelled"),
  };

  const columns = useMemo(
    () =>
      getMaintenanceColumns({
        tRequestNumber: t("request_number"),
        tDeviceType: t("device_type"),
        tTechnician: t("technician"),
        tUnassigned: t("unassigned"),
        tStatusLabels: statusLabels,
        onView: (req: MaintenanceRequest) => router.push(`/maintenance/${req.id}`),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      <Header title={t("title")} />

      <DataTable<MaintenanceRequest>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchable
        onSearch={handleSearch}
        toolbar={
          <MaintenanceToolbar status={statusFilter} onStatusChange={handleStatusChange} />
        }
      />
    </div>
  );
}
