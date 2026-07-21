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
