"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminSettings, useUpdateSettings } from "@/hooks/use-admin";
import { toast } from "sonner";

function SettingsForm({ settings }: { settings: NonNullable<ReturnType<typeof useAdminSettings>["data"]> }) {
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    support_phone: settings.support_phone || "",
    support_email: settings.support_email || "",
    store_address: settings.store_address || "",
    return_policy: settings.return_policy || "",
    privacy_policy: settings.privacy_policy || "",
    terms_conditions: settings.terms_conditions || "",
    admin_email: settings.admin_email || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate(form, {
      onSuccess: () => toast.success("Settings saved"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-gray-900">Contact Information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Input id="support_phone" label="Support Phone" value={form.support_phone} onChange={(e) => setForm({ ...form, support_phone: e.target.value })} />
            <Input id="support_email" label="Support Email" type="email" value={form.support_email} onChange={(e) => setForm({ ...form, support_email: e.target.value })} />
          </div>
          <div className="mt-4">
            <Input id="store_address" label="Store Address" value={form.store_address} onChange={(e) => setForm({ ...form, store_address: e.target.value })} />
          </div>
          <div className="mt-4">
            <Input id="admin_email" label="Admin Email (for order notifications)" type="email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h2 className="font-semibold text-gray-900">Policies</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="return-policy" className="text-sm font-medium text-gray-700">Return Policy</label>
              <textarea id="return-policy" value={form.return_policy} onChange={(e) => setForm({ ...form, return_policy: e.target.value })} className="mt-1.5 h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="privacy-policy" className="text-sm font-medium text-gray-700">Privacy Policy</label>
              <textarea id="privacy-policy" value={form.privacy_policy} onChange={(e) => setForm({ ...form, privacy_policy: e.target.value })} className="mt-1.5 h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label htmlFor="terms-conditions" className="text-sm font-medium text-gray-700">Terms & Conditions</label>
              <textarea id="terms-conditions" value={form.terms_conditions} onChange={(e) => setForm({ ...form, terms_conditions: e.target.value })} className="mt-1.5 h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" />
            </div>
          </div>
        </div>

        <Button type="submit" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? "Saving..." : "Save Settings"}
        </Button>
      </form>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return <SettingsForm key={settings?.support_phone} settings={settings!} />;
}
