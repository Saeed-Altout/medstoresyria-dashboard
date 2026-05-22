import apiClient from "./client";
import type { ApiResponse, Brand, UpsertTranslationDto } from "@/types";

export const getBrands = async (): Promise<Brand[]> => {
  const { data } = await apiClient.get<ApiResponse<Brand[]>>("/brands");
  return data.data;
};

export const createBrand = async (dto: {
  slug: string;
  translations: UpsertTranslationDto[];
}): Promise<Brand> => {
  const { data } = await apiClient.post<ApiResponse<Brand>>("/brands", dto);
  return data.data;
};

export const updateBrand = async (
  id: string,
  dto: Partial<{ slug: string }>,
): Promise<Brand> => {
  const { data } = await apiClient.patch<ApiResponse<Brand>>(
    `/brands/${id}`,
    dto,
  );
  return data.data;
};

export const deleteBrand = async (id: string): Promise<void> => {
  await apiClient.delete(`/brands/${id}`);
};

export const upsertBrandTranslations = async (
  id: string,
  dto: UpsertTranslationDto,
): Promise<void> => {
  await apiClient.post(`/brands/${id}/translations`, dto);
};
