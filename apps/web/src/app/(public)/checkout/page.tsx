"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useDeliveryLocations } from "@/hooks/use-delivery";
import { useCheckout, useBuyNow } from "@/hooks/use-orders";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

const CHECKOUT_DRAFT_KEY = "checkout_draft";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, profile } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: locations } = useDeliveryLocations();
  const checkout = useCheckout();
  const buyNow = useBuyNow();

  const isBuyNow = searchParams.has("buy_now");
  const buyNowProductId = searchParams.get("buy_now") || "";
  const buyNowQty = parseInt(searchParams.get("qty") || "1");
  const buyNowPrice = parseFloat(searchParams.get("price") || "0");

  const [name, setName] = useState(profile?.full_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [phone, setPhone] = useState(profile?.phone_number || "");
  const [locationId, setLocationId] = useState("");
  const [notes, setNotes] = useState("");
  const [hasDraft, setHasDraft] = useState(false);
  const redirecting = useRef(false);

  const restoreDraft = useCallback(() => {
    try {
      const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
      if (!raw) return false;
      const draft = JSON.parse(raw);
      setName(draft.name || "");
      setEmail(draft.email || "");
      setPhone(draft.phone || "");
      setLocationId(draft.location_id || "");
      setNotes(draft.notes || "");
      sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
      setHasDraft(true);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (profile && !restoreDraft()) {
      setName(profile.full_name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone_number || "");
    }
  }, [profile, restoreDraft]);

  useEffect(() => {
    if (!isBuyNow && !cartLoading && !cart?.items.length && !hasDraft && !redirecting.current) {
      redirecting.current = true;
      router.push("/cart");
    }
  }, [isBuyNow, cartLoading, cart, hasDraft, router]);

  const selectedLocation = locations?.find((l) => l.id === locationId);
  const cartTotal = isBuyNow ? buyNowPrice * buyNowQty : (cart?.total || 0);
  const deliveryFee = selectedLocation?.delivery_fee || 0;
  const total = cartTotal + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId) {
      toast.error("Please select a delivery location");
      return;
    }

    const commonData = {
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      delivery_location_id: locationId,
      notes: notes || undefined,
    };

    const mutation = isBuyNow
      ? buyNow.mutateAsync({ ...commonData, product_id: buyNowProductId, quantity: buyNowQty })
      : checkout.mutateAsync(commonData);

    try {
      sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify({
        name, email, phone, location_id: locationId, notes,
        ...(isBuyNow ? { buy_now: buyNowProductId, qty: buyNowQty, price: buyNowPrice } : {}),
      }));
      const result = await mutation;
      const from = isBuyNow ? "product" : "cart";
      redirecting.current = true;
      const paymentParams = new URLSearchParams({ from });
      if (isBuyNow) {
        paymentParams.set("buy_now", buyNowProductId);
        paymentParams.set("qty", String(buyNowQty));
        paymentParams.set("price", String(buyNowPrice));
      }
      router.push(`/payment/${result.payment.reference}?${paymentParams}`);
      toast.success("Proceed to payment!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    }
  };

  if (cartLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (!isBuyNow && !hasDraft && !cart?.items.length && redirecting.current) {
    return null;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            <div className="mt-4 space-y-4">
              <Input
                id="name"
                label="Full Name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                id="phone"
                label="Phone Number"
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <div>
                <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1.5 h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Any special instructions?"
                />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">Delivery Location</h2>
            <div className="mt-4">
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                required
              >
                <option value="">Select a location...</option>
                {locations?.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} (₦{loc.delivery_fee.toLocaleString()} — {loc.estimated_delivery_days} day{loc.estimated_delivery_days !== 1 ? "s" : ""})
                  </option>
                ))}
              </select>
              {selectedLocation && (
                <p className="mt-2 text-sm text-gray-500">
                  Estimated delivery: {selectedLocation.estimated_delivery_days} day{selectedLocation.estimated_delivery_days !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="mt-4 space-y-3 text-sm">
              {!isBuyNow ? (
                cart?.items.map((item) => (
                  <div key={item.product_id} className="flex items-start justify-between gap-4 text-gray-500">
                    <span className="leading-5">{item.product.name}</span>
                    <span className="shrink-0 text-right">
                      <span className="block">₦{item.subtotal.toLocaleString()}</span>
                      <span className="block text-xs text-gray-400">qty: {item.quantity}</span>
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-start justify-between gap-4 text-gray-500">
                  <span className="leading-5">Product</span>
                  <span className="shrink-0 text-right">
                    <span className="block">₦{cartTotal.toLocaleString()}</span>
                    <span className="block text-xs text-gray-400">qty: {buyNowQty}</span>
                  </span>
                </div>
              )}
              <hr className="my-2" />
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₦{cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>₦{deliveryFee.toLocaleString()}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">₦{total.toLocaleString()}</span>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="mt-4 w-full"
              disabled={checkout.isPending || buyNow.isPending}
            >
              {checkout.isPending || buyNow.isPending ? "Placing Order..." : "Place Order"}
            </Button>
            <p className="mt-3 text-center text-xs text-gray-400">
              Secure payment via Flutterwave bank transfer
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-8"><Skeleton className="h-96 w-full rounded-lg" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
