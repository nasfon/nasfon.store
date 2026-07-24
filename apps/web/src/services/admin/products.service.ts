import { createAdminClient } from "@/utils/supabase/admin";
import type { adminProductSchema, adminProductUpdateSchema } from "@/lib/validation";
import type { z } from "zod";

export async function getAdminProducts() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch products");
  return data || [];
}

export async function createProduct(data: z.infer<typeof adminProductSchema>) {
  const supabase = createAdminClient();

  const { data: product, error } = await supabase
    .from("products")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error("Failed to create product");
  return product;
}

export async function updateProduct(id: string, data: z.infer<typeof adminProductUpdateSchema>) {
  const supabase = createAdminClient();

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
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error("Failed to delete product");
}

export async function getProductImages(productId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("display_order", { ascending: true });

  if (error) throw new Error("Failed to fetch product images");
  return data || [];
}

export async function addProductImage(
  productId: string,
  data: { image_url: string; display_order: number }
) {
  const supabase = createAdminClient();

  const { data: image, error } = await supabase
    .from("product_images")
    .insert({ product_id: productId, ...data })
    .select()
    .single();

  if (error) throw new Error("Failed to add image");

  const { data: existing } = await supabase
    .from("products")
    .select("featured_image")
    .eq("id", productId)
    .single();

  if (!existing?.featured_image) {
    await supabase
      .from("products")
      .update({ featured_image: data.image_url })
      .eq("id", productId);
  }

  return image;
}

export async function updateProductImage(
  productId: string,
  imageId: string,
  data: { display_order?: number; image_url?: string }
) {
  const supabase = createAdminClient();

  const { data: image, error } = await supabase
    .from("product_images")
    .update(data)
    .eq("id", imageId)
    .eq("product_id", productId)
    .select()
    .single();

  if (error) throw new Error("Failed to update image");
  return image;
}

export async function deleteProductImage(productId: string, imageId: string) {
  const supabase = createAdminClient();

  const { data: image } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("id", imageId)
    .single();

  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) throw new Error("Failed to delete image");

  if (image) {
    const { data: remaining } = await supabase
      .from("product_images")
      .select("image_url")
      .eq("product_id", productId)
      .order("display_order", { ascending: true })
      .limit(1);

    const { data: product } = await supabase
      .from("products")
      .select("featured_image")
      .eq("id", productId)
      .single();

    if (product?.featured_image === image.image_url) {
      await supabase
        .from("products")
        .update({ featured_image: remaining?.[0]?.image_url || null })
        .eq("id", productId);
    }
  }
}
