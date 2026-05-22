import apiClient from "./client";
import type {
  ApiResponse,
  InventoryLog,
  InventorySnapshot,
  InventoryLogFilters,
  PaginatedResponse,
  AdjustStockDto,
} from "@/types";

export const getInventoryLogs = async (
  filters: InventoryLogFilters = {},
): Promise<PaginatedResponse<InventoryLog>> => {
  const { data } = await apiClient.get<ApiResponse<InventoryLog[]>>(
    "/inventory/logs",
    { params: filters },
  );
  return { data: data.data, meta: data.meta! };
};

export const getInventoryAlerts = async (): Promise<InventorySnapshot[]> => {
  const { data } =
    await apiClient.get<ApiResponse<InventorySnapshot[]>>("/inventory/alerts");
  return data.data;
};

export const getStockLevel = async (
  productId: string,
): Promise<InventorySnapshot> => {
  const { data } = await apiClient.get<ApiResponse<InventorySnapshot>>(
    `/inventory/products/${productId}`,
  );
  return data.data;
};

export const adjustStock = async (
  productId: string,
  dto: AdjustStockDto,
): Promise<void> => {
  await apiClient.post(`/inventory/products/${productId}/adjust`, dto);
};
