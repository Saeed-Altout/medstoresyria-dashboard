import apiClient from "./client";
import type { ApiResponse, User, UserFilters, PaginatedResponse } from "@/types";

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

export const getUsers = async (
  filters: UserFilters = {},
): Promise<PaginatedResponse<User>> => {
  const { data } = await apiClient.get<ApiResponse<User[]>>("/users", {
    params: filters,
  });
  return { data: data.data, meta: data.meta! };
};

export const getUserById = async (id: string): Promise<User> => {
  const { data } = await apiClient.get<ApiResponse<User>>(`/users/${id}`);
  return data.data;
};

export const createUser = async (dto: CreateUserDto): Promise<User> => {
  const { data } = await apiClient.post<ApiResponse<User>>("/users", dto);
  return data.data;
};

export const updateUser = async (
  id: string,
  dto: UpdateUserDto,
): Promise<User> => {
  const { data } = await apiClient.patch<ApiResponse<User>>(
    `/users/${id}`,
    dto,
  );
  return data.data;
};

export const toggleUserActive = async (id: string): Promise<User> => {
  const { data } = await apiClient.patch<ApiResponse<User>>(
    `/users/${id}/toggle`,
  );
  return data.data;
};
