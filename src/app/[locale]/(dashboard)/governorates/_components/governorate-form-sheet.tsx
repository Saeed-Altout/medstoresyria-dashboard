"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldContent,
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
import { useCreateGovernorate, useUpdateGovernorate } from "@/lib/hooks/governorates";
import type { Governorate } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Required"),
  name_local: z.string().optional(),
  delivery_fee_usd: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "e.g. 5.00"),
  is_active: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  governorate?: Governorate | null;
}

function RequiredMark() {
  return <span className="text-destructive ms-0.5">*</span>;
}

export function GovernorateFormSheet({ open, onOpenChange, governorate }: Props) {
  const t = useTranslations("governorates");
  const tCommon = useTranslations("common");
  const isEdit = !!governorate;
  const createMutation = useCreateGovernorate();
  const updateMutation = useUpdateGovernorate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", name_local: "", delivery_fee_usd: "", is_active: true },
  });

  useEffect(() => {
    if (!open) return;
    if (!governorate) {
      form.reset({ name: "", name_local: "", delivery_fee_usd: "", is_active: true });
      return;
    }
    form.reset({
      name: governorate.name,
      name_local: governorate.name_local ?? "",
      delivery_fee_usd: governorate.delivery_fee_usd,
      is_active: governorate.is_active,
    });
  }, [open, governorate]);

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  async function onSubmit(values: FormValues) {
    const base = {
      name: values.name,
      name_local: values.name_local || undefined,
      delivery_fee_usd: values.delivery_fee_usd,
    };

    if (isEdit) {
      updateMutation.mutate(
        { id: governorate!.id, dto: { ...base, is_active: values.is_active } },
        {
          onSuccess: () => { toast.success(t("updated")); handleClose(); },
        },
      );
    } else {
      createMutation.mutate(base, {
        onSuccess: () => { toast.success(t("created")); handleClose(); },
      });
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AppSheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <AppSheetContent size="sm">
        <AppSheetHeader>
          <AppSheetTitle>{isEdit ? t("edit") : t("add")}</AppSheetTitle>
        </AppSheetHeader>

        <AppSheetBody>
          <form id="governorate-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>

              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gov-name">
                      {t("name_en")} <RequiredMark />
                    </FieldLabel>
                    <Input
                      {...field}
                      id="gov-name"
                      placeholder="e.g. Damascus"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="name_local"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gov-name-ar">{t("name_ar")}</FieldLabel>
                    <Input
                      {...field}
                      id="gov-name-ar"
                      dir="rtl"
                      placeholder="مثال: دمشق"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="delivery_fee_usd"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="gov-fee">
                      {t("delivery_fee")} <RequiredMark />
                    </FieldLabel>
                    <Input
                      {...field}
                      id="gov-fee"
                      placeholder="0.00"
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldDescription>{t("delivery_fee_hint")}</FieldDescription>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="is_active"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldLabel htmlFor="gov-active">{t("active")}</FieldLabel>
                      <FieldDescription>{t("active_description")}</FieldDescription>
                    </FieldContent>
                    <Switch
                      id="gov-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />

            </FieldGroup>
          </form>
        </AppSheetBody>

        <AppSheetFooter>
          <Button variant="outline" onClick={handleClose}>
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form="governorate-form" disabled={isPending}>
            {tCommon("save")}
          </Button>
        </AppSheetFooter>
      </AppSheetContent>
    </AppSheet>
  );
}
