import apiClient from "./client";
import type { ApiResponse, Invoice, PaginatedResponse } from "@/types";

export const generateInvoice = async (
  orderId: string,
): Promise<{ data: Invoice; message: string }> => {
  const { data } = await apiClient.post<ApiResponse<Invoice>>(
    `/invoices/orders/${orderId}`,
  );
  return { data: data.data, message: data.message };
};

export const getInvoices = async (): Promise<PaginatedResponse<Invoice>> => {
  const { data } = await apiClient.get<ApiResponse<Invoice[]>>("/invoices");
  return { data: data.data, meta: data.meta! };
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  const { data } = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
  return data.data;
};

export const downloadInvoice = async (id: string): Promise<Blob> => {
  const response = await apiClient.get(`/invoices/${id}/download`, {
    responseType: "blob",
  });
  return response.data as Blob;
};
