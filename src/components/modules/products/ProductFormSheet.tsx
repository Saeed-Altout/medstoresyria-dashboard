"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDirection } from "@/lib/hooks/useDirection";
import {
  createProduct,
  updateProduct,
  upsertProductTranslations,
  setAttributeValues,
} from "@/lib/api/products.api";
import { getCategoryTree } from "@/lib/api/categories.api";
import { getBrands } from "@/lib/api/brands.api";
import { getAttributesByCategoryId } from "@/lib/api/attributes.api";
import { ImageUploader } from "./ImageUploader";
import type {
  ProductDetail,
  ProductImage,
  ProductAttribute,
  Category,
  Brand,
  AttributeDefinition,
  ApiResponse,
  UpsertProductTranslationDto,
  SetAttributeValuesDto,
} from "@/types";

interface ProductFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductDetail;
}

const basicSchema = z.object({
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  condition: z.enum(["new", "used"]),
  price_usd: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid price"),
  stock_qty: z.number().int().min(0),
  stock_min: z.number().int().min(0),
  is_featured: z.boolean(),
});
type BasicFormValues = z.infer<typeof basicSchema>;

const translationSchema = z.object({
  name_en: z.string().min(1),
  description_en: z.string().optional(),
  report_en: z.string().optional(),
  name_ar: z.string().optional(),
  description_ar: z.string().optional(),
  report_ar: z.string().optional(),
});
type TranslationFormValues = z.infer<typeof translationSchema>;

function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap((c) => [c, ...flattenCategories(c.children)]);
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive mt-1">{message}</p>;
}

export function ProductFormSheet({
  open,
  onOpenChange,
  product,
}: ProductFormSheetProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const { sheetSide } = useDirection();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("basic");
  const [savedProduct, setSavedProduct] = useState<ProductDetail | null>(
    product ?? null,
  );
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [attrValues, setAttrValues] = useState<Record<string, string>>({});

  const productId = savedProduct?.id;
  const selectedCategoryId = savedProduct?.category?.id ?? undefined;

  useEffect(() => {
    if (open) {
      setSavedProduct(product ?? null);
      setImages(product?.images ?? []);
      setActiveTab("basic");
      const initAttrs: Record<string, string> = {};
      product?.attributes.forEach((a) => {
        initAttrs[a.key] = a.value;
      });
      setAttrValues(initAttrs);
    }
  }, [open, product]);

  const { data: categories } = useQuery<Category[], AxiosError>({
    queryKey: ["categories"],
    queryFn: getCategoryTree,
    enabled: open,
  });

  const { data: brands } = useQuery<Brand[], AxiosError>({
    queryKey: ["brands"],
    queryFn: getBrands,
    enabled: open,
  });

  const { data: attributeDefs } = useQuery<AttributeDefinition[], AxiosError>({
    queryKey: ["attributes", selectedCategoryId],
    queryFn: () => getAttributesByCategoryId(selectedCategoryId!),
    enabled: !!selectedCategoryId,
  });

  const flatCategories = flattenCategories(categories ?? []);

  const {
    register: registerBasic,
    control: basicControl,
    handleSubmit: handleBasicSubmit,
    formState: { errors: basicErrors },
  } = useForm<BasicFormValues, unknown, BasicFormValues>({
    resolver: zodResolver(basicSchema),
    defaultValues: product
      ? {
          categoryId: product.category?.id,
          brandId: product.brand?.id,
          condition: product.condition,
          price_usd: product.price_usd,
          stock_qty: product.stock_qty,
          stock_min: product.stock_min,
          is_featured: product.is_featured,
        }
      : {
          condition: "new" as const,
          price_usd: "",
          stock_qty: 0,
          stock_min: 0,
          is_featured: false,
        },
  });

  const {
    register: registerTranslation,
    handleSubmit: handleTranslationSubmit,
    formState: { errors: translationErrors },
  } = useForm<TranslationFormValues>({
    resolver: zodResolver(translationSchema),
    defaultValues: {
      name_en: "",
      description_en: "",
      report_en: "",
      name_ar: "",
      description_ar: "",
      report_ar: "",
    },
  });

  const createMutation = useMutation<ProductDetail, AxiosError, BasicFormValues>({
    mutationFn: (values) =>
      createProduct({
        ...values,
        translations: [],
      }),
    onSuccess: (created) => {
      setSavedProduct(created);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(tCommon("save") + " ✓");
      setActiveTab("translations");
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const updateMutation = useMutation<
    ProductDetail,
    AxiosError,
    { id: string; values: BasicFormValues }
  >({
    mutationFn: ({ id, values }) => updateProduct(id, values),
    onSuccess: (updated) => {
      setSavedProduct(updated);
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(tCommon("save") + " ✓");
      setActiveTab("translations");
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const translationMutation = useMutation<
    void,
    AxiosError,
    { id: string; values: TranslationFormValues }
  >({
    mutationFn: ({ id, values }) => {
      const translations: UpsertProductTranslationDto[] = [
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
      return upsertProductTranslations(id, translations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(tCommon("save") + " ✓");
      setActiveTab("images");
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  const attributeMutation = useMutation<
    ProductAttribute[],
    AxiosError,
    { id: string; dto: SetAttributeValuesDto }
  >({
    mutationFn: ({ id, dto }) => setAttributeValues(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(tCommon("save") + " ✓");
      onOpenChange(false);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });

  function onBasicSubmit(values: BasicFormValues) {
    if (productId) {
      updateMutation.mutate({ id: productId, values });
    } else {
      createMutation.mutate(values);
    }
  }

  function onTranslationSubmit(values: TranslationFormValues) {
    if (!productId) return;
    translationMutation.mutate({ id: productId, values });
  }

  function onAttributeSave() {
    if (!productId || !attributeDefs) return;
    const dto: SetAttributeValuesDto = {
      values: attributeDefs
        .filter((def) => attrValues[def.key] !== undefined)
        .map((def) => ({
          attributeDefinitionId: def.id,
          value: attrValues[def.key] ?? "",
        })),
    };
    attributeMutation.mutate({ id: productId, dto });
  }

  const isBasicPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={sheetSide}
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle>
            {product ? t("edit_product") : t("add_product")}
          </SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-6">
            <TabsTrigger value="basic" className="flex-1">
              {t("tab_basic")}
            </TabsTrigger>
            <TabsTrigger
              value="translations"
              className="flex-1"
              disabled={!productId}
            >
              {t("tab_translations")}
            </TabsTrigger>
            <TabsTrigger
              value="images"
              className="flex-1"
              disabled={!productId}
            >
              {t("tab_images")}
            </TabsTrigger>
            <TabsTrigger
              value="attributes"
              className="flex-1"
              disabled={!productId || !selectedCategoryId}
            >
              {t("tab_attributes")}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Basic Info */}
          <TabsContent value="basic">
            <form
              onSubmit={handleBasicSubmit(onBasicSubmit)}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("category")}</Label>
                  <Controller
                    control={basicControl}
                    name="categoryId"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(v) =>
                          field.onChange(v === "none" ? undefined : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`— ${t("category")} —`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {flatCategories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={basicErrors.categoryId?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("brand")}</Label>
                  <Controller
                    control={basicControl}
                    name="brandId"
                    render={({ field }) => (
                      <Select
                        value={field.value ?? "none"}
                        onValueChange={(v) =>
                          field.onChange(v === "none" ? undefined : v)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`— ${t("brand")} —`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">—</SelectItem>
                          {(brands ?? []).map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={basicErrors.brandId?.message} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("condition")}</Label>
                  <Controller
                    control={basicControl}
                    name="condition"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">{t("condition_new")}</SelectItem>
                          <SelectItem value="used">{t("condition_used")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError message={basicErrors.condition?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("price")}</Label>
                  <Input placeholder="0.00" {...registerBasic("price_usd")} />
                  <FieldError message={basicErrors.price_usd?.message} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("stock")}</Label>
                  <Input type="number" min={0} {...registerBasic("stock_qty", { valueAsNumber: true })} />
                  <FieldError message={basicErrors.stock_qty?.message} />
                </div>

                <div className="space-y-1.5">
                  <Label>{t("stock_min")}</Label>
                  <Input type="number" min={0} {...registerBasic("stock_min", { valueAsNumber: true })} />
                  <FieldError message={basicErrors.stock_min?.message} />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Controller
                  control={basicControl}
                  name="is_featured"
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label>{t("featured")}</Label>
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isBasicPending}>
                  {tCommon("save")}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Tab 2: Translations */}
          <TabsContent value="translations">
            <form
              onSubmit={handleTranslationSubmit(onTranslationSubmit)}
              className="space-y-4"
            >
              <p className="text-sm font-medium text-muted-foreground">
                {t("english_required")}
              </p>

              <div className="space-y-1.5">
                <Label>{t("name_en")}</Label>
                <Input {...registerTranslation("name_en")} />
                <FieldError message={translationErrors.name_en?.message} />
              </div>

              <div className="space-y-1.5">
                <Label>{t("desc_en")}</Label>
                <Textarea rows={3} {...registerTranslation("description_en")} />
              </div>

              <div className="space-y-1.5">
                <Label>{t("report_en")}</Label>
                <Textarea rows={2} {...registerTranslation("report_en")} />
              </div>

              <p className="text-sm font-medium text-muted-foreground pt-2">
                {t("arabic_optional")}
              </p>

              <div className="space-y-1.5">
                <Label>{t("name_ar")}</Label>
                <Input dir="rtl" {...registerTranslation("name_ar")} />
              </div>

              <div className="space-y-1.5">
                <Label>{t("desc_ar")}</Label>
                <Textarea rows={3} dir="rtl" {...registerTranslation("description_ar")} />
              </div>

              <div className="space-y-1.5">
                <Label>{t("report_ar")}</Label>
                <Textarea rows={2} dir="rtl" {...registerTranslation("report_ar")} />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={translationMutation.isPending}>
                  {tCommon("save")}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Tab 3: Images */}
          <TabsContent value="images">
            {productId && (
              <ImageUploader
                productId={productId}
                images={images}
                onImagesChange={setImages}
              />
            )}
            <div className="flex justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveTab("attributes")}
                disabled={!selectedCategoryId}
              >
                {selectedCategoryId
                  ? t("tab_attributes")
                  : t("select_category_first")}
              </Button>
            </div>
          </TabsContent>

          {/* Tab 4: Attributes */}
          <TabsContent value="attributes">
            {!selectedCategoryId ? (
              <p className="text-sm text-muted-foreground">
                {t("select_category_first")}
              </p>
            ) : !attributeDefs || attributeDefs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("no_attributes")}
              </p>
            ) : (
              <div className="space-y-4">
                {attributeDefs.map((def) => (
                  <div key={def.id} className="space-y-1.5">
                    <Label>
                      {def.label}
                      {def.is_required && (
                        <span className="text-destructive ms-1">*</span>
                      )}
                    </Label>
                    <Input
                      value={attrValues[def.key] ?? ""}
                      onChange={(e) =>
                        setAttrValues((prev) => ({
                          ...prev,
                          [def.key]: e.target.value,
                        }))
                      }
                      placeholder={def.label}
                    />
                  </div>
                ))}

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    disabled={attributeMutation.isPending}
                    onClick={onAttributeSave}
                  >
                    {tCommon("save")}
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
