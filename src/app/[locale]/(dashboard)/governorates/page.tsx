"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useGetGovernorates } from "@/lib/hooks/governorates";
import { getGovernorateColumns } from "./_components/columns";
import { GovernorateFormSheet } from "./_components/governorate-form-sheet";
import type { Governorate } from "@/types";

type Filter = "active" | "inactive" | "all";

export default function GovernoratesPage() {
  const t = useTranslations("governorates");
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !canAccess(user.role, "settings")) router.replace("/overview");
  }, [user, router]);

  const [formOpen, setFormOpen] = useState(false);
  const [editGov, setEditGov] = useState<Governorate | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const { data: governorates, isLoading } = useGetGovernorates(filter);

  // counts — fetch all once for the tab badges
  const { data: allGovs } = useGetGovernorates("all");
  const totalAll      = allGovs?.length ?? 0;
  const totalActive   = allGovs?.filter((g) => g.is_active).length ?? 0;
  const totalInactive = allGovs?.filter((g) => !g.is_active).length ?? 0;

  const columns = useMemo(
    () =>
      getGovernorateColumns({
        t,
        onEdit: (gov) => { setEditGov(gov); setFormOpen(true); },
      }),
    [t],
  );

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      <Header title={t("title")}>
        <Button size="sm" onClick={() => { setEditGov(null); setFormOpen(true); }}>
          <IconPlus data-icon="inline-start" />
          {t("add")}
        </Button>
      </Header>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList>
          <TabsTrigger value="all">
            {t("filter_all")}
            <span className="ms-1.5 text-xs text-muted-foreground">({totalAll})</span>
          </TabsTrigger>
          <TabsTrigger value="active">
            {t("active")}
            <span className="ms-1.5 text-xs text-muted-foreground">({totalActive})</span>
          </TabsTrigger>
          <TabsTrigger value="inactive">
            {t("inactive")}
            <span className="ms-1.5 text-xs text-muted-foreground">({totalInactive})</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <DataTable<Governorate>
        columns={columns}
        data={governorates ?? []}
        isLoading={isLoading}
      />

      <GovernorateFormSheet
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditGov(null); }}
        governorate={editGov}
      />
    </div>
  );
}
