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

export const confirmOrder = async (id: string): Promise<string> => {
  const { data } = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/confirm`);
  return data.message;
};

export const rejectOrder = async (id: string, reason: string): Promise<string> => {
  const { data } = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/reject`, { rejectionReason: reason });
  return data.message;
};

export const prepareOrder = async (id: string): Promise<string> => {
  const { data } = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/prepare`);
  return data.message;
};

export const shipOrder = async (id: string): Promise<string> => {
  const { data } = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/ship`);
  return data.message;
};

export const deliverOrder = async (id: string): Promise<string> => {
  const { data } = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/deliver`);
  return data.message;
};

export const cancelOrder = async (id: string): Promise<string> => {
  const { data } = await apiClient.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
  return data.message;
};
