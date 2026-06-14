"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  getGovernorates,
  createGovernorate,
  updateGovernorate,
} from "@/lib/api/delivery.api";
import type { ApiResponse } from "@/types";

export const govKeys = {
  all: ["governorates"] as const,
  list: () => ["governorates", "list"] as const,
};

export function useGetGovernorates(status?: "active" | "inactive" | "all") {
  return useQuery({
    queryKey: [...govKeys.list(), status ?? "active"],
    queryFn: () => getGovernorates(status),
  });
}

export function useCreateGovernorate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGovernorate,
    onSuccess: () => qc.invalidateQueries({ queryKey: govKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}

export function useUpdateGovernorate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Parameters<typeof updateGovernorate>[1] }) =>
      updateGovernorate(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: govKeys.all }),
    onError: (err: AxiosError) =>
      toast.error((err.response?.data as ApiResponse<null>)?.message ?? "Error"),
  });
}
