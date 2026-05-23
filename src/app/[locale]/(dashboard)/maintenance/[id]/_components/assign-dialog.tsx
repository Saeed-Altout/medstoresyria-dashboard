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
import { useGetUsers } from "@/lib/hooks/users";
import { useAssignTechnician } from "@/lib/hooks/maintenance";

const schema = z.object({
  technicianId: z.string().uuid("Select a technician"),
  scheduled_at: z.string().min(1, "Required"),
});

type FormValues = z.infer<typeof schema>;

interface AssignDialogProps {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignDialog({ requestId, open, onOpenChange }: AssignDialogProps) {
  const t = useTranslations("maintenance");
  const tCommon = useTranslations("common");

  const { data: usersData } = useGetUsers({ role: "technician", limit: 100 });
  const technicians = usersData?.data ?? [];

  const assignMutation = useAssignTechnician();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { technicianId: "", scheduled_at: "" },
  });

  useEffect(() => {
    if (open) form.reset({ technicianId: "", scheduled_at: "" });
  }, [open, form]);

  function onSubmit(values: FormValues) {
    assignMutation.mutate(
      { id: requestId, technicianId: values.technicianId, scheduled_at: new Date(values.scheduled_at).toISOString() },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("assign_title")}</DialogTitle>
        </DialogHeader>

        <form id="assign-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="technicianId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assign-tech">{t("select_technician")}</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange} name={field.name}>
                    <SelectTrigger id="assign-tech" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder={`— ${t("select_technician")} —`} />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.first_name} {tech.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="scheduled_at"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assign-date">{t("scheduled_at")}</FieldLabel>
                  <Input
                    {...field}
                    id="assign-date"
                    type="datetime-local"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{tCommon("cancel")}</Button>
          <Button type="submit" form="assign-form" disabled={assignMutation.isPending}>
            {tCommon("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
