import apiClient from "./client";
import type { ApiResponse, User } from "@/types";

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
}

export const login = async (dto: LoginDto): Promise<LoginResponse> => {
  const { data } = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    dto,
  );
  return data.data;
};

export const logout = (): Promise<unknown> => apiClient.post("/auth/logout");

export const refreshToken = async (): Promise<string> => {
  const { data } = await apiClient.post<ApiResponse<{ accessToken: string }>>(
    "/auth/refresh",
  );
  return data.data.accessToken;
};
