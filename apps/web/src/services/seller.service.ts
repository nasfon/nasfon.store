import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getSellerProfile(userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sellers")
    .select("*, user:users(*)")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw new Error(error.message);
  }
  return data;
}

export async function getSellerBySlug(slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sellers")
    .select("*, user:users(full_name, avatar_url)")
    .eq("shop_slug", slug)
    .eq("verification_status", "approved")
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") throw new Error("Seller shop not found");
    throw new Error(error.message);
  }
  return data;
}

export async function applyForSeller(userId: string, data: {
  shop_name: string;
  shop_slug: string;
  shop_address: string;
  shop_logo_url?: string;
  contact_phone: string;
  contact_email: string;
  support_contact?: string;
  business_description?: string;
  verification_documents: string[];
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: seller, error } = await supabase
    .from("sellers")
    .insert({
      user_id: userId,
      shop_name: data.shop_name,
      shop_slug: data.shop_slug,
      shop_address: data.shop_address,
      shop_logo_url: data.shop_logo_url || null,
      contact_phone: data.contact_phone,
      contact_email: data.contact_email,
      support_contact: data.support_contact || null,
      business_description: data.business_description || null,
      verification_status: "pending",
      verification_documents: data.verification_documents,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return seller;
}

export async function updateSellerProfile(userId: string, data: {
  shop_name?: string;
  shop_address?: string;
  shop_logo_url?: string;
  contact_phone?: string;
  contact_email?: string;
  support_contact?: string;
  business_description?: string;
  verification_documents?: string[];
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const updateData: Record<string, unknown> = {};
  if (data.shop_name !== undefined) updateData.shop_name = data.shop_name;
  if (data.shop_address !== undefined) updateData.shop_address = data.shop_address;
  if (data.shop_logo_url !== undefined) updateData.shop_logo_url = data.shop_logo_url;
  if (data.contact_phone !== undefined) updateData.contact_phone = data.contact_phone;
  if (data.contact_email !== undefined) updateData.contact_email = data.contact_email;
  if (data.support_contact !== undefined) updateData.support_contact = data.support_contact;
  if (data.business_description !== undefined) updateData.business_description = data.business_description;
  if (data.verification_documents !== undefined) updateData.verification_documents = data.verification_documents;

  const { data: seller, error } = await supabase
    .from("sellers")
    .update(updateData)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return seller;
}

export async function updatePaystackConfig(userId: string, data: {
  paystack_public_key: string;
  paystack_secret_key: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: seller, error } = await supabase
    .from("sellers")
    .update({
      paystack_public_key: data.paystack_public_key,
      paystack_secret_key: data.paystack_secret_key,
    })
    .eq("user_id", userId)
    .eq("verification_status", "approved")
    .select()
    .single();

  if (error) throw new Error(error.message);
  return seller;
}
