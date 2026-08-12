"use client";

import Link from "next/link";
import { ShoppingCart as CartIcon, Trash2, ArrowLeft, Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart, useCartQuantity, useRemoveCartItem } from "@/hooks/use-cart";
import { toast } from "sonner";

export default function CartPage() {
  const { data: cart, isLoading } = useCart();
  const removeItem = useRemoveCartItem();
  const { setQuantity, syncToServer, cancelPending, pending } = useCartQuantity();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!cart?.items.length) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<CartIcon size={48} />}
          title="Your cart is empty"
          description="Looks like you haven't added anything yet."
          action={
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleQuantityChange = (productId: string, newQty: number) => {
    if (newQty < 1) {
      cancelPending(productId);
      removeItem.mutate(productId, {
        onSuccess: () => toast.success("Item removed"),
        onError: (err) => toast.error(err.message),
      });
      return;
    }
    setQuantity(productId, newQty);
    syncToServer(productId, newQty);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="mt-6 space-y-4">
        {cart.items.map((item) => {
          const isUpdating = removeItem.isPending && removeItem.variables === item.product_id;
          const isSyncing = pending.includes(item.product_id);

          return (
            <div
              key={item.product_id}
              className={`flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-opacity ${
                isUpdating ? "opacity-60" : ""
              }`}
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-gray-100">
                {item.product.featured_image ? (
                  <img
                    src={item.product.featured_image}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-gray-300 text-xs">
                    No image
                  </div>
                )}
              </div>

              <div className="flex-1">
                <Link href={`/products/${item.product.slug}`}>
                  <h3 className="font-medium text-gray-900 hover:text-primary">
                    {item.product.name}
                  </h3>
                </Link>
                <p className="text-sm text-gray-500">
                  ₦{item.product.selling_price.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <button
                    onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                    disabled={item.quantity <= 1 || isUpdating}
                    aria-label={`Decrease quantity of ${item.product.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded border text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Minus size={16} aria-hidden="true" />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock_quantity || isUpdating}
                    aria-label={`Increase quantity of ${item.product.name}`}
                    className="flex h-8 w-8 items-center justify-center rounded border text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <Plus size={16} aria-hidden="true" />
                  </button>
                  {isSyncing && (
                    <span role="status" aria-label="Saving changes" className="flex items-center gap-1 text-xs text-gray-400">
                      <Loader2 size={12} className="animate-spin" aria-hidden="true" />
                      Saving
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ₦{item.subtotal.toLocaleString()}
                </p>
                <button
                  onClick={() => {
                    removeItem.mutate(item.product_id, {
                      onSuccess: () => toast.success("Item removed"),
                      onError: (err) => toast.error(err.message),
                    });
                  }}
                  disabled={isUpdating}
                  aria-label={`Remove ${item.product.name} from cart`}
                  className="mt-2 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-error disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 size={18} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">₦{cart.total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery</span>
            <span className="font-medium">Calculated at checkout</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary">₦{cart.total.toLocaleString()}</span>
          </div>
        </div>

        <Link href="/checkout">
          <Button size="lg" className="mt-4 w-full">
            Proceed to Checkout
          </Button>
        </Link>

        <Link
          href="/products"
          className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
