import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">Customer Information</h2>
            <div className="mt-4 space-y-4">
              <Input id="name" label="Full Name" placeholder="Enter your full name" />
              <Input id="email" label="Email" type="email" placeholder="Enter your email" />
              <Input id="phone" label="Phone Number" type="tel" placeholder="Enter your phone number" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">Delivery Location</h2>
            <div className="mt-4">
              <Select id="location" label="Select delivery location" placeholder="Choose a location..." options={[]} />
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₦0</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Delivery Fee</span>
                <span>₦0</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-base">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-primary">₦0</span>
              </div>
            </div>
            <Button size="lg" className="mt-4 w-full">Place Order</Button>
            <p className="mt-3 text-center text-xs text-gray-400">Secure payment via Flutterwave bank transfer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
