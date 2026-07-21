import Link from "next/link";
import { ArrowRight, Smartphone, ShieldCheck, Truck, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrustBadge } from "@/components/shared/trust-badge";

export default function Home() {
  return (
    <div>
      {/* Hero */}
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

      {/* Trust Signals */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <TrustBadge />
      </section>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:text-primary-hover"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <div className="col-span-full py-12 text-center text-gray-400">
            Products loading...
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {/* Category cards will be rendered here */}
            <div className="col-span-full py-12 text-center text-gray-400">
              Categories loading...
            </div>
          </div>
        </div>
      </section>

      {/* Why NasFon */}
      <section className="mx-auto max-w-7xl px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
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
                className="flex flex-col items-center text-center rounded-lg border border-gray-200 bg-white p-6 shadow-card"
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
