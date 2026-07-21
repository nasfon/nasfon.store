import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminDeliveryLocationsPage() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Locations</h1>
        <Button><Plus size={18} /> Add Location</Button>
      </div>
      <div className="mt-6 rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Delivery Fee</th>
              <th className="px-4 py-3 font-medium">Est. Days</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                No delivery locations configured. Add locations that customers can select during checkout.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
