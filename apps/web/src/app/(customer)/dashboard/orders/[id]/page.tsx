import { notFound } from "next/navigation";
import { OrderTimeline } from "@/components/shared/order-timeline";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Order #NF-2024-0001</h1>
      <p className="mt-1 text-sm text-gray-500">Placed on July 21, 2026</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Order Status</h2>
              <OrderTimeline currentStatus="pending" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Items</h2>
              <div className="divide-y">
                <div className="flex items-center gap-3 py-3">
                  <div className="h-16 w-16 shrink-0 rounded-md bg-gray-100" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Product Name</p>
                    <p className="text-sm text-gray-500">Qty: 1 × ₦0</p>
                  </div>
                  <span className="font-medium">₦0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Delivery</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Location</span><span>Lagos</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Fee</span><span>₦0</span></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h2 className="font-semibold text-gray-900 mb-3">Payment</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Status</span><Badge variant="warning">Pending</Badge></div>
                <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-primary">₦0</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
