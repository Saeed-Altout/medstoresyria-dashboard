"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettings, updateSettings } from "@/lib/api/settings.api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { UserRole, ApiResponse } from "@/types";

const settingsSchema = z.object({
  site_name_en: z.string(),
  site_name_ar: z.string(),
  contact_phone: z.string(),
  contact_email: z.string(),
  whatsapp: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const SETTING_KEYS = [
  "site_name_en",
  "site_name_ar",
  "contact_phone",
  "contact_email",
  "whatsapp",
] as const;

export default function SettingsPage() {
  const t = useTranslations("settings");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "settings")) {
      router.replace("/overview");
    }
  }, [user, router]);

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  const { register, handleSubmit, reset } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: { site_name_en: "", site_name_ar: "", contact_phone: "", contact_email: "", whatsapp: "" },
  });

  useEffect(() => {
    if (settings) {
      const vals: Partial<SettingsFormValues> = {};
      settings.forEach((s) => {
        if (SETTING_KEYS.includes(s.key as (typeof SETTING_KEYS)[number])) {
          vals[s.key as keyof SettingsFormValues] = s.value;
        }
      });
      reset(vals as SettingsFormValues);
    }
  }, [settings, reset]);

  const { mutate: save, isPending } = useMutation<unknown, AxiosError<ApiResponse<null>>, SettingsFormValues>({
    mutationFn: (values) =>
      updateSettings(Object.entries(values).map(([key, value]) => ({ key, value }))),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["settings"] }); toast.success("Saved"); },
    onError: (err) => { toast.error(err.response?.data?.message ?? "Error"); },
  });

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <form onSubmit={handleSubmit((v) => save(v))} className="space-y-4">
        {SETTING_KEYS.map((key) => (
          <div key={key} className="space-y-1">
            <Label htmlFor={key}>{t(key)}</Label>
            <Input id={key} {...register(key)} />
          </div>
        ))}
        <Button type="submit" disabled={isPending}>{t("save_settings")}</Button>
      </form>
    </div>
  );
}
