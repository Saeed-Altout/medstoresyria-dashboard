import apiClient from "./client";
import type { ApiResponse, Category, UpsertTranslationDto } from "@/types";

export const getCategoryTree = async (): Promise<Category[]> => {
  const { data } =
    await apiClient.get<ApiResponse<Category[]>>("/categories");
  return data.data;
};

export const createCategory = async (dto: {
  slug: string;
  sortOrder?: number;
  parentId?: string;
  translations: UpsertTranslationDto[];
}): Promise<Category> => {
  const { data } = await apiClient.post<ApiResponse<Category>>(
    "/categories",
    dto,
  );
  return data.data;
};

export const updateCategory = async (
  id: string,
  dto: Partial<{ slug: string; sortOrder: number; parentId: string }>,
): Promise<Category> => {
  const { data } = await apiClient.patch<ApiResponse<Category>>(
    `/categories/${id}`,
    dto,
  );
  return data.data;
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};

export const upsertCategoryTranslations = async (
  id: string,
  dto: UpsertTranslationDto,
): Promise<void> => {
  await apiClient.post(`/categories/${id}/translations`, dto);
};
