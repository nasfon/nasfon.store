import { Package, Users, ShoppingBag, AlertTriangle, DollarSign, Clock } from "lucide-react";
import { getDashboard } from "@/services/admin/dashboard.service";
import Link from "next/link";

export default async function AdminDashboard() {
  const data = await getDashboard();

  const stats = [
    { icon: DollarSign, label: "Total Revenue", value: `₦${(data.stats.total_revenue || 0).toLocaleString()}`, color: "text-green-600 bg-green-100" },
    { icon: ShoppingBag, label: "Total Orders", value: data.stats.total_orders || 0, color: "text-blue-600 bg-blue-100" },
    { icon: Clock, label: "Pending Orders", value: data.stats.pending_orders || 0, color: "text-yellow-600 bg-yellow-100" },
    { icon: Package, label: "Products", value: data.stats.total_products || 0, color: "text-purple-600 bg-purple-100" },
    { icon: Users, label: "Customers", value: data.stats.total_customers || 0, color: "text-indigo-600 bg-indigo-100" },
    { icon: AlertTriangle, label: "Low Stock Items", value: data.low_stock_products?.length || 0, color: "text-red-600 bg-red-100" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className={`inline-flex rounded-lg p-2 ${item.color}`}>
                <Icon size={20} />
              </div>
              <p className="mt-3 text-xl font-bold text-gray-900">{item.value}</p>
              <p className="text-xs text-gray-500">{item.label}</p>
            </div>
          );
        })}
      </div>

      {data.low_stock_products && data.low_stock_products.length > 0 && (
        <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <h2 className="flex items-center gap-2 font-semibold text-yellow-800">
            <AlertTriangle size={18} />
            Low Stock Alert
          </h2>
          <div className="mt-3 space-y-2">
            {data.low_stock_products.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-yellow-700">{p.name}</span>
                <span className="font-medium text-yellow-800">{p.stock_quantity} left</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        {data.recent_orders && data.recent_orders.length > 0 ? (
          <div className="mt-4 space-y-2">
            {data.recent_orders.map((order: any) => (
              <Link
                key={order.id}
                href={`/admin/orders`}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-300"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                  <p className="text-xs text-gray-500">{order.customer_name}</p>
                </div>
                <span className="text-sm font-medium">₦{order.total_amount.toLocaleString()}</span>
              </Link>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-400">No orders yet.</p>
        )}
      </div>
    </div>
  );
}
