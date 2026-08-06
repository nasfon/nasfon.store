import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { cache } from "react";

const listingColumns = "id, name, slug, featured_image, selling_price, compare_price, stock_quantity, brand, is_featured, category_id, created_at";

export const getProducts = cache(async (params: {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: string;
  featured?: boolean;
  sort?: string;
}) => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("products")
    .select(listingColumns, { count: "exact" })
    .eq("is_active", true);

  if (params.search) {
    query = query.ilike("name", `%${params.search}%`);
  }

  if (params.category_id) {
    query = query.eq("category_id", params.category_id);
  }

  if (params.featured !== undefined) {
    query = query.eq("is_featured", params.featured);
  }

  if (params.sort === "price_asc") {
    query = query.order("selling_price", { ascending: true });
  } else if (params.sort === "price_desc") {
    query = query.order("selling_price", { ascending: false });
  } else if (params.sort === "name") {
    query = query.order("name", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  return {
    products: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  };
});

export async function getProductBySlug(slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*), images:product_images(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) throw new Error(error.message === "No rows" ? "Product not found" : error.message);

  if (data && data.seller_id) {
    const { data: seller } = await supabase
      .from("sellers")
      .select("id, shop_name, shop_slug, shop_logo_url, verification_status")
      .eq("id", data.seller_id)
      .maybeSingle();
    if (seller) data.seller = seller;
  }

  return data;
}

export async function getFeaturedProducts() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("products")
    .select(listingColumns)
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function searchProducts(searchQuery: string, page = 1, limit = 20) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const offset = (page - 1) * limit;

  const query = supabase
    .from("products")
    .select(listingColumns, { count: "exact" })
    .eq("is_active", true)
    .textSearch("search_vector", searchQuery, {
      type: "websearch",
      config: "english",
    })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) throw new Error(error.message);

  return {
    products: data || [],
    pagination: {
      page,
      limit,
      total: count || 0,
      total_pages: Math.ceil((count || 0) / limit),
    },
  };
}
