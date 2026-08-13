"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, ImagePlus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/shared/image-upload";
import { useAdminCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-admin";
import { toast } from "sonner";

const PAGE_SIZE = 10;

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useAdminCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<{
    id: string; name: string; slug: string; description?: string | null;
    image_url?: string | null; is_active: boolean;
  } | null>(null);

  const [form, setForm] = useState({ name: "", slug: "", description: "", image_url: "", is_active: true });

  const normalizedSearch = search.trim().toLowerCase();
  const filteredCategories = categories?.filter((cat) => {
    if (!normalizedSearch) return true;
    return cat.name.toLowerCase().includes(normalizedSearch);
  });

  const totalPages = Math.max(1, Math.ceil((filteredCategories?.length || 0) / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedCategories = filteredCategories?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", image_url: "", is_active: true });
    setShowModal(true);
  };

  const openEdit = (cat: {
    id: string; name: string; slug: string; description?: string | null;
    image_url?: string | null; is_active: boolean;
  }) => {
    setEditing(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || "", image_url: cat.image_url || "", is_active: cat.is_active });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, description: form.description || null, image_url: form.image_url || null };

    if (editing) {
      updateCategory.mutate({ id: editing.id, ...payload }, {
        onSuccess: () => { toast.success("Category updated"); setShowModal(false); },
        onError: (err) => toast.error(err.message),
      });
    } else {
      createCategory.mutate(payload, {
        onSuccess: () => { toast.success("Category created"); setShowModal(false); },
        onError: (err) => toast.error(err.message),
      });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <Button onClick={openCreate}><Plus size={18} />Add Category</Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => { setPage(1); setSearch(e.target.value); }}
          placeholder="Search categories by name..."
          aria-label="Search categories by name"
          className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-4 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Image</th>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="px-4 py-3"><Skeleton className="h-6 w-full" /></td></tr>
              ))
            ) : categories?.length ? (
              pagedCategories?.map((cat) => (
                <tr key={cat.id} className="border-b last:border-b-0">
                  <td className="px-4 py-3">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-300"><ImagePlus size={16} /></div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3"><Badge variant={cat.is_active ? "success" : "error"}>{cat.is_active ? "Active" : "Inactive"}</Badge></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(cat)} aria-label={`Edit ${cat.name}`} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Pencil size={16} aria-hidden="true" /></button>
                      <button onClick={() => { if (confirm("Delete?")) deleteCategory.mutate(cat.id, { onSuccess: () => toast.success("Deleted") }); }} aria-label={`Delete ${cat.name}`} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-error"><Trash2 size={16} aria-hidden="true" /></button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                {categories?.length ? "No categories match your search." : "No categories yet."}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        totalItems={filteredCategories?.length || 0}
        pageSize={PAGE_SIZE}
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Edit Category" : "Add Category"}
        description={
          editing
            ? "Update the category details below."
            : "Create a new category to organize your products."
        }
        size="lg"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="category-form"
              loading={createCategory.isPending || updateCategory.isPending}
            >
              {editing ? "Save Changes" : "Create Category"}
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Basic Details
            </h3>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                id="name"
                label="Name"
                placeholder="e.g. Electronics"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <Input
                id="slug"
                label="Slug"
                placeholder="auto-generated"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
            </div>
          </section>

          <section className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Presentation
            </h3>
            <div className="mt-3 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700" htmlFor="category_description">
                  Description
                </label>
                <textarea
                  id="category_description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of this category"
                  className="mt-1.5 h-20 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Cover Image</label>
                <div className="mt-1.5">
                  <ImageUpload
                    images={form.image_url ? [{ image_url: form.image_url, display_order: 0 }] : []}
                    onChange={(images) => setForm({ ...form, image_url: images[0]?.image_url || "" })}
                    maxImages={1}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="border-t border-gray-100 pt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Status
            </h3>
            <div className="mt-3">
              <Switch
                checked={form.is_active}
                onChange={(v) => setForm({ ...form, is_active: v })}
                label="Active"
                description="Show this category on the storefront"
              />
            </div>
          </section>
        </form>
      </Modal>
    </div>
  );
}
