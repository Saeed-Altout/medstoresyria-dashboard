"use client";

import { useLocale } from "next-intl";

export function useDirection() {
  const locale = useLocale();
  const isRTL = locale === "ar";
  return {
    locale,
    isRTL,
    dir: isRTL ? ("rtl" as const) : ("ltr" as const),
    iconClass: isRTL ? "rotate-180" : "",
    sheetSide: isRTL ? ("left" as const) : ("right" as const),
    toastPosition: isRTL
      ? ("bottom-left" as const)
      : ("bottom-right" as const),
  };
}
