import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function adminGetSellers(params?: { status?: string; search?: string }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from("sellers")
    .select("*, user:users(full_name, email, phone_number, avatar_url)")
    .order("created_at", { ascending: false });

  if (params?.status) {
    query = query.eq("verification_status", params.status);
  }

  if (params?.search) {
    query = query.ilike("shop_name", `%${params.search}%`);
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);
  return data || [];
}

export async function adminGetSellerById(sellerId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sellers")
    .select("*, user:users(full_name, email, phone_number, avatar_url)")
    .eq("id", sellerId)
    .single();

  if (error) throw new Error(error.message === "No rows" ? "Seller not found" : error.message);
  return data;
}

export async function adminVerifySeller(sellerId: string, status: "approved" | "rejected") {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sellers")
    .update({ verification_status: status })
    .eq("id", sellerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
