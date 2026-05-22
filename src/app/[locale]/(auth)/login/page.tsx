"use client";

import { useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { login } from "@/lib/api/auth.api";
import type { LoginDto, LoginResponse } from "@/lib/api/auth.api";
import type { ApiResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (user) {
      router.push("/overview");
    }
  }, [user, router]);

  const schema = z.object({
    email: z.string().email(t("auth.invalid_email")),
    password: z.string().min(1, t("auth.password_required")),
  });

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation<LoginResponse, AxiosError<ApiResponse<null>>, LoginDto>({
    mutationFn: login,
    onSuccess: ({ user: u, accessToken }) => {
      setAuth(u, accessToken);
      router.push("/overview");
    },
    onError: (error) => {
      const msg = error.response?.data?.message;
      toast.error(msg ?? "Login failed");
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("auth.title")}</CardTitle>
          <CardDescription>{t("auth.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-destructive text-sm">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? t("auth.logging_in") : t("auth.login_btn")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
