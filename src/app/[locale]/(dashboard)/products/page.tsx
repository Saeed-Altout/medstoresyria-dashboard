"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { IconPlus } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import {
  useProductFilters,
  useGetProducts,
  useDeleteProduct,
} from "@/lib/hooks/products";
import { useGetCategories } from "@/lib/hooks/categories";
import { useGetBrands } from "@/lib/hooks/brands";
import { useDebouncedSearch } from "@/hooks/use-table-filters";
import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ProductCreateSheet } from "@/components/modules/products/product-create-sheet";
import { getProductColumns } from "./_components/columns";
import { ProductsToolbar } from "./_components/products-toolbar";
import type { ProductListItem, Category } from "@/types";

function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap((c) => [c, ...flattenCategories(c.children ?? [])]);
}

export default function ProductsPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !canAccess(user.role, "products")) router.replace("/overview");
  }, [user, router]);

  const { filters, setPage, setLimit, setSearch, setFilter, resetFilters } = useProductFilters();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetProducts(filters);
  const deleteMutation = useDeleteProduct();

  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();

  const handleSearch = useDebouncedSearch(setSearch);

  const columns = useMemo(
    () =>
      getProductColumns({
        t: (k) => t(k as Parameters<typeof t>[0]),
        tCommon: (k) => tCommon(k as Parameters<typeof tCommon>[0]),
        onView: (product) => router.push(`/products/${product.slug}`),
        onDelete: setDeleteId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      <Header title={t("title")}>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <IconPlus data-icon="inline-start" />
          {t("add_product")}
        </Button>
      </Header>

      <DataTable<ProductListItem>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={setPage}
        onLimitChange={setLimit}
        searchable
        onSearch={handleSearch}
        toolbar={
          <ProductsToolbar
            categories={flattenCategories(categories ?? [])}
            brands={brands ?? []}
            onCategoryChange={(id) => setFilter("categoryId", id)}
            onBrandChange={(id) => setFilter("brandId", id)}
            onConditionChange={(c) => setFilter("condition", c as "new" | "used" | undefined)}
            onReset={resetFilters}
          />
        }
      />

      <ProductCreateSheet open={createOpen} onOpenChange={setCreateOpen} />

      <ConfirmDialog
        open={deleteId !== null}
        onCancel={() => setDeleteId(null)}
        title={tCommon("are_you_sure")}
        description={t("delete_confirm")}
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
        }}
        isLoading={deleteMutation.isPending}
        variant="destructive"
      />
    </div>
  );
}
