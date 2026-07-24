import { createAdminClient } from "@/utils/supabase/admin";
import type { adminCustomerUpdateSchema } from "@/lib/validation";
import type { z } from "zod";

export async function getAdminCustomers() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch customers");
  return data || [];
}

export async function getAdminCustomerById(id: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error("Customer not found");
  return data;
}

export async function updateCustomer(id: string, data: z.infer<typeof adminCustomerUpdateSchema>) {
  const supabase = createAdminClient();

  const { data: customer, error } = await supabase
    .from("users")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update customer");
  return customer;
}
