"use client";

import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useOrders } from "@/hooks/use-orders";
import { useAuth } from "@/hooks/use-auth";

const statusLabels: Record<string, { label: string; variant: "info" | "success" | "warning" | "error" }> = {
  pending: { label: "Pending", variant: "warning" },
  payment_confirmed: { label: "Payment Confirmed", variant: "info" },
  processing: { label: "Processing", variant: "info" },
  ready_for_delivery: { label: "Ready for Delivery", variant: "info" },
  out_for_delivery: { label: "Out for Delivery", variant: "info" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

const ACTIVE_STATUSES = new Set([
  "pending",
  "payment_confirmed",
  "processing",
  "ready_for_delivery",
  "out_for_delivery",
]);

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const { data: orders, isLoading } = useOrders();

  const firstName = profile?.full_name?.split(" ")[0];
  const total = orders?.length || 0;
  const inProgress = orders?.filter((o) => ACTIVE_STATUSES.has(o.order_status)).length || 0;
  const recentOrders = orders?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          {firstName ? `Welcome back, ${firstName}` : "My Account"}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {total > 0
            ? `You have ${total} order${total === 1 ? "" : "s"}${inProgress > 0 ? `, ${inProgress} in progress` : ""}.`
            : "Browse products and track your orders here."}
        </p>
      </header>

      <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <Link href="/dashboard/orders" className="p-4 transition hover:bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">{total}</p>
          <p className="mt-0.5 text-xs text-gray-500">Orders</p>
        </Link>
        <Link href="/dashboard/orders" className="border-l border-gray-100 p-4 transition hover:bg-gray-50">
          <p className="text-2xl font-bold text-primary">{inProgress}</p>
          <p className="mt-0.5 text-xs text-gray-500">In progress</p>
        </Link>
        <Link href="/dashboard/reviews" className="border-l border-gray-100 p-4 transition hover:bg-gray-50">
          <p className="text-2xl font-bold text-gray-900">
            {orders?.filter((o) => o.order_status === "delivered").length || 0}
          </p>
          <p className="mt-0.5 text-xs text-gray-500">Delivered</p>
        </Link>
      </div>

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
          {total > 0 && (
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-0.5 text-sm font-medium text-primary hover:text-primary-hover"
            >
              View all <ChevronRight size={16} aria-hidden="true" />
            </Link>
          )}
        </div>

        {recentOrders.length > 0 ? (
          <div className="mt-3 divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3 transition hover:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge variant={statusLabels[order.order_status]?.variant || "info"}>
                    {statusLabels[order.order_status]?.label || order.order_status}
                  </Badge>
                  <span className="text-sm font-semibold text-gray-900">
                    ₦{order.total_amount.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-3 flex flex-col items-center gap-4 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-10 text-center">
            <Package size={32} className="text-gray-300" aria-hidden="true" />
            <div>
              <p className="font-medium text-gray-900">No orders yet</p>
              <p className="mt-1 text-sm text-gray-500">Your orders will appear here once you make a purchase.</p>
            </div>
            <Link
              href="/"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover"
            >
              Browse Products
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
