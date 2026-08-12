"use client";

import { use } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShoppingCart, Star, Minus, Plus, ChevronLeft, ChevronRight, Store, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useProduct } from "@/hooks/use-products";
import { useProductReviews } from "@/hooks/use-reviews";
import { useAddCartItem } from "@/hooks/use-cart";
import { toast } from "sonner";
import { useState } from "react";
import { cloudinaryUrl } from "@/utils/cloudinary";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [quantity, setQuantity] = useState(1);
  const { data: product, isLoading } = useProduct(slug);
  const { data: reviews } = useProductReviews(slug);
  const addToCart = useAddCartItem();
  const [selectedIdx, setSelectedIdx] = useState(0);

  const handleAddToCart = () => {
    if (!product) return;
    if (!inStock) {
      toast.error("Insufficient stock");
      return;
    }
    addToCart.mutate(
      {
        product_id: product.id,
        quantity,
        name: product.name,
        slug: product.slug,
        selling_price: product.selling_price,
        compare_price: product.compare_price,
        featured_image: product.featured_image,
        stock_quantity: product.stock_quantity,
      },
      {
        onSuccess: () => {
          toast.success("Added to cart");
          setQuantity(1);
        },
        onError: (err) => toast.error(err.message),
      }
    );
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!inStock) {
      toast.error("Insufficient stock");
      return;
    }
    window.location.href = `/checkout?buy_now=${product.id}&qty=${quantity}&price=${product.selling_price}`;
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
  const allImages = [
    ...(product.featured_image ? [{ id: "featured", image_url: product.featured_image }] : []),
    ...(product.images?.map((img) => ({ id: img.id, image_url: img.image_url })) ?? []),
  ].filter(
    (img, i, arr) => arr.findIndex((x) => x.image_url === img.image_url) === i
  );
  const safeIdx = Math.min(selectedIdx, Math.max(0, allImages.length - 1));
  const selectedImage = allImages[safeIdx];

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
          <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
            {selectedImage ? (
              <>
                <Image
                  key={selectedImage.id}
                  src={cloudinaryUrl(selectedImage.image_url, { width: 1200, format: "auto" })}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover transition-opacity duration-300"
                  priority
                />
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedIdx((i) => (i - 1 + allImages.length) % allImages.length)}
                      aria-label="Previous image"
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-gray-700 shadow hover:bg-white"
                    >
                      <ChevronLeft size={20} aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => setSelectedIdx((i) => (i + 1) % allImages.length)}
                      aria-label="Next image"
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-gray-700 shadow hover:bg-white"
                    >
                      <ChevronRight size={20} aria-hidden="true" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedIdx(i)}
                          aria-label={`Go to image ${i + 1} of ${allImages.length}`}
                          aria-current={i === selectedIdx}
                          className={`h-2 w-2 rounded-full transition-colors ${i === selectedIdx ? "bg-white" : "bg-white/50"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-300">
                No image
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {allImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedIdx(i)}
                  aria-label={`Show image ${i + 1} of ${allImages.length}`}
                  aria-current={i === selectedIdx}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-md border-2 ${i === selectedIdx ? "border-primary" : "border-transparent"}`}
                >
                  <Image
                    src={cloudinaryUrl(img.image_url, { width: 160, format: "auto" })}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
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

          {product.seller && (
            <Link
              href={`/sellers/${product.seller.shop_slug}`}
              className="mt-5 flex items-center gap-3 rounded-xl border bg-white p-3 transition hover:border-gray-300 hover:shadow-sm"
            >
              <div className="relative h-12 w-12 overflow-hidden rounded-full border bg-gray-100">
                {product.seller.shop_logo_url ? (
                  <Image
                    src={cloudinaryUrl(product.seller.shop_logo_url, { width: 96, format: "auto" })}
                    alt={product.seller.shop_name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  <Store size={22} className="absolute inset-0 m-auto text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {product.seller.shop_name}
                </p>
                <p className="text-xs text-green-700 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Verified Seller
                </p>
              </div>
              <span className="text-sm text-gray-400">View store →</span>
            </Link>
          )}

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
                  aria-label="Decrease quantity"
                  className="flex h-8 w-8 items-center justify-center rounded border text-gray-500 hover:bg-gray-50"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} aria-hidden="true" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock_quantity, q + 1))}
                  aria-label="Increase quantity"
                  className="flex h-8 w-8 items-center justify-center rounded border text-gray-500 hover:bg-gray-50"
                  disabled={quantity >= product.stock_quantity}
                >
                  <Plus size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                loading={addToCart.isPending}
                onClick={handleAddToCart}
              >
                <ShoppingCart size={18} />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
              <Button
                size="lg"
                className="flex-1"
                onClick={handleBuyNow}
              >
                Buy Now
              </Button>
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
