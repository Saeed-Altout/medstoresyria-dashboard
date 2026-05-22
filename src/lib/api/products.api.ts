import apiClient from "./client";
import type {
  ApiResponse,
  ProductListItem,
  ProductDetail,
  ProductImage,
  ProductAttribute,
  ProductFilters,
  PaginatedResponse,
  CreateProductDto,
  SetAttributeValuesDto,
  UpsertProductTranslationDto,
} from "@/types";

export const getProducts = async (
  filters: ProductFilters = {},
): Promise<PaginatedResponse<ProductListItem>> => {
  const { data } = await apiClient.get<ApiResponse<ProductListItem[]>>(
    "/products",
    { params: filters },
  );
  return { data: data.data, meta: data.meta! };
};

export const getProductBySlug = async (slug: string): Promise<ProductDetail> => {
  const { data } = await apiClient.get<ApiResponse<ProductDetail>>(
    `/products/${slug}`,
  );
  return data.data;
};

export const createProduct = async (
  dto: CreateProductDto,
): Promise<ProductDetail> => {
  const { data } = await apiClient.post<ApiResponse<ProductDetail>>(
    "/products",
    dto,
  );
  return data.data;
};

export const updateProduct = async (
  id: string,
  dto: Partial<CreateProductDto>,
): Promise<ProductDetail> => {
  const { data } = await apiClient.patch<ApiResponse<ProductDetail>>(
    `/products/${id}`,
    dto,
  );
  return data.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

export const uploadImage = async (
  id: string,
  formData: FormData,
): Promise<ProductImage[]> => {
  const { data } = await apiClient.post<ApiResponse<ProductImage[]>>(
    `/products/${id}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data.data;
};

export const deleteImage = async (
  id: string,
  imageId: string,
): Promise<void> => {
  await apiClient.delete(`/products/${id}/images/${imageId}`);
};

export const setPrimaryImage = async (
  id: string,
  imageId: string,
): Promise<void> => {
  await apiClient.patch(`/products/${id}/images/${imageId}/primary`);
};

export const setAttributeValues = async (
  id: string,
  dto: SetAttributeValuesDto,
): Promise<ProductAttribute[]> => {
  const { data } = await apiClient.post<ApiResponse<ProductAttribute[]>>(
    `/products/${id}/attributes`,
    dto,
  );
  return data.data;
};

export const upsertProductTranslations = async (
  id: string,
  dto: UpsertProductTranslationDto[],
): Promise<void> => {
  await apiClient.post(`/products/${id}/translations`, { translations: dto });
};
