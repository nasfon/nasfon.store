"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { ImageUpload } from "@/components/shared/image-upload";
import {
  useSellerProducts,
  useCreateSellerProduct,
  useUpdateSellerProduct,
  useDeleteSellerProduct,
} from "@/hooks/use-seller";
import { useCategories } from "@/hooks/use-categories";
import { toast } from "sonner";
import type { Product } from "@/types";

interface ProductForm {
  name: string;
  slug: string;
  sku: string;
  category_id: string;
  selling_price: string;
  compare_price: string;
  stock_quantity: string;
  description: string;
  brand: string;
}

const emptyForm: ProductForm = {
  name: "",
  slug: "",
  sku: "",
  category_id: "",
  selling_price: "",
  compare_price: "",
  stock_quantity: "",
  description: "",
  brand: "",
};

export default function SellerProductsPage() {
  const { data: products, isLoading } = useSellerProducts();
  const { data: categories } = useCategories();
  const createProduct = useCreateSellerProduct();
  const updateProduct = useUpdateSellerProduct();
  const deleteProduct = useDeleteSellerProduct();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [images, setImages] = useState<{ image_url: string; display_order: number }[]>([]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setImages([]);
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category_id: product.category_id,
      selling_price: String(product.selling_price),
      compare_price: product.compare_price?.toString() || "",
      stock_quantity: String(product.stock_quantity),
      description: product.description || "",
      brand: product.brand || "",
    });
    setImages(product.images?.map((img, i) => ({ image_url: img.image_url, display_order: i })) || []);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      selling_price: parseFloat(form.selling_price) || 0,
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      stock_quantity: parseInt(form.stock_quantity) || 0,
      featured_image: images[0]?.image_url || null,
    };

    if (editing) {
      updateProduct.mutate(
        { id: editing.id, ...payload },
        {
          onSuccess: () => { toast.success("Product updated"); setShowModal(false); },
          onError: (err) => toast.error(err.message),
        }
      );
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => { toast.success("Product created"); setShowModal(false); },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    deleteProduct.mutate(id, {
      onSuccess: () => toast.success("Product deleted"),
      onError: (err) => toast.error(err.message),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
        <Button onClick={openCreate}><Plus size={18} />Add Product</Button>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div key={product.id} className="rounded-xl border bg-white p-4">
                <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
                  {product.featured_image ? (
                    <Image src={product.featured_image} alt={product.name} fill className="object-cover" />
                  ) : null}
                </div>
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category?.name}</p>
                  </div>
                  <Badge>{product.is_active ? "Active" : "Hidden"}</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="font-bold text-black">₦{Number(product.selling_price).toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(product)}>
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-error" onClick={() => handleDelete(product.id)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <p className="text-gray-500">No products yet. Add your first product to start selling.</p>
          </div>
        )}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing?.id ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            label="Product Name"
            value={form.name}
            onChange={(e) => {
              const val = e.target.value;
              setForm({ ...form, name: val, slug: val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") });
            }}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="sku"
              label="SKU"
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
              required
            />
            <Input
              id="brand"
              label="Brand"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              required
            >
              <option value="">Select category</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="selling_price"
              label="Selling Price (₦)"
              type="number"
              min={0}
              value={form.selling_price}
              onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
              required
            />
            <Input
              id="compare_price"
              label="Compare Price (₦)"
              type="number"
              min={0}
              value={form.compare_price}
              onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
            />
          </div>
          <Input
            id="stock_quantity"
            label="Stock Quantity"
            type="number"
            min={0}
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-black focus:outline-none"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>
            <ImageUpload images={images} onChange={setImages} maxImages={5} />
          </div>
          <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending}>
            {createProduct.isPending || updateProduct.isPending ? "Saving..." : editing?.id ? "Update Product" : "Create Product"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}