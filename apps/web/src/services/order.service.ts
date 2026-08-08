import { createAdminClient } from "@/utils/supabase/admin";

export async function trackOrder(orderNumber: string, phoneNumber: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), delivery_location:delivery_locations(*), payment:payments(*)")
    .eq("order_number", orderNumber)
    .eq("customer_phone", phoneNumber)
    .single();

  if (error) throw new Error("Order not found");
  return data;
}

export async function getCustomerOrders(userId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), delivery_location:delivery_locations(*), payment:payments(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch orders");
  return data || [];
}

export async function getOrderById(orderId: string, userId?: string) {
  const supabase = createAdminClient();

  let query = supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), delivery_location:delivery_locations(*), payment:payments(*)")
    .eq("id", orderId);

  if (userId) {
    query = query.eq("user_id", userId);
  }

  const { data, error } = await query.single();

  if (error) throw new Error("Order not found");
  return data;
}
