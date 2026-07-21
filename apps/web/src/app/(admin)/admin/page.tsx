import { Package, ShoppingCart, Users, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Store overview and key metrics.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Revenue", value: "₦0", icon: Package, change: "+0%", color: "text-success" },
          { label: "Orders", value: "0", icon: ShoppingCart, change: "+0", color: "text-primary" },
          { label: "Customers", value: "0", icon: Users, change: "+0", color: "text-info" },
          { label: "Low Stock", value: "0", icon: AlertTriangle, change: "needs attention", color: "text-warning" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`rounded-full p-2 ${item.color} bg-gray-100`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-xs text-gray-400">{item.change}</span>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Recent Orders</h2>
            <div className="text-center py-8 text-sm text-gray-400">No recent orders.</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-3">Low Stock Products</h2>
            <div className="text-center py-8 text-sm text-gray-400">All products are well stocked.</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
