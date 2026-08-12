"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Eye } from "lucide-react";
import { useSellerOrders, useUpdateSellerOrderStatus } from "@/hooks/use-seller";
import { toast } from "sonner";
import type { Order, OrderStatus } from "@/types";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  payment_confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  ready_for_delivery: "bg-cyan-100 text-cyan-800",
  out_for_delivery: "bg-indigo-100 text-indigo-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: ["processing", "cancelled"],
  payment_confirmed: ["processing", "cancelled"],
  processing: ["ready_for_delivery", "cancelled"],
  ready_for_delivery: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export default function SellerOrdersPage() {
  const { data: orders, isLoading } = useSellerOrders();
  const updateStatus = useUpdateSellerOrderStatus();
  const [viewing, setViewing] = useState<Order | null>(null);

  const handleStatusChange = (order: Order, status: OrderStatus) => {
    updateStatus.mutate(
      { id: order.id, order_status: status },
      {
        onSuccess: () => toast.success(`Order marked as ${status.replace(/_/g, " ")}`),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
      <p className="mt-1 text-sm text-gray-500">Orders containing your products.</p>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="overflow-hidden rounded-xl border">
            <div className="divide-y divide-gray-100">
              {orders.map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4">
                  <div>
                    <p className="font-medium text-gray-900">#{order.order_number}</p>
                    <p className="text-sm text-gray-500">
                      {order.customer_name} · {order.customer_phone} · ₦{order.total_amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {order.items?.length} item(s) · {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={statusStyles[order.order_status]}>
                      {order.order_status.replace(/_/g, " ")}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => setViewing(order)}>
                      <Eye size={14} /> View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-gray-500">No orders yet. Once customers buy your products, orders will appear here.</p>
          </div>
        )}
      </div>

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing ? `Order #${viewing.order_number}` : "Order"}>
        {viewing && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase text-gray-500">Customer</p>
                <p className="font-medium text-gray-900">{viewing.customer_name}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{viewing.customer_phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{viewing.customer_email}</p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">Delivery Location</p>
                <p className="font-medium text-gray-900">{viewing.delivery_location?.name || "—"}</p>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <p className="text-xs uppercase text-gray-500 mb-2">Items</p>
              <div className="space-y-2">
                {viewing.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product?.name || "Product"} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900">₦{item.subtotal.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4">
              <div>
                <p className="text-xs uppercase text-gray-500">Status</p>
                <Badge className={`mt-1 ${statusStyles[viewing.order_status]}`}>
                  {viewing.order_status.replace(/_/g, " ")}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-gray-500">Total</p>
                <p className="text-xl font-bold text-gray-900">₦{viewing.total_amount.toLocaleString()}</p>
              </div>
            </div>

            {allowedTransitions[viewing.order_status]?.length > 0 && (
              <div className="border-t pt-4">
                <p className="text-xs uppercase text-gray-500 mb-2">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {allowedTransitions[viewing.order_status].map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant="outline"
                      disabled={updateStatus.isPending}
                      loading={updateStatus.isPending && updateStatus.variables?.order_status === status}
                      onClick={() => handleStatusChange(viewing, status)}
                    >
                      {status.replace(/_/g, " ")}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}