"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/hooks/use-orders";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading } = useOrder(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-8 w-64" />
        <Skeleton className="mx-auto mt-2 h-4 w-48" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500">Order not found.</p>
        <Link href="/">
          <Button className="mt-4">Go Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle size={56} className="mx-auto text-success" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Order Confirmed!</h1>
      <p className="mt-2 text-gray-500">Payment received. Your order is being processed.</p>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6 text-left">
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Order Number</span>
            <span className="font-mono font-medium">{order.order_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="font-bold text-primary">₦{order.total_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Payment Status</span>
            <Badge variant="success">Paid</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Order Status</span>
            <Badge variant="info">Payment Confirmed</Badge>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Link href={`/dashboard/orders/${order.id}`}>
          <Button size="lg" className="w-full">View Order Details</Button>
        </Link>
        <Link href={`/track?order_number=${order.order_number}&phone=${order.customer_phone}`}>
          <Button variant="outline" size="lg" className="w-full">Track Order</Button>
        </Link>
        <Link href="/">
          <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
