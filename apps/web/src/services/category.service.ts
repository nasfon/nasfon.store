import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getCategories() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function getCategoryBySlug(slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: category, error: catError } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (catError) throw new Error("Category not found");

  const { data: products } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .eq("category_id", category.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  return { category, products: products || [] };
}
