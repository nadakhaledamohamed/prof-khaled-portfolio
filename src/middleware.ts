import { NextResponse, type NextRequest } from "next/server";
import { LOCALE_COOKIE } from "@/i18n/config";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/session";

/**
 * Admin: every /admin page except the login page needs a valid session.
 *
 * Locale routing for the public site:
 *   /        → English (rewritten internally to /en)
 *   /ar      → Arabic
 *   /en/...  → redirected to the unprefixed URL so each page has one canonical address
 * A visitor who last chose Arabic is sent from "/" to "/ar".
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
    if (!session) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const headers = new Headers(request.headers);

  if (pathname === "/ar" || pathname.startsWith("/ar/")) {
    headers.set("x-locale", "ar");
    return NextResponse.next({ request: { headers } });
  }

  if (pathname === "/" && request.cookies.get(LOCALE_COOKIE)?.value === "ar") {
    const url = request.nextUrl.clone();
    url.pathname = "/ar";
    return NextResponse.redirect(url, 307);
  }

  headers.set("x-locale", "en");
  const url = request.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  // Skip API routes, uploaded media, Next internals and any path with a file extension.
  matcher: ["/((?!api|media|_next|.*\\..*).*)"],
};
