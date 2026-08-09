"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { ProductCard } from "@/components/shared/product-card";
import { useInfiniteSearchProducts } from "@/hooks/use-products";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchProducts(debouncedQuery);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const products = data?.pages.flatMap((p) => p.products) ?? [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Search Products</h1>

      <div className="relative mt-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product name, brand, or description..."
          aria-label="Search by product name, brand, or description"
          className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <div className="mt-6">
        {!debouncedQuery ? (
          <p className="text-center text-gray-400">Type a product name to search.</p>
        ) : isLoading ? (
          <div role="status" className="flex items-center justify-center gap-2 py-12 text-sm text-gray-400">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Searching...
          </div>
        ) : products.length > 0 ? (
          <>
            <p role="status" className="mb-4 text-sm text-gray-400">
              {data?.pages[0]?.pagination.total || 0} result{data?.pages[0]?.pagination.total !== 1 ? "s" : ""} for &quot;{debouncedQuery}&quot;
            </p>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div ref={sentinelRef} className="flex flex-col items-center gap-3 py-8">
              {isFetchingNextPage && (
                <div role="status" className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  Loading more results...
                </div>
              )}
              {hasNextPage && !isFetchingNextPage && (
                <button
                  onClick={() => fetchNextPage()}
                  className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Load more
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-gray-400">No products found for &quot;{debouncedQuery}&quot;.</p>
        )}
      </div>
    </div>
  );
}