"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Order Placed!</h1>
      <p className="mt-2 text-gray-500">Thank you for your order.</p>

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
            <span className="text-sm text-gray-500">Status</span>
            <span className="capitalize">{order.order_status.replace(/_/g, " ")}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-primary/5 p-6 text-left">
        <h2 className="font-semibold text-gray-900">Payment Instructions</h2>
        <p className="mt-2 text-sm text-gray-600">
          Make a bank transfer to the dynamic account generated for your order.
          Your order will be processed once payment is confirmed.
        </p>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Amount</span>
            <span className="font-semibold">₦{order.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Link href={`/track?order_number=${order.order_number}&phone=${order.customer_phone}`}>
          <Button size="lg" className="w-full">Track Order</Button>
        </Link>
        <Link href="/products">
          <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
