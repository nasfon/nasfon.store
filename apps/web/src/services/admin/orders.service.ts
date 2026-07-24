import { createAdminClient } from "@/utils/supabase/admin";
import type { adminOrderUpdateSchema } from "@/lib/validation";
import type { z } from "zod";

export async function getAdminOrders() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), delivery_location:delivery_locations(*), payment:payments(*)")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch orders");
  return data || [];
}

export async function getAdminOrderById(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*, product:products(*)), delivery_location:delivery_locations(*), payment:payments(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error("Order not found");
  return data;
}

export async function updateOrder(id: string, data: z.infer<typeof adminOrderUpdateSchema>) {
  const supabase = createAdminClient();

  const updateData: Record<string, unknown> = {};
  if (data.order_status !== undefined) updateData.order_status = data.order_status;
  if (data.payment_status !== undefined) updateData.payment_status = data.payment_status;
  if (data.notes !== undefined) updateData.notes = data.notes;

  const { data: order, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update order");
  return order;
}
