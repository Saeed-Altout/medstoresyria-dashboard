"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import { SectionCards } from "./_components/section-cards";
import { ChartAreaInteractive } from "./_components/chart-area-interactive";
import type { UserRole } from "@/types";

export default function OverviewPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user && !canAccess(user.role as UserRole, "overview")) {
      router.replace("/login");
    }
  }, [user, router]);

  return (
    <section className="space-y-5">
      <SectionCards />
      <ChartAreaInteractive />
    </section>
  );
}
