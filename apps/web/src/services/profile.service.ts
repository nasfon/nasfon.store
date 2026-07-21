import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getProfile(userId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw new Error("Profile not found");
  return data;
}

export async function updateProfile(
  userId: string,
  data: {
    full_name?: string;
    phone_number?: string;
    avatar_url?: string | null;
  }
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const updateData: Record<string, unknown> = {};
  if (data.full_name !== undefined) updateData.full_name = data.full_name;
  if (data.phone_number !== undefined) updateData.phone_number = data.phone_number;
  if (data.avatar_url !== undefined) updateData.avatar_url = data.avatar_url;

  if (Object.keys(updateData).length === 0) {
    throw new Error("No fields to update");
  }

  const { data: profile, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw new Error("Failed to update profile");
  return profile;
}
