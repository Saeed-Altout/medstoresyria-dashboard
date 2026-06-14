"use client"

import { useTranslations } from "next-intl"
import { usePathname, useRouter } from "@/i18n/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
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
  IconCategory2,
  IconBuildingStore,
  IconMapPin,
  IconStar,
  type Icon as TablerIcon,
} from "@tabler/icons-react"
import { canAccess } from "@/lib/utils/roles"
import type { PermissionSection } from "@/lib/utils/roles"
import type { UserRole } from "@/types"

interface NavItem {
  labelKey: string
  href: string
  icon: TablerIcon
  section: PermissionSection
}

const NAV_ITEMS: NavItem[] = [
  { labelKey: "overview",    href: "/overview",    icon: IconLayoutDashboard, section: "overview"    },
  { labelKey: "orders",      href: "/orders",      icon: IconShoppingCart,    section: "orders"      },
  { labelKey: "products",    href: "/products",    icon: IconPackage,         section: "products"    },
  { labelKey: "reviews",     href: "/reviews",     icon: IconStar,            section: "products"    },
  { labelKey: "inventory",   href: "/inventory",   icon: IconBox,             section: "inventory"   },
  { labelKey: "maintenance", href: "/maintenance", icon: IconTool,            section: "maintenance" },
  { labelKey: "invoices",    href: "/invoices",    icon: IconFileInvoice,     section: "invoices"    },
  { labelKey: "reports",     href: "/reports",     icon: IconChartBar,        section: "reports"     },
  { labelKey: "users",       href: "/users",       icon: IconUsers,           section: "users"       },
  { labelKey: "settings",    href: "/settings",    icon: IconSettings,        section: "settings"    },
  { labelKey: "categories",    href: "/categories",    icon: IconCategory2,     section: "settings"    },
  { labelKey: "brands",        href: "/brands",        icon: IconBuildingStore, section: "settings"    },
  { labelKey: "governorates",  href: "/governorates",  icon: IconMapPin,        section: "settings"    },
]

export function NavMain({ role }: { role: UserRole | undefined }) {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const router = useRouter()

  const visibleItems = NAV_ITEMS.filter((item) =>
    canAccess(role, item.section),
  )

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {visibleItems.map((item) => {
            const ItemIcon = item.icon
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  tooltip={t(item.labelKey as Parameters<typeof t>[0])}
                  isActive={isActive}
                  onClick={() => router.push(item.href)}
                  className="cursor-pointer"
                >
                  <ItemIcon />
                  <span>{t(item.labelKey as Parameters<typeof t>[0])}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
