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
import { getCategoryTree, deleteCategory } from "@/lib/api/categories.api";
import { getCategoryColumns, flattenTree } from "./_components/columns";
import { CategoryFormSheet } from "./_components/category-form-sheet";
import { CategoriesToolbar } from "./_components/categories-toolbar";
import type { ApiResponse, Category } from "@/types";
import type { FlatCategory } from "./_components/columns";

type StatusFilter = "active" | "inactive" | "all";

export default function CategoriesPage() {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && !canAccess(user.role, "settings")) router.replace("/overview");
  }, [user, router]);

  const [status, setStatus] = useState<StatusFilter>("active");
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: categories, isLoading } = useQuery<Category[], AxiosError>({
    queryKey: ["categories", status],
    queryFn: () => getCategoryTree(status),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("deleted"));
      setDeleteId(null);
    },
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });

  const flatCategories = useMemo(() => flattenTree(categories ?? []), [categories]);

  const columns = useMemo(
    () =>
      getCategoryColumns({
        tName: tCommon("name"),
        tParent: t("parent"),
        tSortOrder: t("sort_order"),
        tActive: tCommon("active"),
        tInactive: tCommon("inactive"),
        categories: categories ?? [],
        onEdit: (cat) => { setEditCategory(cat); setFormOpen(true); },
        onDelete: setDeleteId,
      }),
    [categories, t, tCommon],
  );

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      <Header title={t("title")}>
        <Button size="sm" onClick={() => { setEditCategory(null); setFormOpen(true); }}>
          <IconPlus data-icon="inline-start" />
          {t("add")}
        </Button>
      </Header>

      <DataTable<FlatCategory>
        columns={columns}
        data={flatCategories}
        isLoading={isLoading}
        toolbar={
          <CategoriesToolbar status={status} onStatusChange={setStatus} />
        }
      />

      <CategoryFormSheet
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditCategory(null); }}
        category={editCategory}
        allCategories={categories ?? []}
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
