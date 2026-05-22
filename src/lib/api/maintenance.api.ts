import apiClient from "./client";
import type {
  ApiResponse,
  MaintenanceRequest,
  MaintenanceFilters,
  PaginatedResponse,
} from "@/types";

export const getMaintenanceRequests = async (
  filters: MaintenanceFilters = {},
): Promise<PaginatedResponse<MaintenanceRequest>> => {
  const { data } = await apiClient.get<ApiResponse<MaintenanceRequest[]>>(
    "/maintenance",
    { params: filters },
  );
  return { data: data.data, meta: data.meta! };
};

export const getMaintenanceById = async (
  id: string,
): Promise<MaintenanceRequest> => {
  const { data } = await apiClient.get<ApiResponse<MaintenanceRequest>>(
    `/maintenance/${id}`,
  );
  return data.data;
};

export const getAssignedMaintenance = async (): Promise<
  PaginatedResponse<MaintenanceRequest>
> => {
  const { data } = await apiClient.get<ApiResponse<MaintenanceRequest[]>>(
    "/maintenance/assigned",
  );
  return { data: data.data, meta: data.meta! };
};

export const assignTechnician = async (
  id: string,
  dto: { technicianId: string; scheduled_at: string },
): Promise<void> => {
  await apiClient.patch(`/maintenance/${id}/assign`, dto);
};

export const updateMaintenanceStatus = async (
  id: string,
  dto: { status: string; note?: string },
): Promise<void> => {
  await apiClient.patch(`/maintenance/${id}/status`, dto);
};
