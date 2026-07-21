"use client";

import { use } from "react";
import Link from "next/link";
import { CheckCircle, Copy, Clock, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrder } from "@/hooks/use-orders";
import { usePaymentStatus } from "@/hooks/use-payments";
import { toast } from "sonner";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: order, isLoading } = useOrder(id);
  const { data: paymentStatus } = usePaymentStatus(id);

  const isPaid = paymentStatus?.payment_status === "paid" || order?.payment_status === "paid";
  const payment = paymentStatus?.payment || order?.payment;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

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
            <span className="text-sm text-gray-500">Payment Status</span>
            <Badge variant={isPaid ? "success" : "warning"}>
              {isPaid ? "Paid" : "Awaiting Payment"}
            </Badge>
          </div>
        </div>
      </div>

      {payment?.virtual_account_number ? (
        <div className="mt-6 rounded-lg border border-primary/20 bg-primary/5 p-6 text-left">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <Building2 size={18} className="text-primary" />
            Bank Transfer Details
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Transfer the exact amount to the account below. Your order will be processed once payment is confirmed.
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs text-gray-500">Bank</p>
              <p className="font-semibold text-gray-900">{payment.bank_name}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs text-gray-500">Account Number</p>
              <div className="flex items-center justify-between">
                <p className="font-mono text-lg font-bold text-gray-900">{payment.virtual_account_number}</p>
                <button
                  onClick={() => copyToClipboard(payment.virtual_account_number || "")}
                  className="rounded p-1 text-gray-400 hover:text-primary"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs text-gray-500">Account Name</p>
              <p className="font-semibold text-gray-900">{payment.account_name}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs text-gray-500">Amount</p>
              <p className="font-bold text-primary">₦{order.total_amount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <p className="text-xs text-gray-500">Reference</p>
              <p className="font-mono text-sm text-gray-600">{payment.flutterwave_reference}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-6 text-left">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <CreditCard size={18} />
            Payment Instructions
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Make a bank transfer of <strong>₦{order.total_amount.toLocaleString()}</strong> to the store&apos;s account.
            Your order will be processed once payment is confirmed.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            Order reference: <span className="font-mono">{order.order_number}</span>
          </p>
        </div>
      )}

      {!isPaid && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock size={16} className="animate-pulse" />
          Waiting for payment confirmation...
        </div>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {isPaid ? (
          <Link href={`/dashboard/orders/${order.id}`}>
            <Button size="lg" className="w-full">View Order Details</Button>
          </Link>
        ) : (
          <Link href={`/track?order_number=${order.order_number}&phone=${order.customer_phone}`}>
            <Button size="lg" className="w-full" variant="outline">Track Order</Button>
          </Link>
        )}
        <Link href="/products">
          <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
}
