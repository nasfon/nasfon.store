"use client";

import Image from "next/image";
import Link from "next/link";
import { useSellerProfile, useSellerProducts, useSellerOrders } from "@/hooks/use-seller";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, ShoppingCart, MapPin, Store, CreditCard, ArrowRight } from "lucide-react";
import type { OrderStatus } from "@/types";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  payment_confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  ready_for_delivery: "bg-cyan-100 text-cyan-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function SellerDashboardPage() {
  const { data: seller, isLoading: sellerLoading } = useSellerProfile();
  const { data: products, isLoading: productsLoading } = useSellerProducts();
  const { data: orders, isLoading: ordersLoading } = useSellerOrders();

  const totalOrders = orders?.length || 0;
  const pendingOrders = orders?.filter((o) => o.order_status === "pending" || o.order_status === "payment_confirmed").length || 0;
  const totalRevenue = orders
    ?.filter((o) => o.order_status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_amount), 0) || 0;

  const recentOrders = orders?.slice(0, 5) || [];

  if (sellerLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-500">Welcome back, {seller?.shop_name}</p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/sellers/${seller?.shop_slug}`}
            target="_blank"
            className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <span className="flex items-center gap-2"><Store size={16} /> View Store</span>
          </Link>
          <Link
            href="/seller/dashboard/products"
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add Product
          </Link>
        </div>
      </div>

      {seller?.shop_logo_url && (
        <div className="flex items-center gap-4 rounded-xl border bg-white p-4">
          <div className="relative h-16 w-16 rounded-full overflow-hidden border bg-gray-100">
            <Image src={seller.shop_logo_url} alt={seller.shop_name} fill className="object-cover" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{seller.shop_name}</p>
            <Badge className="mt-1 bg-green-100 text-green-800">Verified Seller</Badge>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-gray-500">
            <Package size={18} />
            <span className="text-sm font-medium">Products</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {productsLoading ? "—" : products?.length || 0}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-gray-500">
            <ShoppingCart size={18} />
            <span className="text-sm font-medium">Orders</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{ordersLoading ? "—" : totalOrders}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-gray-500">
            <MapPin size={18} />
            <span className="text-sm font-medium">Pending</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">{ordersLoading ? "—" : pendingOrders}</p>
        </div>
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center gap-2 text-gray-500">
            <CreditCard size={18} />
            <span className="text-sm font-medium">Revenue</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {ordersLoading ? "—" : `₦${totalRevenue.toLocaleString()}`}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
          <Link
            href="/seller/dashboard/orders"
            className="flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-black"
          >
            View all <ArrowRight size={14} />
          </Link>
        </div>
        {ordersLoading ? (
          <div className="space-y-3 p-5">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="p-5 text-center text-sm text-gray-500">No orders yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium text-gray-900">#{order.order_number}</p>
                  <p className="text-xs text-gray-500">
                    {order.customer_name} · ₦{order.total_amount.toLocaleString()}
                  </p>
                </div>
                <Badge className={statusStyles[order.order_status as OrderStatus]}>
                  {order.order_status.replace(/_/g, " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}