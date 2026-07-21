"use client";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminCustomers, useUpdateCustomer } from "@/hooks/use-admin";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const { data: customers, isLoading } = useAdminCustomers();
  const updateCustomer = useUpdateCustomer();

  const toggleActive = (id: string, current: boolean) => {
    updateCustomer.mutate({ id, is_active: !current }, {
      onSuccess: () => toast.success("Customer updated"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
              ))
            ) : customers?.length ? (
              customers.map((customer) => (
                <tr key={customer.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{customer.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-500">{customer.phone_number || "—"}</td>
                  <td className="px-4 py-3"><Badge variant={customer.role === "admin" ? "primary" : "info"}>{customer.role}</Badge></td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(customer.id, customer.is_active)}>
                      <Badge variant={customer.is_active ? "success" : "error"}>{customer.is_active ? "Active" : "Suspended"}</Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(customer.created_at).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No customers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
