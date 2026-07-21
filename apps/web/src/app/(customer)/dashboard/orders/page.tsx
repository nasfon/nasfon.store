import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default function OrdersPage() {
  const hasOrders = false;

  if (!hasOrders) {
    return (
      <EmptyState
        icon={<Package size={48} />}
        title="No orders yet"
        description="When you place an order, it will appear here."
        action={<Link href="/products"><Button>Browse Products</Button></Link>}
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
      <div className="mt-4 space-y-3">
        {[].map((order: any) => (
          <Link key={order.id} href={`/dashboard/orders/${order.id}`}>
            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 hover:border-gray-300">
              <div>
                <p className="font-medium text-gray-900">{order.order_number}</p>
                <p className="text-sm text-gray-500">{order.created_at}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="info">{order.order_status}</Badge>
                <span className="font-medium">₦{order.total_amount}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
