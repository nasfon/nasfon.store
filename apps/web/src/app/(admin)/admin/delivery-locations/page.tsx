"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAdminDeliveryLocations, useCreateDeliveryLocation, useUpdateDeliveryLocation, useDeleteDeliveryLocation } from "@/hooks/use-admin";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function AdminDeliveryLocationsPage() {
  const { data: locations, isLoading } = useAdminDeliveryLocations();
  const createLocation = useCreateDeliveryLocation();
  const updateLocation = useUpdateDeliveryLocation();
  const deleteLocation = useDeleteDeliveryLocation();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{
    id: string; name: string; delivery_fee: number;
    estimated_delivery_days: number; is_active: boolean;
  } | null>(null);

  const [form, setForm] = useState({ name: "", delivery_fee: "", estimated_delivery_days: "", is_active: true });

  const normalizedSearch = search.trim().toLowerCase();
  const filteredLocations = locations?.filter((loc) => {
    if (!normalizedSearch) return true;
    return loc.name.toLowerCase().includes(normalizedSearch);
  });

  const totalPages = Math.max(1, Math.ceil((filteredLocations?.length || 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedLocations = filteredLocations?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", delivery_fee: "", estimated_delivery_days: "", is_active: true });
    setShowModal(true);
  };

  const openEdit = (loc: {
    id: string; name: string; delivery_fee: number;
    estimated_delivery_days: number; is_active: boolean;
  }) => {
    setEditing(loc);
    setForm({ name: loc.name, delivery_fee: String(loc.delivery_fee), estimated_delivery_days: String(loc.estimated_delivery_days), is_active: loc.is_active });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, delivery_fee: parseFloat(form.delivery_fee) || 0, estimated_delivery_days: parseInt(form.estimated_delivery_days) || 1 };

    if (editing) {
      updateLocation.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { toast.success("Location updated"); setShowModal(false); },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createLocation.mutate(payload, {
        onSuccess: () => { toast.success("Location created"); setShowModal(false); },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Locations</h1>
        <Button onClick={openCreate}><Plus size={18} />Add Location</Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search by city name..."
          aria-label="Search delivery locations by city name"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Delivery Fee</th>
              <th className="px-4 py-3 font-medium">Est. Days</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
              ))
            ) : locations?.length ? (
              pagedLocations?.map((loc) => (
                <tr key={loc.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{loc.name}</td>
                  <td className="px-4 py-3">₦{loc.delivery_fee.toLocaleString()}</td>
                  <td className="px-4 py-3">{loc.estimated_delivery_days} day(s)</td>
                  <td className="px-4 py-3"><Badge variant={loc.is_active ? "success" : "error"}>{loc.is_active ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(loc)} aria-label={`Edit ${loc.name}`} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil size={16} aria-hidden="true" /></button>
                      <button onClick={() => { if (confirm("Delete?")) deleteLocation.mutate(loc.id, { onSuccess: () => toast.success("Deleted") }); }} aria-label={`Delete ${loc.name}`} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-error"><Trash2 size={16} aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                {locations?.length ? "No locations match your search." : "No locations yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredLocations?.length || 0}
        pageSize={PAGE_SIZE}
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Location" : "Add Location"}
        description={
          editing
            ? "Update the delivery location details below."
            : "Add a delivery location available at checkout."
        }
        size="md"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="location-form"
              loading={createLocation.isPending || updateLocation.isPending}
            >
              {editing ? "Save Changes" : "Add Location"}
            </Button>
          </>
        }
      >
        <form id="location-form" onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Details
            </h3>
            <div className="mt-3">
              <Input
                id="name"
                label="Name"
                placeholder="e.g. Lagos Mainland"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
          </section>

          <section className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Delivery &amp; Pricing
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="fee"
                label="Delivery Fee (₦)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.delivery_fee}
                onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })}
                required
              />
              <Input
                id="days"
                label="Estimated Delivery Days"
                type="number"
                value={form.estimated_delivery_days}
                onChange={(e) => setForm({ ...form, estimated_delivery_days: e.target.value })}
                required
              />
            </div>
          </section>

          <section className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Status
            </h3>
            <div className="mt-3">
              <Switch
                checked={form.is_active}
                onChange={(v) => setForm({ ...form, is_active: v })}
                label="Active"
                description="Offer this location at checkout"
              />
            </div>
          </section>
        </form>
      </Modal>
    </div>
  );
}
