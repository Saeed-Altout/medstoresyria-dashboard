"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { deleteCategory } from "@/lib/api/categories.api";
import { useGetCategories, categoryKeys } from "@/lib/hooks/categories";
import { getCategoryColumns } from "./_components/columns";
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleStatusChange = (s: StatusFilter) => { setStatus(s); setPage(1); };
  const handleSearch = useCallback((s: string) => { setSearch(s); setPage(1); }, []);

  const { data: result, isLoading } = useGetCategories({ status, search, page, limit });

  const categories = result?.data ?? [];
  const meta = result?.meta ?? { page, limit, total: 0, totalPages: 1 };

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success(t("deleted"));
      setDeleteId(null);
    },
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });

  const columns = useMemo(
    () =>
      getCategoryColumns({
        tName: tCommon("name"),
        tParent: t("parent"),
        tSortOrder: t("sort_order"),
        tActive: tCommon("active"),
        tInactive: tCommon("inactive"),
        categories,
        onEdit: (cat) => { setEditCategory(cat); setFormOpen(true); },
        onDelete: setDeleteId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        data={categories as FlatCategory[]}
        isLoading={isLoading}
        searchable
        onSearch={handleSearch}
        toolbar={
          <CategoriesToolbar status={status} onStatusChange={handleStatusChange} />
        }
        meta={meta}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1); }}
      />

      <CategoryFormSheet
        open={formOpen}
        onOpenChange={(o) => { setFormOpen(o); if (!o) setEditCategory(null); }}
        category={editCategory}
        allCategories={categories}
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
