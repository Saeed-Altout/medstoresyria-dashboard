"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { IconCheck, IconStarFilled, IconTrash } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/format";
import type { Review } from "@/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <IconStarFilled
          key={i}
          className={i < rating ? "size-3.5 text-amber-500" : "size-3.5 text-muted"}
        />
      ))}
    </span>
  );
}

interface GetReviewColumnsArgs {
  tProduct: string;
  tAuthor: string;
  tRating: string;
  tReview: string;
  tStatus: string;
  tDate: string;
  tApprove: string;
  tReject: string;
  tApproved: string;
  tPending: string;
  tVerified: string;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export function getReviewColumns({
  tProduct,
  tAuthor,
  tRating,
  tReview,
  tStatus,
  tDate,
  tApprove,
  tReject,
  tApproved,
  tPending,
  tVerified,
  onApprove,
  onReject,
}: GetReviewColumnsArgs): ColumnDef<Review>[] {
  return [
    {
      id: "product",
      header: tProduct,
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.product?.slug ?? "—"}
        </span>
      ),
    },
    {
      id: "author",
      header: tAuthor,
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{row.original.author_name}</span>
          {row.original.is_verified_purchase && (
            <span className="text-[11px] text-green-600">{tVerified}</span>
          )}
        </div>
      ),
    },
    {
      id: "rating",
      header: tRating,
      cell: ({ row }) => <Stars rating={row.original.rating} />,
    },
    {
      id: "review",
      header: tReview,
      cell: ({ row }) => (
        <div className="flex max-w-sm flex-col gap-0.5">
          {row.original.title && (
            <span className="text-sm font-medium">{row.original.title}</span>
          )}
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {row.original.body}
          </span>
        </div>
      ),
    },
    {
      id: "status",
      header: tStatus,
      cell: ({ row }) =>
        row.original.is_approved ? (
          <Badge variant="secondary">{tApproved}</Badge>
        ) : (
          <Badge variant="outline" className="text-muted-foreground">
            {tPending}
          </Badge>
        ),
    },
    {
      id: "date",
      header: tDate,
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          {!row.original.is_approved && (
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-green-600 hover:text-green-600"
              title={tApprove}
              onClick={() => onApprove(row.original.id)}
            >
              <IconCheck className="size-3.5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            title={tReject}
            onClick={() => onReject(row.original.id)}
          >
            <IconTrash className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];
}
