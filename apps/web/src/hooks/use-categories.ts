"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { Category, Product } from "@/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<Category[]>("/categories"),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => api.get<{ category: Category; products: Product[] }>(`/categories/${slug}`),
    enabled: !!slug,
  });
}
