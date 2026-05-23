"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StatusFilter = "active" | "inactive" | "all";

interface CategoriesToolbarProps {
  status: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
}

export function CategoriesToolbar({ status, onStatusChange }: CategoriesToolbarProps) {
  const tCommon = useTranslations("common");

  return (
    <Select value={status} onValueChange={(v) => onStatusChange(v as StatusFilter)}>
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="active">{tCommon("active")}</SelectItem>
        <SelectItem value="inactive">{tCommon("inactive")}</SelectItem>
        <SelectItem value="all">{tCommon("all")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
