import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { rateLimitMiddleware, getRateLimitHeaders } from "@/lib/rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function createRouteHandlerClient(request: NextRequest) {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
      },
    },
  });
}

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

export async function requireUser(request?: NextRequest) {
  const supabase = request
    ? createRouteHandlerClient(request)
    : createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: errorResponse("Unauthorized", [], 401) };
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("users")
    .select("is_active")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return { user: null, error: errorResponse("Profile not found", [], 401) };
  }

  if (!profile.is_active) {
    return { user: null, error: errorResponse("Account has been suspended", [], 403) };
  }

  return { user, error: null };
}

export async function requireAdmin(request?: NextRequest) {
  const supabase = request
    ? createRouteHandlerClient(request)
    : createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, error: errorResponse("Unauthorized", [], 401) };
  }

  const adminClient = createAdminClient();
  const { data: profile } = await adminClient
    .from("users")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.is_active) {
    return { user: null, error: errorResponse("Unauthorized", [], 401) };
  }

  if (profile.role !== "admin") {
    return { user: null, error: errorResponse("Forbidden: admin role required", [], 403) };
  }

  return { user, error: null };
}

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1"
  );
}

export async function withRateLimit(
  request: NextRequest,
  group: Parameters<typeof rateLimitMiddleware>[1]
): Promise<NextResponse | null> {
  const ip = getClientIp(request);
  const result = rateLimitMiddleware(ip, group);
  if (!result.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." } satisfies ApiResponse,
      {
        status: 429,
        headers: getRateLimitHeaders(result),
      }
    );
  }
  return null;
}
