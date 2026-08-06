"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";
import { toast } from "sonner";

export default function SellerApplyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    shop_name: "",
    shop_slug: "",
    shop_address: "",
    contact_phone: "",
    contact_email: "",
    support_contact: "",
    business_description: "",
  });
  const [logoImages, setLogoImages] = useState<{ image_url: string; display_order: number }[]>([]);
  const [cacImages, setCacImages] = useState<{ image_url: string; display_order: number }[]>([]);
  const [govIdImages, setGovIdImages] = useState<{ image_url: string; display_order: number }[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/v1/seller/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({
          ...form,
          shop_logo_url: logoImages[0]?.image_url || "",
          verification_documents: [...cacImages, ...govIdImages].map((img) => img.image_url),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || "Failed to submit seller application");
      }

      toast.success("Seller application submitted successfully!");
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Become a Seller</h1>
      <p className="mt-2 text-gray-600">
        Fill out your shop details and provide verification documents to start selling on NasFon Store.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Input
          id="shop_name"
          label="Shop Name"
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
          id="shop_slug"
          label="Shop Slug (URL-friendly)"
          value={form.shop_slug}
          onChange={(e) => setForm({ ...form, shop_slug: e.target.value })}
          required
        />

        <Input
          id="shop_address"
          label="Shop Address"
          value={form.shop_address}
          onChange={(e) => setForm({ ...form, shop_address: e.target.value })}
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            id="contact_phone"
            label="Contact Phone"
            type="tel"
            value={form.contact_phone}
            onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
            required
          />
          <Input
            id="contact_email"
            label="Contact Email"
            type="email"
            value={form.contact_email}
            onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
            required
          />
        </div>

        <Input
          id="support_contact"
          label="Support Contact (Optional)"
          value={form.support_contact}
          onChange={(e) => setForm({ ...form, support_contact: e.target.value })}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Business Description</label>
          <textarea
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
            rows={4}
            value={form.business_description}
            onChange={(e) => setForm({ ...form, business_description: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Logo / Image (For brand recognition)</label>
          <ImageUpload
            images={logoImages}
            onChange={setLogoImages}
            maxImages={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CAC Certificate</label>
          <ImageUpload
            images={cacImages}
            onChange={setCacImages}
            maxImages={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Government ID</label>
          <ImageUpload
            images={govIdImages}
            onChange={setGovIdImages}
            maxImages={1}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Submitting Application..." : "Submit Seller Application"}
        </Button>
      </form>
    </div>
  );
}
