import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function createReview(data: {
  user_id: string;
  product_id: string;
  order_id: string;
  rating: number;
  review?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: order } = await supabase
    .from("orders")
    .select("order_status, user_id")
    .eq("id", data.order_id)
    .single();

  if (!order) throw new Error("Order not found");
  if (order.user_id !== data.user_id) throw new Error("Not authorized");
  if (order.order_status !== "delivered") throw new Error("Can only review delivered orders");

  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("user_id", data.user_id)
    .eq("product_id", data.product_id)
    .eq("order_id", data.order_id)
    .single();

  if (existing) throw new Error("You have already reviewed this product for this order");

  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      user_id: data.user_id,
      product_id: data.product_id,
      order_id: data.order_id,
      rating: data.rating,
      review: data.review || null,
      is_visible: true,
    })
    .select()
    .single();

  if (error) throw new Error("Failed to create review");
  return review;
}

export async function getProductReviews(productId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("reviews")
    .select("*, user:users(full_name, avatar_url)")
    .eq("product_id", productId)
    .eq("is_visible", true)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch reviews");
  return data || [];
}
