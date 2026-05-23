"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface RejectDialogProps {
  open: boolean;
  reason: string;
  isPending: boolean;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RejectDialog({
  open,
  reason,
  isPending,
  onReasonChange,
  onCancel,
  onConfirm,
}: RejectDialogProps) {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("confirm_reject")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reject-reason">{t("reject_reason")}</Label>
          <Textarea
            id="reject-reason"
            placeholder={t("reject_reason_placeholder")}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={3}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {tCommon("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || isPending}
            onClick={onConfirm}
          >
            {t("action_reject")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
