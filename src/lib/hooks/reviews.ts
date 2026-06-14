"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  approveReview,
  getAdminReviews,
  rejectReview,
} from "@/lib/api/reviews.api";
import type {
  ApiResponse,
  PaginatedResponse,
  Review,
  ReviewStatusFilter,
} from "@/types";

const errMsg = (err: AxiosError) =>
  (err.response?.data as ApiResponse<null>)?.message ?? "Error";

export const reviewKeys = {
  all: ["reviews"] as const,
  list: (status: ReviewStatusFilter, page: number, limit: number) =>
    ["reviews", "admin", status, page, limit] as const,
};

export function useAdminReviews(
  status: ReviewStatusFilter,
  page: number,
  limit: number,
) {
  return useQuery<PaginatedResponse<Review>, AxiosError>({
    queryKey: reviewKeys.list(status, page, limit),
    queryFn: () => getAdminReviews({ status, page, limit }),
    placeholderData: (prev) => prev,
  });
}

export function useApproveReview() {
  const qc = useQueryClient();
  return useMutation<string, AxiosError, string>({
    mutationFn: approveReview,
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success(message);
    },
    onError: (err) => toast.error(errMsg(err)),
  });
}

export function useRejectReview() {
  const qc = useQueryClient();
  return useMutation<string, AxiosError, string>({
    mutationFn: rejectReview,
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: reviewKeys.all });
      toast.success(message);
    },
    onError: (err) => toast.error(errMsg(err)),
  });
}
