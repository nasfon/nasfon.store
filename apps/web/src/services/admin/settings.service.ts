import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { adminSettingsSchema } from "@/lib/validation";
import type { z } from "zod";

export async function getAdminSettings() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("settings")
    .select("*")
    .single();

  if (error) throw new Error("Failed to fetch settings");
  return data;
}

export async function updateSettings(data: z.infer<typeof adminSettingsSchema>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const updateData: Record<string, unknown> = {};
  if (data.support_phone !== undefined) updateData.support_phone = data.support_phone;
  if (data.support_email !== undefined) updateData.support_email = data.support_email;
  if (data.store_address !== undefined) updateData.store_address = data.store_address;
  if (data.return_policy !== undefined) updateData.return_policy = data.return_policy;
  if (data.privacy_policy !== undefined) updateData.privacy_policy = data.privacy_policy;
  if (data.terms_conditions !== undefined) updateData.terms_conditions = data.terms_conditions;

  const { data: settings, error } = await supabase
    .from("settings")
    .update(updateData)
    .eq("id", 1)
    .select()
    .single();

  if (error) throw new Error("Failed to update settings");
  return settings;
}
