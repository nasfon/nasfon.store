"use client";

import { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OrderTimeline } from "@/components/shared/order-timeline";
import { useTrackOrder } from "@/hooks/use-orders";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; variant: "info" | "success" | "warning" | "error" }> = {
  pending: { label: "Pending", variant: "warning" },
  payment_confirmed: { label: "Payment Confirmed", variant: "info" },
  processing: { label: "Processing", variant: "info" },
  ready_for_delivery: { label: "Ready for Delivery", variant: "info" },
  out_for_delivery: { label: "Out for Delivery", variant: "info" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const trackOrder = useTrackOrder();
  const order = trackOrder.data;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackOrder.mutate(
      { order_number: orderNumber, phone_number: phoneNumber },
      { onError: (err) => toast.error(err.message) }
    );
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="text-center">
        <Package size={40} className="mx-auto text-primary" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Track Your Order</h1>
        <p className="mt-2 text-sm text-gray-500">
          Enter your order number and phone number to track your order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <Input
          id="order_number"
          label="Order Number"
          placeholder="e.g. NF-ABC123"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
        />
        <Input
          id="phone_number"
          label="Phone Number"
          type="tel"
          placeholder="Enter the phone number used at checkout"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <Button type="submit" size="lg" className="w-full" loading={trackOrder.isPending}>
          {trackOrder.isPending ? "Searching..." : "Track Order"}
        </Button>
      </form>

      {trackOrder.isError && (
        <div role="alert" className="mt-6 rounded-lg border border-error/20 bg-error/5 p-4 text-center">
          <p className="text-sm text-error">
            {trackOrder.error instanceof Error ? trackOrder.error.message : "Order not found"}
          </p>
        </div>
      )}

      {order && (
        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Order Number</p>
                <p className="font-mono font-medium text-gray-900">{order.order_number}</p>
              </div>
              <Badge variant={statusLabels[order.order_status]?.variant || "info"}>
                {statusLabels[order.order_status]?.label || order.order_status}
              </Badge>
            </div>
          </div>

          <OrderTimeline currentStatus={order.order_status} />

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Order Details</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Items</span>
                <span className="font-medium">{order.items?.length || 0} item(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>₦{order.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee</span>
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
              <h3 className="font-semibold text-gray-900">Delivery</h3>
              <p className="mt-2 text-sm text-gray-600">{order.delivery_location.name}</p>
              {order.delivery_location.estimated_delivery_days && (
                <p className="text-sm text-gray-500">
                  Estimated delivery: {order.delivery_location.estimated_delivery_days} day(s)
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
