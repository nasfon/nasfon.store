"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/fetch";

interface PaymentStatusResponse {
  payment_status: string;
  payment: {
    reference?: string;
    amount?: number;
    payment_status?: string;
  } | null;
}

interface PaymentByReferenceResponse {
  payment_status: string;
  order: { id: string; order_number: string; order_status: string; payment_status: string } | null;
  payment: {
    id: string;
    reference: string;
    amount: number;
    payment_status: string;
    webhook_payload: Record<string, unknown>;
  };
  amount_mismatch?: boolean;
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

export function usePaymentByReference(reference: string) {
  return useQuery({
    queryKey: ["payment-reference", reference],
    queryFn: () => api.get<PaymentByReferenceResponse>(`/payments/by-reference/${reference}`),
    enabled: !!reference,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data?.order) return false;
      return 5000;
    },
  });
}
