"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { type ColumnDef, type Row } from "@tanstack/react-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconDotsVertical, IconPlus } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import {
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct,
} from "@/lib/api/products.api";
import { getCategoryTree } from "@/lib/api/categories.api";
import { getBrands } from "@/lib/api/brands.api";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ProductFormSheet } from "@/components/modules/products/ProductFormSheet";
import { formatPrice } from "@/lib/utils/format";
import type {
  ProductListItem,
  ProductDetail,
  ProductFilters,
  PaginatedResponse,
  Category,
  Brand,
  ApiResponse,
} from "@/types";

function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap((c) => [c, ...flattenCategories(c.children)]);
}

export default function ProductsPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user && !canAccess(user.role, "products")) router.replace("/overview");
  }, [user, router]);

  const [filters, setFilters] = useState<ProductFilters>({ page: 1 });
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductDetail | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PaginatedResponse<ProductListItem>, AxiosError>({
    queryKey: ["products", filters],
    queryFn: () => getProducts(filters),
    placeholderData: (prev) => prev,
  });

  const { data: categories } = useQuery<Category[], AxiosError>({
    queryKey: ["categories"],
    queryFn: getCategoryTree,
  });

  const { data: brands } = useQuery<Brand[], AxiosError>({
    queryKey: ["brands"],
    queryFn: getBrands,
  });

  const flatCategories = flattenCategories(categories ?? []);

  const toggleActiveMutation = useMutation<
    ProductDetail,
    AxiosError,
    { id: string; is_active: boolean }
  >({
    mutationFn: ({ id, is_active }) => updateProduct(id, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const deleteMutation = useMutation<void, AxiosError, string>({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(tCommon("delete") + " ✓");
      setDeleteId(null);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  async function handleEdit(product: ProductListItem) {
    try {
      const detail = await getProductBySlug(product.slug);
      setEditProduct(detail);
      setSheetOpen(true);
    } catch {
      toast.error("Failed to load product");
    }
  }

  function handleAdd() {
    setEditProduct(null);
    setSheetOpen(true);
  }

  const columns: ColumnDef<ProductListItem>[] = [
    {
      id: "image",
      header: "",
      cell: ({ row }: { row: Row<ProductListItem> }) => (
        <div className="size-10 rounded-md overflow-hidden bg-muted shrink-0">
          {row.original.primaryImageUrl ? (
            <Image
              src={row.original.primaryImageUrl}
              alt={row.original.name}
              width={40}
              height={40}
              className="object-cover size-10"
            />
          ) : (
            <div className="size-10 bg-muted" />
          )}
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: tCommon("name"),
      cell: ({ row }: { row: Row<ProductListItem> }) => (
        <div>
          <p className="font-medium text-sm">{row.original.name}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {row.original.slug}
          </p>
        </div>
      ),
    },
    {
      id: "brand",
      header: t("brand"),
      cell: ({ row }: { row: Row<ProductListItem> }) =>
        row.original.brand?.name ?? "—",
    },
    {
      id: "category",
      header: t("category"),
      cell: ({ row }: { row: Row<ProductListItem> }) =>
        row.original.category?.name ?? "—",
    },
    {
      id: "condition",
      header: t("condition"),
      cell: ({ row }: { row: Row<ProductListItem> }) => (
        <Badge variant="outline">
          {row.original.condition === "new"
            ? t("condition_new")
            : t("condition_used")}
        </Badge>
      ),
    },
    {
      accessorKey: "price_usd",
      header: t("price"),
      cell: ({ row }: { row: Row<ProductListItem> }) =>
        formatPrice(row.original.price_usd),
    },
    {
      accessorKey: "stock_qty",
      header: t("stock"),
      cell: ({ row }: { row: Row<ProductListItem> }) => row.original.stock_qty,
    },
    {
      id: "is_active",
      header: t("active"),
      cell: ({ row }: { row: Row<ProductListItem> }) => {
        const p = row.original as ProductListItem & { is_active?: boolean };
        return (
          <Switch
            checked={p.is_active !== false}
            onCheckedChange={(checked) =>
              toggleActiveMutation.mutate({ id: p.id, is_active: checked })
            }
          />
        );
      },
    },
    {
      id: "actions",
      header: tCommon("actions"),
      cell: ({ row }: { row: Row<ProductListItem> }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <IconDotsVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleEdit(row.original)}>
              {tCommon("edit")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => setDeleteId(row.original.id)}
            >
              {tCommon("delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const toolbar = (
    <div className="flex items-center gap-3 flex-wrap">
      <Select
        defaultValue="all"
        onValueChange={(v) =>
          setFilters((f) => ({
            ...f,
            categoryId: v === "all" ? undefined : v,
            page: 1,
          }))
        }
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder={t("category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("category")}</SelectItem>
          {flatCategories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue="all"
        onValueChange={(v) =>
          setFilters((f) => ({
            ...f,
            brandId: v === "all" ? undefined : v,
            page: 1,
          }))
        }
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder={t("brand")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("brand")}</SelectItem>
          {(brands ?? []).map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        defaultValue="all"
        onValueChange={(v) =>
          setFilters((f) => ({
            ...f,
            condition:
              v === "all"
                ? undefined
                : (v as "new" | "used"),
            page: 1,
          }))
        }
      >
        <SelectTrigger className="w-32">
          <SelectValue placeholder={t("condition")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("condition")}</SelectItem>
          <SelectItem value="new">{t("condition_new")}</SelectItem>
          <SelectItem value="used">{t("condition_used")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  if (!user) return null;

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("title")}
        actions={
          <Button size="sm" onClick={handleAdd}>
            <IconPlus className="size-4 me-2" />
            {t("add_product")}
          </Button>
        }
      />

      <DataTable<ProductListItem>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        meta={data?.meta}
        onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
        searchable
        onSearch={(value) =>
          setFilters((f) => ({ ...f, search: value || undefined, page: 1 }))
        }
        toolbar={toolbar}
      />

      <ProductFormSheet
        open={sheetOpen}
        onOpenChange={(open) => {
          setSheetOpen(open);
          if (!open) setEditProduct(null);
        }}
        product={editProduct ?? undefined}
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
