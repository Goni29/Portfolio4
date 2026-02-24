import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const LOCALE_COOKIE = "portfolio4_locale";
const LOCALE_PREFIX = /^\/(ko|en)(?=\/|$)/;
const STATIC_FILE = /\.[^/]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/favicon.ico" ||
    STATIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const localeMatch = pathname.match(LOCALE_PREFIX);
  if (!localeMatch) {
    const preferred = request.cookies.get(LOCALE_COOKIE)?.value;
    const locale = preferred === "en" ? "en" : "ko";
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
    return NextResponse.redirect(redirectUrl);
  }

  const locale = localeMatch[1];
  const internalPath = pathname.replace(LOCALE_PREFIX, "") || "/";
  const rewriteUrl = request.nextUrl.clone();
  rewriteUrl.pathname = internalPath;

  const response = NextResponse.rewrite(rewriteUrl);
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/:path*"],
};
