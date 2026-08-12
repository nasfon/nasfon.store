"use client";

import { use, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, TimerOff, AlertTriangle, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { DotsLoader } from "@/components/ui/loader";
import { usePaymentByReference } from "@/hooks/use-payments";

function PaymentContent({
  params: { reference },
}: {
  params: { reference: string };
}) {
  const router = useRouter();
  const { data, isLoading } = usePaymentByReference(reference);
  const redirectedRef = useRef(false);

  const payment = data?.payment;
  const order = data?.order;
  const isExpired = data?.payment_status === "expired";
  const amountMismatch = data?.amount_mismatch === true;
  const paymentUrl = (payment?.webhook_payload as { payment_url?: string | null } | undefined)?.payment_url;

  useEffect(() => {
    if (order?.id && !redirectedRef.current) {
      redirectedRef.current = true;
      router.replace("/dashboard/orders");
    }
  }, [order, router]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto mt-4 h-8 w-64" />
        <Skeleton className="mx-auto mt-2 h-4 w-48" />
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <TimerOff size={56} className="mx-auto text-error" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Expired</h1>
        <p className="mt-2 text-gray-500">
          The payment window has closed. Please start a new checkout to try again.
        </p>
        <div className="mt-8 space-y-3">
          <Link href="/checkout">
            <Button size="lg" className="w-full">Checkout Again</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (amountMismatch) {
    const expected = payment?.webhook_payload?.expected_amount as number | undefined;
    const actual = payment?.webhook_payload?.actual_amount as number | undefined;
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <HelpCircle size={56} className="mx-auto text-warning" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Amount Mismatch</h1>
        <p className="mt-2 text-gray-500">
          You paid <strong>₦{(actual || 0).toLocaleString()}</strong> but the expected amount was <strong>₦{(expected || 0).toLocaleString()}</strong>.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Your payment was received but the amount does not match your order. Our team will review this and contact you shortly.
        </p>
        <div className="mt-8 space-y-3">
          <Link href="/">
            <Button size="lg" className="w-full">Go Home</Button>
          </Link>
          <p className="text-xs text-gray-400">For urgent assistance, please contact support.</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <AlertTriangle size={56} className="mx-auto text-warning" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment Not Found</h1>
        <p className="mt-2 text-gray-500">We couldn&apos;t find this payment. It may have already expired.</p>
        <div className="mt-8 space-y-3">
          <Link href="/checkout">
            <Button size="lg" className="w-full">Checkout Again</Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="lg" className="w-full">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <div className="relative mx-auto h-16 w-16">
        <ShieldCheck size={56} className="mx-auto text-primary" />
      </div>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">
        {order ? "Payment Confirmed!" : "Verifying Payment..."}
      </h1>
      <p className="mt-2 text-gray-500">
        {order
          ? "Redirecting you to your order confirmation..."
          : "We&apos;re confirming your payment with Paystack. This usually takes just a few seconds."}
      </p>

      {!order && (
        <>
          <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-500">
            <Spinner size={18} className="text-primary" />
            Confirming payment
          </div>
          <DotsLoader className="mt-4 justify-center" />

          {paymentUrl && (
            <div className="mt-8">
              <p className="text-sm text-gray-500">
                Payment still pending? Continue on Paystack.
              </p>
              <a href={paymentUrl}>
                <Button variant="outline" size="lg" className="mt-2 w-full">
                  Return to Payment
                </Button>
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function PaymentPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = use(params);
  return <PaymentContent params={{ reference }} />;
}
