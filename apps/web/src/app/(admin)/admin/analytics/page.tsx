import { Card, CardContent } from "@/components/ui/card";

export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
      <p className="mt-1 text-sm text-gray-500">Sales data and store performance.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Revenue Overview</h2>
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              Chart will render here
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Popular Products</h2>
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              No data available yet
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Orders Over Time</h2>
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              Chart will render here
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Order Status Breakdown</h2>
            <div className="flex h-48 items-center justify-center text-sm text-gray-400">
              No data available yet
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
