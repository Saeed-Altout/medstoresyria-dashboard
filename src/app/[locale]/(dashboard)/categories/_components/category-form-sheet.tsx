"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { IconUpload, IconX } from "@tabler/icons-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
  FieldContent,
} from "@/components/ui/field";
import {
  AppSheet,
  AppSheetContent,
  AppSheetHeader,
  AppSheetBody,
  AppSheetFooter,
  AppSheetTitle,
} from "@/components/app-sheet";
import {
  createCategory,
  updateCategory,
  uploadCategoryImage,
  upsertCategoryTranslations,
} from "@/lib/api/categories.api";
import type { ApiResponse, Category } from "@/types";

function RequiredMark() {
  return <span className="text-destructive ms-0.5">*</span>;
}

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function flattenCategories(cats: Category[], excludeId?: string): Category[] {
  return cats.flatMap((c) => {
    if (c.id === excludeId) return [];
    return [c, ...flattenCategories(c.children ?? [], excludeId)];
  });
}

const schema = z.object({
  name_en: z.string().min(1, "Required"),
  name_ar: z.string().optional(),
  slug: z.string().min(1, "Required"),
  parentId: z.string().optional(),
  sortOrder: z.number().int().min(0),
  isActive: z.boolean(),
  imageUrl: z.string().optional(),
});

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

type FormValues = z.infer<typeof schema>;

interface CategoryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  allCategories: Category[];
}

export function CategoryFormSheet({ open, onOpenChange, category, allCategories }: CategoryFormSheetProps) {
  const t = useTranslations("categories");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const isEdit = !!category;

  const flatCats = flattenCategories(allCategories, category?.id);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name_en: "",
      name_ar: "",
      slug: "",
      parentId: undefined,
      sortOrder: 0,
      isActive: true,
      imageUrl: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    setImageFile(null);
    if (!category) {
      form.reset({ name_en: "", name_ar: "", slug: "", parentId: undefined, sortOrder: 0, isActive: true, imageUrl: "" });
      setImagePreview(null);
      return;
    }
    const enT = category.translations?.find((t) => t.locale === "en");
    const arT = category.translations?.find((t) => t.locale === "ar");
    form.reset({
      name_en: enT?.name ?? "",
      name_ar: arT?.name ?? "",
      slug: category.slug,
      parentId: undefined,
      sortOrder: category.sortOrder ?? 0,
      isActive: category.isActive ?? true,
      imageUrl: category.imageUrl ?? "",
    });
    setImagePreview(category.imageUrl ?? null);
  }, [open, category, form]);

  function handleImageFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error(t("image_type_error"));
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error(t("image_size_error"));
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  function handleRemoveImage() {
    setImageFile(null);
    setImagePreview(null);
    form.setValue("imageUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const nameEnValue = form.watch("name_en");
  useEffect(() => {
    if (!isEdit) {
      form.setValue("slug", toSlug(nameEnValue ?? ""), { shouldValidate: false });
    }
  }, [nameEnValue, isEdit, form]);

  async function resolveImageUrl(current?: string): Promise<string | undefined> {
    if (imageFile) return uploadCategoryImage(imageFile);
    return current || undefined;
  }

  const createMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const translations = [{ locale: "en", name: values.name_en }];
      if (values.name_ar) translations.push({ locale: "ar", name: values.name_ar });
      const imageUrl = await resolveImageUrl(values.imageUrl);
      return createCategory({
        slug: values.slug,
        sortOrder: values.sortOrder,
        ...(values.parentId ? { parentId: values.parentId } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        translations,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("created"));
      handleClose();
    },
    onError: (err: AxiosError) => toast.error((err.response?.data as ApiResponse<null>)?.message ?? t("error")),
  });

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const translations = [{ locale: "en", name: values.name_en }];
      if (values.name_ar) translations.push({ locale: "ar", name: values.name_ar });
      const imageUrl = await resolveImageUrl(values.imageUrl);
      await Promise.all([
        updateCategory(category!.id, {
          slug: values.slug,
          sortOrder: values.sortOrder,
          isActive: values.isActive,
          imageUrl: imageUrl ?? "",
          ...(values.parentId ? { parentId: values.parentId } : {}),
        }),
        upsertCategoryTranslations(category!.id, translations),
      ]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success(t("updated"));
      handleClose();
    },
    onError: (err: AxiosError) => toast.error((err.response?.data as ApiResponse<null>)?.message ?? t("error")),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  function onSubmit(values: FormValues) {
    if (isEdit) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <AppSheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <AppSheetContent size="md">
        <AppSheetHeader>
          <AppSheetTitle>{isEdit ? t("edit") : t("add")}</AppSheetTitle>
        </AppSheetHeader>

        <AppSheetBody>
          <form id="category-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel>{t("image")}</FieldLabel>
                <div className="flex items-center gap-4">
                  <div className="size-16 shrink-0 overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
                    {imagePreview ? (
                      <Image
                        src={imagePreview}
                        alt="category"
                        width={64}
                        height={64}
                        className="size-16 object-cover"
                        unoptimized
                      />
                    ) : (
                      <IconUpload className="size-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFile}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {t("upload_image")}
                    </Button>
                    {imagePreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={handleRemoveImage}
                      >
                        <IconX className="size-3.5 me-1" />
                        {t("remove_image")}
                      </Button>
                    )}
                  </div>
                </div>
                <FieldDescription>{t("image_hint")}</FieldDescription>
              </Field>

              <Controller
                name="name_en"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cat-name-en">{t("name_en")}<RequiredMark /></FieldLabel>
                    <Input {...field} id="cat-name-en" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="name_ar"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cat-name-ar">{t("name_ar")}</FieldLabel>
                    <Input {...field} id="cat-name-ar" dir="rtl" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cat-slug">{t("slug")}<RequiredMark /></FieldLabel>
                    <Input {...field} id="cat-slug" aria-invalid={fieldState.invalid} className="font-mono text-sm" />
                    <FieldDescription>{t("slug_hint")}</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="parentId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cat-parent">{t("parent")}</FieldLabel>
                    <Select
                      value={field.value ?? "none"}
                      onValueChange={(v) => field.onChange(v === "none" ? undefined : v)}
                      name={field.name}
                    >
                      <SelectTrigger id="cat-parent" aria-invalid={fieldState.invalid}>
                        <SelectValue placeholder={`— ${t("parent")} —`} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">—</SelectItem>
                        {flatCats.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="sortOrder"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="cat-sort">{t("sort_order")}</FieldLabel>
                    <Input
                      id="cat-sort"
                      type="number"
                      min={0}
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      value={field.value ?? 0}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : e.target.valueAsNumber,
                        )
                      }
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {isEdit && (
                <Controller
                  name="isActive"
                  control={form.control}
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldLabel htmlFor="cat-active">{tCommon("active")}</FieldLabel>
                        <FieldDescription>{t("active_description")}</FieldDescription>
                      </FieldContent>
                      <Switch
                        id="cat-active"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </Field>
                  )}
                />
              )}
            </FieldGroup>
          </form>
        </AppSheetBody>

        <AppSheetFooter>
          <Button variant="outline" onClick={handleClose}>{tCommon("cancel")}</Button>
          <Button type="submit" form="category-form" disabled={isPending}>
            {tCommon("save")}
          </Button>
        </AppSheetFooter>
      </AppSheetContent>
    </AppSheet>
  );
}
