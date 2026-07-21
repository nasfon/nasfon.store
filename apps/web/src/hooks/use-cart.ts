"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetch";

interface CartItemWithProduct {
  product_id: string;
  quantity: number;
  product: {
    name: string;
    slug: string;
    selling_price: number;
    compare_price: number | null;
    featured_image: string | null;
    stock_quantity: number;
  };
  subtotal: number;
}

interface CartResponse {
  items: CartItemWithProduct[];
  total: number;
}

export function useCart() {
  return useQuery({
    queryKey: ["cart"],
    queryFn: () => api.get<CartResponse>("/cart"),
  });
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { product_id: string; quantity: number }) =>
      api.post<{ items: { product_id: string; quantity: number }[] }>("/cart/items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { product_id: string; quantity: number }) =>
      api.patch<{ items: { product_id: string; quantity: number }[] }>(`/cart/items/${data.product_id}`, {
        quantity: data.quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      api.delete<{ items: { product_id: string; quantity: number }[] }>(`/cart/items/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.delete("/cart"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}
