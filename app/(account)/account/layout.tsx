"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, type ReactNode } from "react";
import { PublicShell } from "@/components/layout/public-shell";
import { useStore } from "@/components/providers/store-provider";
import { stripLocalePrefix, withLocalePath } from "@/lib/locale-routing";
import { cn } from "@/lib/utils";

const ACCOUNT_MENU = [
  { href: "/account", label: { ko: "\uB300\uC2DC\uBCF4\uB4DC", en: "Dashboard" } },
  { href: "/account/orders", label: { ko: "\uC8FC\uBB38 \uB0B4\uC5ED", en: "My Orders" } },
  { href: "/account/wishlist", label: { ko: "\uC704\uC2DC\uB9AC\uC2A4\uD2B8", en: "Wishlist" } },
  { href: "/account/addresses", label: { ko: "\uC8FC\uC18C\uB85D", en: "Addresses" } },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, currentUser, logout, locale, setLocale } = useStore();
  const { locale: pathLocale, path: routePath } = useMemo(() => stripLocalePrefix(pathname), [pathname]);
  const localize = (path: string, targetLocale = locale) => withLocalePath(path, targetLocale);

  const isAuthPage = routePath === "/account/login" || routePath === "/account/register";

  useEffect(() => {
    if (pathLocale && pathLocale !== locale) {
      setLocale(pathLocale);
    }
  }, [pathLocale, locale, setLocale]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (isAuthPage && currentUser) {
      router.replace(withLocalePath(currentUser.role === "admin" ? "/admin" : "/account", locale));
      return;
    }
    if (!isAuthPage && !currentUser) {
      router.replace(withLocalePath("/account/login", locale));
      return;
    }
    if (!isAuthPage && currentUser?.role === "admin") {
      router.replace(withLocalePath("/admin", locale));
    }
  }, [ready, isAuthPage, currentUser, router, locale]);

  if (!ready) {
    return (
      <div className={cn("min-h-[60vh] grid place-items-center", locale === "ko" ? "locale-ko" : "locale-en")}>
        {locale === "ko" ? "\uB85C\uB529 \uC911..." : "Loading..."}
      </div>
    );
  }

  if (isAuthPage) {
    return (
      <PublicShell>
        <div className={cn("smart-wrap min-h-[calc(100vh-var(--public-header-height))] bg-white", locale === "ko" ? "locale-ko" : "locale-en")}>
          {children}
        </div>
      </PublicShell>
    );
  }

  if (!currentUser || currentUser.role === "admin") {
    return null;
  }

  return (
    <PublicShell>
      <div className={cn("w-full max-w-[1440px] mx-auto px-4 sm:px-6 md:px-10 lg:px-20 pt-3 pb-10 smart-wrap", locale === "ko" ? "locale-ko" : "locale-en")}>
        <div className="bg-[#e6194c] text-white text-xs font-semibold tracking-widest uppercase text-center py-2 px-4 rounded-md mb-8">
          {locale === "ko"
            ? "\uC8FC\uBB38 \uAE08\uC561 $75 \uC774\uC0C1 \uBB34\uB8CC \uBC30\uC1A1"
            : "Complimentary Shipping on Orders Over $75"}
        </div>
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="flex flex-col gap-1 sticky top-[var(--public-sticky-offset)] rounded-xl border border-[#f3e7ea] bg-white p-3">
              <div className="mb-4 px-2 pt-1">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-1">
                  {locale === "ko" ? "\uB0B4 \uACC4\uC815" : "My Account"}
                </p>
                <h2 className="text-xl font-bold text-slate-900">{currentUser.name}</h2>
              </div>
              {ACCOUNT_MENU.map((item) => (
                <Link
                  key={item.href}
                  href={localize(item.href)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors",
                    routePath === item.href || routePath.startsWith(`${item.href}/`)
                      ? "bg-[#fcf8f9] text-[#e6194c] border-l-2 border-[#e6194c] font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-[#e6194c]",
                  )}
                >
                  {item.label[locale]}
                </Link>
              ))}
              <button
                type="button"
                className="mt-3 h-10 px-4 rounded-lg border border-[#f3e7ea] text-sm font-semibold text-slate-600 hover:text-[#e6194c] transition-colors"
                onClick={() => {
                  logout();
                  router.push(localize("/"));
                }}
              >
                {locale === "ko" ? "\uB85C\uADF8\uC544\uC6C3" : "Sign Out"}
              </button>
            </nav>
          </aside>

          <section className="flex-1 smart-wrap">{children}</section>
        </div>
      </div>
    </PublicShell>
  );
}
