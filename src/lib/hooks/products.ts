"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadImage,
  deleteImage,
  setPrimaryImage,
  setAttributeValues,
  upsertProductTranslations,
} from "@/lib/api/products.api";
import { createTableFiltersStore } from "@/hooks/use-table-filters";
import type {
  ProductListItem,
  ProductDetail,
  ProductImage,
  ProductAttribute,
  ProductFilters,
  PaginatedResponse,
  ApiResponse,
  CreateProductDto,
  SetAttributeValuesDto,
  UpsertProductTranslationDto,
} from "@/types";

// ─── Filter store ─────────────────────────────────────────────────────────────

export const useProductFilters = createTableFiltersStore<ProductFilters>({ page: 1, limit: 10 });

// ─── Query keys ───────────────────────────────────────────────────────────────

export const productKeys = {
  all: ["products"] as const,
  list: (filters: ProductFilters) => ["products", "list", filters] as const,
  detail: (slug: string) => ["products", "detail", slug] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useGetProducts(filters: ProductFilters) {
  return useQuery<PaginatedResponse<ProductListItem>, AxiosError>({
    queryKey: productKeys.list(filters),
    queryFn: () => getProducts(filters),
    placeholderData: (prev) => prev,
  });
}

export function useGetProductBySlug(slug: string) {
  return useQuery<ProductDetail, AxiosError>({
    queryKey: productKeys.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: !!slug,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateProduct() {
  const qc = useQueryClient();

  return useMutation<{ data: ProductDetail; message: string }, AxiosError, CreateProductDto>({
    mutationFn: createProduct,
    onSuccess: ({ message }) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();

  return useMutation<
    { data: ProductDetail; message: string },
    AxiosError,
    { id: string; dto: Partial<CreateProductDto> & { is_active?: boolean } }
  >({
    mutationFn: ({ id, dto }) => updateProduct(id, dto),
    onSuccess: ({ message }) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();

  return useMutation<string, AxiosError, string>({
    mutationFn: deleteProduct,
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useUploadProductImage() {
  const qc = useQueryClient();

  return useMutation<{ data: ProductImage[]; message: string }, AxiosError, { id: string; formData: FormData }>({
    mutationFn: ({ id, formData }) => uploadImage(id, formData),
    onSuccess: ({ message }) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();

  return useMutation<string, AxiosError, { id: string; imageId: string }>({
    mutationFn: ({ id, imageId }) => deleteImage(id, imageId),
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useSetPrimaryImage() {
  const qc = useQueryClient();

  return useMutation<string, AxiosError, { id: string; imageId: string }>({
    mutationFn: ({ id, imageId }) => setPrimaryImage(id, imageId),
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useSetProductAttributes() {
  const qc = useQueryClient();

  return useMutation<{ data: ProductAttribute[]; message: string }, AxiosError, { id: string; dto: SetAttributeValuesDto }>({
    mutationFn: ({ id, dto }) => setAttributeValues(id, dto),
    onSuccess: ({ message }) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useUpsertProductTranslations() {
  const qc = useQueryClient();

  return useMutation<string, AxiosError, { id: string; translations: UpsertProductTranslationDto[] }>({
    mutationFn: ({ id, translations }) => upsertProductTranslations(id, translations),
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}
