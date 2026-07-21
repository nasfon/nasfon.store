import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { adminDeliveryLocationSchema, adminDeliveryLocationUpdateSchema } from "@/lib/validation";
import type { z } from "zod";

export async function getAdminDeliveryLocations() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("delivery_locations")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error("Failed to fetch delivery locations");
  return data || [];
}

export async function createDeliveryLocation(data: z.infer<typeof adminDeliveryLocationSchema>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: location, error } = await supabase
    .from("delivery_locations")
    .insert(data)
    .select()
    .single();

  if (error) throw new Error("Failed to create delivery location");
  return location;
}

export async function updateDeliveryLocation(id: string, data: z.infer<typeof adminDeliveryLocationUpdateSchema>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: location, error } = await supabase
    .from("delivery_locations")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update delivery location");
  return location;
}

export async function deleteDeliveryLocation(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase
    .from("delivery_locations")
    .delete()
    .eq("id", id);

  if (error) throw new Error("Failed to delete delivery location");
}
