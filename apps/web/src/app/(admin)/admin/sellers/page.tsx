"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Eye, Store, MapPin, Phone, Mail, FileText } from "lucide-react";
import { useAdminSellers, useAdminVerifySeller } from "@/hooks/use-seller";
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
  const verifySeller = useAdminVerifySeller();
  const [viewing, setViewing] = useState<Seller | null>(null);

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

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Sellers</h1>
        <div className="flex gap-2">
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
                    <Badge className={statusStyles[seller.verification_status]?.className}>
                      {statusStyles[seller.verification_status]?.label}
                    </Badge>
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
          </div>
        )}
      </Modal>
    </div>
  );
}
