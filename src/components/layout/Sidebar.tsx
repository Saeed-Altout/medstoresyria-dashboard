"use client";

import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import {
  IconLayoutDashboard,
  IconShoppingCart,
  IconPackage,
  IconBox,
  IconTool,
  IconFileInvoice,
  IconChartBar,
  IconUsers,
  IconSettings,
  IconLogout,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess, type PermissionSection } from "@/lib/utils/roles";
import { logout } from "@/lib/api/auth.api";
import type { UserRole } from "@/types";

interface NavItem {
  key: PermissionSection;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { key: "overview", href: "/overview", icon: IconLayoutDashboard },
  { key: "orders", href: "/orders", icon: IconShoppingCart },
  { key: "products", href: "/products", icon: IconPackage },
  { key: "inventory", href: "/inventory", icon: IconBox },
  { key: "maintenance", href: "/maintenance", icon: IconTool },
  { key: "invoices", href: "/invoices", icon: IconFileInvoice },
  { key: "reports", href: "/reports", icon: IconChartBar },
  { key: "users", href: "/users", icon: IconUsers },
  { key: "settings", href: "/settings", icon: IconSettings },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutStore } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      logoutStore();
      router.push("/login");
    }
  };

  const visibleItems = NAV_ITEMS.filter((item) =>
    canAccess(user?.role as UserRole | undefined, item.key),
  );

  return (
    <aside className="w-64 shrink-0 border-e bg-sidebar flex flex-col">
      <div className="p-6 border-b">
        <h1 className="font-bold text-lg text-sidebar-primary">MedStore</h1>
        <p className="text-xs text-muted-foreground">Syria</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.key}
              onClick={() => router.push(item.href)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {t(item.key)}
            </button>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <IconLogout className="size-4 shrink-0" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
