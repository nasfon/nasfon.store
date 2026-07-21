import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function register(data: {
  full_name: string;
  email: string;
  password: string;
  phone_number?: string;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (signUpError) throw new Error(signUpError.message);
  if (!authData.user) throw new Error("Failed to create user");

  const { error: profileError } = await supabase.from("users").insert({
    id: authData.user.id,
    full_name: data.full_name,
    email: data.email,
    phone_number: data.phone_number || null,
    role: "customer",
    is_active: true,
  });

  if (profileError) {
    await supabase.auth.admin.deleteUser(authData.user.id);
    throw new Error("Failed to create profile");
  }

  return { user: authData.user };
}

export async function login(data: { email: string; password: string }) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) throw new Error(error.message);
  return { session: authData.session, user: authData.user };
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

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) throw new Error("Not authenticated");

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return { ...user, profile };
}

export async function forgotPassword(email: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const appUrl = process.env.APP_URL || "http://localhost:3000";

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
