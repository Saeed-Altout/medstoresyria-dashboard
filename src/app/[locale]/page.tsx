"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/stores/auth.store";

export default function LocaleRootPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      router.replace("/overview");
    } else {
      router.replace("/login");
    }
  }, [user, router]);

  return null;
}
