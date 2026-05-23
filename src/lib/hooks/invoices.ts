"use client";

import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  getInvoices,
  getInvoiceById,
  generateInvoice,
  downloadInvoice,
} from "@/lib/api/invoices.api";
import type {
  Invoice,
  PaginatedResponse,
  ApiResponse,
} from "@/types";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const invoiceKeys = {
  all: ["invoices"] as const,
  list: () => ["invoices", "list"] as const,
  detail: (id: string) => ["invoices", "detail", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useGetInvoices() {
  return useQuery<PaginatedResponse<Invoice>, AxiosError>({
    queryKey: invoiceKeys.list(),
    queryFn: getInvoices,
  });
}

export function useGetInvoiceById(id: string) {
  return useQuery<Invoice, AxiosError>({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useGenerateInvoice() {
  const qc = useQueryClient();

  return useMutation<{ data: Invoice; message: string }, AxiosError, string>({
    mutationFn: generateInvoice,
    onSuccess: ({ message }) => {
      qc.invalidateQueries({ queryKey: invoiceKeys.all });
      qc.invalidateQueries({ queryKey: ["orders"] });
      toast.success(message);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}

export function useDownloadInvoice() {
  return useMutation<Blob, AxiosError, { id: string; invoiceNumber: string }>({
    mutationFn: ({ id }) => downloadInvoice(id),
    onSuccess: (blob, { invoiceNumber }) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice_${invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: (err) => {
      toast.error((err.response?.data as ApiResponse<null>)?.message);
    },
  });
}
