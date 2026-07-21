import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OrderTimeline } from "@/components/shared/order-timeline";

export default function TrackOrderPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-center text-2xl font-bold text-gray-900">Track Your Order</h1>
      <p className="mt-2 text-center text-sm text-gray-500">
        Enter your order number and phone number to track your order.
      </p>
      <div className="mt-8 space-y-4">
        <Input id="order-number" label="Order Number" placeholder="e.g. NF-2024-0001" />
        <Input id="phone" label="Phone Number" type="tel" placeholder="Enter phone number used during checkout" />
        <Button size="lg" className="w-full">
          <Search size={18} />
          Track Order
        </Button>
      </div>
      <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="font-semibold text-gray-900">Order #NF-2024-0001</h2>
        <OrderTimeline currentStatus="pending" />
      </div>
    </div>
  );
}
