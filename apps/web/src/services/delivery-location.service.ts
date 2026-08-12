import { createPublicClient } from "@/utils/supabase/server";

export async function getActiveDeliveryLocations() {
  const supabase = createPublicClient();

  const { data, error } = await supabase
    .from("delivery_locations")
    .select("*")
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw new Error("Failed to fetch delivery locations");
  const seen = new Set<string>();
  return (data || []).filter((loc) => {
    const key = loc.name.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
