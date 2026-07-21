"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders?.length) {
    return (
      <EmptyState
        icon={<Package size={48} />}
        title="No orders yet"
        description="When you place an order, it will appear here."
        action={<Link href="/products"><Button>Browse Products</Button></Link>}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      <div className="mt-4 space-y-3">
        {orders.map((order) => (
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
    </div>
  );
}
