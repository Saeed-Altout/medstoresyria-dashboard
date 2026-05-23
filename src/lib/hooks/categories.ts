"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { getCategoryTree, createCategory, updateCategory, deleteCategory, upsertCategoryTranslations } from "@/lib/api/categories.api";
import type { ApiResponse, Category, UpsertTranslationDto } from "@/types";

export type StatusFilter = "active" | "inactive" | "all";

export const categoryKeys = {
  all: ["categories"] as const,
  tree: (status: StatusFilter = "active") => ["categories", "tree", status] as const,
};

export function useGetCategories(status: StatusFilter = "active") {
  return useQuery<Category[], AxiosError>({
    queryKey: categoryKeys.tree(status),
    queryFn: () => getCategoryTree(status),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof updateCategory>[1] }) =>
      updateCategory(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}

export function useUpsertCategoryTranslations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, translations }: { id: string; translations: UpsertTranslationDto[] }) =>
      upsertCategoryTranslations(id, translations),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}
