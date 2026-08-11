import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function adminCreateSeller(data: {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
  shop_name: string;
  shop_slug: string;
  shop_address: string;
  shop_logo_url?: string;
  contact_phone: string;
  contact_email: string;
  support_contact?: string;
  business_description?: string;
}) {
  const adminClient = createAdminClient();

  const { data: existing } = await adminClient
    .from("users")
    .select("id")
    .eq("email", data.email)
    .maybeSingle();
  if (existing) throw new Error("An account with this email already exists");

  const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: data.full_name },
  });

  if (createError || !authData.user) {
    throw new Error(createError?.message || "Failed to create account");
  }

  const userId = authData.user.id;

  try {
    const { error: profileError } = await adminClient.from("users").insert({
      id: userId,
      full_name: data.full_name,
      email: data.email,
      phone_number: data.phone_number || null,
      role: "customer",
      is_active: true,
      email_verified_at: new Date().toISOString(),
    });
    if (profileError) throw new Error(profileError.message);

    const { data: seller, error: sellerError } = await adminClient
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
        verification_status: "approved",
        verification_documents: [],
        is_active: true,
      })
      .select()
      .single();
    if (sellerError) throw new Error(sellerError.message);

    return seller;
  } catch (err) {
    await adminClient.auth.admin.deleteUser(userId).catch(() => {});
    throw err;
  }
}

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

export async function adminSetSellerActive(sellerId: string, is_active: boolean) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("sellers")
    .update({ is_active })
    .eq("id", sellerId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function adminDeleteSeller(sellerId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: seller } = await supabase
    .from("sellers")
    .select("user_id")
    .eq("id", sellerId)
    .single();

  const { error } = await supabase
    .from("sellers")
    .delete()
    .eq("id", sellerId);

  if (error) throw new Error(error.message);

  if (seller?.user_id) {
    await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", seller.user_id);
  }
}
