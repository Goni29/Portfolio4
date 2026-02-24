import type { Locale } from "@/lib/types";

const LOCALE_PATTERN = /^\/(ko|en)(?=\/|$)/;

export function stripLocalePrefix(pathname: string): { locale: Locale | null; path: string } {
  const normalized = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const match = normalized.match(LOCALE_PATTERN);

  if (!match) {
    return { locale: null, path: normalized };
  }

  const stripped = normalized.replace(LOCALE_PATTERN, "") || "/";
  return { locale: match[1] as Locale, path: stripped };
}

export function withLocalePath(path: string, locale: Locale): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const { path: basePath } = stripLocalePrefix(normalized);
  return basePath === "/" ? `/${locale}` : `/${locale}${basePath}`;
}
