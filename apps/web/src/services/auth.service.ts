import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { createAndSendOtp, createPendingRegistration } from "@/services/otp.service";

export async function register(data: {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}) {
  const adminClient = createAdminClient();

  const { data: existing } = await adminClient
    .from("users")
    .select("id")
    .eq("email", data.email)
    .maybeSingle();
  if (existing) throw new Error("An account with this email already exists");

  // No account is created yet. We stage the signup and only create the
  // Supabase user + profile after the email is verified via OTP.
  const { expiresAt } = await createPendingRegistration({
    email: data.email,
    full_name: data.full_name,
    phone_number: data.phone_number,
    password: data.password,
  });

  return { requiresOtp: true, email: data.email, expiresAt };
}

export async function login(data: {
  email: string;
  password: string;
  otp_reverify?: boolean;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const adminClient = createAdminClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw new Error(error.message);

  const { data: existing } = await adminClient
    .from("users")
    .select("role, is_active, email_verified_at")
    .eq("id", authData.user.id)
    .maybeSingle();

  const role: string = existing?.role || "customer";

  if (!existing) {
    const { error: insertError } = await adminClient.from("users").insert({
      id: authData.user.id,
      full_name: authData.user.email?.split("@")[0] || "User",
      email: authData.user.email || "",
      role,
      is_active: true,
      email_verified_at: new Date().toISOString(),
    });

    if (insertError) {
      await supabase.auth.signOut();
      throw new Error("Failed to create profile. Please contact support.");
    }
  } else if (!existing.is_active) {
    await supabase.auth.signOut();
    throw new Error("Account has been suspended. Please contact support.");
  } else if (!existing.email_verified_at) {
    await supabase.auth.signOut();
    throw new Error(
      "Your email has not been verified. Please check your inbox for the verification code."
    );
  }

  // Re-verification after an expired session: keep the session but require OTP.
  if (data.otp_reverify) {
    await createAndSendOtp({
      userId: authData.user.id,
      email: authData.user.email || "",
      purpose: "login",
    });
  }

  return {
    session: authData.session,
    user: authData.user,
    role: role as "customer" | "admin",
    requiresOtp: Boolean(data.otp_reverify),
  };
}

export async function logout() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(error.message);
}

export async function getMe() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const adminClient = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  let { data: profile } = await adminClient
    .from("users")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    const { data: newProfile } = await adminClient
      .from("users")
      .upsert({
        id: user.id,
        full_name: user.email?.split("@")[0] || "User",
        email: user.email || "",
        role: "customer",
        is_active: true,
      }, { onConflict: "id" })
      .select()
      .maybeSingle();

    if (!newProfile) {
      throw new Error("Failed to create profile");
    }

    profile = newProfile;
  }

  if (!profile.is_active) throw new Error("Account has been suspended");

  const { data: seller } = await adminClient
    .from("sellers")
    .select("id, user_id, shop_name, shop_slug, verification_status, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  return { ...user, profile, seller };
}
