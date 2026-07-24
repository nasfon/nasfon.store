"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { Product, ApiResponse } from "@/types";

interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export function useProducts(params?: {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  featured?: boolean;
  sort?: string;
}) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => api.get<ProductsResponse>("/products", params as Record<string, string | number | boolean | undefined>),
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => api.get<Product>(`/products/${slug}`),
    enabled: !!slug,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api.get<Product[]>("/products/featured"),
  });
}

export function useSearchProducts(query: string) {
  return useQuery({
    queryKey: ["products", "search", query],
    queryFn: () => api.get<Product[]>("/products/search", { q: query }),
    enabled: query.length > 0,
  });
}
