"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetch";
import type { Seller, Product, DeliveryLocation, Order } from "@/types";

export function useSellerProfile() {
  return useQuery({
    queryKey: ["seller", "profile"],
    queryFn: () => api.get<Seller | null>("/seller/profile"),
  });
}

export function useUpdateSellerProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Seller>) => api.patch<Seller>("/seller/profile", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "profile"] }),
  });
}

export function useUpdatePaystackConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { paystack_public_key: string; paystack_secret_key: string }) =>
      api.post<Seller>("/seller/payment/config", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "profile"] }),
  });
}

export function useSellerProducts() {
  return useQuery({
    queryKey: ["seller", "products"],
    queryFn: () => api.get<Product[]>("/seller/products"),
  });
}

export function useCreateSellerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) => api.post<Product>("/seller/products", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "products"] }),
  });
}

export function useUpdateSellerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Product> & { id: string }) =>
      api.patch<Product>(`/seller/products/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "products"] }),
  });
}

export function useDeleteSellerProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/seller/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "products"] }),
  });
}

export function useSellerDeliveryLocations() {
  return useQuery({
    queryKey: ["seller", "delivery-locations"],
    queryFn: () => api.get<DeliveryLocation[]>("/seller/delivery-locations"),
  });
}

export function useCreateSellerDeliveryLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<DeliveryLocation>) => api.post<DeliveryLocation>("/seller/delivery-locations", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "delivery-locations"] }),
  });
}

export function useUpdateSellerDeliveryLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<DeliveryLocation> & { id: string }) =>
      api.patch<DeliveryLocation>(`/seller/delivery-locations/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "delivery-locations"] }),
  });
}

export function useDeleteSellerDeliveryLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/seller/delivery-locations/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "delivery-locations"] }),
  });
}

export function useSellerOrders() {
  return useQuery({
    queryKey: ["seller", "orders"],
    queryFn: () => api.get<Order[]>("/seller/orders"),
  });
}

export function useUpdateSellerOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, order_status }: { id: string; order_status: string }) =>
      api.patch<Order>(`/seller/orders/${id}`, { order_status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller", "orders"] }),
  });
}

// Admin hooks for sellers
export function useAdminSellers(status?: string) {
  return useQuery({
    queryKey: ["admin", "sellers", status],
    queryFn: () => api.get<Seller[]>(`/admin/sellers${status ? `?status=${status}` : ""}`),
  });
}

export function useAdminCreateSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      full_name: string;
      email: string;
      password: string;
      phone_number?: string;
      shop_name: string;
      shop_slug: string;
      shop_address: string;
      shop_logo_url?: string;
      contact_phone: string;
      contact_email: string;
      support_contact?: string;
      business_description?: string;
    }) => api.post<Seller>("/admin/sellers", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "sellers"] }),
  });
}

export function useAdminVerifySeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "approved" | "rejected" }) =>
      api.patch<Seller>(`/admin/sellers/${id}/verify`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "sellers"] }),
  });
}

export function useAdminSetSellerActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) =>
      api.patch<Seller>(`/admin/sellers/${id}`, { is_active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "sellers"] }),
  });
}

export function useAdminDeleteSeller() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/admin/sellers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "sellers"] }),
  });
}
