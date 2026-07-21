import { notFound } from "next/navigation";
import { CheckCircle2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;
  if (!id) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center">
        <CheckCircle2 size={48} className="mx-auto text-success" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Order Placed!</h1>
        <p className="mt-2 text-sm text-gray-500">Your order has been placed successfully.</p>
      </div>
      <Card className="mt-8">
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">Order Number</p>
            <p className="text-lg font-bold text-gray-900">NF-2024-0001</p>
          </div>
          <hr />
          <div>
            <h2 className="font-semibold text-gray-900">Payment Instructions</h2>
            <p className="mt-1 text-sm text-gray-500">Transfer the exact amount to the bank account below:</p>
          </div>
          <div className="space-y-3 rounded-lg bg-gray-50 p-4">
            {[
              { label: "Bank", value: "Wema Bank" },
              { label: "Account Number", value: "1234567890" },
              { label: "Account Name", value: "NasFon Store" },
              { label: "Amount", value: "₦15,000" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  <button className="text-gray-400 hover:text-gray-600"><Copy size={14} /></button>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-warning/20 bg-warning/5 p-3 text-sm text-warning">
            <p className="font-medium">Important</p>
            <p className="mt-1">This account will expire in 30 minutes. Transfer the exact amount to avoid delays.</p>
          </div>
          <Button variant="outline" size="lg" className="w-full">
            I&apos;ve Made the Transfer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
