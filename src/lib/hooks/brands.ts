"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getBrands, createBrand, updateBrand, deleteBrand, upsertBrandTranslations } from "@/lib/api/brands.api";
import type { ApiResponse, Brand, UpsertTranslationDto } from "@/types";

export const brandKeys = {
  all: ["brands"] as const,
  list: () => ["brands", "list"] as const,
};

export function useGetBrands() {
  return useQuery<Brand[], AxiosError>({
    queryKey: brandKeys.list(),
    queryFn: getBrands,
  });
}

export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: brandKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}

export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof updateBrand>[1] }) =>
      updateBrand(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: brandKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}

export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: brandKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}

export function useUpsertBrandTranslations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, translations }: { id: string; translations: UpsertTranslationDto[] }) =>
      upsertBrandTranslations(id, translations),
    onSuccess: () => qc.invalidateQueries({ queryKey: brandKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}
