"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { getBrands, deleteBrand } from "@/lib/api/brands.api";
import { getBrandColumns } from "./_components/columns";
import { BrandFormSheet } from "./_components/brand-form-sheet";
import type { ApiResponse, Brand } from "@/types";

export default function BrandsPage() {
  const t = useTranslations("brands");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && !canAccess(user.role, "settings")) router.replace("/overview");
  }, [user, router]);

  const [formOpen, setFormOpen] = useState(false);
  const [editBrand, setEditBrand] = useState<Brand | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: brands, isLoading } = useQuery<Brand[], AxiosError>({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
      toast.success(t("deleted"));
      setDeleteId(null);
    },
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });

  const columns = useMemo(
    () =>
      getBrandColumns({
        tName: tCommon("name"),
        onEdit: (brand) => { setEditBrand(brand); setFormOpen(true); },
        onDelete: setDeleteId,
      }),
    [tCommon],
  );

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      <Header title={t("title")}>
        <Button size="sm" onClick={() => { setEditBrand(null); setFormOpen(true); }}>
          <IconPlus data-icon="inline-start" />
          {t("add")}
        </Button>
      </Header>

      <DataTable<Brand> columns={columns} data={brands ?? []} isLoading={isLoading} />

      <BrandFormSheet
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditBrand(null); }}
        brand={editBrand}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        title={tCommon("are_you_sure")}
        description={t("delete_confirm")}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
