"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/data-table";
import { Header } from "@/components/header";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAuthStore } from "@/stores/auth.store";
import { canAccess } from "@/lib/utils/roles";
import {
  useAdminReviews,
  useApproveReview,
  useRejectReview,
} from "@/lib/hooks/reviews";
import { getReviewColumns } from "./_components/columns";
import type { Review, ReviewStatusFilter } from "@/types";

export default function ReviewsPage() {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && !canAccess(user.role, "products")) router.replace("/overview");
  }, [user, router]);

  const [status, setStatus] = useState<ReviewStatusFilter>("pending");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const { data, isLoading } = useAdminReviews(status, page, limit);
  const meta = data?.meta ?? { page, limit, total: 0, totalPages: 1 };
  const approveMutation = useApproveReview();
  const rejectMutation = useRejectReview();

  const columns = useMemo(
    () =>
      getReviewColumns({
        tProduct: t("product"),
        tAuthor: t("author"),
        tRating: t("rating"),
        tReview: t("review"),
        tStatus: tCommon("status"),
        tDate: tCommon("date"),
        tApprove: t("approve"),
        tReject: t("reject"),
        tApproved: t("approved"),
        tPending: t("pending"),
        tVerified: t("verified"),
        onApprove: (id) => approveMutation.mutate(id),
        onReject: setRejectId,
      }),
    [t, tCommon, approveMutation],
  );

  if (!user) return null;

  return (
    <div className="flex flex-col gap-5">
      <Header title={t("title")} />

      <DataTable<Review>
        columns={columns}
        data={data?.data ?? []}
        isLoading={isLoading}
        meta={meta}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        toolbar={
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as ReviewStatusFilter);
              setPage(1);
            }}
          >
            <SelectTrigger size="sm" className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">{t("pending")}</SelectItem>
              <SelectItem value="approved">{t("approved")}</SelectItem>
              <SelectItem value="all">{tCommon("all")}</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <ConfirmDialog
        open={rejectId !== null}
        onCancel={() => setRejectId(null)}
        title={tCommon("are_you_sure")}
        description={t("reject_confirm")}
        variant="destructive"
        isLoading={rejectMutation.isPending}
        onConfirm={() => {
          if (rejectId)
            rejectMutation.mutate(rejectId, {
              onSuccess: () => setRejectId(null),
            });
        }}
      />
    </div>
  );
}
