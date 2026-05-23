"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field";
import { useAdjustStock } from "@/lib/hooks/inventory";
import type { InventorySnapshot } from "@/types";

const schema = z.object({
  quantity: z.number().int().min(1, "Must be at least 1"),
  type: z.enum(["in", "adjustment"]),
  reason: z.enum(["restock", "damage", "return", "initial"]),
});

type FormValues = z.infer<typeof schema>;

interface AdjustStockDialogProps {
  item: InventorySnapshot | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdjustStockDialog({ item, open, onOpenChange }: AdjustStockDialogProps) {
  const t = useTranslations("inventory");
  const tCommon = useTranslations("common");
  const adjustMutation = useAdjustStock();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { quantity: 1, type: "in", reason: "restock" },
  });

  useEffect(() => {
    if (open) form.reset({ quantity: 1, type: "in", reason: "restock" });
  }, [open, form]);

  function onSubmit(values: FormValues) {
    if (!item) return;
    adjustMutation.mutate(
      { productId: item.id, dto: values },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("adjust_title")}{item ? ` — ${item.name}` : ""}</DialogTitle>
        </DialogHeader>

        <form id="adjust-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="type"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="adj-type">Type</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                    <SelectTrigger id="adj-type" aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">{t("type_in")}</SelectItem>
                      <SelectItem value="adjustment">{t("type_adjustment")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="quantity"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="adj-qty">{t("quantity")}</FieldLabel>
                  <Input
                    {...field}
                    id="adj-qty"
                    type="number"
                    min={1}
                    aria-invalid={fieldState.invalid}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="reason"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="adj-reason">{t("reason")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                    <SelectTrigger id="adj-reason" aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="restock">{t("reason_restock")}</SelectItem>
                      <SelectItem value="damage">{t("reason_damage")}</SelectItem>
                      <SelectItem value="return">{t("reason_return")}</SelectItem>
                      <SelectItem value="initial">{t("reason_initial")}</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tCommon("cancel")}</Button>
          <Button type="submit" form="adjust-form" disabled={adjustMutation.isPending}>
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
