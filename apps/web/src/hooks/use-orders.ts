"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { Order } from "@/types";

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

interface CheckoutResponse {
  payment: PaymentInfo;
}

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => api.get<Order[]>("/orders"),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => api.get<Order>(`/orders/${id}`),
    enabled: !!id,
  });
}

export function useTrackOrder() {
  return useMutation({
    mutationFn: (data: { order_number: string; phone_number: string }) =>
      api.get<Order>("/orders/track", data),
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: (data: {
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      delivery_location_id: string;
      notes?: string;
    }) => api.post<CheckoutResponse>("/checkout", data),
  });
}

export function useBuyNow() {
  return useMutation({
    mutationFn: (data: {
      product_id: string;
      quantity?: number;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      delivery_location_id: string;
      notes?: string;
    }) => api.post<CheckoutResponse>("/checkout/buy-now", data),
  });
}
