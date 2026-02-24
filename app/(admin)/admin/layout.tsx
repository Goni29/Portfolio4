"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
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

const MENU_CONTENT_HINTS: Record<string, string[]> = {
  "/admin": ["dashboard", "overview", "analytics", "summary", "대시보드", "개요", "요약", "통계"],
  "/admin/orders": ["orders", "payment", "shipping", "tracking", "refund", "status", "주문", "결제", "배송", "운송장", "환불", "상태"],
  "/admin/products": ["products", "inventory", "stock", "sku", "category", "ingredients", "제품", "재고", "카테고리", "성분"],
  "/admin/collections": ["collections", "curation", "sort", "featured", "컬렉션", "큐레이션", "정렬", "노출"],
  "/admin/customers": ["customers", "accounts", "profile", "address", "membership", "고객", "계정", "프로필", "주소", "회원"],
  "/admin/reviews": ["reviews", "rating", "approval", "feedback", "리뷰", "평점", "승인", "피드백"],
  "/admin/inquiries": ["inquiries", "support", "ticket", "message", "문의", "고객지원", "티켓", "메시지"],
  "/admin/journal": ["journal", "article", "content", "publish", "저널", "아티클", "콘텐츠", "게시"],
  "/admin/banners": ["banners", "hero", "headline", "cta", "배너", "히어로", "헤드라인", "노출"],
  "/admin/coupons": ["coupons", "discount", "promotion", "code", "쿠폰", "할인", "프로모션", "코드"],
  "/admin/settings": ["settings", "store", "shipping", "tax", "support", "설정", "스토어", "배송", "세금", "지원"],
};

function normalizeSearchText(value: string): string {
  return value.toLowerCase().replace(/\s+/g, " ").trim();
}

function flattenSearchValue(value: unknown): string[] {
  if (value == null) {
    return [];
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap(flattenSearchValue);
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(flattenSearchValue);
  }
  return [];
}

function buildSearchBlob(...values: unknown[]): string {
  return normalizeSearchText(values.flatMap(flattenSearchValue).join(" "));
}

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, currentUser, logout, locale, setLocale, db } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const { locale: pathLocale, path: routePath } = useMemo(() => stripLocalePrefix(pathname), [pathname]);
  const localize = (path: string, targetLocale = locale) => withLocalePath(path, targetLocale);
  const isLoginPage = routePath === "/admin/login";
  const activeMenuItem = useMemo(() => ADMIN_MENU.find((item) => isActivePath(routePath, item.href)) ?? null, [routePath]);
  const currentSection = useMemo(
    () => activeMenuItem?.label[locale] ?? (locale === "ko" ? "관리자" : "Admin"),
    [activeMenuItem, locale],
  );
  const [adminMenuQuery, setAdminMenuQuery] = useState("");
  const normalizedMenuQuery = normalizeSearchText(adminMenuQuery);
  const queryTokens = useMemo(() => normalizedMenuQuery.split(" ").filter(Boolean), [normalizedMenuQuery]);
  const menuContentSearchIndex = useMemo<Record<string, string>>(
    () => ({
      "/admin": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin"],
        `${db.orders.length} orders`,
        `${db.products.length} products`,
        `${db.users.length} customers`,
        `${db.reviews.length} reviews`,
        `${db.inquiries.length} inquiries`,
      ),
      "/admin/orders": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin/orders"],
        db.orders.map((order) => [
          order.id,
          order.status,
          order.paymentStatus,
          order.trackingNumber,
          order.couponCode,
          order.refundRequested,
          order.shippingAddress,
          order.subtotal,
          order.discount,
          order.total,
          order.createdAt,
        ]),
      ),
      "/admin/products": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin/products"],
        db.products.map((product) => [
          product.id,
          product.slug,
          product.name,
          product.shortDescription,
          product.description,
          product.category,
          product.skinTypes,
          product.concerns,
          product.price,
          product.compareAtPrice,
          product.badge,
          product.ingredients,
          product.howToUse,
          product.routineTip,
          product.collectionSlugs,
          product.isFeatured,
        ]),
      ),
      "/admin/collections": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin/collections"],
        db.collections.map((collection) => [
          collection.id,
          collection.slug,
          collection.name,
          collection.description,
          collection.productSlugs,
          collection.sortOrder,
        ]),
      ),
      "/admin/customers": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin/customers"],
        db.users.map((user) => [
          user.id,
          user.name,
          user.email,
          user.role,
          user.addresses,
          user.createdAt,
        ]),
      ),
      "/admin/reviews": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin/reviews"],
        db.reviews.map((review) => [
          review.id,
          review.productSlug,
          review.userName,
          review.rating,
          review.title,
          review.body,
          review.approved,
          review.createdAt,
        ]),
      ),
      "/admin/inquiries": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin/inquiries"],
        db.inquiries.map((inquiry) => [
          inquiry.id,
          inquiry.userName,
          inquiry.userEmail,
          inquiry.topic,
          inquiry.message,
          inquiry.status,
          inquiry.adminNote,
          inquiry.createdAt,
          inquiry.updatedAt,
        ]),
      ),
      "/admin/journal": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin/journal"],
        db.articles.map((article) => [
          article.id,
          article.slug,
          article.title,
          article.excerpt,
          article.content,
          article.category,
          article.relatedProductSlugs,
          article.publishedAt,
        ]),
      ),
      "/admin/banners": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin/banners"],
        db.banners.map((banner) => [
          banner.id,
          banner.key,
          banner.type,
          banner.url,
          banner.headline,
          banner.subheadline,
          banner.ctaText,
          banner.ctaHref,
          banner.active,
        ]),
      ),
      "/admin/coupons": buildSearchBlob(
        MENU_CONTENT_HINTS["/admin/coupons"],
        db.coupons.map((coupon) => [
          coupon.id,
          coupon.code,
          coupon.type,
          coupon.value,
          coupon.minSubtotal,
          coupon.active,
          coupon.expiresAt,
        ]),
      ),
      "/admin/settings": buildSearchBlob(MENU_CONTENT_HINTS["/admin/settings"], db.settings),
    }),
    [db],
  );
  const adminMenuSearchIndex = useMemo<Record<string, string>>(
    () =>
      Object.fromEntries(
        ADMIN_MENU.map((item) => [
          item.href,
          buildSearchBlob(
            item.label.ko,
            item.label.en,
            item.href,
            item.icon,
            MENU_CONTENT_HINTS[item.href] ?? [],
            menuContentSearchIndex[item.href] ?? "",
          ),
        ]),
      ),
    [menuContentSearchIndex],
  );
  const filteredAdminMenu = useMemo(() => {
    if (queryTokens.length === 0) {
      return ADMIN_MENU;
    }
    return ADMIN_MENU.filter((item) => queryTokens.every((token) => (adminMenuSearchIndex[item.href] ?? "").includes(token)));
  }, [queryTokens, adminMenuSearchIndex]);
  const noMenuMatches = filteredAdminMenu.length === 0;

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
            <Link href={localize("/")} className="flex items-center gap-2.5 text-slate-900">
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
                className="admin-menu-search-input ml-2 w-full border-none bg-transparent p-0 text-sm text-slate-600 placeholder:text-slate-400 focus:ring-0"
                placeholder={t("관리자 메뉴 검색", "Search admin")}
                type="search"
                value={adminMenuQuery}
                onChange={(event) => setAdminMenuQuery(event.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex h-9 max-w-[42vw] items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600">
              <span className="material-symbols-outlined text-[15px] text-slate-500">{activeMenuItem?.icon ?? "dashboard"}</span>
              <span className="truncate">{currentSection}</span>
            </div>

            <Link
              href={localize("/shop")}
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
            {filteredAdminMenu.map((item) => {
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
            {noMenuMatches && (
              <p className="px-3 py-2 text-sm text-slate-400">{t("검색 결과가 없습니다.", "No matching menu results.")}</p>
            )}
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


