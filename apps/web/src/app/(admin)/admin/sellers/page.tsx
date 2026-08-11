"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Eye, Store, MapPin, Phone, Mail, FileText, Ban, RotateCcw, Trash2, Plus } from "lucide-react";
import { useAdminSellers, useAdminCreateSeller, useAdminVerifySeller, useAdminSetSellerActive, useAdminDeleteSeller } from "@/hooks/use-seller";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { Seller } from "@/types";

const statusStyles: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800" },
  approved: { label: "Approved", className: "bg-green-100 text-green-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
};

export default function AdminSellersPage() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: sellers, isLoading } = useAdminSellers(statusFilter);
  const createSeller = useAdminCreateSeller();
  const verifySeller = useAdminVerifySeller();
  const setSellerActive = useAdminSetSellerActive();
  const deleteSeller = useAdminDeleteSeller();
  const [viewing, setViewing] = useState<Seller | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    full_name: "", email: "", password: "", phone_number: "",
    shop_name: "", shop_slug: "", shop_address: "",
    contact_phone: "", contact_email: "", support_contact: "", business_description: "",
  });

  const openCreate = () => {
    setForm({
      full_name: "", email: "", password: "", phone_number: "",
      shop_name: "", shop_slug: "", shop_address: "",
      contact_phone: "", contact_email: "", support_contact: "", business_description: "",
    });
    setShowCreate(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createSeller.mutate(form, {
      onSuccess: () => {
        toast.success("Seller created");
        setShowCreate(false);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleVerify = (seller: Seller, status: "approved" | "rejected") => {
    verifySeller.mutate(
      { id: seller.id, status },
      {
        onSuccess: () => {
          toast.success(`Seller ${status}`);
          setViewing(null);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleToggleActive = (seller: Seller) => {
    setSellerActive.mutate(
      { id: seller.id, is_active: !seller.is_active },
      {
        onSuccess: () => {
          toast.success(seller.is_active ? "Seller deactivated" : "Seller activated");
          setViewing(null);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleDelete = (seller: Seller) => {
    if (!confirm(`Delete "${seller.shop_name}"? This permanently removes the seller.`)) return;
    deleteSeller.mutate(seller.id, {
      onSuccess: () => {
        toast.success("Seller deleted");
        setViewing(null);
      },
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sellers</h1>
        <div className="flex gap-2">
          <Button onClick={openCreate}><Plus size={18} />Add Seller</Button>
          {[
            { value: undefined, label: "All" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ].map((f) => (
            <Button
              key={f.label}
              variant={statusFilter === f.value ? "primary" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="mt-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Seller</th>
                <th className="px-4 py-3">Shop</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sellers?.map((seller) => (
                <tr key={seller.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center shrink-0">
                        {seller.shop_logo_url ? (
                          <Image src={seller.shop_logo_url} alt={seller.shop_name} fill className="object-cover" />
                        ) : (
                          <Store size={18} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{seller.shop_name}</p>
                        <p className="text-xs text-gray-500">{seller.user?.full_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1 text-gray-600">
                      <MapPin size={14} className="text-gray-400" /> {seller.shop_address}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1 text-gray-600">
                      <Phone size={14} className="text-gray-400" /> {seller.contact_phone}
                    </p>
                    <p className="flex items-center gap-1 text-gray-600">
                      <Mail size={14} className="text-gray-400" /> {seller.contact_email}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge className={statusStyles[seller.verification_status]?.className}>
                        {statusStyles[seller.verification_status]?.label}
                      </Badge>
                      {!seller.is_active && (
                        <Badge className="bg-gray-100 text-gray-600">Deactivated</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewing(seller)}>
                        <Eye size={14} /> Review
                      </Button>
                      {seller.verification_status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-700"
                            onClick={() => handleVerify(seller, "approved")}
                          >
                            <Check size={14} /> Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-700"
                            onClick={() => handleVerify(seller, "rejected")}
                          >
                            <X size={14} /> Reject
                          </Button>
                        </>
                      )}
                      <Button variant="outline" size="sm" onClick={() => handleToggleActive(seller)}>
                        {seller.is_active ? (
                          <><Ban size={14} /> Deactivate</>
                        ) : (
                          <><RotateCcw size={14} /> Activate</>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-700"
                        onClick={() => handleDelete(seller)}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!sellers || sellers.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-gray-500">
                    No sellers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!viewing} onClose={() => setViewing(null)} title={viewing?.shop_name || "Seller Details"}>
        {viewing && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 rounded-full overflow-hidden bg-gray-100 border flex items-center justify-center shrink-0">
                {viewing.shop_logo_url ? (
                  <Image src={viewing.shop_logo_url} alt={viewing.shop_name} fill className="object-cover" />
                ) : (
                  <Store size={32} className="text-gray-400" />
                )}
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">{viewing.shop_name}</p>
                <Badge className={statusStyles[viewing.verification_status]?.className}>
                  {statusStyles[viewing.verification_status]?.label}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase text-gray-500 mb-1">Shop Address</p>
                <p className="flex items-center gap-1.5 text-gray-700">
                  <MapPin size={14} className="text-gray-400" /> {viewing.shop_address}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-1">Contact Phone</p>
                <p className="flex items-center gap-1.5 text-gray-700">
                  <Phone size={14} className="text-gray-400" /> {viewing.contact_phone}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500 mb-1">Contact Email</p>
                <p className="flex items-center gap-1.5 text-gray-700">
                  <Mail size={14} className="text-gray-400" /> {viewing.contact_email}
                </p>
              </div>
              {viewing.support_contact && (
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-1">Support Contact</p>
                  <p className="text-gray-700">{viewing.support_contact}</p>
                </div>
              )}
            </div>

            {viewing.business_description && (
              <div>
                <p className="text-xs uppercase text-gray-500 mb-1">Business Description</p>
                <p className="text-gray-700">{viewing.business_description}</p>
              </div>
            )}

            <div>
              <p className="text-xs uppercase text-gray-500 mb-2 flex items-center gap-1">
                <FileText size={14} /> Verification Documents
              </p>
              <div className="flex flex-wrap gap-3">
                {viewing.verification_documents?.map((doc: string, idx: number) => (
                  <a
                    key={idx}
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative h-28 w-28 rounded-lg border overflow-hidden hover:opacity-90"
                  >
                    <Image src={doc} alt={`Verification Document ${idx + 1}`} fill className="object-cover" />
                  </a>
                ))}
              </div>
            </div>

            {viewing.verification_status === "pending" && (
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  className="text-red-700"
                  onClick={() => handleVerify(viewing, "rejected")}
                >
                  <X size={16} /> Reject
                </Button>
                <Button
                  className="bg-green-700 hover:bg-green-800"
                  onClick={() => handleVerify(viewing, "approved")}
                >
                  <Check size={16} /> Approve
                </Button>
              </div>
            )}

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                Danger Zone
              </p>
              <div className="mt-3 flex flex-wrap justify-end gap-3">
                <Button
                  variant="outline"
                  className="text-red-700"
                  onClick={() => handleToggleActive(viewing)}
                >
                  {viewing.is_active ? (
                    <><Ban size={16} /> Deactivate Seller</>
                  ) : (
                    <><RotateCcw size={16} /> Activate Seller</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="text-red-700"
                  onClick={() => handleDelete(viewing)}
                >
                  <Trash2 size={16} /> Delete Seller
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Seller"
        description="Create a seller account. The seller will be approved and active immediately."
        size="xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-seller-form" disabled={createSeller.isPending}>
              {createSeller.isPending ? "Creating..." : "Create Seller"}
            </Button>
          </>
        }
      >
        <form id="create-seller-form" onSubmit={handleCreate} className="space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Account Details
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="seller-full-name"
                label="Full Name"
                placeholder="e.g. Jane Doe"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                required
              />
              <Input
                id="seller-email"
                label="Email"
                type="email"
                placeholder="seller@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
              <Input
                id="seller-password"
                label="Password"
                type="password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                minLength={8}
                required
              />
              <Input
                id="seller-phone"
                label="Phone Number (Optional)"
                type="tel"
                placeholder="e.g. 08012345678"
                value={form.phone_number}
                onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              />
            </div>
          </section>

          <section className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Shop Details
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="seller-shop-name"
                label="Shop Name"
                placeholder="e.g. Jane's Boutique"
                value={form.shop_name}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm({
                    ...form,
                    shop_name: val,
                    shop_slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
                  });
                }}
                required
              />
              <Input
                id="seller-shop-slug"
                label="Shop Slug (URL-friendly)"
                placeholder="auto-generated"
                value={form.shop_slug}
                onChange={(e) => setForm({ ...form, shop_slug: e.target.value })}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  id="seller-shop-address"
                  label="Shop Address"
                  placeholder="e.g. 12 Lagos Road, Ikeja, Lagos"
                  value={form.shop_address}
                  onChange={(e) => setForm({ ...form, shop_address: e.target.value })}
                  required
                />
              </div>
              <Input
                id="seller-contact-phone"
                label="Contact Phone"
                type="tel"
                placeholder="e.g. 08012345678"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                required
              />
              <Input
                id="seller-contact-email"
                label="Contact Email"
                type="email"
                placeholder="shop@example.com"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  id="seller-support-contact"
                  label="Support Contact (Optional)"
                  placeholder="WhatsApp or phone for customer support"
                  value={form.support_contact}
                  onChange={(e) => setForm({ ...form, support_contact: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label
                  htmlFor="seller-business-description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Business Description (Optional)
                </label>
                <textarea
                  id="seller-business-description"
                  value={form.business_description}
                  onChange={(e) => setForm({ ...form, business_description: e.target.value })}
                  placeholder="Describe the business, what it sells, and its mission..."
                  className="mt-1.5 h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </section>
        </form>
      </Modal>
    </div>
  );
}
