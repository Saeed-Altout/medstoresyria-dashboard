"use client";

import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from "@/components/ui/field";
import {
  AppSheet,
  AppSheetContent,
  AppSheetHeader,
  AppSheetBody,
  AppSheetFooter,
  AppSheetTitle,
  AppSheetDescription,
} from "@/components/app-sheet";
import { useCreateProduct } from "@/lib/hooks/products";
import { useGetCategories } from "@/lib/hooks/categories";
import { useGetBrands } from "@/lib/hooks/brands";
import type { Category } from "@/types";

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name_en: z.string().min(2, "Name must be at least 2 characters"),
  condition: z.enum(["new", "used"]),
  price_usd: z.string().regex(/^\d+(\.\d{1,2})?$/, "e.g. 29.99"),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
});
type FormValues = z.infer<typeof schema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap((c) => [c, ...flattenCategories(c.children ?? [])]);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ProductCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductCreateSheet({ open, onOpenChange }: ProductCreateSheetProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const createMutation = useCreateProduct();

  const { data: categories } = useGetCategories();
  const { data: brands } = useGetBrands();

  const flatCategories = flattenCategories(categories?.data ?? []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name_en: "", condition: "new", price_usd: "", categoryId: undefined, brandId: undefined },
  });

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  function onSubmit(values: FormValues) {
    createMutation.mutate(
      {
        condition: values.condition,
        price_usd: values.price_usd,
        stock_qty: 0,
        translations: [{ locale: "en", name: values.name_en }],
        ...(values.categoryId ? { categoryId: values.categoryId } : {}),
        ...(values.brandId ? { brandId: values.brandId } : {}),
      },
      {
        onSuccess: ({ data }) => {
          handleClose();
          router.push(`/products/${data.slug}`);
        },
      },
    );
  }

  return (
    <AppSheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <AppSheetContent size="md">
        <AppSheetHeader>
          <AppSheetTitle>{t("add_product")}</AppSheetTitle>
          <AppSheetDescription>{t("create_description")}</AppSheetDescription>
        </AppSheetHeader>

        <AppSheetBody>
          <form id="product-create-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              {/* English name */}
              <Controller
                name="name_en"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-name-en">{t("name_en")}</FieldLabel>
                    <Input
                      {...field}
                      id="create-name-en"
                      aria-invalid={fieldState.invalid}
                      placeholder="e.g. Blood Pressure Monitor"
                    />
                    <FieldDescription>{t("create_name_hint")}</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Condition */}
              <Controller
                name="condition"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-condition">{t("condition")}</FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                      <SelectTrigger id="create-condition" aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">{t("condition_new")}</SelectItem>
                        <SelectItem value="used">{t("condition_used")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Price */}
              <Controller
                name="price_usd"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-price">{t("price")}</FieldLabel>
                    <Input
                      {...field}
                      id="create-price"
                      aria-invalid={fieldState.invalid}
                      placeholder="0.00"
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Category */}
              <Controller
                name="categoryId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-category">{t("category")}</FieldLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                      name={field.name}
                    >
                      <SelectTrigger id="create-category" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={`— ${t("category")} —`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {flatCategories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Brand */}
              <Controller
                name="brandId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="create-brand">{t("brand")}</FieldLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                      name={field.name}
                    >
                      <SelectTrigger id="create-brand" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={`— ${t("brand")} —`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {(brands ?? []).map((b) => (
                          <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </AppSheetBody>

        <AppSheetFooter>
          <Button variant="outline" onClick={handleClose}>{tCommon("cancel")}</Button>
          <Button
            type="submit"
            form="product-create-form"
            disabled={createMutation.isPending}
          >
            {t("create_and_continue")}
          </Button>
        </AppSheetFooter>
      </AppSheetContent>
    </AppSheet>
  );
}
