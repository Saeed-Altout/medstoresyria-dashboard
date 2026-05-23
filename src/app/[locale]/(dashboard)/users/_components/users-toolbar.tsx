"use client";

import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserRole } from "@/types";

interface UsersToolbarProps {
  role: UserRole | "all";
  onRoleChange: (role: UserRole | undefined) => void;
}

export function UsersToolbar({ role, onRoleChange }: UsersToolbarProps) {
  const t = useTranslations("users");
  const tCommon = useTranslations("common");

  return (
    <Select
      value={role}
      onValueChange={(v) => onRoleChange(v === "all" ? undefined : (v as UserRole))}
    >
      <SelectTrigger size="sm" className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{tCommon("all")}</SelectItem>
        <SelectItem value="admin">{t("role_admin")}</SelectItem>
        <SelectItem value="sales">{t("role_sales")}</SelectItem>
        <SelectItem value="warehouse">{t("role_warehouse")}</SelectItem>
        <SelectItem value="accountant">{t("role_accountant")}</SelectItem>
        <SelectItem value="technician">{t("role_technician")}</SelectItem>
        <SelectItem value="delivery">{t("role_delivery")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
