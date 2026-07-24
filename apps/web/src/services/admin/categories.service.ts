import { createAdminClient } from "@/utils/supabase/admin";
import type { adminCategorySchema, adminCategoryUpdateSchema } from "@/lib/validation";
import type { z } from "zod";

export async function getAdminCategories() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error("Failed to fetch categories");
  return data || [];
}

export async function createCategory(data: z.infer<typeof adminCategorySchema>) {
  const supabase = createAdminClient();

  const { data: category, error } = await supabase
    .from("categories")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error("Failed to create category");
  return category;
}

export async function updateCategory(id: string, data: z.infer<typeof adminCategoryUpdateSchema>) {
  const supabase = createAdminClient();

  const { data: category, error } = await supabase
    .from("categories")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update category");
  return category;
}

export async function deleteCategory(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("categories")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error("Failed to delete category");
}
