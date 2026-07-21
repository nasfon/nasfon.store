import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export function successResponse<T>(data: T, message = "Success", status = 200) {
  return NextResponse.json(
    { success: true, message, data } satisfies ApiResponse<T>,
    { status }
  );
}

export function errorResponse(
  message: string,
  errors?: string[],
  status = 400
) {
  return NextResponse.json(
    { success: false, message, errors } satisfies ApiResponse,
    { status }
  );
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getAuthUser();
  if (!user) {
    return { user: null, error: errorResponse("Unauthorized", [], 401) };
  }
  return { user, error: null };
}

export async function requireAdmin() {
  const result = await requireUser();
  if (result.error) return result;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", result.user.id)
    .single();

  if (profile?.role !== "admin") {
    return { user: null, error: errorResponse("Forbidden", [], 403) };
  }
  return result;
}
