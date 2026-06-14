import apiClient from "./client";
import type { ApiResponse, Category, UpsertTranslationDto } from "@/types";

export const getCategoryTree = async (status: "active" | "inactive" | "all" = "active"): Promise<Category[]> => {
  const { data } = await apiClient.get<ApiResponse<Category[]>>("/categories", {
    params: status !== "active" ? { status } : undefined,
  });
  return data.data;
};


export const createCategory = async (dto: {
  slug: string;
  sortOrder?: number;
  parentId?: string;
  imageUrl?: string;
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
  dto: Partial<{
    slug: string;
    sortOrder: number;
    parentId: string;
    imageUrl: string;
    isActive: boolean;
  }>,
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
  translations: UpsertTranslationDto[],
): Promise<void> => {
  await apiClient.post(`/categories/${id}/translations`, { translations });
};

/** Upload a category logo/image and return its public URL. */
export const uploadCategoryImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
    "/storage/upload?folder=categories",
    formData,
  );
  return data.data.url;
};
