import { Badge } from "@/components/ui/badge";

export default function AdminCustomersPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                No customers yet.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
