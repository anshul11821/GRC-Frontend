import { NextResponse, type NextRequest } from "next/server";

import { WAITLIST_MODE } from "@/lib/flags";

// Next 16 renamed the `middleware` convention to `proxy`.
// Pre-launch, the only things the public may reach are the landing page and the waitlist form.
// Everything else — the app, signin, signup, tracks, cv, verify — redirects to /waitlist.
const PUBLIC_PATHS = new Set(["/", "/waitlist"]);

export function proxy(request: NextRequest) {
  if (!WAITLIST_MODE) return NextResponse.next();

  const { pathname } = request.nextUrl;
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  return NextResponse.redirect(new URL("/waitlist", request.url));
}

export const config = {
  // Skip Next internals and anything with a file extension (favicon, images, robots.txt) so
  // static assets on the landing page keep loading.
  matcher: ["/((?!_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
