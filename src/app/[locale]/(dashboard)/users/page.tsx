"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, toggleUserActive } from "@/lib/api/users.api";
import { getFullName } from "@/lib/utils/format";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { UserRole, ApiResponse } from "@/types";
import { AxiosError } from "axios";

export default function UsersPage() {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "users")) {
      router.replace("/overview");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => getUsers({ page: 1, limit: 50 }),
  });

  const { mutate: toggle } = useMutation<unknown, AxiosError<ApiResponse<null>>, string>({
    mutationFn: toggleUserActive,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); },
    onError: (err) => { toast.error(err.response?.data?.message ?? "Error"); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      {isLoading && <p className="text-muted-foreground">{tCommon("loading")}</p>}
      {data && (
        <div className="rounded-lg border divide-y">
          {data.data.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-medium">{getFullName(u)}</p>
                <p className="text-sm text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground capitalize">{u.role}</span>
                <Button size="sm" variant={u.is_active ? "outline" : "default"} onClick={() => toggle(u.id)}>
                  {u.is_active ? t("deactivate") : t("activate")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
