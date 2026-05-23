"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserActive,
  type CreateUserDto,
  type UpdateUserDto,
} from "@/lib/api/users.api";
import { createTableFiltersStore } from "@/hooks/use-table-filters";
import type {
  User,
  UserFilters,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

// ─── Filter store ─────────────────────────────────────────────────────────────

export const useUserFilters = createTableFiltersStore<UserFilters>({ page: 1, limit: 10 });

// ─── Query keys ───────────────────────────────────────────────────────────────

export const userKeys = {
  all: ["users"] as const,
  list: (filters: UserFilters) => ["users", "list", filters] as const,
  detail: (id: string) => ["users", "detail", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useGetUsers(filters: UserFilters) {
  return useQuery<PaginatedResponse<User>, AxiosError>({
    queryKey: userKeys.list(filters),
    queryFn: () => getUsers(filters),
    placeholderData: (prev) => prev,
  });
}

export function useGetUserById(id: string) {
  return useQuery<User, AxiosError>({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateUser() {
  const qc = useQueryClient();

  return useMutation<{ data: User; message: string }, AxiosError, CreateUserDto>({
    mutationFn: createUser,
    onSuccess: ({ message }) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();

  return useMutation<{ data: User; message: string }, AxiosError, { id: string; dto: UpdateUserDto }>({
    mutationFn: ({ id, dto }) => updateUser(id, dto),
    onSuccess: ({ message }) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useToggleUserActive() {
  const qc = useQueryClient();

  return useMutation<{ data: User; message: string }, AxiosError, string>({
    mutationFn: toggleUserActive,
    onSuccess: ({ message }) => {
      qc.invalidateQueries({ queryKey: userKeys.all });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}
