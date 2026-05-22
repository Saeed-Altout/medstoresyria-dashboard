import apiClient from "./client";
import type { ApiResponse, Governorate } from "@/types";

export const getGovernorates = async (): Promise<Governorate[]> => {
  const { data } =
    await apiClient.get<ApiResponse<Governorate[]>>("/delivery/governorates");
  return data.data;
};

export const createGovernorate = async (dto: {
  name: string;
  name_local?: string;
  delivery_fee_usd: string;
}): Promise<Governorate> => {
  const { data } = await apiClient.post<ApiResponse<Governorate>>(
    "/delivery/governorates",
    dto,
  );
  return data.data;
};

export const updateGovernorate = async (
  id: string,
  dto: Partial<{ name: string; name_local: string; delivery_fee_usd: string }>,
): Promise<Governorate> => {
  const { data } = await apiClient.patch<ApiResponse<Governorate>>(
    `/delivery/governorates/${id}`,
    dto,
  );
  return data.data;
};
