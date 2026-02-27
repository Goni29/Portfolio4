"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useStore } from "@/components/providers/store-provider";
import { CartDrawer } from "@/components/public/shared/cart-drawer";
import { LocaleToggle } from "@/components/shared/locale-toggle";
import { Drawer } from "@/components/ui/drawer";
import { BRAND_LABELS, resolveText } from "@/lib/i18n";
import { stripLocalePrefix, withLocalePath } from "@/lib/locale-routing";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/shop", labelKey: "navShop" as const },
  { href: "/routine", labelKey: "navRoutine" as const },
  { href: "/about", labelKey: "navPhilosophy" as const },
  { href: "/journal", labelKey: "navJournal" as const },
  { href: "/contact", label: { ko: "고객문의", en: "Contact Us" } },
] as const;

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready, currentUser, cartItems, db, logout, locale, setLocale } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [cartOpenPath, setCartOpenPath] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  const headerSearchInputRef = useRef<HTMLInputElement>(null);
  const headerSearchWrapRef = useRef<HTMLDivElement>(null);

  const cartCount = cartItems.reduce((sum, line) => sum + line.quantity, 0);
  const { locale: pathLocale, path: routePath } = useMemo(() => stripLocalePrefix(pathname), [pathname]);
  const localize = useCallback((path: string) => withLocalePath(path, locale), [locale]);
  const accountHref = localize(ready && currentUser?.role === "admin" ? "/admin" : "/account");

  const submitHeaderSearch = useCallback(() => {
    const trimmed = headerSearchQuery.trim();
    if (!trimmed) {
      return;
    }

    const params = new URLSearchParams();
    params.set("q", trimmed);
    router.push(`${localize("/shop")}?${params.toString()}`);
    setHeaderSearchQuery("");
    setHeaderSearchOpen(false);
  }, [headerSearchQuery, localize, router]);

  useEffect(() => {
    if (pathLocale && pathLocale !== locale) {
      setLocale(pathLocale);
    }
  }, [locale, pathLocale, setLocale]);

  useEffect(() => {
    if (headerSearchOpen) {
      headerSearchInputRef.current?.focus();
    }
  }, [headerSearchOpen]);

  useEffect(() => {
    if (!headerSearchOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!headerSearchWrapRef.current?.contains(event.target as Node)) {
        setHeaderSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [headerSearchOpen]);

  const isActive = useMemo(
    () => (href: string) => routePath === href || routePath.startsWith(`${href}/`),
    [routePath],
  );

  const onLocaleChange = useCallback(
    (nextLocale: "ko" | "en") => {
      router.replace(withLocalePath(routePath, nextLocale), { scroll: false });
    },
    [routePath, router],
  );

  const navLabel = (item: (typeof NAV_ITEMS)[number]) => {
    if ("labelKey" in item) {
      return resolveText(BRAND_LABELS[item.labelKey], locale);
    }

    return locale === "ko" ? item.label.ko : item.label.en;
  };

  const cartOpen = routePath === "/cart" || cartOpenPath === routePath;
  const trimmedHeaderSearchQuery = headerSearchQuery.trim();
  const headerSearchResults = useMemo(() => {
    if (!trimmedHeaderSearchQuery) {
      return [];
    }

    const keyword = trimmedHeaderSearchQuery.toLowerCase();
    return db.products
      .filter((product) => {
        const name = resolveText(product.name, locale);
        const shortDescription = resolveText(product.shortDescription, locale);
        const searchable = `${product.slug} ${name} ${shortDescription}`.toLowerCase();
        return searchable.includes(keyword);
      })
      .slice(0, 5);
  }, [db.products, locale, trimmedHeaderSearchQuery]);

  const closeCart = () => {
    setCartOpenPath(null);
    if (routePath === "/cart") {
      router.replace(localize("/shop"));
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen bg-[#fcf8f9] text-[#1b0e11] selection:bg-[#e6194c]/20 selection:text-[#e6194c] flex flex-col",
        locale === "ko" ? "locale-ko" : "locale-en",
      )}
    >
      <header className="fixed inset-x-0 top-0 z-50 h-[var(--public-header-height)] w-full bg-[#fcf8f9]/95 backdrop-blur-md border-b border-[#f3e7ea]/50">
        <div className="container-edge h-full">
          <div className="relative grid h-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-1.5 sm:gap-x-2 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:gap-x-0">
            <div className="relative z-10 flex items-center min-w-0">
              <button
                type="button"
                className="lg:hidden h-8 w-8 min-w-8 sm:h-10 sm:w-10 sm:min-w-10 shrink-0 grid place-items-center text-[#1b0e11]"
                onClick={() => setMenuOpen(true)}
                aria-label={locale === "ko" ? "메뉴 열기" : "Open menu"}
              >
                <span className="material-symbols-outlined font-light">menu</span>
              </button>

              <nav className="hidden lg:flex items-center gap-8">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={localize(item.href)}
                    className={cn(
                      "text-sm uppercase tracking-[0.12em] font-medium text-[#1b0e11]/80 hover:text-[#1b0e11] transition-colors",
                      isActive(item.href) && "text-[#1b0e11]",
                    )}
                  >
                    {navLabel(item)}
                  </Link>
                ))}
              </nav>
            </div>

            <div
              className={cn(
                "absolute inset-y-0 left-1/2 z-20 flex min-w-0 items-center justify-center px-1 transition-transform duration-300 ease-out sm:px-2 lg:static lg:inset-auto lg:left-auto lg:translate-x-0 lg:justify-self-center lg:px-4 lg:z-0",
                headerSearchOpen
                  ? "-translate-x-[138%] sm:-translate-x-1/2"
                  : "-translate-x-1/2",
              )}
            >
              <Link href={localize("/")} className="pointer-events-auto inline-flex max-w-full items-center">
                <Image
                  src="/logo_header.png"
                  alt="Portfolio logo"
                  width={420}
                  height={172}
                  className="h-10 max-w-[132px] w-auto object-contain sm:h-12 sm:max-w-[166px] md:h-14 md:max-w-[196px] lg:h-16 lg:max-w-none"
                  priority
                />
              </Link>
            </div>

            <div className="relative z-10 flex items-center justify-end gap-1 sm:gap-3 lg:gap-6">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-5">
                <LocaleToggle
                  className="hidden sm:inline-flex lg:hidden shrink-0 origin-center scale-[0.92] sm:scale-100"
                  locale={locale}
                  onChange={onLocaleChange}
                  size="compact"
                />
                <LocaleToggle className="hidden lg:inline-flex shrink-0" locale={locale} onChange={onLocaleChange} />
                <div ref={headerSearchWrapRef} className="relative">
                  <div
                    className={cn(
                      "flex h-8 sm:h-10 lg:h-11 shrink-0 items-center overflow-hidden rounded-full transition-[width,background-color] duration-300 ease-out",
                      headerSearchOpen ? "w-[min(26vw,6.75rem)] sm:w-36 md:w-44 lg:w-56 bg-white/90" : "w-8 sm:w-10 lg:w-11 bg-transparent",
                    )}
                  >
                    <button
                      type="button"
                      className="grid h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11 shrink-0 place-items-center text-[#1b0e11] transition-opacity hover:opacity-70"
                      aria-label={resolveText(BRAND_LABELS.navSearch, locale)}
                      aria-expanded={headerSearchOpen}
                      onClick={() => {
                        if (!headerSearchOpen) {
                          setHeaderSearchOpen(true);
                          return;
                        }

                        if (headerSearchQuery.trim()) {
                          submitHeaderSearch();
                          return;
                        }

                        if (headerSearchOpen) {
                          setHeaderSearchQuery("");
                          setHeaderSearchOpen(false);
                        }
                      }}
                    >
                      <span className="material-symbols-outlined text-[18px] lg:text-[20px]">search</span>
                    </button>
                    <input
                      ref={headerSearchInputRef}
                      type="search"
                      value={headerSearchQuery}
                      onChange={(event) => setHeaderSearchQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          submitHeaderSearch();
                          return;
                        }

                        if (event.key === "Escape") {
                          event.preventDefault();
                          setHeaderSearchQuery("");
                          setHeaderSearchOpen(false);
                        }
                      }}
                      placeholder={resolveText(BRAND_LABELS.navSearch, locale)}
                      className={cn(
                        "header-search-input h-full min-w-0 border-none bg-transparent pr-3 text-sm text-[#1b0e11] placeholder:text-[#8f747d] outline-none focus:ring-0 transition-opacity duration-200",
                        headerSearchOpen ? "w-full opacity-100" : "pointer-events-none w-0 opacity-0",
                      )}
                    />
                  </div>

                  {headerSearchOpen && trimmedHeaderSearchQuery && (
                    <div className="fixed left-3 right-3 top-[calc(var(--public-header-height)+0.5rem)] z-[70] overflow-hidden rounded-2xl border border-[#efd9e1] bg-white/95 shadow-[0_18px_42px_rgba(54,17,31,0.2)] backdrop-blur sm:absolute sm:left-1/2 sm:right-auto sm:top-[calc(100%+8px)] sm:w-[min(24rem,calc(100vw-2rem))] sm:-translate-x-1/2">
                      {headerSearchResults.length > 0 ? (
                        <ul className="divide-y divide-[#f2e6ea]">
                          {headerSearchResults.map((product) => (
                            <li key={product.id}>
                              <Link
                                href={localize(`/product/${product.slug}`)}
                                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#fff1f5]"
                                onClick={() => {
                                  setHeaderSearchQuery("");
                                  setHeaderSearchOpen(false);
                                }}
                              >
                                <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-[#f1e3e8] bg-[#fbf5f7]">
                                  <img
                                    src={product.images[0]}
                                    alt={resolveText(product.name, locale)}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold text-[#1b0e11]">
                                    {resolveText(product.name, locale)}
                                  </p>
                                  <p className="truncate text-xs text-[#8c6a74]">
                                    {resolveText(product.shortDescription, locale)}
                                  </p>
                                </div>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="px-4 py-5 text-center text-sm text-[#8c6a74]">
                          {locale === "ko" ? "일치하는 상품이 없습니다." : "No matching products."}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <Link
                  href={localize("/account")}
                  className="h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11 shrink-0 grid place-items-center text-[#1b0e11] hover:opacity-70 transition-opacity"
                  aria-label={resolveText(BRAND_LABELS.navAccount, locale)}
                  onClick={(event) => {
                    if (ready && currentUser?.role === "admin") {
                      event.preventDefault();
                      router.push(localize("/admin"));
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-[18px] lg:text-[20px]">account_circle</span>
                </Link>
                <button
                  type="button"
                  className="relative h-8 w-8 sm:h-10 sm:w-10 lg:h-11 lg:w-11 shrink-0 grid place-items-center text-[#1b0e11] hover:opacity-70 transition-opacity"
                  aria-label={resolveText(BRAND_LABELS.navCart, locale)}
                  onClick={() => setCartOpenPath(routePath)}
                >
                  <span className="material-symbols-outlined text-[18px] lg:text-[20px]">shopping_bag</span>
                  {cartCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 sm:top-1 sm:right-1 flex h-3 w-3 sm:h-3.5 sm:w-3.5 items-center justify-center rounded-full bg-[#e6194c] text-[8px] sm:text-[9px] font-bold text-white">
                      {Math.min(9, cartCount)}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Drawer
        open={menuOpen}
        title={locale === "ko" ? "메뉴" : "Menu"}
        onClose={() => setMenuOpen(false)}
        headerContent={(
          <div className="leading-tight">
            <p className="text-[9px] uppercase tracking-[0.24em] text-[#a78490]">
              {locale === "ko" ? "하이엔드 큐레이션" : "High-End Curation"}
            </p>
            <p className="mt-1 truncate font-serif text-[1.05rem] tracking-[0.02em] text-[#1b0e11]">
              {locale === "ko" ? "포트폴리오 메뉴" : "Portfolio Menu"}
            </p>
          </div>
        )}
        headerActions={(
          <LocaleToggle locale={locale} onChange={onLocaleChange} size="compact" className="inline-flex shrink-0" />
        )}
      >
        <div className="flex min-h-full flex-col text-[#1b0e11]">
          <nav className="pt-4">
            <section>
              <h2 className="mb-4 font-serif text-[10px] uppercase tracking-[0.2em] text-[#a0808a]">
                {locale === "ko" ? "쇼핑" : "Shop"}
              </h2>
              <Link
                href={localize("/shop")}
                className="group flex items-center justify-between py-1"
                onClick={() => setMenuOpen(false)}
              >
                <span className="font-serif text-[1.08rem] sm:text-[1.16rem] leading-tight tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                  {resolveText(BRAND_LABELS.navShop, locale)}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#7a5964] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  arrow_forward
                </span>
              </Link>
            </section>

            <section className="mt-8">
              <h2 className="mb-4 font-serif text-[10px] uppercase tracking-[0.2em] text-[#a0808a]">
                {locale === "ko" ? "루틴" : "Routine"}
              </h2>
              <Link
                href={localize("/routine")}
                className="group flex items-center justify-between py-1"
                onClick={() => setMenuOpen(false)}
              >
                <span className="font-serif text-[1.08rem] sm:text-[1.16rem] leading-tight tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                  {resolveText(BRAND_LABELS.navRoutine, locale)}
                </span>
                <span className="material-symbols-outlined text-[16px] text-[#7a5964] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  arrow_forward
                </span>
              </Link>
            </section>

            <section className="mt-10 space-y-3 border-t border-[#efe2e7] pt-8">
              {NAV_ITEMS.filter((item) => item.href === "/journal" || item.href === "/about" || item.href === "/contact").map((item) => (
                <Link
                  key={item.href}
                  href={localize(item.href)}
                  className="group flex items-center justify-between py-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="font-serif text-[1.08rem] sm:text-[1.16rem] leading-tight tracking-tight transition-transform duration-300 group-hover:translate-x-1">
                    {navLabel(item)}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#7a5964] opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    arrow_forward
                  </span>
                </Link>
              ))}
            </section>

            <section className="mt-8 grid grid-cols-2 gap-y-3 border-t border-[#efe2e7] pt-6 pb-7">
              {currentUser ? (
                <>
                  <Link
                    href={accountHref}
                    className="text-[12px] font-medium tracking-wide text-[#6f5560] transition-colors hover:text-[#1b0e11]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {currentUser.role === "admin"
                      ? locale === "ko"
                        ? "관리자"
                        : "Admin"
                      : resolveText(BRAND_LABELS.navAccount, locale)}
                  </Link>
                  <Link
                    href={localize("/account/orders")}
                    className="text-[12px] font-medium tracking-wide text-[#6f5560] transition-colors hover:text-[#1b0e11]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {locale === "ko" ? "주문 내역" : "My Orders"}
                  </Link>
                  <Link
                    href={localize("/")}
                    className="col-span-2 mt-2 justify-self-start text-[12px] font-medium tracking-wide text-[#6f5560] transition-colors hover:text-[#e6194c]"
                    onClick={(event) => {
                      event.preventDefault();
                      logout();
                      router.push(localize("/"));
                      setMenuOpen(false);
                    }}
                  >
                    {locale === "ko" ? "로그아웃" : "Sign Out"}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={localize("/account/login")}
                    className="text-[12px] font-medium tracking-wide text-[#6f5560] transition-colors hover:text-[#1b0e11]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {resolveText(BRAND_LABELS.navLogin, locale)}
                  </Link>
                  <Link
                    href={localize("/account/register")}
                    className="text-[12px] font-medium tracking-wide text-[#6f5560] transition-colors hover:text-[#1b0e11]"
                    onClick={() => setMenuOpen(false)}
                  >
                    {resolveText(BRAND_LABELS.navRegister, locale)}
                  </Link>
                </>
              )}
            </section>
          </nav>

          <footer className="mt-auto border-t border-[#efe2e7] pt-7">
            <p className="font-serif text-[12px] italic leading-relaxed text-[#6f5560]">
              {locale === "ko" ? "뷰티를 하나의 예술 경험으로 완성합니다." : "Elevating beauty to an art form."}
            </p>
          </footer>
        </div>
      </Drawer>

      <CartDrawer open={cartOpen} onClose={closeCart} />

      <main className="flex-1 pt-[var(--public-header-height)]">{children}</main>

      <footer className="bg-stone-100 border-t border-stone-200 mt-auto">
        <div className="px-6 lg:px-12 py-16">
          <div className="flex flex-col md:flex-row justify-between gap-12">
            <div className="w-full md:w-1/3 space-y-6">
              <Image
                src="/logo_header.png"
                alt="Portfolio logo"
                width={520}
                height={214}
                className="h-16 sm:h-20 w-auto object-contain"
              />
              <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
                {locale === "ko"
                  ? "정제된 효능과 감각적 사용감을 갖춘 스킨케어 루틴을 제안합니다."
                  : "Elevate your daily ritual with precision skincare engineered for visible performance."}
              </p>
            </div>

            <div className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
                  {locale === "ko" ? "컬렉션" : "Collections"}
                </h3>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/collections/ritual-essentials")}>{locale === "ko" ? "리추얼 에센셜" : "Ritual Essentials"}</Link></li>
                  <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/collections/night-repair")}>{locale === "ko" ? "나이트 리페어" : "Night Repair"}</Link></li>
                  <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/collections/daily-defense")}>{locale === "ko" ? "데일리 디펜스" : "Daily Defense"}</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
                  {locale === "ko" ? "브랜드" : "Company"}
                </h3>
                <ul className="space-y-3 text-sm text-slate-500">
                  <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/about")}>{locale === "ko" ? "브랜드 철학" : "Brand Philosophy"}</Link></li>
                  <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/journal")}>{locale === "ko" ? "저널" : "Journal"}</Link></li>
                  <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/contact")}>{locale === "ko" ? "고객문의" : "Contact Us"}</Link></li>
                </ul>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
                  {locale === "ko" ? "뉴스레터" : "Newsletter"}
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                  {locale === "ko"
                    ? "신제품 소식, 리추얼 인사이트, 멤버 전용 혜택을 가장 먼저 받아보세요."
                    : "Receive product launches, ritual insights, and member-only offers first."}
                </p>
                <form
                  className="flex flex-col gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!newsletterEmail.trim()) {
                      return;
                    }
                    setNewsletterSubscribed(true);
                    setNewsletterEmail("");
                  }}
                >
                  <input
                    className="w-full bg-white border-none rounded-sm px-4 py-3 text-sm shadow-sm focus:ring-1 focus:ring-[#e6194c] placeholder:text-slate-400"
                    placeholder={locale === "ko" ? "이메일 주소를 입력해 주세요" : "Enter your email"}
                    type="email"
                    value={newsletterEmail}
                    onChange={(event) => {
                      setNewsletterEmail(event.target.value);
                      if (newsletterSubscribed) {
                        setNewsletterSubscribed(false);
                      }
                    }}
                  />
                  <button
                    className="w-full bg-[#e6194c] text-white px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-[#cb1743] transition-colors"
                    type="submit"
                  >
                    {locale === "ko" ? "구독하기" : "Subscribe"}
                  </button>
                  <p className="text-[11px] text-slate-400">
                    {newsletterSubscribed
                      ? locale === "ko"
                        ? "구독이 완료되었습니다."
                        : "Thanks for subscribing."
                      : locale === "ko"
                        ? "구독 시 개인정보 처리방침에 동의한 것으로 간주됩니다."
                        : "By subscribing, you agree to our Privacy Policy."}
                  </p>
                </form>
              </div>
            </div>
          </div>

          <div className="border-t border-stone-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>Copyright 2026 Portfolio Beauty. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-[#e6194c] transition-colors" href="#">
                {locale === "ko" ? "개인정보 처리방침" : "Privacy Policy"}
              </a>
              <a className="hover:text-[#e6194c] transition-colors" href="#">
                {locale === "ko" ? "이용약관" : "Terms of Service"}
              </a>
              <a className="hover:text-[#e6194c] transition-colors" href="#">
                {locale === "ko" ? "배송 정책" : "Shipping Policy"}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
