"use client";

import { useState } from "react";
import { useSellerProfile, useUpdatePaystackConfig } from "@/hooks/use-seller";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function SellerPaymentPage() {
  const { data: seller, isLoading } = useSellerProfile();
  const updateConfig = useUpdatePaystackConfig();
  const [publicKey, setPublicKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [showKeys, setShowKeys] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig.mutate(
      { paystack_public_key: publicKey.trim(), paystack_secret_key: secretKey.trim() },
      {
        onSuccess: () => {
          toast.success("Paystack configuration saved");
          setPublicKey("");
          setSecretKey("");
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    );
  }

  const hasConfig = !!seller?.paystack_public_key && !!seller?.paystack_secret_key;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900">Payment Settings</h1>
      <p className="mt-1 text-sm text-gray-500">
        Configure your own Paystack API keys to receive payments for your products.
      </p>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Paystack API</h2>
            <p className="text-sm text-gray-500">
              Paystack is the only supported payment provider for sellers.
            </p>
          </div>
          {hasConfig && (
            <Badge className="bg-green-100 text-green-800">Configured</Badge>
          )}
        </div>

        {hasConfig && (
          <div className="mt-4 rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
            <p className="mb-2">Your current configuration:</p>
            <p className="break-all font-mono text-xs">
              Public Key: {showKeys ? seller?.paystack_public_key : "••••" + seller?.paystack_public_key?.slice(-4)}
            </p>
            <button
              type="button"
              className="mt-2 text-xs font-medium text-gray-500 underline"
              onClick={() => setShowKeys(!showKeys)}
            >
              {showKeys ? "Hide" : "Show"} public key
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input
            id="paystack_public_key"
            label="Paystack Public Key"
            placeholder="pk_live_..."
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            required
          />
          <Input
            id="paystack_secret_key"
            label="Paystack Secret Key"
            type="password"
            placeholder="sk_live_..."
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            required
          />
          <div className="rounded-lg bg-yellow-50 p-4 text-xs text-yellow-800">
            Keep your secret key safe. It is encrypted at rest and never exposed to customers.
          </div>
          <Button type="submit" loading={updateConfig.isPending}>
            {updateConfig.isPending ? "Saving..." : hasConfig ? "Update Keys" : "Save Configuration"}
          </Button>
        </form>
      </div>
    </div>
  );
}