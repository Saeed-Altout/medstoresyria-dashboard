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
): Promise<{ data: ProductDetail; message: string }> => {
  const { data } = await apiClient.post<ApiResponse<ProductDetail>>("/products", dto);
  return { data: data.data, message: data.message };
};

export const updateProduct = async (
  id: string,
  dto: Partial<CreateProductDto> & { is_active?: boolean },
): Promise<{ data: ProductDetail; message: string }> => {
  const { data } = await apiClient.patch<ApiResponse<ProductDetail>>(`/products/${id}`, dto);
  return { data: data.data, message: data.message };
};

export const deleteProduct = async (id: string): Promise<string> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(`/products/${id}`);
  return data.message;
};

export const uploadImage = async (
  id: string,
  formData: FormData,
): Promise<{ data: ProductImage[]; message: string }> => {
  const { data } = await apiClient.post<ApiResponse<ProductImage[]>>(
    `/products/${id}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return { data: data.data, message: data.message };
};

export const deleteImage = async (id: string, imageId: string): Promise<string> => {
  const { data } = await apiClient.delete<ApiResponse<null>>(
    `/products/${id}/images/${imageId}`,
  );
  return data.message;
};

export const setPrimaryImage = async (id: string, imageId: string): Promise<string> => {
  const { data } = await apiClient.patch<ApiResponse<null>>(
    `/products/${id}/images/${imageId}/primary`,
  );
  return data.message;
};

export const setAttributeValues = async (
  id: string,
  dto: SetAttributeValuesDto,
): Promise<{ data: ProductAttribute[]; message: string }> => {
  const { data } = await apiClient.post<ApiResponse<ProductAttribute[]>>(
    `/products/${id}/attributes`,
    dto,
  );
  return { data: data.data, message: data.message };
};

export const upsertProductTranslations = async (
  id: string,
  dto: UpsertProductTranslationDto[],
): Promise<string> => {
  const { data } = await apiClient.post<ApiResponse<null>>(
    `/products/${id}/translations`,
    { translations: dto },
  );
  return data.message;
};
