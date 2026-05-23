"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { AxiosError } from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field";
import { Header } from "@/components/header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ProductImageManager } from "@/components/modules/products/product-image-manager";
import { IconArrowLeft, IconPackage, IconTag, IconTrash } from "@tabler/icons-react";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useDirection } from "@/hooks/use-direction";
import {
  useUpdateProduct,
  useDeleteProduct,
  useSetProductAttributes,
  useUpsertProductTranslations,
} from "@/lib/hooks/products";
import { getProductBySlug } from "@/lib/api/products.api";
import { useGetCategories } from "@/lib/hooks/categories";
import { useGetBrands } from "@/lib/hooks/brands";
import { getAttributesByCategoryId } from "@/lib/api/attributes.api";
import { formatPrice } from "@/lib/utils/format";
import type {
  ProductDetail,
  Category,
  Brand,
  AttributeDefinition,
} from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap((c) => [c, ...flattenCategories(c.children ?? [])]);
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const basicSchema = z.object({
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  condition: z.enum(["new", "used"]),
  price_usd: z.string().regex(/^\d+(\.\d{1,2})?$/, "e.g. 29.99"),
  stock_qty: z.number().int().min(0),
  stock_min: z.number().int().min(0),
  is_featured: z.boolean(),
  is_active: z.boolean(),
});
type BasicValues = z.infer<typeof basicSchema>;

const translationSchema = z.object({
  name_en: z.string().min(1, "Required"),
  description_en: z.string().optional(),
  report_en: z.string().optional(),
  name_ar: z.string().optional(),
  description_ar: z.string().optional(),
  report_ar: z.string().optional(),
});
type TranslationValues = z.infer<typeof translationSchema>;

// ─── Basic Form ───────────────────────────────────────────────────────────────

function BasicForm({
  product,
  categories,
  brands,
}: {
  product: ProductDetail;
  categories: Category[];
  brands: Brand[];
}) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const updateMutation = useUpdateProduct();
  const flatCategories = flattenCategories(categories);

  const form = useForm<BasicValues, unknown, BasicValues>({
    resolver: zodResolver(basicSchema),
    defaultValues: {
      categoryId: product.category?.id,
      brandId: product.brand?.id,
      condition: product.condition,
      price_usd: product.price_usd,
      stock_qty: product.stock_qty,
      stock_min: product.stock_min,
      is_featured: product.is_featured,
      is_active: product.is_active,
    },
  });

  useEffect(() => {
    form.reset({
      categoryId: product.category?.id,
      brandId: product.brand?.id,
      condition: product.condition,
      price_usd: product.price_usd,
      stock_qty: product.stock_qty,
      stock_min: product.stock_min,
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
  }, [product]);

  function onSubmit(values: BasicValues) {
    updateMutation.mutate({ id: product.id, dto: values });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <FieldGroup>
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-category">{t("category")}</FieldLabel>
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(v) =>
                    field.onChange(v === "none" ? undefined : v)
                  }
                  name={field.name}
                >
                  <SelectTrigger
                    id="edit-category"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {flatCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="brandId"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-brand">{t("brand")}</FieldLabel>
                <Select
                  value={field.value ?? "none"}
                  onValueChange={(v) =>
                    field.onChange(v === "none" ? undefined : v)
                  }
                  name={field.name}
                >
                  <SelectTrigger
                    id="edit-brand"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">—</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="condition"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-condition">
                  {t("condition")}
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  name={field.name}
                >
                  <SelectTrigger
                    id="edit-condition"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">{t("condition_new")}</SelectItem>
                    <SelectItem value="used">{t("condition_used")}</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="price_usd"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-price">{t("price")}</FieldLabel>
                <Input
                  {...field}
                  id="edit-price"
                  aria-invalid={fieldState.invalid}
                  placeholder="0.00"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="stock_qty"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-stock">{t("stock")}</FieldLabel>
                <Input
                  id="edit-stock"
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="stock_min"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-stock-min">
                  {t("stock_min")}
                </FieldLabel>
                <Input
                  id="edit-stock-min"
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          name="is_featured"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="edit-featured">{t("featured")}</FieldLabel>
                <FieldDescription>{t("featured_description")}</FieldDescription>
              </FieldContent>
              <Switch
                id="edit-featured"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />

        <Controller
          name="is_active"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="horizontal" data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor="edit-active">{t("active")}</FieldLabel>
                <FieldDescription>{t("active_description")}</FieldDescription>
              </FieldContent>
              <Switch
                id="edit-active"
                checked={field.value}
                onCheckedChange={field.onChange}
                aria-invalid={fieldState.invalid}
              />
            </Field>
          )}
        />

      </FieldGroup>

      <div className="flex justify-end">
        <Button type="submit" disabled={updateMutation.isPending}>
          {tCommon("save")}
        </Button>
      </div>
    </form>
  );
}

// ─── Translations Form ────────────────────────────────────────────────────────

function TranslationsForm({ product }: { product: ProductDetail }) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const upsertMutation = useUpsertProductTranslations();

  const form = useForm<TranslationValues>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      name_en: product.name ?? "",
      description_en: product.description ?? "",
      report_en: product.condition_report ?? "",
      name_ar: "",
      description_ar: "",
      report_ar: "",
    },
  });

  function onSubmit(values: TranslationValues) {
    const translations = [
      {
        locale: "en",
        name: values.name_en,
        description: values.description_en,
        condition_report: values.report_en,
      },
      ...(values.name_ar
        ? [
            {
              locale: "ar",
              name: values.name_ar,
              description: values.description_ar,
              condition_report: values.report_ar,
            },
          ]
        : []),
    ];
    upsertMutation.mutate({ id: product.id, translations });
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      <div className="rounded-md border bg-muted/30 p-4 flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          English
        </p>
        <FieldGroup>
          <Controller
            name="name_en"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trans-name-en">{t("name_en")}</FieldLabel>
                <Input
                  {...field}
                  id="trans-name-en"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="description_en"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trans-desc-en">{t("desc_en")}</FieldLabel>
                <Textarea
                  {...field}
                  id="trans-desc-en"
                  rows={3}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="report_en"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trans-report-en">
                  {t("report_en")}
                </FieldLabel>
                <Textarea
                  {...field}
                  id="trans-report-en"
                  rows={2}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <div className="rounded-md border bg-muted/30 p-4 flex flex-col gap-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          العربية
        </p>
        <FieldGroup>
          <Controller
            name="name_ar"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trans-name-ar">{t("name_ar")}</FieldLabel>
                <Input
                  {...field}
                  id="trans-name-ar"
                  dir="rtl"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="description_ar"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trans-desc-ar">{t("desc_ar")}</FieldLabel>
                <Textarea
                  {...field}
                  id="trans-desc-ar"
                  rows={3}
                  dir="rtl"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            name="report_ar"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="trans-report-ar">
                  {t("report_ar")}
                </FieldLabel>
                <Textarea
                  {...field}
                  id="trans-report-ar"
                  rows={2}
                  dir="rtl"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={upsertMutation.isPending}>
          {tCommon("save")}
        </Button>
      </div>
    </form>
  );
}

// ─── Attributes Form ──────────────────────────────────────────────────────────

function AttributesForm({
  product,
  attributeDefs,
}: {
  product: ProductDetail;
  attributeDefs: AttributeDefinition[] | undefined;
}) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const setAttrMutation = useSetProductAttributes();

  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    product.attributes?.forEach((a) => {
      init[a.key] = a.value;
    });
    return init;
  });

  if (!product.category?.id) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
          <IconTag className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{t("attr_no_category_title")}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("attr_no_category_desc")}</p>
        </div>
      </div>
    );
  }

  if (!attributeDefs || attributeDefs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center">
          <IconTag className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">{t("no_attributes")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            <span className="font-medium text-foreground">{product.category.name}</span>
            {" "}{t("attr_no_defs_desc")}
          </p>
        </div>
      </div>
    );
  }

  function handleSave() {
    const dto = {
      values: (attributeDefs ?? [])
        .filter(
          (def) => values[def.key] !== undefined && values[def.key] !== "",
        )
        .map((def) => ({
          attributeDefinitionId: def.id,
          value: values[def.key]!,
        })),
    };
    setAttrMutation.mutate({ id: product.id, dto });
  }

  return (
    <div className="flex flex-col gap-6">
      <FieldGroup>
        {attributeDefs.map((def) => (
          <Field key={def.id}>
            <FieldLabel htmlFor={`attr-${def.key}`}>
              {def.label}
              {def.is_required && (
                <span className="text-destructive ms-1">*</span>
              )}
            </FieldLabel>
            <Input
              id={`attr-${def.key}`}
              value={values[def.key] ?? ""}
              onChange={(e) =>
                setValues((v) => ({ ...v, [def.key]: e.target.value }))
              }
              placeholder={def.label}
            />
          </Field>
        ))}
      </FieldGroup>
      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSave}
          disabled={setAttrMutation.isPending}
        >
          {tCommon("save")}
        </Button>
      </div>
    </div>
  );
}

// ─── Preview Card ─────────────────────────────────────────────────────────────

function ProductPreviewCard({ product }: { product: ProductDetail }) {
  const t = useTranslations("products");
  const primaryImage =
    product.images.find((i) => i.is_primary) ?? product.images[0];

  return (
    <div className="rounded-xl border bg-card overflow-hidden flex flex-col shadow-sm">
      <div className="aspect-4/3 bg-muted relative">
        {primaryImage ? (
          <Image
            src={primaryImage.url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="320px"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <IconPackage className="size-12 opacity-30" />
          </div>
        )}
        <div className="absolute top-2 inset-s-2 flex flex-col gap-1">
          {!product.is_active && (
            <Badge variant="secondary" className="text-[11px]">
              {t("inactive")}
            </Badge>
          )}
          {product.is_featured && (
            <Badge className="text-[11px] bg-amber-500 hover:bg-amber-500">
              {t("featured")}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div>
          <p className="font-semibold text-sm leading-tight line-clamp-2">
            {product.name}
          </p>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            {product.slug}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">
            {formatPrice(product.price_usd)}
          </span>
          <Badge variant="outline" className="text-xs">
            {product.condition === "new"
              ? t("condition_new")
              : t("condition_used")}
          </Badge>
        </div>

        <Separator />

        <div className="flex gap-1.5 flex-wrap">
          <Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">
            {product.is_active ? t("active") : t("inactive")}
          </Badge>
          <Badge variant={product.in_stock ? "default" : "destructive"} className="text-xs">
            {product.in_stock ? t("in_stock") : t("out_of_stock")}
          </Badge>
        </div>

        <Separator />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">{t("stock")}</p>
            <p className="font-medium">
              {product.stock_qty} {t("units")}
            </p>
          </div>
          {product.brand && (
            <div>
              <p className="text-muted-foreground">{t("brand")}</p>
              <p className="font-medium truncate">{product.brand.name}</p>
            </div>
          )}
          {product.category && (
            <div className="col-span-2">
              <p className="text-muted-foreground">{t("category")}</p>
              <p className="font-medium truncate">{product.category.name}</p>
            </div>
          )}
        </div>

        {product.images.length > 1 && (
          <>
            <Separator />
            <div className="flex gap-1.5 flex-wrap">
              {product.images.slice(0, 5).map((img) => (
                <div
                  key={img.id}
                  className={`size-9 rounded overflow-hidden border ${img.is_primary ? "border-primary" : "border-border"}`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    width={36}
                    height={36}
                    className="object-cover size-9"
                    sizes="36px"
                  />
                </div>
              ))}
              {product.images.length > 5 && (
                <div className="size-9 rounded border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground">
                  +{product.images.length - 5}
                </div>
              )}
            </div>
          </>
        )}

        {product.attributes && product.attributes.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-1">
              {product.attributes.slice(0, 4).map((attr) => (
                <div key={attr.key} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{attr.label}</span>
                  <span className="font-medium">{attr.value}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { iconClass } = useDirection();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !canAccess(user.role, "products")) router.replace("/overview");
  }, [user, router]);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteMutation = useDeleteProduct();

  const { data: product, isLoading } = useQuery<ProductDetail, AxiosError>({
    queryKey: ["products", "detail", params.slug],
    queryFn: () => getProductBySlug(params.slug),
    enabled: !!params.slug,
  });

  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();

  const { data: attributeDefs } = useQuery<AttributeDefinition[], AxiosError>({
    queryKey: ["attributes", product?.category?.id],
    queryFn: () => getAttributesByCategoryId(product!.category!.id),
    enabled: !!product?.category?.id,
  });

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {tCommon("loading")}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        {tCommon("no_data")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <Header title={product.name}>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/products")}
          >
            <IconArrowLeft className={`size-4 me-1.5 ${iconClass}`} />
            {t("back_to_products")}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setDeleteOpen(true)}
          >
            <IconTrash data-icon="inline-start" />
            {tCommon("delete")}
          </Button>
        </div>
      </Header>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6 items-start">
        <Tabs defaultValue="basic">
          <TabsList className="w-full">
            <TabsTrigger value="basic" className="flex-1">
              {t("tab_basic")}
            </TabsTrigger>
            <TabsTrigger value="translations" className="flex-1">
              {t("tab_translations")}
            </TabsTrigger>
            <TabsTrigger value="images" className="flex-1">
              {t("tab_images")}
            </TabsTrigger>
            <TabsTrigger value="attributes" className="flex-1">
              {t("tab_attributes")}
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="basic"
            className="mt-4 rounded-lg border bg-card p-5"
          >
            <BasicForm
              product={product}
              categories={categories ?? []}
              brands={brands ?? []}
            />
          </TabsContent>

          <TabsContent
            value="translations"
            className="mt-4 rounded-lg border bg-card p-5"
          >
            <TranslationsForm product={product} />
          </TabsContent>

          <TabsContent
            value="images"
            className="mt-4 rounded-lg border bg-card p-5"
          >
            <ProductImageManager
              productId={product.id}
              images={product.images}
            />
          </TabsContent>

          <TabsContent
            value="attributes"
            className="mt-4 rounded-lg border bg-card p-5"
          >
            <AttributesForm product={product} attributeDefs={attributeDefs} />
          </TabsContent>
        </Tabs>

        <div className="xl:sticky xl:top-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            {t("preview")}
          </p>
          <ProductPreviewCard product={product} />
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onCancel={() => setDeleteOpen(false)}
        title={tCommon("are_you_sure")}
        description={t("delete_confirm")}
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          deleteMutation.mutate(product.id, {
            onSuccess: () => router.push("/products"),
          });
        }}
      />
    </div>
  );
}
