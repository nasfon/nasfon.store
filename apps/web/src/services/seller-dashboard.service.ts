import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getSellerProducts(sellerId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .eq("seller_id", sellerId)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

async function generateUniqueSlug(supabase: ReturnType<typeof createClient>, baseSlug: string, excludeId?: string) {
  let slug = baseSlug;
  let counter = 2;

  for (;;) {
    let query = supabase
      .from("products")
      .select("id")
      .eq("slug", slug);

    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query.maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return slug;

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function createSellerProduct(sellerId: string, productData: {
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  sku: string;
  selling_price: number;
  compare_price?: number;
  stock_quantity: number;
  brand?: string;
  featured_image?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const baseSlug =
    productData.slug ||
    productData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const slug = await generateUniqueSlug(supabase, baseSlug);

  const { data, error } = await supabase
    .from("products")
    .insert({
      ...productData,
      slug,
      seller_id: sellerId,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSellerProduct(sellerId: string, productId: string, productData: Record<string, unknown>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const updateData: Record<string, unknown> = { ...productData };

  if (typeof updateData.slug === "string" && updateData.slug) {
    updateData.slug = await generateUniqueSlug(supabase, updateData.slug, productId);
  }

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSellerProduct(sellerId: string, productId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("products")
    .update({ is_active: false })
    .eq("id", productId)
    .eq("seller_id", sellerId)
    .select("id");

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error("Product not found or does not belong to this seller");
  }
}

export async function getSellerDeliveryLocations(sellerId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("delivery_locations")
    .select("*")
    .eq("seller_id", sellerId)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createSellerDeliveryLocation(sellerId: string, locationData: {
  name: string;
  delivery_fee: number;
  estimated_delivery_days: number;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("delivery_locations")
    .insert({
      ...locationData,
      seller_id: sellerId,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSellerDeliveryLocation(sellerId: string, locationId: string, locationData: Record<string, unknown>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("delivery_locations")
    .update(locationData)
    .eq("id", locationId)
    .eq("seller_id", sellerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteSellerDeliveryLocation(sellerId: string, locationId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("delivery_locations")
    .update({ is_active: false })
    .eq("id", locationId)
    .eq("seller_id", sellerId);

  if (error) throw new Error(error.message);
}

export async function getSellerOrders(sellerId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Find orders containing products belonging to this seller
  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), delivery_location:delivery_locations(*)")
    .filter("items.product.seller_id", "eq", sellerId)
    .order("created_at", { ascending: false });

  // Alternatively, query via order_items join if filter syntax needs precision
  if (error) {
    // Fallback: query order_ids from order_items where product belongs to seller
    const { data: items, error: itemError } = await supabase
      .from("order_items")
      .select("order_id, product:products!inner(seller_id)")
      .eq("product.seller_id", sellerId);

    if (itemError) throw new Error(itemError.message);
    const orderIds = Array.from(new Set((items || []).map((i) => i.order_id)));

    if (orderIds.length === 0) return [];

    const { data: orders, error: orderError } = await supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(*)), delivery_location:delivery_locations(*)")
      .in("id", orderIds)
      .order("created_at", { ascending: false });

    if (orderError) throw new Error(orderError.message);
    return orders || [];
  }

  return data || [];
}

export async function updateSellerOrderStatus(sellerId: string, orderId: string, status: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Verify that the order contains at least one product belonging to this seller
  const { data: item } = await supabase
    .from("order_items")
    .select("product:products!inner(seller_id)")
    .eq("order_id", orderId)
    .eq("product.seller_id", sellerId)
    .limit(1)
    .single();

  if (!item) throw new Error("Order does not belong to this seller");

  const { data, error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
