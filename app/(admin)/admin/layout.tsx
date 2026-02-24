"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, type ReactNode } from "react";
import { useStore } from "@/components/providers/store-provider";
import { stripLocalePrefix, withLocalePath } from "@/lib/locale-routing";
import { cn } from "@/lib/utils";

const ADMIN_MENU = [
  { href: "/admin", label: { ko: "대시보드", en: "Dashboard" }, icon: "dashboard" },
  { href: "/admin/orders", label: { ko: "주문", en: "Orders" }, icon: "shopping_bag" },
  { href: "/admin/products", label: { ko: "제품", en: "Products" }, icon: "sell" },
  { href: "/admin/collections", label: { ko: "컬렉션", en: "Collections" }, icon: "category" },
  { href: "/admin/customers", label: { ko: "고객", en: "Customers" }, icon: "group" },
  { href: "/admin/reviews", label: { ko: "리뷰", en: "Reviews" }, icon: "rate_review" },
  { href: "/admin/inquiries", label: { ko: "문의", en: "Inquiries" }, icon: "contact_support" },
  { href: "/admin/journal", label: { ko: "저널", en: "Journal" }, icon: "article" },
  { href: "/admin/banners", label: { ko: "배너", en: "Banners" }, icon: "photo" },
  { href: "/admin/coupons", label: { ko: "쿠폰", en: "Coupons" }, icon: "loyalty" },
  { href: "/admin/settings", label: { ko: "설정", en: "Settings" }, icon: "settings" },
];

const TOP_NAV_MENU = ADMIN_MENU;

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, currentUser, logout, locale, setLocale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const { locale: pathLocale, path: routePath } = useMemo(() => stripLocalePrefix(pathname), [pathname]);
  const localize = (path: string, targetLocale = locale) => withLocalePath(path, targetLocale);
  const isLoginPage = routePath === "/admin/login";
  const currentSection = useMemo(
    () => ADMIN_MENU.find((item) => isActivePath(routePath, item.href))?.label[locale] ?? (locale === "ko" ? "관리자" : "Admin"),
    [routePath, locale],
  );

  useEffect(() => {
    if (pathLocale && pathLocale !== locale) {
      setLocale(pathLocale);
    }
  }, [pathLocale, locale, setLocale]);

  useEffect(() => {
    if (!ready) {
      return;
    }
    if (isLoginPage && currentUser?.role === "admin") {
      router.replace(withLocalePath("/admin", locale));
      return;
    }
    if (!isLoginPage && !currentUser) {
      router.replace(withLocalePath("/admin/login", locale));
      return;
    }
    if (!isLoginPage && currentUser?.role !== "admin") {
      router.replace(withLocalePath("/account", locale));
    }
  }, [ready, isLoginPage, currentUser, router, locale]);

  if (!ready) {
    return (
      <div className={cn("min-h-[60vh] grid place-items-center", locale === "ko" ? "locale-ko" : "locale-en")}>
        {t("로딩 중...", "Loading...")}
      </div>
    );
  }

  if (isLoginPage) {
    return <div className={cn("min-h-screen bg-[#f8f6f6] text-slate-900", locale === "ko" ? "locale-ko" : "locale-en")}>{children}</div>;
  }

  if (!currentUser || currentUser.role !== "admin") {
    return null;
  }

  return (
    <div className={cn("flex min-h-screen w-full flex-col bg-[#f8f6f6] text-slate-900", locale === "ko" ? "locale-ko" : "locale-en")}>
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <div className="flex min-w-0 items-center gap-5">
            <Link href={localize("/admin")} className="flex items-center gap-2.5 text-slate-900">
              <Image
                src="/logo_header.png"
                alt="Portfolio logo"
                width={320}
                height={132}
                className="h-12 sm:h-14 w-auto object-contain"
                priority
              />
              <span className="inline-flex h-6 items-center rounded-full bg-[#e6194c]/10 px-2.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#e6194c]">
                Admin
              </span>
            </Link>

            <div className="hidden items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 md:flex md:w-72">
              <span className="material-symbols-outlined text-[18px] text-slate-400">search</span>
              <input
                className="ml-2 w-full border-none bg-transparent p-0 text-sm text-slate-600 placeholder:text-slate-400 focus:ring-0"
                placeholder={t("관리자 메뉴 검색", "Search admin")}
                readOnly
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <nav className="no-scrollbar hidden max-w-[50vw] items-center gap-1 overflow-x-auto lg:flex">
              {TOP_NAV_MENU.map((item) => {
                const isActive = isActivePath(routePath, item.href);
                return (
                  <Link
                    key={item.href}
                    href={localize(item.href)}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#e6194c]/10 text-[#e6194c]"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    {item.label[locale]}
                  </Link>
                );
              })}
            </nav>

            <Link
              href={localize("/")}
              className="hidden h-9 items-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:inline-flex"
            >
              {t("스토어 보기", "View Store")}
            </Link>
            <button
              type="button"
              className="inline-flex h-9 items-center rounded-lg bg-[#e6194c] px-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:bg-[#e6194c]/90"
              onClick={() => {
                logout();
                router.push(localize("/admin/login"));
              }}
            >
              {t("로그아웃", "Sign Out")}
            </button>
          </div>
        </div>

        <nav className="border-t border-slate-200 lg:hidden">
          <div className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2 sm:px-6">
            {TOP_NAV_MENU.map((item) => {
              const isActive = isActivePath(routePath, item.href);
              return (
                <Link
                  key={item.href}
                  href={localize(item.href)}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
                    isActive
                      ? "bg-[#e6194c]/10 text-[#e6194c]"
                      : "bg-slate-100 text-slate-500 hover:text-slate-900",
                  )}
                >
                  {item.label[locale]}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white xl:flex">
          <div className="border-b border-slate-200 px-4 py-5">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e6194c]/10 text-[#e6194c]">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{currentUser.name}</p>
                <p className="truncate text-xs text-slate-500">{currentUser.email}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {ADMIN_MENU.map((item) => {
              const isActive = isActivePath(routePath, item.href);
              return (
                <Link
                  key={item.href}
                  href={localize(item.href)}
                  className={cn(
                    "group mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-[#e6194c]/10 text-[#e6194c]"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-[19px] transition-colors",
                      isActive ? "text-[#e6194c]" : "text-slate-400 group-hover:text-[#e6194c]",
                    )}
                  >
                    {item.icon}
                  </span>
                  <span className="truncate font-medium">{item.label[locale]}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 overflow-y-auto bg-[#f8f6f6]">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
            <div className="mb-6 flex items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                <span>{t("관리자", "Admin")}</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="font-semibold text-slate-700">{currentSection}</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 hover:text-slate-900 xl:hidden"
                onClick={() => {
                  router.push(localize("/admin"));
                }}
              >
                <span className="material-symbols-outlined text-[16px]">grid_view</span>
                {t("대시보드", "Dashboard")}
              </button>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}


