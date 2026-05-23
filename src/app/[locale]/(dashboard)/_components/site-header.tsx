"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const SEGMENT_KEY_MAP: Record<string, string> = {
  overview: "overview",
  orders: "orders",
  products: "products",
  inventory: "inventory",
  maintenance: "maintenance",
  invoices: "invoices",
  reports: "reports",
  users: "users",
  settings: "settings",
};

export function SiteHeader() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();

  const segment = pathname.split("/").filter(Boolean)[0] ?? "overview";
  const titleKey = SEGMENT_KEY_MAP[segment] ?? "overview";
  const pageTitle = t(titleKey as Parameters<typeof t>[0]);

  const handleLocaleSwitch = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full items-center gap-2 px-4">
        <SidebarTrigger className="-ms-1" />
        <Separator
          orientation="vertical"
          className="mx-1 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-sm font-semibold">{pageTitle}</h1>

        <div className="ms-auto">
          <Button variant="ghost" size="sm" onClick={handleLocaleSwitch}>
            {locale === "ar" ? "EN" : "العربية"}
          </Button>
        </div>
      </div>
    </header>
  );
}
