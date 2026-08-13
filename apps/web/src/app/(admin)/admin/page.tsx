import {
  Package, Users, ShoppingBag, AlertTriangle, DollarSign, Clock,
  ArrowUpRight, ShoppingCart, PackageOpen,
} from "lucide-react";
import { getDashboard } from "@/services/admin/dashboard.service";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const statusLabels: Record<string, { label: string; variant: "info" | "success" | "warning" | "error" | "primary" }> = {
  pending: { label: "Pending", variant: "warning" },
  payment_confirmed: { label: "Payment Confirmed", variant: "info" },
  processing: { label: "Processing", variant: "info" },
  ready_for_delivery: { label: "Ready for Delivery", variant: "primary" },
  out_for_delivery: { label: "Out for Delivery", variant: "info" },
  delivered: { label: "Delivered", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
};

const stats = [
  {
    icon: DollarSign, label: "Total Revenue",
    value: (v: number) => `₦${v.toLocaleString()}`,
    tint: "bg-green-50 text-green-600",
  },
  { icon: ShoppingBag, label: "Total Orders", value: (v: number) => v.toLocaleString(), tint: "bg-blue-50 text-blue-600" },
  { icon: Clock, label: "Pending Orders", value: (v: number) => v.toLocaleString(), tint: "bg-amber-50 text-amber-600" },
  { icon: Package, label: "Products", value: (v: number) => v.toLocaleString(), tint: "bg-purple-50 text-purple-600" },
  { icon: Users, label: "Customers", value: (v: number) => v.toLocaleString(), tint: "bg-indigo-50 text-indigo-600" },
  { icon: AlertTriangle, label: "Low Stock", value: (v: number) => v.toLocaleString(), tint: "bg-red-50 text-red-600" },
];

export default async function AdminDashboard() {
  const data = await getDashboard();

  const statValues: Record<string, number> = {
    "Total Revenue": data.stats.total_revenue || 0,
    "Total Orders": data.stats.total_orders || 0,
    "Pending Orders": data.stats.pending_orders || 0,
    "Products": data.stats.total_products || 0,
    "Customers": data.stats.total_customers || 0,
    "Low Stock": data.low_stock_products?.length || 0,
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            A quick overview of your store&apos;s performance.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-hover"
        >
          Manage orders <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((item) => {
          const Icon = item.icon;
          const value = statValues[item.label];
          return (
            <div
              key={item.label}
              className="group rounded-2xl border border-gray-200/70 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.tint}`}>
                <Icon size={20} aria-hidden="true" />
              </div>
              <p className="mt-4 text-2xl font-bold tracking-tight text-gray-900">{item.value(value)}</p>
              <p className="mt-0.5 text-[13px] text-gray-500">{item.label}</p>
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className="xl:col-span-2 overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-gray-400" aria-hidden="true" />
              <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            </div>
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-primary hover:text-primary-hover"
            >
              View all
            </Link>
          </div>

          {data.recent_orders?.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50/70 text-left text-xs uppercase tracking-wide text-gray-500">
                    <th className="px-5 py-2.5 font-medium">Order</th>
                    <th className="px-5 py-2.5 font-medium">Customer</th>
                    <th className="px-5 py-2.5 font-medium">Total</th>
                    <th className="px-5 py-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.recent_orders.map((order: {
                    id: string; order_number: string; customer_name: string;
                    total_amount: number; order_status: string; created_at: string;
                  }) => {
                    const status = statusLabels[order.order_status] || { label: order.order_status, variant: "info" as const };
                    return (
                      <tr key={order.id} className="transition-colors hover:bg-gray-50">
                        <td className="px-5 py-3">
                          <p className="font-mono font-medium text-gray-900">{order.order_number}</p>
                          <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-700">{order.customer_name}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900">₦{order.total_amount.toLocaleString()}</td>
                        <td className="px-5 py-3">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
              <PackageOpen size={36} className="text-gray-300" aria-hidden="true" />
              <p className="text-sm text-gray-500">No orders yet.</p>
            </div>
          )}
        </section>

        <section className="space-y-6">
          {data.low_stock_products?.length ? (
            <div className="overflow-hidden rounded-2xl border border-amber-200/70 bg-amber-50/60 shadow-sm">
              <div className="flex items-center justify-between border-b border-amber-200/70 px-5 py-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-amber-600" aria-hidden="true" />
                  <h2 className="font-semibold text-amber-900">Low Stock Alert</h2>
                </div>
                <Link
                  href="/admin/products"
                  className="text-sm font-medium text-amber-700 hover:text-amber-900"
                >
                  View products
                </Link>
              </div>
              <ul className="divide-y divide-amber-200/40">
                {data.low_stock_products.map((p: { id: string; name: string; sku: string; stock_quantity: number }) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-amber-700/70">{p.sku}</p>
                    </div>
                    <span
                      className={`shrink-0 rounded-lg px-2 py-1 text-xs font-semibold ${
                        p.stock_quantity < 5 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {p.stock_quantity} left
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Package size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Inventory looking good</p>
                <p className="text-xs text-gray-500">No low stock items right now.</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-2xl border border-gray-200/70 bg-white px-5 py-4 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShoppingBag size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Average Order Value</p>
              <p className="text-xs text-gray-500">
                ₦
                {data.stats.total_orders
                  ? Math.round((data.stats.total_revenue || 0) / data.stats.total_orders).toLocaleString()
                  : 0}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}