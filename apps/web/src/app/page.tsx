"use client";

import Link from "next/link";
import { ArrowRight, Smartphone, ShieldCheck, Truck, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/shared/trust-badge";
import { ProductCard } from "@/components/shared/product-card";
import { useFeaturedProducts, useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: featured, isLoading: featuredLoading } = useFeaturedProducts();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();

  return (
    <div>
      <section className="bg-gradient-to-b from-primary/5 to-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
            Trusted Online Shopping
            <br />
            <span className="text-primary">for First-Time Buyers</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-500">
            Genuine phone accessories. Secure payments. Reliable delivery.
            Shop with confidence — no account required.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/products">
              <Button size="lg">
                Browse Products
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link href="/track">
              <Button variant="outline" size="lg">
                Track Your Order
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <TrustBadge />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featuredLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : featured?.length ? (
            featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-400">
              No featured products yet.
            </div>
          )}
        </div>
      </section>

      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Shop by Category</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categoriesLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-[3/2] rounded-xl bg-gray-200" />
              ))
            ) : categoriesData?.length ? (
              categoriesData.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className={`group relative flex items-start justify-center overflow-hidden rounded-xl shadow-md transition hover:shadow-lg ${cat.image_url ? "" : "bg-gradient-to-br from-primary/40 to-primary/20"}`}
                  style={cat.image_url ? { backgroundImage: `url(${cat.image_url})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                >
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative flex aspect-[3/2] w-full items-center justify-center">
                    {!cat.image_url && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-white/80">{cat.name.charAt(0)}</span>
                      </div>
                    )}
                    <h3 className="px-3 text-center text-sm font-semibold text-white drop-shadow-sm">
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400">
                No categories yet.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold text-gray-900">
          Why Shop at NasFon Store?
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Safe & Secure",
              desc: "Bank transfer via verified Flutterwave dynamic accounts. Your money is protected.",
            },
            {
              icon: Smartphone,
              title: "Genuine Products",
              desc: "We sell only authentic phone accessories. Real photos, honest descriptions.",
            },
            {
              icon: Truck,
              title: "Reliable Delivery",
              desc: "Track your order from payment to delivery. Know exactly where your package is.",
            },
            {
              icon: Headphones,
              title: "24/7 Support",
              desc: "Have a question? Our support team is ready to help you anytime.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-6 text-center shadow-card"
              >
                <div className="rounded-full bg-primary/10 p-3">
                  <Icon size={28} className="text-primary" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-500">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
