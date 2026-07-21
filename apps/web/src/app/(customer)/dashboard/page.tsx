"use client";

import Link from "next/link";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/use-orders";

const statusLabels: Record<string, { label: string; variant: "info" | "success" | "warning" | "error" }> = {
  pending: { label: "Pending", variant: "warning" },
  payment_confirmed: { label: "Payment Confirmed", variant: "info" },
  processing: { label: "Processing", variant: "info" },
  ready_for_delivery: { label: "Ready for Delivery", variant: "info" },
  out_for_delivery: { label: "Out for Delivery", variant: "info" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export default function CustomerDashboard() {
  const { data: orders, isLoading } = useOrders();
  const recentOrders = orders?.slice(0, 5) || [];

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o) => o.order_status === "pending" || o.order_status === "payment_confirmed").length || 0,
    delivered: orders?.filter((o) => o.order_status === "delivered").length || 0,
    cancelled: orders?.filter((o) => o.order_status === "cancelled").length || 0,
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Package, label: "Total Orders", value: stats.total, color: "text-blue-600 bg-blue-100" },
          { icon: Clock, label: "Pending", value: stats.pending, color: "text-yellow-600 bg-yellow-100" },
          { icon: CheckCircle, label: "Delivered", value: stats.delivered, color: "text-green-600 bg-green-100" },
          { icon: XCircle, label: "Cancelled", value: stats.cancelled, color: "text-red-600 bg-red-100" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className={`inline-flex rounded-lg p-2 ${item.color}`}>
                <Icon size={20} />
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{item.value}</p>
              <p className="text-sm text-gray-500">{item.label}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders" className="text-sm text-primary hover:text-primary-hover">
            View All
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="mt-4 space-y-3">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300">
                  <div>
                    <p className="font-medium text-gray-900">{order.order_number}</p>
                    <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusLabels[order.order_status]?.variant || "info"}>
                      {statusLabels[order.order_status]?.label || order.order_status}
                    </Badge>
                    <span className="font-medium">₦{order.total_amount.toLocaleString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-400">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
