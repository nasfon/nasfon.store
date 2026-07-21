import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { adminCustomerUpdateSchema } from "@/lib/validation";
import type { z } from "zod";

export async function getAdminCustomers() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Failed to fetch customers");
  return data || [];
}

export async function getAdminCustomerById(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error("Customer not found");
  return data;
}

export async function updateCustomer(id: string, data: z.infer<typeof adminCustomerUpdateSchema>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: customer, error } = await supabase
    .from("users")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error("Failed to update customer");
  return customer;
}
