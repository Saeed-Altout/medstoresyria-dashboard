"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
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
  IconChevronLeft,
  IconChevronRight,
  type Icon as TablerIcon,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import type { PermissionSection } from "@/lib/utils/roles";
import { logout as logoutApi } from "@/lib/api/auth.api";
import { useDirection } from "@/lib/hooks/useDirection";
import { getFullName } from "@/lib/utils/format";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: TablerIcon;
  section: PermissionSection;
}

const NAV_ITEMS: NavItem[] = [
  { label: "overview",    href: "/overview",    icon: IconLayoutDashboard, section: "overview"    },
  { label: "orders",      href: "/orders",      icon: IconShoppingCart,    section: "orders"      },
  { label: "products",    href: "/products",    icon: IconPackage,         section: "products"    },
  { label: "inventory",   href: "/inventory",   icon: IconBox,             section: "inventory"   },
  { label: "maintenance", href: "/maintenance", icon: IconTool,            section: "maintenance" },
  { label: "invoices",    href: "/invoices",    icon: IconFileInvoice,     section: "invoices"    },
  { label: "reports",     href: "/reports",     icon: IconChartBar,        section: "reports"     },
  { label: "users",       href: "/users",       icon: IconUsers,           section: "users"       },
  { label: "settings",    href: "/settings",    icon: IconSettings,        section: "settings"    },
];

export function Sidebar() {
  const t = useTranslations("nav");
  const { isRTL } = useDirection();
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout: logoutStore } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);

  const visibleItems = NAV_ITEMS.filter((item) =>
    canAccess(user?.role as UserRole | undefined, item.section),
  );

  const handleLogout = async () => {
    try {
      await logoutApi();
    } finally {
      logoutStore();
      router.push("/login");
    }
  };

  const CollapseIcon: TablerIcon = isRTL
    ? collapsed ? IconChevronLeft : IconChevronRight
    : collapsed ? IconChevronRight : IconChevronLeft;

  const initials = user
    ? `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <aside
      className={cn(
        "flex flex-col shrink-0 border-e bg-sidebar transition-all duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      {/* Brand + toggle */}
      <div className="flex items-center justify-between px-4 h-14 border-b shrink-0">
        {!collapsed && (
          <span className="font-bold text-base text-sidebar-primary truncate">
            MedStore
          </span>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="ms-auto p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground"
          aria-label="toggle sidebar"
        >
          <CollapseIcon className="size-4" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {visibleItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <button
              key={item.section}
              onClick={() => router.push(item.href)}
              title={collapsed ? t(item.label as Parameters<typeof t>[0]) : undefined}
              className={cn(
                "w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm transition-colors",
                collapsed && "justify-center",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <ItemIcon className="size-4 shrink-0" />
              {!collapsed && (
                <span className="truncate">
                  {t(item.label as Parameters<typeof t>[0])}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User section + logout */}
      <div className="border-t p-3 space-y-2 shrink-0">
        {!collapsed && user && (
          <div className="flex items-center gap-2 px-1">
            <div className="size-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-semibold shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{getFullName(user)}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? t("logout") : undefined}
          className={cn(
            "w-full flex items-center gap-3 px-2 py-2 rounded-md text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
            collapsed && "justify-center",
          )}
        >
          <IconLogout className="size-4 shrink-0" />
          {!collapsed && <span>{t("logout")}</span>}
        </button>
      </div>
    </aside>
  );
}
