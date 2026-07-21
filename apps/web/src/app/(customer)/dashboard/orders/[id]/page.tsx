"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderTimeline } from "@/components/shared/order-timeline";
import { useOrder } from "@/hooks/use-orders";

const statusLabels: Record<string, { label: string; variant: "info" | "success" | "warning" | "error" }> = {
  pending: { label: "Pending", variant: "warning" },
  payment_confirmed: { label: "Payment Confirmed", variant: "info" },
  processing: { label: "Processing", variant: "info" },
  ready_for_delivery: { label: "Ready for Delivery", variant: "info" },
  out_for_delivery: { label: "Out for Delivery", variant: "info" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-6 w-32" />
        <div className="mt-4 space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/dashboard/orders"><Button className="mt-4">Back to Orders</Button></Link>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/orders"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Orders
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
        <Badge variant={statusLabels[order.order_status]?.variant || "info"}>
          {statusLabels[order.order_status]?.label || order.order_status}
        </Badge>
      </div>

      <OrderTimeline currentStatus={order.order_status} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-gray-900">Order Items</h2>
          <div className="mt-4 space-y-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 rounded bg-gray-100" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.product?.name || "Product"}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} x ₦{item.unit_price.toLocaleString()}</p>
                </div>
                <p className="text-sm font-medium">₦{item.subtotal.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="font-semibold text-gray-900">Order Summary</h2>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>₦{order.delivery_fee.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₦{order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {order.delivery_location && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">Delivery</h2>
              <p className="mt-2 text-sm text-gray-600">{order.delivery_location.name}</p>
            </div>
          )}

          {order.payment && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h2 className="font-semibold text-gray-900">Payment</h2>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Bank</span>
                  <span>{order.payment.bank_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Account</span>
                  <span className="font-mono">{order.payment.virtual_account_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Badge variant={order.payment.payment_status === "paid" ? "success" : "warning"}>
                    {order.payment.payment_status}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
