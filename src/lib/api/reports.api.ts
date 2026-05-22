import apiClient from "./client";
import type {
  ApiResponse,
  SalesSummary,
  DailyRevenue,
  TopProduct,
  InventorySnapshot,
  MaintenanceSummaryReport,
} from "@/types";

export const getSalesSummary = async (
  from: string,
  to: string,
): Promise<SalesSummary> => {
  const { data } = await apiClient.get<ApiResponse<SalesSummary>>(
    "/reports/sales/summary",
    { params: { from, to } },
  );
  return data.data;
};

export const getDailyRevenue = async (
  from: string,
  to: string,
): Promise<DailyRevenue[]> => {
  const { data } = await apiClient.get<ApiResponse<DailyRevenue[]>>(
    "/reports/sales/daily",
    { params: { from, to } },
  );
  return data.data;
};

export const getTopProducts = async (
  from: string,
  to: string,
  limit?: number,
): Promise<TopProduct[]> => {
  const { data } = await apiClient.get<ApiResponse<TopProduct[]>>(
    "/reports/products/top",
    { params: { from, to, limit } },
  );
  return data.data;
};

export const getInventorySnapshot = async (): Promise<InventorySnapshot[]> => {
  const { data } = await apiClient.get<ApiResponse<InventorySnapshot[]>>(
    "/reports/inventory",
  );
  return data.data;
};

export const getMaintenanceSummary = async (
  from: string,
  to: string,
): Promise<MaintenanceSummaryReport> => {
  const { data } = await apiClient.get<ApiResponse<MaintenanceSummaryReport>>(
    "/reports/maintenance",
    { params: { from, to } },
  );
  return data.data;
};
