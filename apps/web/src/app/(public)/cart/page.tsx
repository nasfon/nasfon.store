import Link from "next/link";
import { ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

export default function CartPage() {
  const isEmpty = true;

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          icon={<ShoppingCart size={48} />}
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

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
      <div className="mt-6 space-y-4">
        <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="h-20 w-20 shrink-0 rounded-md bg-gray-100" />
          <div className="flex-1">
            <h3 className="font-medium text-gray-900">Product Name</h3>
            <p className="text-sm text-gray-500">₦0</p>
            <div className="mt-2 flex items-center gap-2">
              <button className="flex h-8 w-8 items-center justify-center rounded border text-gray-500 hover:bg-gray-50">-</button>
              <span className="w-8 text-center text-sm font-medium">1</span>
              <button className="flex h-8 w-8 items-center justify-center rounded border text-gray-500 hover:bg-gray-50">+</button>
            </div>
          </div>
          <button className="shrink-0 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-error">
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-medium">₦0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Delivery</span>
            <span className="font-medium">Calculated at checkout</span>
          </div>
          <hr className="my-2" />
          <div className="flex justify-between text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary">₦0</span>
          </div>
        </div>
        <Link href="/checkout">
          <Button size="lg" className="mt-4 w-full">Proceed to Checkout</Button>
        </Link>
        <Link href="/products" className="mt-3 flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft size={16} />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
