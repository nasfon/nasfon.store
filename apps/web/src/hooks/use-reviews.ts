"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { Review } from "@/types";

export function useProductReviews(productSlug: string) {
  return useQuery({
    queryKey: ["reviews", productSlug],
    queryFn: () => api.get<Review[]>(`/products/${productSlug}/reviews`),
    enabled: !!productSlug,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      product_id: string;
      order_id: string;
      rating: number;
      review?: string;
    }) => api.post<Review>("/reviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
}
