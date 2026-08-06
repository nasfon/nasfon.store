import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { siteConfig } from "@/lib/seo";

async function cleanupAuthUser(userId: string) {
  try {
    const adminClient = createAdminClient();
    await adminClient.auth.admin.deleteUser(userId);
  } catch {
    console.warn("Could not clean up auth user — SUPABASE_SERVICE_ROLE_KEY may not be set");
  }
}

export async function register(data: {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const adminClient = createAdminClient();

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (signUpError) throw new Error(signUpError.message);
  if (!authData.user) throw new Error("Failed to create user");

  const { error: profileError } = await adminClient.from("users").insert({
    id: authData.user.id,
    full_name: data.full_name,
    email: data.email,
    phone_number: data.phone_number || null,
    role: "customer",
    is_active: true,
  });

  if (profileError) {
    await cleanupAuthUser(authData.user.id);
    throw new Error("Failed to create profile");
  }

  return { user: authData.user };
}

export async function login(data: { email: string; password: string }) {
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
    .select("role, is_active")
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
    });

    if (insertError) {
      await supabase.auth.signOut();
      throw new Error("Failed to create profile. Please contact support.");
    }
  } else if (!existing.is_active) {
    await supabase.auth.signOut();
    throw new Error("Account has been suspended. Please contact support.");
  }

  return { session: authData.session, user: authData.user, role: role as "customer" | "admin" };
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

  return { ...user, profile };
}

export async function forgotPassword(email: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const appUrl = process.env.APP_URL || siteConfig.url;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/reset-password`,
  });

  if (error) throw new Error(error.message);
}

export async function resetPassword(password: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error(error.message);
}
