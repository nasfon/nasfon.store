"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { Product } from "@/types";

export interface ProductsResponse {
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
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeaturedProducts() {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: () => api.get<Product[]>("/products/featured"),
  });
}

export function useInfiniteProducts(
  params?: {
    limit?: number;
    search?: string;
    category_id?: string;
    sort?: string;
  },
  options?: { initialData?: InfiniteData<ProductsResponse> }
) {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", params],
    queryFn: ({ pageParam }) =>
      api.get<ProductsResponse>("/products", {
        ...params,
        page: pageParam === undefined ? 1 : Number(pageParam),
      }),
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    ...(options?.initialData ? { initialData: options.initialData } : {}),
  });
}

export function useInfiniteSearchProducts(query: string, limit = 20) {
  return useInfiniteQuery({
    queryKey: ["products", "search", "infinite", query],
    queryFn: ({ pageParam = 1 }) =>
      api.get<ProductsResponse>("/products/search", { q: query, page: pageParam, limit }),
    getNextPageParam: (lastPage) => {
      const { page, total_pages } = lastPage.pagination;
      return page < total_pages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: query.length > 0,
  });
}
