"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useAdminDeliveryLocations, useCreateDeliveryLocation, useUpdateDeliveryLocation, useDeleteDeliveryLocation } from "@/hooks/use-admin";
import { toast } from "sonner";

export default function AdminDeliveryLocationsPage() {
  const { data: locations, isLoading } = useAdminDeliveryLocations();
  const createLocation = useCreateDeliveryLocation();
  const updateLocation = useUpdateDeliveryLocation();
  const deleteLocation = useDeleteDeliveryLocation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: "", delivery_fee: 0, estimated_delivery_days: 1, is_active: true });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", delivery_fee: 0, estimated_delivery_days: 1, is_active: true });
    setShowModal(true);
  };

  const openEdit = (loc: Record<string, unknown>) => {
    setEditing(loc);
    setForm({ name: loc.name, delivery_fee: loc.delivery_fee, estimated_delivery_days: loc.estimated_delivery_days, is_active: loc.is_active });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, delivery_fee: parseFloat(form.delivery_fee.toString()), estimated_delivery_days: parseInt(form.estimated_delivery_days.toString()) };

    if (editing) {
      updateLocation.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { toast.success("Location updated"); setShowModal(false); },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createLocation.mutate(payload as Record<string, unknown>, {
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

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
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
              locations.map((loc) => (
                <tr key={loc.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{loc.name}</td>
                  <td className="px-4 py-3">₦{loc.delivery_fee.toLocaleString()}</td>
                  <td className="px-4 py-3">{loc.estimated_delivery_days} day(s)</td>
                  <td className="px-4 py-3"><Badge variant={loc.is_active ? "success" : "error"}>{loc.is_active ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(loc)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil size={16} /></button>
                      <button onClick={() => { if (confirm("Delete?")) deleteLocation.mutate(loc.id, { onSuccess: () => toast.success("Deleted") }); }} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-error"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">No locations yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Location" : "Add Location"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="name" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input id="fee" label="Delivery Fee (₦)" type="number" step="0.01" value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: parseFloat(e.target.value) || 0 })} required />
          <Input id="days" label="Estimated Delivery Days" type="number" value={form.estimated_delivery_days} onChange={(e) => setForm({ ...form, estimated_delivery_days: parseInt(e.target.value) || 1 })} required />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            Active
          </label>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
