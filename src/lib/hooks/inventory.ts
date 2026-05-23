"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  getInventoryAlerts,
  getInventoryLogs,
  getStockLevel,
  adjustStock,
} from "@/lib/api/inventory.api";
import { createTableFiltersStore } from "@/hooks/use-table-filters";
import type {
  InventorySnapshot,
  InventoryLog,
  InventoryLogFilters,
  PaginatedResponse,
  AdjustStockDto,
  ApiResponse,
} from "@/types";

// ─── Filter store ─────────────────────────────────────────────────────────────

export const useInventoryLogFilters = createTableFiltersStore<InventoryLogFilters>({ page: 1, limit: 10 });

// ─── Query keys ───────────────────────────────────────────────────────────────

export const inventoryKeys = {
  all: ["inventory"] as const,
  alerts: () => ["inventory", "alerts"] as const,
  logs: (filters: InventoryLogFilters) => ["inventory", "logs", filters] as const,
  stock: (productId: string) => ["inventory", "stock", productId] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useGetInventoryAlerts() {
  return useQuery<InventorySnapshot[], AxiosError>({
    queryKey: inventoryKeys.alerts(),
    queryFn: getInventoryAlerts,
  });
}

export function useGetInventoryLogs(filters: InventoryLogFilters) {
  return useQuery<PaginatedResponse<InventoryLog>, AxiosError>({
    queryKey: inventoryKeys.logs(filters),
    queryFn: () => getInventoryLogs(filters),
    placeholderData: (prev) => prev,
  });
}

export function useGetStockLevel(productId: string) {
  return useQuery<InventorySnapshot, AxiosError>({
    queryKey: inventoryKeys.stock(productId),
    queryFn: () => getStockLevel(productId),
    enabled: !!productId,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useAdjustStock() {
  const qc = useQueryClient();

  return useMutation<void, AxiosError, { productId: string; dto: AdjustStockDto }>({
    mutationFn: ({ productId, dto }) => adjustStock(productId, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}
