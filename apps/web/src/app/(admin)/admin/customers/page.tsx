"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Pagination } from "@/components/ui/pagination";
import { useAdminCustomers, useUpdateCustomer, useDeleteCustomer } from "@/hooks/use-admin";
import { toast } from "sonner";
import { Trash2, Search } from "lucide-react";

const PAGE_SIZE = 10;

export default function AdminCustomersPage() {
  const { data: customers, isLoading } = useAdminCustomers();
  const updateCustomer = useUpdateCustomer();
  const deleteCustomer = useDeleteCustomer();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCustomers = customers?.filter((customer) => {
    if (!normalizedSearch) return true;
    return customer.email.toLowerCase().includes(normalizedSearch);
  });

  const totalPages = Math.max(1, Math.ceil((filteredCustomers?.length || 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCustomers = filteredCustomers?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleActive = (id: string, current: boolean) => {
    updateCustomer.mutate({ id, is_active: !current }, {
      onSuccess: () => toast.success("Customer updated"),
      onError: (err) => toast.error(err.message),
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (!window.confirm(`Delete customer "${name}"? This action cannot be undone.`)) return;
    deleteCustomer.mutate(id, {
      onSuccess: () => toast.success("Customer deleted"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Customers</h1>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search customers by email..."
          aria-label="Search customers by email"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={7} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
              ))
            ) : customers?.length ? (
              pagedCustomers?.map((customer) => (
                <tr key={customer.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{customer.full_name}</td>
                  <td className="px-4 py-3 text-gray-500">{customer.email}</td>
                  <td className="px-4 py-3 text-gray-500">{customer.phone_number || "—"}</td>
                  <td className="px-4 py-3"><Badge variant={customer.role === "admin" ? "primary" : "info"}>{customer.role}</Badge></td>
                  <td className="px-4 py-3">
                    <Badge variant={customer.is_active ? "success" : "error"}>{customer.is_active ? "Active" : "Suspended"}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(customer.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {customer.is_active ? (
                        <button
                          onClick={() => toggleActive(customer.id, customer.is_active)}
                          className="rounded bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700 hover:bg-yellow-100"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleActive(customer.id, customer.is_active)}
                          className="rounded bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(customer.id, customer.full_name)}
                        className="rounded bg-red-50 p-1.5 text-red-600 hover:bg-red-100"
                        title="Delete customer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                {customers?.length ? "No customers match your search." : "No customers yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredCustomers?.length || 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
