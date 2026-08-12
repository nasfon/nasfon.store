import type { Metadata } from "next";
import { getProducts } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { ProductBrowser } from "@/components/shared/product-browser";
import type { ProductsResponse } from "@/hooks/use-products";
import type { Category } from "@/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Products",
  description:
    "Browse genuine phone accessories and more at Market by NasFon. Clear pricing, real photos, and trusted delivery across Nigeria.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Products",
    description:
      "Browse genuine phone accessories and more at Market by NasFon.",
    url: "/",
  },
};

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ page: 1, limit: 12 }),
    getCategories(),
  ]);

  return (
    <ProductBrowser
      initialData={products as ProductsResponse}
      categories={categories as Category[]}
    />
  );
}
