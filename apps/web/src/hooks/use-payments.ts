"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/fetch";

interface PaymentInfo {
  id: string;
  flutterwave_reference: string;
  virtual_account_number: string | null;
  bank_name: string | null;
  account_name: string | null;
  amount: number;
  payment_status: string;
  reference: string;
}

interface PaymentStatusResponse {
  payment_status: string;
  payment: {
    flutterwave_reference?: string;
    virtual_account_number?: string;
    bank_name?: string;
    account_name?: string;
    amount?: number;
    payment_status?: string;
  } | null;
}

interface PaymentByReferenceResponse {
  payment_status: string;
  order: { id: string; order_number: string; order_status: string; payment_status: string } | null;
  payment: {
    id: string;
    flutterwave_reference: string;
    virtual_account_number: string | null;
    bank_name: string | null;
    account_name: string | null;
    amount: number;
    payment_status: string;
    webhook_payload: Record<string, unknown>;
  };
  amount_mismatch?: boolean;
}

export function useGeneratePayment() {
  return useMutation({
    mutationFn: (data: { amount: number; email: string; fullname: string; order_id?: string }) =>
      api.post<PaymentInfo>("/payments/dynamic-account", data),
  });
}

export function usePaymentStatus(orderId: string) {
  return useQuery({
    queryKey: ["payment-status", orderId],
    queryFn: () => api.get<PaymentStatusResponse>(`/payments/status/${orderId}`),
    enabled: !!orderId,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.payment_status === "paid") return false;
      return 10000;
    },
  });
}

export function useExpirePayment() {
  return useMutation({
    mutationFn: (reference: string) => api.patch<{ expired: boolean }>(`/payments/${reference}`),
  });
}

export function usePaymentByReference(reference: string) {
  return useQuery({
    queryKey: ["payment-reference", reference],
    queryFn: () => api.get<PaymentByReferenceResponse>(`/payments/by-reference/${reference}`),
    enabled: !!reference,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.order) return false;
      return 10000;
    },
  });
}
