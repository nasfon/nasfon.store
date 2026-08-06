import type { Metadata } from "next";
import { siteConfig } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse genuine phone accessories and more at Market by NasFon. Clear pricing, real photos, and trusted delivery across Nigeria.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "Products",
    description:
      "Browse genuine phone accessories and more at Market by NasFon.",
    url: "/products",
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
