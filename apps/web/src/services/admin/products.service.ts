import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { adminProductSchema, adminProductUpdateSchema } from "@/lib/validation";
import type { z } from "zod";

export async function getAdminProducts() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch products");
  return data || [];
}

export async function createProduct(data: z.infer<typeof adminProductSchema>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: product, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error("Failed to create product");
  return product;
}

export async function updateProduct(id: string, data: z.infer<typeof adminProductUpdateSchema>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: product, error } = await supabase
    .from("products")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update product");
  return product;
}

export async function deleteProduct(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error("Failed to delete product");
}
