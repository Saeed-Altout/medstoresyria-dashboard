import axios, { AxiosError, type AxiosInstance } from "axios";
import { useAuthStore } from "@/stores/auth.store";
import type { ApiResponse } from "@/types";

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config!;
    if (
      error.response?.status === 401 &&
      !(original as typeof original & { _retry?: boolean })._retry
    ) {
      if (isRefreshing) return Promise.reject(error);
      (original as typeof original & { _retry?: boolean })._retry = true;
      isRefreshing = true;
      try {
        const { data } = await apiClient.post<
          ApiResponse<{ accessToken: string }>
        >("/auth/refresh");
        const token = data.data.accessToken;
        useAuthStore.getState().setAuth(useAuthStore.getState().user!, token);
        original.headers!["Authorization"] = `Bearer ${token}`;
        return apiClient(original);
      } catch {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          window.location.href = "/ar/login";
        }
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export default apiClient;
