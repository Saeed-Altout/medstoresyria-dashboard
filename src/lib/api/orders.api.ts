import apiClient from "./client";
import type { ApiResponse, Order, OrderFilters, PaginatedResponse } from "@/types";

export const getOrders = async (
  filters: OrderFilters = {},
): Promise<PaginatedResponse<Order>> => {
  const { data } = await apiClient.get<ApiResponse<Order[]>>("/orders", {
    params: filters,
  });
  return { data: data.data, meta: data.meta! };
};

export const getOrderById = async (id: string): Promise<Order> => {
  const { data } = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`);
  return data.data;
};

export const confirmOrder = (id: string): Promise<unknown> =>
  apiClient.patch(`/orders/${id}/confirm`);

export const rejectOrder = (id: string, reason: string): Promise<unknown> =>
  apiClient.patch(`/orders/${id}/reject`, { reason });

export const prepareOrder = (id: string): Promise<unknown> =>
  apiClient.patch(`/orders/${id}/prepare`);

export const shipOrder = (id: string): Promise<unknown> =>
  apiClient.patch(`/orders/${id}/ship`);

export const deliverOrder = (id: string): Promise<unknown> =>
  apiClient.patch(`/orders/${id}/deliver`);

export const cancelOrder = (id: string): Promise<unknown> =>
  apiClient.patch(`/orders/${id}/cancel`);
