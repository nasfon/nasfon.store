"use client";

import { Suspense, useState, useMemo } from "react";
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

function initFormState(profile: { full_name?: string | null; email?: string | null; phone_number?: string | null } | null | undefined) {
  try {
    const raw = sessionStorage.getItem(CHECKOUT_DRAFT_KEY);
    if (raw) {
      const draft = JSON.parse(raw);
      sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
      return {
        name: draft.name || profile?.full_name || "",
        email: draft.email || profile?.email || "",
        phone: draft.phone || profile?.phone_number || "",
        locationId: draft.location_id || "",
        notes: draft.notes || "",
        hasDraft: true,
      };
    }
  } catch {}
  return {
    name: profile?.full_name || "",
    email: profile?.email || "",
    phone: profile?.phone_number || "",
    locationId: "",
    notes: "",
    hasDraft: false,
  };
}

function CheckoutForm({ cart, locations, isBuyNow, buyNowProductId, buyNowQty, buyNowPrice, profile }: {
  cart: ReturnType<typeof useCart>["data"];
  locations: ReturnType<typeof useDeliveryLocations>["data"];
  isBuyNow: boolean; buyNowProductId: string; buyNowQty: number; buyNowPrice: number;
  profile: ReturnType<typeof useAuth>["profile"];
}) {
  const router = useRouter();
  const checkout = useCheckout();
  const buyNow = useBuyNow();

  const initial = useMemo(() => initFormState(profile), [profile]);
  const [name, setName] = useState(initial.name);
  const [email, setEmail] = useState(initial.email);
  const [phone, setPhone] = useState(initial.phone);
  const [locationId, setLocationId] = useState(initial.locationId);
  const [notes, setNotes] = useState(initial.notes);
  const [hasDraft] = useState(initial.hasDraft);
  const [redirected, setRedirected] = useState(false);

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
      setRedirected(true);
      const paymentUrl = result.payment.payment_url;
      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        router.push(`/payment/${result.payment.reference}`);
      }
      toast.success("Redirecting to payment...");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Checkout failed");
    }
  };

  if (!isBuyNow && !hasDraft && !cart?.items.length && !redirected) {
    setRedirected(true);
    router.push("/cart");
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
              You&apos;ll be redirected to Paystack to complete your payment securely.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const { profile } = useAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const { data: locations } = useDeliveryLocations();

  const isBuyNow = searchParams.has("buy_now");
  const buyNowProductId = searchParams.get("buy_now") || "";
  const buyNowQty = parseInt(searchParams.get("qty") || "1");
  const buyNowPrice = parseFloat(searchParams.get("price") || "0");

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

  return (
    <CheckoutForm
      cart={cart}
      locations={locations}
      isBuyNow={isBuyNow}
      buyNowProductId={buyNowProductId}
      buyNowQty={buyNowQty}
      buyNowPrice={buyNowPrice}
      profile={profile}
    />
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-3xl px-4 py-8"><Skeleton className="h-96 w-full rounded-lg" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
