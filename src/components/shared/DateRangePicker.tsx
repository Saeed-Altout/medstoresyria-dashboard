"use client";

import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRange {
  from: string;
  to: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const t = useTranslations("reports");

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="flex items-center gap-2">
        <Label htmlFor="date-from" className="text-sm shrink-0">
          {t("from")}
        </Label>
        <Input
          id="date-from"
          type="date"
          value={value.from}
          max={value.to}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className="w-38"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="date-to" className="text-sm shrink-0">
          {t("to")}
        </Label>
        <Input
          id="date-to"
          type="date"
          value={value.to}
          min={value.from}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className="w-38"
        />
      </div>
    </div>
  );
}
