"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { Product, Category, Order, DeliveryLocation, User, StoreSettings, ProductImage } from "@/types";

interface DashboardData {
  stats: {
    total_orders: number;
    pending_orders: number;
    total_products: number;
    total_customers: number;
    total_revenue: number;
  };
  low_stock_products: Product[];
  recent_orders: Order[];
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: () => api.get<DashboardData>("/admin/dashboard"),
  });
}

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => api.get<Product[]>("/admin/products"),
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) => api.post<Product>("/admin/products", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Product> & { id: string }) =>
      api.patch<Product>(`/admin/products/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "products"] }),
  });
}

export function useAdminCategories(enabled = true) {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => api.get<Category[]>("/admin/categories"),
    enabled,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Category>) => api.post<Category>("/admin/categories", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Category> & { id: string }) =>
      api.patch<Category>(`/admin/categories/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });
}

export function useAdminOrders() {
  return useQuery({
    queryKey: ["admin", "orders"],
    queryFn: () => api.get<Order[]>("/admin/orders"),
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: ["admin", "order", id],
    queryFn: () => api.get<Order>(`/admin/orders/${id}`),
    enabled: !!id,
  });
}

export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; order_status?: string; payment_status?: string; notes?: string }) =>
      api.patch<Order>(`/admin/orders/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
      qc.invalidateQueries({ queryKey: ["admin", "order"] });
    },
  });
}

export function useAdminDeliveryLocations() {
  return useQuery({
    queryKey: ["admin", "delivery-locations"],
    queryFn: () => api.get<DeliveryLocation[]>("/admin/delivery-locations"),
  });
}

export function useCreateDeliveryLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DeliveryLocation>) =>
      api.post<DeliveryLocation>("/admin/delivery-locations", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "delivery-locations"] }),
  });
}

export function useUpdateDeliveryLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<DeliveryLocation> & { id: string }) =>
      api.patch<DeliveryLocation>(`/admin/delivery-locations/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "delivery-locations"] }),
  });
}

export function useDeleteDeliveryLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/delivery-locations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "delivery-locations"] }),
  });
}

export function useAdminCustomers() {
  return useQuery({
    queryKey: ["admin", "customers"],
    queryFn: () => api.get<User[]>("/admin/customers"),
  });
}

export function useAdminCustomer(id: string) {
  return useQuery({
    queryKey: ["admin", "customer", id],
    queryFn: () => api.get<User>(`/admin/customers/${id}`),
    enabled: !!id,
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/customers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "customers"] }),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<User> & { id: string }) =>
      api.patch<User>(`/admin/customers/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "customers"] }),
  });
}

export function useProductImages(productId: string | null) {
  return useQuery({
    queryKey: ["admin", "products", productId, "images"],
    queryFn: () => api.get<ProductImage[]>(`/admin/products/${productId}/images`),
    enabled: !!productId,
  });
}

export function useAddProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, ...data }: { productId: string; image_url: string; display_order: number }) =>
      api.post<ProductImage>(`/admin/products/${productId}/images`, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "products", variables.productId, "images"] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useUpdateProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId, ...data }: { productId: string; imageId: string; display_order?: number }) =>
      api.patch<ProductImage>(`/admin/products/${productId}/images/${imageId}`, data),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "products", variables.productId, "images"] });
    },
  });
}

export function useDeleteProductImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, imageId }: { productId: string; imageId: string }) =>
      api.delete(`/admin/products/${productId}/images/${imageId}`),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "products", variables.productId, "images"] });
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });
}

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => api.get<StoreSettings>("/admin/settings"),
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<StoreSettings>) =>
      api.patch<StoreSettings>("/admin/settings", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "settings"] }),
  });
}
