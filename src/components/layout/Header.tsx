"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { logout as logoutApi } from "@/lib/api/auth.api";
import { getFullName } from "@/lib/utils/format";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  IconChevronDown,
  IconLogout,
} from "@tabler/icons-react";

const PATH_TITLE_MAP: Record<string, string> = {
  overview:    "nav.overview",
  orders:      "nav.orders",
  products:    "nav.products",
  inventory:   "nav.inventory",
  maintenance: "nav.maintenance",
  invoices:    "nav.invoices",
  reports:     "nav.reports",
  users:       "nav.users",
  settings:    "nav.settings",
};

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutStore } = useAuthStore();

  const segment = pathname.split("/").filter(Boolean)[0] ?? "overview";
  const titleKey = PATH_TITLE_MAP[segment] ?? "nav.overview";
  const pageTitle = t(titleKey as Parameters<typeof t>[0]);

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      logoutStore();
      router.push("/login");
    }
  };

  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <header className="h-14 border-b px-6 flex items-center justify-between bg-background shrink-0">
      <h2 className="font-semibold text-base">{pageTitle}</h2>

      <div className="flex items-center gap-2">
        <LocaleSwitcher />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <div className="size-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
                  {initials}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {getFullName(user)}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline capitalize">
                  {user.role}
                </span>
                <IconChevronDown className="size-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>
                <p className="font-medium">{getFullName(user)}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive gap-2"
              >
                <IconLogout className="size-4" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
