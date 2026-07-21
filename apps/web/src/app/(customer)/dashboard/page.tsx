import { Package, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function CustomerDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">Welcome back! Here&apos;s your account overview.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Total Orders", value: "0", icon: Package, color: "text-primary" },
          { label: "Pending", value: "0", icon: Clock, color: "text-warning" },
          { label: "Delivered", value: "0", icon: CheckCircle2, color: "text-success" },
          { label: "Cancelled", value: "0", icon: XCircle, color: "text-error" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`rounded-full p-2 ${item.color} bg-gray-100`}>
                  <Icon size={22} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-400">
          No orders yet. Start shopping to see your orders here.
        </div>
      </div>
    </div>
  );
}
