"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
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

interface AddToCartData {
  product_id: string;
  quantity: number;
  name: string;
  slug: string;
  selling_price: number;
  compare_price: number | null;
  featured_image: string | null;
  stock_quantity: number;
}

export function useAddCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddToCartData) =>
      api.post<CartResponse>("/cart/items", { product_id: data.product_id, quantity: data.quantity }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartResponse>(["cart"]);
      const items = [...(previous?.items ?? [])];
      const existing = items.find((i) => i.product_id === data.product_id);

      if (existing) {
        existing.quantity += data.quantity;
        existing.subtotal = existing.product.selling_price * existing.quantity;
      } else {
        items.push({
          product_id: data.product_id,
          quantity: data.quantity,
          product: {
            name: data.name,
            slug: data.slug,
            selling_price: data.selling_price,
            compare_price: data.compare_price,
            featured_image: data.featured_image,
            stock_quantity: data.stock_quantity,
          },
          subtotal: data.selling_price * data.quantity,
        });
      }

      const total = items.reduce((sum, item) => sum + item.subtotal, 0);
      queryClient.setQueryData<CartResponse>(["cart"], { items, total });

      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { product_id: string; quantity: number }) =>
      api.patch<CartResponse>(`/cart/items/${data.product_id}`, {
        quantity: data.quantity,
      }),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartResponse>(["cart"]);

      if (previous) {
        const updatedItems = previous.items.map((item) => {
          if (item.product_id !== data.product_id) return item;
          return {
            ...item,
            quantity: data.quantity,
            subtotal: item.product.selling_price * data.quantity,
          };
        });
        const total = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        queryClient.setQueryData<CartResponse>(["cart"], { items: updatedItems, total });
      }

      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
    },
  });
}

/** Optimistically update cart quantity in cache and debounce the API sync. */
export function useCartQuantity() {
  const queryClient = useQueryClient();
  const updateItem = useUpdateCartItem();
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const originals = useRef<Record<string, CartResponse | undefined>>({});

  const setQuantity = (productId: string, quantity: number) => {
    if (timers.current[productId]) {
      clearTimeout(timers.current[productId]);
    }

    if (!originals.current[productId]) {
      originals.current[productId] = structuredClone(
        queryClient.getQueryData<CartResponse>(["cart"])
      );
    }

    const cart = queryClient.getQueryData<CartResponse>(["cart"]);
    if (cart) {
      const updatedItems = cart.items.map((item) => {
        if (item.product_id !== productId) return item;
        return {
          ...item,
          quantity,
          subtotal: item.product.selling_price * quantity,
        };
      });
      const total = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
      queryClient.setQueryData<CartResponse>(["cart"], { items: updatedItems, total });
    }
  };

  const syncToServer = (productId: string, quantity: number) => {
    if (timers.current[productId]) {
      clearTimeout(timers.current[productId]);
    }

    timers.current[productId] = setTimeout(() => {
      const original = originals.current[productId];
      delete originals.current[productId];
      updateItem.mutate(
        { product_id: productId, quantity },
        {
          onError: () => {
            if (original) {
              queryClient.setQueryData(["cart"], original);
            }
          },
        }
      );
      delete timers.current[productId];
    }, 500);
  };

  const cancelPending = (productId: string) => {
    if (timers.current[productId]) {
      clearTimeout(timers.current[productId]);
      const original = originals.current[productId];
      if (original) {
        queryClient.setQueryData(["cart"], original);
      }
      delete originals.current[productId];
      delete timers.current[productId];
    }
  };

  return { setQuantity, syncToServer, cancelPending };
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      api.delete<CartResponse>(`/cart/items/${productId}`),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previous = queryClient.getQueryData<CartResponse>(["cart"]);

      if (previous) {
        const updatedItems = previous.items.filter((item) => item.product_id !== productId);
        const total = updatedItems.reduce((sum, item) => sum + item.subtotal, 0);
        queryClient.setQueryData<CartResponse>(["cart"], { items: updatedItems, total });
      }

      return { previous };
    },
    onError: (_err, _data, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["cart"], context.previous);
      }
    },
    onSettled: () => {
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
