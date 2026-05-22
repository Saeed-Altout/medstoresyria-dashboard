"use client";

import { useTranslations } from "next-intl";
import { useAuthStore } from "@/stores/auth.store";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { getFullName } from "@/lib/utils/format";

export function Header() {
  const t = useTranslations("auth");
  const user = useAuthStore((s) => s.user);

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between bg-background shrink-0">
      <div />
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-muted-foreground">
            {t("logged_in_as")}{" "}
            <span className="font-medium text-foreground">
              {getFullName(user)}
            </span>
          </span>
        )}
        <LocaleSwitcher />
      </div>
    </header>
  );
}
