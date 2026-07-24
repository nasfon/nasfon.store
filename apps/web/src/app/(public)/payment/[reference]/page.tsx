"use client";

import { Suspense, use, useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Copy, Building2, Clock, CreditCard, CheckCircle, TimerOff, X, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { usePaymentByReference, useExpirePayment } from "@/hooks/use-payments";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function PaymentContent({
  params: { reference },
}: {
  params: { reference: string };
}) {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "cart";
  const buyNowProductId = searchParams.get("buy_now") || "";
  const buyNowQty = searchParams.get("qty") || "1";
  const buyNowPrice = searchParams.get("price") || "0";
  const queryClient = useQueryClient();

  const { data, isLoading } = usePaymentByReference(reference);
  const expireMutation = useExpirePayment();

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [expired, setExpired] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [verifying, setVerifying] = useState(false);

  const expiresAt = data?.payment?.webhook_payload?.expires_at as string | undefined;
  const expiredRef = useRef(false);

  useEffect(() => {
    if (!expiresAt) return;
    const target = new Date(expiresAt).getTime();

    const tick = () => {
      const remaining = Math.max(0, Math.floor((target - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        setExpired(true);
        expireMutation.mutate(reference);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, reference, expireMutation]);

  const payment = data?.payment;
  const order = data?.order;
  const isPaid = data?.payment_status === "paid";
  const isExpired = data?.payment_status === "expired" || expired;
  const amountMismatch = data?.amount_mismatch === true;

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  }, []);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-8 w-64" />
        <Skeleton className="mx-auto mt-2 h-4 w-48" />
      </div>
    );
  }

  if (order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <CheckCircle size={56} className="mx-auto text-success" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Confirmed!</h1>
        <p className="mt-2 text-gray-500">Your order has been placed.</p>
        <div className="mt-8 space-y-3">
          <Link href={`/order/confirmation/${order.id}`}>
            <Button size="lg" className="w-full">View Order Details</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isExpired) {
    const checkoutUrl = from === "product" && buyNowProductId
      ? `/checkout?buy_now=${buyNowProductId}&qty=${buyNowQty}&price=${buyNowPrice}`
      : "/checkout";
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <TimerOff size={56} className="mx-auto text-error" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Expired</h1>
        <p className="mt-2 text-gray-500">
          The payment window has closed. Please start a new checkout to try again.
        </p>
        <div className="mt-8 space-y-3">
          <Link href={checkoutUrl}>
            <Button size="lg" className="w-full">Checkout Again</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (amountMismatch) {
    const expected = data?.payment?.webhook_payload?.expected_amount as number | undefined;
    const actual = data?.payment?.webhook_payload?.actual_amount as number | undefined;
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <HelpCircle size={56} className="mx-auto text-warning" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Amount Mismatch</h1>
        <p className="mt-2 text-gray-500">
          You transferred <strong>₦{(actual || 0).toLocaleString()}</strong> but the expected amount was <strong>₦{(expected || 0).toLocaleString()}</strong>.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Your payment was received but the amount does not match your order. Our team will review this and contact you shortly.
        </p>
        <div className="mt-8 space-y-3">
          <Link href="/">
            <Button size="lg" className="w-full">Go Home</Button>
          </Link>
          <p className="text-xs text-gray-400">
            For urgent assistance, please contact support.
          </p>
        </div>
      </div>
    );
  }

  const handleCancel = () => {
    expiredRef.current = true;
    expireMutation.mutate(reference, {
      onSuccess: () => {
        setExpired(true);
        queryClient.invalidateQueries({ queryKey: ["payment-reference", reference] });
        toast.success("Payment cancelled");
      },
      onError: (err) => toast.error(err.message),
    });
    setShowCancelModal(false);
  };

  const handleVerifyPayment = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/v1/payments/${reference}`);
      const json = await res.json();
      if (json.success && json.data?.status === "successful") {
        queryClient.invalidateQueries({ queryKey: ["payment-reference", reference] });
        toast.success("Payment confirmed!");
      } else {
        setVerifyMessage(
          "We could not confirm your payment yet. It may take a few minutes to process. " +
          "If you have already transferred and this persists, please contact support with your order details."
        );
        setShowVerifyModal(true);
      }
    } catch {
      setVerifyMessage(
        "Unable to verify payment at this time. Please try again in a few minutes. " +
        "If the issue continues, contact support with your order details."
      );
      setShowVerifyModal(true);
    } finally {
      setVerifying(false);
    }
  };

  if (!payment) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <p className="text-gray-500">Payment not found.</p>
        <Link href="/">
          <Button className="mt-4">Go Home</Button>
        </Link>
      </div>
    );
  }

  const timerColor = timeLeft !== null && timeLeft <= 10 ? "text-error" : "text-gray-500";

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <Building2 size={48} className="mx-auto text-primary" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Complete Your Payment</h1>
      <p className="mt-2 text-gray-500">
        Transfer the exact amount to the account below. Your order will be created once payment is confirmed.
      </p>

      {timeLeft !== null && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className={`flex items-center gap-2 text-sm font-semibold ${timerColor}`}>
            <Clock size={16} />
            {timeLeft > 0 ? `${formatTime(timeLeft)} remaining` : "Expired"}
          </div>
          {timeLeft > 0 && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-error"
              title="Cancel payment"
            >
              <X size={16} />
            </button>
          )}
        </div>
      )}

      {payment.virtual_account_number ? (
        <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-6 text-left">
          <div className="space-y-3">
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
              <p className="font-bold text-primary">₦{payment.amount.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-6 text-left">
          <h2 className="flex items-center gap-2 font-semibold text-gray-900">
            <CreditCard size={18} />
            Payment Instructions
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Make a bank transfer of <strong>₦{payment.amount.toLocaleString()}</strong> to the store&apos;s account.
            Your order will be created once payment is confirmed.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-3">
        <Button
          size="lg"
          className="w-full"
          onClick={handleVerifyPayment}
          disabled={verifying}
        >
          {verifying ? "Verifying..." : "I Made the Payment"}
        </Button>
        <Link href="/products">
          <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
        </Link>
      </div>

      <Modal open={showCancelModal} onClose={() => setShowCancelModal(false)} title="Cancel Payment?">
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel this payment? Your order will not be created
          and you will need to start a new checkout if you still want to purchase.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => setShowCancelModal(false)}
          >
            Keep Payment
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleCancel}
            disabled={expireMutation.isPending}
          >
            {expireMutation.isPending ? "Cancelling..." : "Yes, Cancel"}
          </Button>
        </div>
      </Modal>

      <Modal open={showVerifyModal} onClose={() => setShowVerifyModal(false)} title="Payment Not Found">
        <div className="flex flex-col items-center text-center">
          <AlertTriangle size={48} className="text-warning" />
          <p className="mt-4 text-sm text-gray-600">{verifyMessage}</p>
          <Button
            size="lg"
            className="mt-6 w-full"
            onClick={() => setShowVerifyModal(false)}
          >
            Got it
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  return (
    <Suspense fallback={<div className="mx-auto max-w-lg px-4 py-16"><Skeleton className="h-16 w-16 rounded-full mx-auto" /></div>}>
      <PaymentContent params={{ reference }} />
    </Suspense>
  );
}
