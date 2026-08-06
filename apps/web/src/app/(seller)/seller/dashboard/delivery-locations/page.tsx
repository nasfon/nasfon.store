"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import {
  useSellerDeliveryLocations,
  useCreateSellerDeliveryLocation,
  useUpdateSellerDeliveryLocation,
  useDeleteSellerDeliveryLocation,
} from "@/hooks/use-seller";
import { toast } from "sonner";
import type { DeliveryLocation } from "@/types";

export default function SellerDeliveryLocationsPage() {
  const { data: locations, isLoading } = useSellerDeliveryLocations();
  const createLocation = useCreateSellerDeliveryLocation();
  const updateLocation = useUpdateSellerDeliveryLocation();
  const deleteLocation = useDeleteSellerDeliveryLocation();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<DeliveryLocation | null>(null);
  const [form, setForm] = useState({ name: "", delivery_fee: "", estimated_delivery_days: "" });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", delivery_fee: "", estimated_delivery_days: "" });
    setShowModal(true);
  };

  const openEdit = (loc: DeliveryLocation) => {
    setEditing(loc);
    setForm({
      name: loc.name,
      delivery_fee: loc.delivery_fee.toString(),
      estimated_delivery_days: loc.estimated_delivery_days.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      delivery_fee: parseFloat(form.delivery_fee) || 0,
      estimated_delivery_days: parseInt(form.estimated_delivery_days) || 1,
    };

    if (editing) {
      updateLocation.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => { toast.success("Delivery location updated"); setShowModal(false); },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      createLocation.mutate(payload, {
        onSuccess: () => { toast.success("Delivery location created"); setShowModal(false); },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this delivery location?")) return;
    deleteLocation.mutate(id, {
      onSuccess: () => toast.success("Delivery location deleted"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Locations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set your own delivery locations and fees. Customers will choose from these at checkout.
          </p>
        </div>
        <Button onClick={openCreate}><Plus size={18} />Add Location</Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : locations && locations.length > 0 ? (
          <div className="overflow-hidden rounded-xl border">
            <div className="divide-y divide-gray-100">
              {locations.map((loc) => (
                <div key={loc.id} className="flex items-center justify-between bg-white px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                      <MapPin size={18} className="text-gray-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{loc.name}</p>
                      <p className="text-sm text-gray-500">
                        ₦{loc.delivery_fee.toLocaleString()} · {loc.estimated_delivery_days} day(s)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge>{loc.is_active ? "Active" : "Disabled"}</Badge>
                    <Button variant="outline" size="sm" onClick={() => openEdit(loc)}>
                      <Pencil size={14} /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-error" onClick={() => handleDelete(loc.id)}>
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-gray-500">No delivery locations yet. Add your first delivery location.</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Delivery Location" : "Add Delivery Location"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Location Name"
            placeholder="e.g. Lagos Island"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            id="delivery_fee"
            label="Delivery Fee (₦)"
            type="number"
            min={0}
            value={form.delivery_fee}
            onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })}
            required
          />
          <Input
            id="estimated_delivery_days"
            label="Estimated Delivery (Days)"
            type="number"
            min={1}
            value={form.estimated_delivery_days}
            onChange={(e) => setForm({ ...form, estimated_delivery_days: e.target.value })}
            required
          />
          <Button type="submit" className="w-full" disabled={createLocation.isPending || updateLocation.isPending}>
            {createLocation.isPending || updateLocation.isPending ? "Saving..." : editing ? "Update Location" : "Create Location"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}