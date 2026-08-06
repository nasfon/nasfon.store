import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";
import { validateEnv } from "@/lib/env";

const { ok, missing } = validateEnv();
if (!ok) {
  console.error(`[env] Missing variables at startup: ${missing.join(", ")}`);
}

const STATE_CHANGING_METHODS = ["POST", "PATCH", "PUT", "DELETE"];
const customerRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];
const sellerRoutes = ["/seller/dashboard", "/seller/apply"];

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api");
}

function csrfCheck(request: NextRequest): NextResponse | null {
  if (!STATE_CHANGING_METHODS.includes(request.method)) return null;

  // Exempt payment webhooks from CSRF
  if (
    request.nextUrl.pathname.startsWith('/api/v1/payments/webhook/flutterwave') ||
    request.nextUrl.pathname.startsWith('/api/v1/payments/webhook/paystack')
  ) {
    return null;
  }

  const requestedWith = request.headers.get("X-Requested-With");
  if (requestedWith !== "XMLHttpRequest") {
    return NextResponse.json(
      { success: false, message: "CSRF validation failed" },
      { status: 403 }
    );
  }

  const origin = request.headers.get("Origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json(
      { success: false, message: "Invalid origin" },
      { status: 403 }
    );
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS' && isApiRoute(pathname)) {
    const origin = request.headers.get('origin');
    const headers = new Headers();
    if (origin && (origin === process.env.APP_URL || origin === 'https://market.nasfon.com' || origin === 'http://localhost:3000')) {
      headers.set('Access-Control-Allow-Origin', origin);
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      headers.set('Access-Control-Allow-Credentials', 'true');
    }
    return new NextResponse(null, { headers, status: 204 });
  }

  // CSRF protection for state-changing API requests
  if (isApiRoute(pathname)) {
    const csrfResponse = csrfCheck(request);
    if (csrfResponse) return csrfResponse;
  }

  const { supabase, supabaseResponse } = createClient(request);

  // Add CORS headers to the response
  if (isApiRoute(pathname)) {
    const origin = request.headers.get('origin');
    if (origin && (origin === process.env.APP_URL || origin === 'https://market.nasfon.com' || origin === 'http://localhost:3000')) {
      supabaseResponse.headers.set('Access-Control-Allow-Origin', origin);
      supabaseResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
      supabaseResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      supabaseResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    }
  }

  const isAuthRoute = isRouteMatch(pathname, ["/login", "/register"]);
  const isProtectedRoute =
    isRouteMatch(pathname, adminRoutes) ||
    isRouteMatch(pathname, customerRoutes) ||
    isRouteMatch(pathname, sellerRoutes);

  if (!isAuthRoute && !isProtectedRoute) {
    return supabaseResponse;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isProtectedRoute && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
