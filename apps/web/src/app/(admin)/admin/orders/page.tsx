"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { useAdminOrders, useUpdateOrder } from "@/hooks/use-admin";
import { toast } from "sonner";

const statusLabels: Record<string, { label: string; variant: "info" | "success" | "warning" | "error" }> = {
  pending: { label: "Pending", variant: "warning" },
  payment_confirmed: { label: "Payment Confirmed", variant: "info" },
  processing: { label: "Processing", variant: "info" },
  ready_for_delivery: { label: "Ready for Delivery", variant: "info" },
  out_for_delivery: { label: "Out for Delivery", variant: "info" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateOrder = useUpdateOrder();

  const [selectedOrder, setSelectedOrder] = useState<{
    id: string; order_number: string; customer_name: string;
    customer_phone: string; total_amount: number;
    payment_status: string; order_status: string; created_at: string;
  } | null>(null);

  const handleStatusChange = (id: string, status: string) => {
    updateOrder.mutate({ id, order_status: status }, {
      onSuccess: () => toast.success("Order updated"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Orders</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Order #</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
              ))
            ) : orders?.length ? (
              orders.map((order: {
                id: string; order_number: string; customer_name: string;
                customer_phone: string; total_amount: number;
                payment_status: string; order_status: string; created_at: string;
              }) => (
                <tr key={order.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-medium">{order.order_number}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                    <p className="text-xs text-gray-500">{order.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">₦{order.total_amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge variant={order.payment_status === "paid" ? "success" : "warning"}>{order.payment_status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusLabels[order.order_status]?.variant || "info"}>{statusLabels[order.order_status]?.label || order.order_status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" onClick={() => setSelectedOrder(order)}>Update</Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.order_number}`}>
        {selectedOrder && (
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <p><span className="text-gray-500">Customer:</span> {selectedOrder.customer_name} ({selectedOrder.customer_phone})</p>
              <p><span className="text-gray-500">Total:</span> ₦{selectedOrder.total_amount.toLocaleString()}</p>
              <p><span className="text-gray-500">Payment:</span> {selectedOrder.payment_status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Order Status</label>
              <select
                value={selectedOrder.order_status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm"
              >
                {Object.entries(statusLabels).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
            <Button onClick={() => setSelectedOrder(null)}>Close</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
