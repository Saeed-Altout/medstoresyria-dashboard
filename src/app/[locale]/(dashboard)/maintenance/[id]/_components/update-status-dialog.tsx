"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { useUpdateMaintenanceStatus } from "@/lib/hooks/maintenance";
import type { MaintenanceStatus } from "@/types";

const ALLOWED_TRANSITIONS: Record<MaintenanceStatus, MaintenanceStatus[]> = {
  pending: ["assigned", "cancelled"],
  assigned: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const schema = z.object({
  status: z.string().min(1, "Required"),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface UpdateStatusDialogProps {
  requestId: string;
  currentStatus: MaintenanceStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateStatusDialog({ requestId, currentStatus, open, onOpenChange }: UpdateStatusDialogProps) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");
  const updateMutation = useUpdateMaintenanceStatus();

  const nextStatuses = ALLOWED_TRANSITIONS[currentStatus];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { status: nextStatuses[0] ?? "", note: "" },
  });

  useEffect(() => {
    if (open) form.reset({ status: nextStatuses[0] ?? "", note: "" });
  }, [open, form, nextStatuses]);

  function onSubmit(values: FormValues) {
    updateMutation.mutate(
      { id: requestId, status: values.status, note: values.note || undefined },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  const STATUS_LABELS: Record<string, string> = {
    pending: t("status_pending"),
    assigned: t("status_assigned"),
    in_progress: t("status_in_progress"),
    completed: t("status_completed"),
    cancelled: t("status_cancelled"),
  };

  if (nextStatuses.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("update_status")}</DialogTitle>
        </DialogHeader>

        <form id="status-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="status"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status-select">{tCommon("status")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                    <SelectTrigger id="status-select" aria-invalid={fieldState.invalid}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {nextStatuses.map((s) => (
                        <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="note"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="status-note">{t("note")}</FieldLabel>
                  <Textarea {...field} id="status-note" rows={3} aria-invalid={fieldState.invalid} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tCommon("cancel")}</Button>
          <Button type="submit" form="status-form" disabled={updateMutation.isPending}>
            {tCommon("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
