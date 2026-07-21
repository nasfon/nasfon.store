"use client";

import { use } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/use-products";
import { useProductReviews } from "@/hooks/use-reviews";
import { useAddCartItem } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useState } from "react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = useProduct(slug);
  const { data: reviews } = useProductReviews(product?.id || "");
  const addToCart = useAddCartItem();

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate(
      { product_id: product.id, quantity },
      {
        onSuccess: () => {
          toast.success("Added to cart");
          setQuantity(1);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="h-6 w-32" />
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-gray-500">Product not found.</p>
        <Link href="/products"><Button className="mt-4">Browse Products</Button></Link>
      </div>
    );
  }

  const inStock = product.stock_quantity > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/products"
        className="mb-6 flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft size={16} />
        Back to Products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            {product.featured_image ? (
              <img
                src={product.featured_image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                No image
              </div>
            )}
          </div>
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img) => (
                <img
                  key={img.id}
                  src={img.image_url}
                  alt=""
                  className="h-20 w-20 shrink-0 rounded-md object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category && (
            <Link
              href={`/categories/${product.category.slug}`}
              className="text-sm text-primary hover:text-primary-hover"
            >
              {product.category.name}
            </Link>
          )}
          <h1 className="mt-1 text-2xl font-bold text-gray-900">{product.name}</h1>
          {product.brand && (
            <p className="mt-1 text-sm text-gray-500">{product.brand}</p>
          )}

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              ₦{product.selling_price.toLocaleString()}
            </span>
            {product.compare_price && product.compare_price > product.selling_price && (
              <span className="text-lg text-gray-400 line-through">
                ₦{product.compare_price.toLocaleString()}
              </span>
            )}
          </div>

          <div className="mt-4">
            <Badge variant={inStock ? "success" : "error"}>
              {inStock ? `In Stock (${product.stock_quantity} available)` : "Out of Stock"}
            </Badge>
          </div>

          {product.description && (
            <p className="mt-6 text-gray-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}

          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded border text-gray-500 hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded border text-gray-500 hover:bg-gray-50"
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1"
                disabled={!inStock || addToCart.isPending}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <Link href={`/checkout?buy_now=${product.id}&qty=${quantity}`} className="flex-1">
                <Button variant="outline" size="lg" className="w-full" disabled={!inStock}>
                  Buy Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">Customer Reviews</h2>
        {reviews && reviews.length > 0 ? (
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {review.user?.full_name || "Anonymous"}
                  </span>
                </div>
                {review.review && (
                  <p className="mt-2 text-sm text-gray-600">{review.review}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-400">No reviews yet.</p>
        )}
      </section>
    </div>
  );
}
