"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Images, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/shared/image-upload";
import {
  useAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useAdminCategories,
  useProductImages,
  useAddProductImage,
  useDeleteProductImage,
  useUpdateProductImage,
} from "@/hooks/use-admin";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function AdminProductsPage() {
  const { data: products, isLoading } = useAdminProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [showModal, setShowModal] = useState(false);
  const { data: categories } = useAdminCategories(showModal);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showImagesModal, setShowImagesModal] = useState<string | null>(null);
  const [editing, setEditing] = useState<{
    id: string; name: string; slug: string; sku: string;
    category_id: string; selling_price: number; compare_price?: number | null;
    stock_quantity: number; description?: string | null; brand?: string | null;
    featured_image?: string | null; is_featured: boolean; is_active: boolean;
  } | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", sku: "", category_id: "",
    selling_price: "", compare_price: "", stock_quantity: "",
    description: "", brand: "", featured_image: "", is_featured: false, is_active: true,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", sku: "", category_id: "", selling_price: "", compare_price: "", stock_quantity: "", description: "", brand: "", featured_image: "", is_featured: false, is_active: true });
    setShowModal(true);
  };

  const openEdit = (product: {
    id: string; name: string; slug: string; sku: string;
    category_id: string; selling_price: number; compare_price?: number | null;
    stock_quantity: number; description?: string | null; brand?: string | null;
    featured_image?: string | null; is_featured: boolean; is_active: boolean;
  }) => {
    setEditing(product);
    setForm({
      name: product.name, slug: product.slug, sku: product.sku,
      category_id: product.category_id, selling_price: String(product.selling_price),
      compare_price: product.compare_price?.toString() || "",
      stock_quantity: String(product.stock_quantity), description: product.description || "",
      brand: product.brand || "", featured_image: product.featured_image || "",
      is_featured: product.is_featured, is_active: product.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      selling_price: parseFloat(form.selling_price) || 0,
      stock_quantity: parseInt(form.stock_quantity) || 0,
    };

    if (editing) {
      updateProduct.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { toast.success("Product updated"); setShowModal(false); },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createProduct.mutate(payload, {
        onSuccess: () => {
          toast.success("Product created");
          setShowModal(false);
        },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredProducts = products?.filter((product) => {
    if (!normalizedSearch) return true;
    const categoryName = product.category?.name?.toLowerCase() || "";
    return (
      product.name.toLowerCase().includes(normalizedSearch) ||
      categoryName.includes(normalizedSearch)
    );
  });

  const totalPages = Math.max(1, Math.ceil((filteredProducts?.length || 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Button onClick={openCreate}><Plus size={18} />Add Product</Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search by product name or category..."
          aria-label="Search products by name or category"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
              ))
            ) : products?.length ? (
              pagedProducts?.map((product) => (
                <tr key={product.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 rounded bg-gray-100">
                        {product.featured_image && <img src={product.featured_image} alt="" className="h-full w-full rounded object-cover" />}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{product.name}</span>
                        {(product.images?.length ?? 0) > 1 && (
                          <span className="ml-2 text-xs text-gray-400">+{product.images!.length - 1} more</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{product.sku}</td>
                  <td className="px-4 py-3 font-medium">₦{product.selling_price.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={product.stock_quantity < 10 ? "text-error" : "text-gray-900"}>{product.stock_quantity}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={product.is_active ? "success" : "error"}>{product.is_active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setShowImagesModal(product.id)} aria-label={`Manage images for ${product.name}`} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Images size={16} aria-hidden="true" /></button>
                      <button onClick={() => openEdit(product)} aria-label={`Edit ${product.name}`} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil size={16} aria-hidden="true" /></button>
                      <button onClick={() => { if (confirm("Delete this product?")) deleteProduct.mutate(product.id, { onSuccess: () => toast.success("Deleted") }); }} aria-label={`Delete ${product.name}`} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-error"><Trash2 size={16} aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                {products?.length ? "No products match your search." : "No products yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredProducts?.length || 0}
        pageSize={PAGE_SIZE}
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Product" : "Add Product"}
        description={
          editing
            ? "Update the product details below."
            : "Fill in the details to add a new product to your catalog."
        }
        size="xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="product-form"
              loading={createProduct.isPending || updateProduct.isPending}
            >
              {editing ? "Save Changes" : "Create Product"}
            </Button>
          </>
        }
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Basic Details
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Input
                  id="name"
                  label="Name"
                  placeholder="e.g. Wireless Bluetooth Earbuds"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <Input
                id="slug"
                label="Slug"
                placeholder="auto-generated"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
              <Input
                id="sku"
                label="SKU"
                placeholder="e.g. NF-EB-001"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                required
              />
              <div className="sm:col-span-2">
                <Input
                  id="brand"
                  label="Brand"
                  placeholder="Optional brand name"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
            </div>
          </section>

          <section className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Classification &amp; Pricing
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="category_id">
                  Category
                </label>
                <select
                  id="category_id"
                  value={form.category_id}
                  onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                  className="mt-1.5 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                >
                  <option value="">Select a category...</option>
                  {categories
                    ? categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    : null}
                  {!categories && <option disabled>Loading...</option>}
                </select>
              </div>
              <Input
                id="selling_price"
                label="Selling Price (₦)"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={form.selling_price}
                onChange={(e) => setForm({ ...form, selling_price: e.target.value })}
                required
              />
              <Input
                id="compare_price"
                label="Compare Price (₦)"
                type="number"
                step="0.01"
                placeholder="Optional, for discounts"
                value={form.compare_price}
                onChange={(e) => setForm({ ...form, compare_price: e.target.value })}
              />
            </div>
          </section>

          <section className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Inventory &amp; Status
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="stock_quantity"
                label="Stock Quantity"
                type="number"
                value={form.stock_quantity}
                onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })}
                required
              />
              <div className="grid grid-cols-1 gap-3">
                <Switch
                  checked={form.is_active}
                  onChange={(v) => setForm({ ...form, is_active: v })}
                  label="Available"
                  description="Show this product on the storefront"
                />
                <Switch
                  checked={form.is_featured}
                  onChange={(v) => setForm({ ...form, is_featured: v })}
                  label="Featured"
                  description="Highlight this product in featured sections"
                />
              </div>
            </div>
          </section>

          <section className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Description
            </h3>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the product, its features, and what's included..."
              aria-label="Product description"
              className="mt-3 h-24 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </section>
        </form>
      </Modal>

      {showImagesModal && (
        <ImagesModal
          productId={showImagesModal}
          onClose={() => setShowImagesModal(null)}
        />
      )}
    </div>
  );
}

function ImagesModal({ productId, onClose }: { productId: string | null; onClose: () => void }) {
  const { data: images, isLoading } = useProductImages(productId);
  const addImage = useAddProductImage();
  const deleteImage = useDeleteProductImage();
  const updateImage = useUpdateProductImage();
  const [uploading, setUploading] = useState(false);

  const handleImagesChange = async (newImages: { image_url: string; display_order: number }[]) => {
    if (!productId) return;
    setUploading(true);

    try {
      const existing = images || [];
      const newUrls = new Set(newImages.map((n) => n.image_url));
      const oldUrls = new Set(existing.map((e) => e.image_url));

      const toAdd = newImages.filter((n) => !oldUrls.has(n.image_url));
      const toRemove = existing.filter((e) => !newUrls.has(e.image_url));

      const addedIds = new Map<string, string>();

      for (const img of toAdd) {
        const result = await addImage.mutateAsync({ productId, ...img });
        addedIds.set(img.image_url, (result as { id: string }).id);
      }

      const allImages = [
        ...existing.filter((e) => newUrls.has(e.image_url)),
        ...toAdd.map((img) => ({ id: addedIds.get(img.image_url)!, image_url: img.image_url, display_order: img.display_order })),
      ];

      const reorderPromises = allImages.map((img, i) => {
        const existingImg = existing.find((e) => e.id === img.id);
        if (existingImg && existingImg.display_order !== i) {
          return updateImage.mutateAsync({ productId, imageId: img.id, display_order: i });
        }
        return Promise.resolve();
      });
      await Promise.all(reorderPromises);

      for (const img of toRemove) {
        await deleteImage.mutateAsync({ productId, imageId: img.id });
      }

      toast.success("Images updated");
    } catch {
      toast.error("Failed to update images");
    } finally {
      setUploading(false);
    }
  };

  const imageItems = (images || []).map((img) => ({
    id: img.id,
    image_url: img.image_url,
    display_order: img.display_order,
  }));

  return (
    <Modal open={!!productId} onClose={onClose} title="Manage Images">
      <div className="relative mt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          <>
            <ImageUpload images={imageItems} onChange={handleImagesChange} />
            {uploading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/80">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Saving images...
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}
