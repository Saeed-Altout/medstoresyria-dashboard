import apiClient from "./client";
import type { ApiResponse, Category, PaginationMeta, UpsertTranslationDto } from "@/types";

export interface CategoriesPage {
  data: Category[];
  meta: PaginationMeta;
}

export const getCategoryTree = async (params: {
  status?: "active" | "inactive" | "all";
  search?: string;
  page?: number;
  limit?: number;
} = {}): Promise<CategoriesPage> => {
  const { status = "active", search, page = 1, limit = 10 } = params;
  const { data } = await apiClient.get<ApiResponse<CategoriesPage>>("/categories", {
    params: { status, ...(search ? { search } : {}), page, limit },
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
