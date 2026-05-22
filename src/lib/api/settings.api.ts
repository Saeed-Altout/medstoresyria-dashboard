import apiClient from "./client";
import type { ApiResponse, Setting } from "@/types";

export const getSettings = async (): Promise<Setting[]> => {
  const { data } = await apiClient.get<ApiResponse<Setting[]>>("/settings");
  return data.data;
};

export const updateSettings = async (
  settings: { key: string; value: string }[],
): Promise<Setting[]> => {
  const { data } = await apiClient.patch<ApiResponse<Setting[]>>("/settings", {
    settings,
  });
  return data.data;
};
