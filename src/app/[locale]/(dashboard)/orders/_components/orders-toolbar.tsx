"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { IconFilter, IconX } from "@tabler/icons-react";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderStatus } from "@/types";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "shipped",
  "delivered",
  "cancelled",
  "rejected",
];

interface OrdersToolbarProps {
  onStatusChange: (status: OrderStatus | undefined) => void;
  onDateChange: (range: { from: string; to: string }) => void;
  onReset: () => void;
}

export function OrdersToolbar({
  onStatusChange,
  onDateChange,
  onReset,
}: OrdersToolbarProps) {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const tReports = useTranslations("reports");

  const [status, setStatus] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  function handleStatusChange(value: string) {
    setStatus(value);
    onStatusChange(value === "all" ? undefined : (value as OrderStatus));
  }

  function handleDateChange(next: { from: string; to: string }) {
    setDateRange(next);
    onDateChange(next);
  }

  function handleReset() {
    setStatus("all");
    setDateRange({ from: "", to: "" });
    onReset();
  }

  const hasActiveFilter =
    status !== "all" || dateRange.from !== "" || dateRange.to !== "";

  const statusSelect = (
    <Select value={status} onValueChange={handleStatusChange}>
      <SelectTrigger size="sm" className="w-full text-sm">
        <SelectValue placeholder={t("all_statuses")} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{t("all_statuses")}</SelectItem>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {t(`status_${s}` as Parameters<typeof t>[0])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const dateInputs = (
    <>
      <div className="flex items-center gap-1.5">
        <Label className="text-sm text-muted-foreground shrink-0">
          {tReports("from")}
        </Label>
        <Input
          type="date"
          value={dateRange.from}
          max={dateRange.to || undefined}
          onChange={(e) =>
            handleDateChange({ ...dateRange, from: e.target.value })
          }
          className="h-8 w-36 text-sm"
        />
      </div>
      <div className="flex items-center gap-1.5">
        <Label className="text-sm text-muted-foreground shrink-0">
          {tReports("to")}
        </Label>
        <Input
          type="date"
          value={dateRange.to}
          min={dateRange.from || undefined}
          onChange={(e) =>
            handleDateChange({ ...dateRange, to: e.target.value })
          }
          className="h-8 w-36 text-sm"
        />
      </div>
    </>
  );

  return (
    <>
      {/* ── Mobile: single popover trigger ── */}
      <div className="md:hidden">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 relative"
            >
              <IconFilter className="size-3.5" />
              {t("filters")}
              {hasActiveFilter && (
                <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <p className="font-medium text-sm mb-3">{t("filters")}</p>
            <div className="flex flex-col gap-3">
              {statusSelect}
              <div className="flex flex-col gap-2">{dateInputs}</div>
              {hasActiveFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={handleReset}
                >
                  <IconX className="size-3.5 me-1.5" />
                  {tCommon("reset")}
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Desktop: inline row ── */}
      <div className="hidden md:flex items-center gap-2">
        <div className="w-40">{statusSelect}</div>
        {dateInputs}
        {hasActiveFilter && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-muted-foreground"
            onClick={handleReset}
          >
            <IconX className="size-3.5 me-1.5" />
            {tCommon("reset")}
          </Button>
        )}
      </div>
    </>
  );
}
