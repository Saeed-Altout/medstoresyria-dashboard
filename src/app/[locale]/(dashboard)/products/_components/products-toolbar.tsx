"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { IconFilter, IconX } from "@tabler/icons-react";
import type { Category, Brand } from "@/types";

interface ProductsToolbarProps {
  categories: Category[];
  brands: Brand[];
  onCategoryChange: (id: string | undefined) => void;
  onBrandChange: (id: string | undefined) => void;
  onConditionChange: (condition: "new" | "used" | undefined) => void;
  onReset: () => void;
}

export function ProductsToolbar({
  categories,
  brands,
  onCategoryChange,
  onBrandChange,
  onConditionChange,
  onReset,
}: ProductsToolbarProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");

  const [category, setCategory] = useState("all");
  const [brand, setBrand] = useState("all");
  const [condition, setCondition] = useState("all");

  const hasFilter = category !== "all" || brand !== "all" || condition !== "all";

  function handleReset() {
    setCategory("all");
    setBrand("all");
    setCondition("all");
    onReset();
  }

  const filterControls = (
    <>
      <Select
        value={category}
        onValueChange={(v) => {
          setCategory(v);
          onCategoryChange(v === "all" ? undefined : v);
        }}
      >
        <SelectTrigger size="sm" className="w-40">
          <SelectValue placeholder={t("category")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("category")}</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={brand}
        onValueChange={(v) => {
          setBrand(v);
          onBrandChange(v === "all" ? undefined : v);
        }}
      >
        <SelectTrigger size="sm" className="w-36">
          <SelectValue placeholder={t("brand")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("brand")}</SelectItem>
          {brands.map((b) => (
            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={condition}
        onValueChange={(v) => {
          setCondition(v);
          onConditionChange(v === "all" ? undefined : (v as "new" | "used"));
        }}
      >
        <SelectTrigger size="sm" className="w-32">
          <SelectValue placeholder={t("condition")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{t("condition")}</SelectItem>
          <SelectItem value="new">{t("condition_new")}</SelectItem>
          <SelectItem value="used">{t("condition_used")}</SelectItem>
        </SelectContent>
      </Select>
    </>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex items-center gap-2">
        {filterControls}
        {hasFilter && (
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 px-2 text-muted-foreground">
            <IconX className="size-3.5 me-1" />
            {tCommon("reset_filters")}
          </Button>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative h-8">
              <IconFilter className="size-3.5 me-1.5" />
              {tCommon("filters")}
              {hasFilter && (
                <span className="absolute -top-1 -inset-e-1 size-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-56 flex flex-col gap-3 p-3">
            {filterControls}
            {hasFilter && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 w-full text-muted-foreground">
                <IconX className="size-3.5 me-1" />
                {tCommon("reset_filters")}
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>
    </>
  );
}
