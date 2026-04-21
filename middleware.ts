import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasAuthToken = request.cookies.has("access_token");

  const protectedRoutes = [
    "/dashboard/company",
    "/dashboard/inventory",
    "/dashboard/invoices",
    "/dashboard/customers",
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !hasAuthToken) {
    return NextResponse.redirect(new URL("/signup", request.url));
  }

  return NextResponse.next();
}

/**
 * Only run middleware on dashboard routes
 */
export const config = {
  matcher: ["/dashboard/:path*"],
};
