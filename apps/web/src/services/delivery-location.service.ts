import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function getActiveDeliveryLocations() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("delivery_locations")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error("Failed to fetch delivery locations");
  return data || [];
}
