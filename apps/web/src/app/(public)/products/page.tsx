import { getProducts } from "@/services/product.service";
import { getCategories } from "@/services/category.service";
import { ProductBrowser } from "./product-browser";
import type { ProductsResponse } from "@/hooks/use-products";
import type { Category } from "@/types";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
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