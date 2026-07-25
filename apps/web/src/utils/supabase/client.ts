import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseAnonKey } from "@/lib/env";

export const createClient = () =>
  createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
  );
