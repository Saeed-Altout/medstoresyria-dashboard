import apiClient from "./client";
import type { ApiResponse, AttributeDefinition } from "@/types";

export const getAttributesByCategoryId = async (
  categoryId: string,
): Promise<AttributeDefinition[]> => {
  const { data } = await apiClient.get<ApiResponse<AttributeDefinition[]>>(
    `/attributes/by-category/${categoryId}`,
  );
  return data.data;
};
