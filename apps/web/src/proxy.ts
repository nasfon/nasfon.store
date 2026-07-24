import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/middleware";

const customerRoutes = ["/dashboard"];
const adminRoutes = ["/admin"];

function isRouteMatch(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { supabase, supabaseResponse } = createClient(request);

  const isAuthRoute = isRouteMatch(pathname, ["/login", "/register"]);
  const isProtectedRoute =
    isRouteMatch(pathname, adminRoutes) || isRouteMatch(pathname, customerRoutes);

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
