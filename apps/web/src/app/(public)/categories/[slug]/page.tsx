"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/components/shared/product-card";
import { useCategory } from "@/hooks/use-categories";

export default function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data, isLoading } = useCategory(slug);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-6 w-32" />
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-square w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data?.category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-gray-500">Category not found.</p>
        <Link href="/products"><Button className="mt-4">Browse Products</Button></Link>
      </div>
    );
  }

  const products = data.products || [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/products" className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900">
        <ArrowLeft size={16} />
        All Products
      </Link>

      <h1 className="text-2xl font-bold text-gray-900">{data.category.name}</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-gray-400">
            No products in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
