"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAddCartItem } from "@/hooks/use-cart";
import { toast } from "sonner";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAddCartItem();
  const inStock = product.stock_quantity > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) {
      toast.error("Insufficient stock");
      return;
    }
    addToCart.mutate(
      {
        product_id: product.id,
        quantity: 1,
        name: product.name,
        slug: product.slug,
        selling_price: product.selling_price,
        compare_price: product.compare_price,
        featured_image: product.featured_image,
        stock_quantity: product.stock_quantity,
      },
      {
        onSuccess: () => toast.success("Added to cart"),
        onError: (err) => toast.error(err.message),
      }
    );
  };

  return (
    <div className="group rounded-lg border border-gray-200 bg-white shadow-card transition-shadow hover:shadow-dropdown">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square overflow-hidden rounded-t-lg bg-gray-100">
          {product.featured_image ? (
            <img
              src={product.featured_image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-gray-300">
              No image
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {product.brand && (
          <p className="mt-0.5 text-xs text-gray-400">{product.brand}</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            ₦{product.selling_price.toLocaleString()}
          </span>
          {product.compare_price && product.compare_price > product.selling_price && (
            <span className="text-sm text-gray-400 line-through">
              ₦{product.compare_price.toLocaleString()}
            </span>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <Badge variant={inStock ? "success" : "error"}>
            {inStock ? "In Stock" : "Out of Stock"}
          </Badge>
          {product.is_featured && (
            <Badge variant="primary">Featured</Badge>
          )}
        </div>

        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          disabled={addToCart.isPending}
          onClick={handleAddToCart}
        >
          <ShoppingCart size={16} />
          {addToCart.isPending ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
