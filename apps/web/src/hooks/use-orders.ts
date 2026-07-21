"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { Order } from "@/types";

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
    }) => api.post<{ order: Order }>("/checkout", data),
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
    }) => api.post<{ order: Order }>("/checkout/buy-now", data),
  });
}
