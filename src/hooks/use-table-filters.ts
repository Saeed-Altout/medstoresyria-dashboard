"use client";

import { useRef, useCallback } from "react";
import { create } from "zustand";

export interface TableFiltersState<T extends { page?: number; limit?: number; search?: string }> {
  filters: T;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string | undefined) => void;
  setFilter: <K extends keyof T>(key: K, value: T[K] | undefined) => void;
  resetFilters: () => void;
}

export function createTableFiltersStore<T extends { page?: number; limit?: number; search?: string }>(
  initial: T,
) {
  return create<TableFiltersState<T>>()((set) => ({
    filters: { ...initial },

    setPage: (page) =>
      set((s) => ({ filters: { ...s.filters, page } })),

    setLimit: (limit) =>
      set((s) => ({ filters: { ...s.filters, limit, page: 1 } })),

    setSearch: (search) =>
      set((s) => ({ filters: { ...s.filters, search: search || undefined, page: 1 } })),

    setFilter: (key, value) =>
      set((s) => ({ filters: { ...s.filters, [key]: value, page: 1 } })),

    resetFilters: () =>
      set(() => ({ filters: { ...initial } })),
  }));
}

export function useDebouncedSearch(
  onSearch: (value: string | undefined) => void,
  delay = 400,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback(
    (value: string) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        onSearch(value || undefined);
      }, delay);
    },
    [onSearch, delay],
  );
}
