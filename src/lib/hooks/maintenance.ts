"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  getMaintenanceRequests,
  getMaintenanceById,
  assignTechnician,
  updateMaintenanceStatus,
} from "@/lib/api/maintenance.api";
import { createTableFiltersStore } from "@/hooks/use-table-filters";
import type {
  MaintenanceRequest,
  MaintenanceFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

// ─── Filter store ─────────────────────────────────────────────────────────────

export const useMaintenanceFilters = createTableFiltersStore<MaintenanceFilters>({ page: 1, limit: 10 });

// ─── Query keys ───────────────────────────────────────────────────────────────

export const maintenanceKeys = {
  all: ["maintenance"] as const,
  list: (filters: MaintenanceFilters) => ["maintenance", "list", filters] as const,
  detail: (id: string) => ["maintenance", "detail", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useGetMaintenanceRequests(filters: MaintenanceFilters) {
  return useQuery<PaginatedResponse<MaintenanceRequest>, AxiosError>({
    queryKey: maintenanceKeys.list(filters),
    queryFn: () => getMaintenanceRequests(filters),
    placeholderData: (prev) => prev,
  });
}

export function useGetMaintenanceById(id: string) {
  return useQuery<MaintenanceRequest, AxiosError>({
    queryKey: maintenanceKeys.detail(id),
    queryFn: () => getMaintenanceById(id),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useAssignTechnician() {
  const qc = useQueryClient();

  return useMutation<string, AxiosError, { id: string; technicianId: string; scheduled_at: string }>({
    mutationFn: ({ id, ...dto }) => assignTechnician(id, dto),
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: maintenanceKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useUpdateMaintenanceStatus() {
  const qc = useQueryClient();

  return useMutation<string, AxiosError, { id: string; status: string; note?: string }>({
    mutationFn: ({ id, ...dto }) => updateMaintenanceStatus(id, dto),
    onSuccess: (message) => {
      qc.invalidateQueries({ queryKey: maintenanceKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}
