import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // We are bypassing this because Vercel edge servers cannot read 
  // cross-domain cookies set by Render. 
  // We will protect our routes on the client-side instead.
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};