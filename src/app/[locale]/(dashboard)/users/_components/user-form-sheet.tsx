"use client";

import { useEffect } from "react";
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
} from "@/components/app-sheet";
import { useCreateUser, useUpdateUser } from "@/lib/hooks/users";
import type { User } from "@/types";

function RequiredMark() {
  return <span className="text-destructive ms-0.5">*</span>;
}

const createSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  role: z.string().min(1, "Required"),
  phone: z.string().optional(),
});

const editSchema = z.object({
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  email: z.string().email("Invalid email"),
  password: z.string().optional(),
  role: z.string().min(1, "Required"),
  phone: z.string().optional(),
});

type FormValues = {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  role: string;
  phone?: string;
};

interface UserFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: User | null;
}

export function UserFormSheet({ open, onOpenChange, user }: UserFormSheetProps) {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const isEdit = !!user;
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", role: "sales", phone: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (!user) {
      form.reset({ firstName: "", lastName: "", email: "", password: "", role: "sales", phone: "" });
      return;
    }
    form.reset({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone ?? "",
    });
  }, [open, user, form]);

  function handleClose() {
    form.reset();
    onOpenChange(false);
  }

  async function onSubmit(values: FormValues) {
    if (isEdit) {
      updateMutation.mutate(
        {
          id: user!.id,
          dto: {
            firstName: values.firstName,
            lastName: values.lastName,
            phone: values.phone || undefined,
            role: values.role,
          },
        },
        { onSuccess: () => handleClose() },
      );
    } else {
      createMutation.mutate(
        {
          email: values.email,
          password: values.password!,
          firstName: values.firstName,
          lastName: values.lastName,
          role: values.role,
          phone: values.phone || undefined,
        },
        { onSuccess: () => handleClose() },
      );
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <AppSheet open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <AppSheetContent size="md">
        <AppSheetHeader>
          <AppSheetTitle>{isEdit ? tCommon("edit") : t("add_user")}</AppSheetTitle>
        </AppSheetHeader>

        <AppSheetBody>
          <form id="user-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Controller
                name="firstName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-first">{t("first_name")}<RequiredMark /></FieldLabel>
                    <Input {...field} id="user-first" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="lastName"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-last">{t("last_name")}<RequiredMark /></FieldLabel>
                    <Input {...field} id="user-last" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-email">{tCommon("email")}<RequiredMark /></FieldLabel>
                    <Input {...field} id="user-email" type="email" aria-invalid={fieldState.invalid} disabled={isEdit} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              {!isEdit && (
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="user-pass">{t("password")}<RequiredMark /></FieldLabel>
                      <Input {...field} id="user-pass" type="password" aria-invalid={fieldState.invalid} />
                      <FieldDescription>{t("password_hint")}</FieldDescription>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              )}

              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-role">{t("role")}<RequiredMark /></FieldLabel>
                    <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                      <SelectTrigger id="user-role" aria-invalid={fieldState.invalid}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">{t("role_admin")}</SelectItem>
                        <SelectItem value="sales">{t("role_sales")}</SelectItem>
                        <SelectItem value="warehouse">{t("role_warehouse")}</SelectItem>
                        <SelectItem value="accountant">{t("role_accountant")}</SelectItem>
                        <SelectItem value="technician">{t("role_technician")}</SelectItem>
                        <SelectItem value="delivery">{t("role_delivery")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="user-phone">{tCommon("phone")}</FieldLabel>
                    <Input {...field} id="user-phone" type="tel" aria-invalid={fieldState.invalid} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </FieldGroup>
          </form>
        </AppSheetBody>

        <AppSheetFooter>
          <Button variant="outline" onClick={handleClose}>{tCommon("cancel")}</Button>
          <Button type="submit" form="user-form" disabled={isPending}>
            {tCommon("save")}
          </Button>
        </AppSheetFooter>
      </AppSheetContent>
    </AppSheet>
  );
}
