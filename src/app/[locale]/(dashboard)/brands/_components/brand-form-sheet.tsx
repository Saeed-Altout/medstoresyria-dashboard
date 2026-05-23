"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "@/components/app-sheet";
import { IconUpload, IconX } from "@tabler/icons-react";
import {
  createBrand,
  updateBrand,
  upsertBrandTranslations,
} from "@/lib/api/brands.api";
import type { ApiResponse, Brand } from "@/types";

function toSlug(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const schema = z.object({
  name_en: z.string().min(1, "Required"),
  name_ar: z.string().optional(),
  description_en: z.string().optional(),
  description_ar: z.string().optional(),
  slug: z.string().min(1, "Required"),
  website: z.union([z.string().url("Must be a valid URL"), z.literal("")]).optional(),
  logoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface BrandFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brand?: Brand | null;
}

function RequiredMark() {
  return <span className="text-destructive ms-0.5">*</span>;
}

export function BrandFormSheet({ open, onOpenChange, brand }: BrandFormSheetProps) {
  const t = useTranslations("brands");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const isEdit = !!brand;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name_en: "", name_ar: "", description_en: "", description_ar: "", slug: "", website: "", logoUrl: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (!brand) {
      form.reset({ name_en: "", name_ar: "", description_en: "", description_ar: "", slug: "", website: "", logoUrl: "" });
      setLogoPreview(null);
      setLogoFile(null);
      return;
    }
    const enT = brand.translations?.find((t) => t.locale === "en");
    const arT = brand.translations?.find((t) => t.locale === "ar");
    form.reset({
      name_en: enT?.name ?? "",
      name_ar: arT?.name ?? "",
      description_en: enT?.description ?? "",
      description_ar: arT?.description ?? "",
      slug: brand.slug ?? "",
      website: brand.website ?? "",
      logoUrl: brand.logoUrl ?? "",
    });
    setLogoPreview(brand.logoUrl ?? null);
    setLogoFile(null);
  }, [open, brand, form]);

  const nameEnValue = form.watch("name_en");
  useEffect(() => {
    if (!isEdit) {
      form.setValue("slug", toSlug(nameEnValue ?? ""), { shouldValidate: false });
    }
  }, [nameEnValue, isEdit, form]);

  function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    form.setValue("logoUrl", "");
  }

  function handleRemoveLogo() {
    setLogoFile(null);
    setLogoPreview(null);
    form.setValue("logoUrl", "");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const isPending = form.formState.isSubmitting;

  function handleClose() {
    form.reset();
    setLogoPreview(null);
    setLogoFile(null);
    onOpenChange(false);
  }

  async function uploadLogoIfNeeded(): Promise<string | undefined> {
    if (!logoFile) return form.getValues("logoUrl") || undefined;
    const formData = new FormData();
    formData.append("file", logoFile);
    const { default: apiClient } = await import("@/lib/api/client");
    const { data } = await apiClient.post<{ data: { url: string } }>("/storage/upload", formData);
    return data.data.url;
  }

  async function onSubmit(values: FormValues) {
    try {
      let resolvedLogoUrl: string | undefined;
      try {
        resolvedLogoUrl = await uploadLogoIfNeeded();
      } catch {
        resolvedLogoUrl = values.logoUrl || undefined;
      }

      const translations = [
        { locale: "en", name: values.name_en, description: values.description_en || undefined },
        ...(values.name_ar ? [{ locale: "ar", name: values.name_ar, description: values.description_ar || undefined }] : []),
      ];

      if (isEdit) {
        await updateBrand(brand!.id, {
          slug: values.slug,
          ...(resolvedLogoUrl !== undefined && { logoUrl: resolvedLogoUrl }),
          ...(values.website && { website: values.website }),
        });
        await upsertBrandTranslations(brand!.id, translations);
        toast.success(t("updated"));
      } else {
        await createBrand({
          slug: values.slug,
          ...(resolvedLogoUrl !== undefined && { logoUrl: resolvedLogoUrl }),
          ...(values.website && { website: values.website }),
          translations,
        });
        toast.success(t("created"));
      }

      queryClient.invalidateQueries({ queryKey: ["brands"] });
      handleClose();
    } catch (err) {
      toast.error((err as AxiosError<ApiResponse<null>>)?.response?.data?.message ?? "Error");
    }
  }

  return (
    <AppSheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <AppSheetContent size="md">
        <AppSheetHeader>
          <AppSheetTitle>{isEdit ? t("edit") : t("add")}</AppSheetTitle>
        </AppSheetHeader>

        <AppSheetBody>
          <form id="brand-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>

              {/* Logo upload */}
              <Field>
                <FieldLabel>{t("logo")}</FieldLabel>
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-lg border bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <Image src={logoPreview} alt="logo" width={64} height={64} className="object-contain size-16" />
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
                      onChange={handleLogoFile}
                    />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                      {t("upload_logo")}
                    </Button>
                    {logoPreview && (
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={handleRemoveLogo}>
                        <IconX className="size-3.5 me-1" />
                        {t("remove_logo")}
                      </Button>
                    )}
                  </div>
                </div>
              </Field>

              {/* English name */}
              <Controller
                name="name_en"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="brand-name-en">
                      {t("name_en")}<RequiredMark />
                    </FieldLabel>
                    <Input {...field} id="brand-name-en" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Arabic name */}
              <Controller
                name="name_ar"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="brand-name-ar">{t("name_ar")}</FieldLabel>
                    <Input {...field} id="brand-name-ar" dir="rtl" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Description EN */}
              <Controller
                name="description_en"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="brand-desc-en">{t("description_en")}</FieldLabel>
                    <Textarea {...field} id="brand-desc-en" rows={3} aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Description AR */}
              <Controller
                name="description_ar"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="brand-desc-ar">{t("description_ar")}</FieldLabel>
                    <Textarea {...field} id="brand-desc-ar" rows={3} dir="rtl" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Slug */}
              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="brand-slug">
                      {t("slug")}<RequiredMark />
                    </FieldLabel>
                    <Input {...field} id="brand-slug" aria-invalid={fieldState.invalid} className="font-mono text-sm" />
                    <FieldDescription>{t("slug_hint")}</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {/* Website */}
              <Controller
                name="website"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="brand-website">{t("website")}</FieldLabel>
                    <Input {...field} id="brand-website" type="url" placeholder="https://" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

            </FieldGroup>
          </form>
        </AppSheetBody>

        <AppSheetFooter>
          <Button variant="outline" onClick={handleClose}>{tCommon("cancel")}</Button>
          <Button type="submit" form="brand-form" disabled={isPending}>
            {tCommon("save")}
          </Button>
        </AppSheetFooter>
      </AppSheetContent>
    </AppSheet>
  );
}
