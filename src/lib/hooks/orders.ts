"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  getOrders,
  getOrderById,
  confirmOrder,
  rejectOrder,
  prepareOrder,
  shipOrder,
  deliverOrder,
  cancelOrder,
} from "@/lib/api/orders.api";
import { createTableFiltersStore } from "@/hooks/use-table-filters";
import type {
  Order,
  OrderFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

// ─── Filter store ─────────────────────────────────────────────────────────────

export const useOrderFilters = createTableFiltersStore<OrderFilters>({ page: 1, limit: 10 });

// ─── Query keys ───────────────────────────────────────────────────────────────

export const orderKeys = {
  all: ["orders"] as const,
  list: (filters: OrderFilters) => ["orders", "list", filters] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
  pending: () => ["orders", "pending"] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useGetOrders(filters: OrderFilters) {
  return useQuery<PaginatedResponse<Order>, AxiosError>({
    queryKey: orderKeys.list(filters),
    queryFn: () => getOrders(filters),
    placeholderData: (prev) => prev,
  });
}

export function useGetOrderById(id: string) {
  return useQuery<Order, AxiosError>({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });
}

export function useGetPendingOrders() {
  return useQuery<PaginatedResponse<Order>, AxiosError>({
    queryKey: orderKeys.pending(),
    queryFn: () => getOrders({ status: "pending", limit: 5 }),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

function useOrderMutation<TInput>(mutationFn: (input: TInput) => Promise<string>) {
  const qc = useQueryClient();

  return useMutation<string, AxiosError, TInput>({
    mutationFn,
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useConfirmOrder() {
  return useOrderMutation<string>(confirmOrder);
}

export function usePrepareOrder() {
  return useOrderMutation<string>(prepareOrder);
}

export function useShipOrder() {
  return useOrderMutation<string>(shipOrder);
}

export function useDeliverOrder() {
  return useOrderMutation<string>(deliverOrder);
}

export function useCancelOrder() {
  return useOrderMutation<string>(cancelOrder);
}

export function useRejectOrder() {
  const qc = useQueryClient();

  return useMutation<string, AxiosError, { id: string; reason: string }>({
    mutationFn: ({ id, reason }) => rejectOrder(id, reason),
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: orderKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}
