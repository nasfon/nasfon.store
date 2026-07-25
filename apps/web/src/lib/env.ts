const REQUIRED_PUBLIC = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

const REQUIRED_SERVER = [
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function validateEnv(): { missing: string[]; ok: boolean } {
  const missingPublic = REQUIRED_PUBLIC.filter((name) => !process.env[name]);
  const missingServer = REQUIRED_SERVER.filter((name) => !process.env[name]);
  const allMissing = [...missingPublic, ...missingServer];
  return { missing: allMissing, ok: allMissing.length === 0 };
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function envOrFallback(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

export function getSupabaseUrl(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return requireEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
}

export function getServiceRoleKey(): string | null {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}
