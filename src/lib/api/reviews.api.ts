import apiClient from "./client";
import type {
  ApiResponse,
  PaginatedResponse,
  Review,
  ReviewStatusFilter,
} from "@/types";

export const getAdminReviews = async (params: {
  status?: ReviewStatusFilter;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Review>> => {
  const { data } = await apiClient.get<ApiResponse<Review[]>>("/reviews/admin", {
    params,
  });
  return { data: data.data, meta: data.meta! };
};

export const approveReview = async (id: string): Promise<string> => {
  const { data } = await apiClient.patch<ApiResponse<null>>(
    `/reviews/${id}/approve`,
  );
  return data.message;
};

export const rejectReview = async (id: string): Promise<string> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/reviews/${id}`);
  return data.message;
};
