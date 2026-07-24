"use client";

import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminDashboard } from "@/hooks/use-admin";

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useAdminDashboard();

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Sales Overview</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm text-gray-500">Total Revenue</span>
              <span className="text-lg font-bold">₦{(data?.stats.total_revenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm text-gray-500">Total Orders</span>
              <span className="text-lg font-bold">{data?.stats.total_orders || 0}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm text-gray-500">Pending Orders</span>
              <span className="text-lg font-bold text-yellow-600">{data?.stats.pending_orders || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Average Order Value</span>
              <span className="text-lg font-bold">
                ₦{data?.stats.total_orders ? Math.round((data.stats.total_revenue || 0) / data.stats.total_orders).toLocaleString() : 0}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="font-semibold text-gray-900">Inventory</h2>
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm text-gray-500">Total Products</span>
              <span className="text-lg font-bold">{data?.stats.total_products || 0}</span>
            </div>
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm text-gray-500">Total Customers</span>
              <span className="text-lg font-bold">{data?.stats.total_customers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Low Stock Items</span>
              <span className="text-lg font-bold text-red-600">{data?.low_stock_products?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-12 text-center">
        <BarChart3 size={48} className="mx-auto text-gray-300" />
        <p className="mt-4 text-sm text-gray-400">
          Detailed charts and graphs will be available in a future update.
        </p>
      </div>
    </div>
  );
}
