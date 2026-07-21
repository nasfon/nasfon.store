import { notFound } from "next/navigation";
import { ShoppingCart, Zap, ShieldCheck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <div className="flex h-full items-center justify-center text-gray-300">
              Product Image
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-16 overflow-hidden rounded-md bg-gray-100">
                <div className="flex h-full items-center justify-center text-xs text-gray-300">{i}</div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <Badge variant="info">Phone Accessories</Badge>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Product Name</h1>
          <p className="mt-1 text-sm text-gray-400">Brand Name</p>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">₦0</span>
            <span className="text-lg text-gray-400 line-through">₦0</span>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Badge variant="success">In Stock</Badge>
            <span className="text-sm text-gray-500">10+ units available</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-600">
            Product description will appear here.
          </p>
          <div className="mt-6 space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
            {[
              { icon: ShieldCheck, text: "100% genuine product" },
              { icon: Package, text: "Secure packaging & fast delivery" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600">
                  <Icon size={16} className="text-success" />
                  {item.text}
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="flex-1">
              <ShoppingCart size={18} />
              Add to Cart
            </Button>
            <Button size="lg" className="flex-1">
              <Zap size={18} />
              Buy Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
