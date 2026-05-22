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

export const confirmOrder = async (id: string): Promise<void> => {
  await apiClient.patch(`/orders/${id}/confirm`);
};

export const rejectOrder = async (id: string, reason: string): Promise<void> => {
  await apiClient.patch(`/orders/${id}/reject`, { reason });
};

export const prepareOrder = async (id: string): Promise<void> => {
  await apiClient.patch(`/orders/${id}/prepare`);
};

export const shipOrder = async (id: string): Promise<void> => {
  await apiClient.patch(`/orders/${id}/ship`);
};

export const deliverOrder = async (id: string): Promise<void> => {
  await apiClient.patch(`/orders/${id}/deliver`);
};

export const cancelOrder = async (id: string): Promise<void> => {
  await apiClient.patch(`/orders/${id}/cancel`);
};
