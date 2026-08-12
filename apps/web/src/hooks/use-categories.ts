"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { Category, Product } from "@/types";

export function useCategories(initialData?: Category[]) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<Category[]>("/categories"),
    ...(initialData ? { initialData } : {}),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => api.get<{ category: Category; products: Product[] }>(`/categories/${slug}`),
    enabled: !!slug,
  });
}
