"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { Drawer } from "@/components/ui/drawer";
import { resolveText } from "@/lib/i18n";
import { withLocalePath } from "@/lib/locale-routing";
import {
  getDefaultProductSizeKey,
} from "@/lib/product-pricing";
import type { Concern, Product, ProductFilters, SkinType } from "@/lib/types";
import { currency } from "@/lib/utils";

type ShopFilters = ProductFilters & {
  collection: string;
};

type ActivePanel = "all" | "category" | "concern" | "collection" | "sort";
type DesktopPanel = Exclude<ActivePanel, "all">;

const DEFAULT_FILTERS: ShopFilters = {
  category: "all",
  skinType: "all",
  concern: "all",
  collection: "all",
  minPrice: 0,
  maxPrice: 250,
};

const SORTS = ["newest", "priceAsc", "priceDesc", "best"] as const;
const SHOP_PAGE_SIZE = 8;

const resolveSearchText = (
  value: Product["name"] | Product["shortDescription"] | Product["description"],
): string => {
  if (typeof value === "string") {
    return value;
  }

  return `${value.ko} ${value.en}`;
};

export function ShopView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { db, addToCart, currentUser, toggleWishlist, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();

  const [filters, setFilters] = useState<ShopFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("newest");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>("all");
  const [desktopPanel, setDesktopPanel] = useState<DesktopPanel | null>(null);
  const [desktopPanelLeft, setDesktopPanelLeft] = useState(0);
  const [desktopPanelRight, setDesktopPanelRight] = useState<number | null>(null);
  const desktopMenuRef = useRef<HTMLDivElement | null>(null);

  const sortLabel = (key: (typeof SORTS)[number]) => {
    if (key === "newest") return t("최신순", "Newest");
    if (key === "priceAsc") return t("가격 낮은순", "Price: Low to High");
    if (key === "priceDesc") return t("가격 높은순", "Price: High to Low");
    return t("평점순", "Best Rated");
  };

  const categoryLabelText = (key: string) => {
    const labels: Record<string, { ko: string; en: string }> = {
      cleanser: { ko: "클렌저", en: "Cleanser" },
      serum: { ko: "세럼", en: "Serum" },
      moisturizer: { ko: "모이스처라이저", en: "Moisturizer" },
      sunscreen: { ko: "선스크린", en: "Sunscreen" },
      mask: { ko: "마스크", en: "Mask" },
      tool: { ko: "뷰티 툴", en: "Beauty Tool" },
      all: { ko: "전체", en: "All" },
    };
    const label = labels[key];
    if (!label) {
      return key;
    }
    return locale === "ko" ? label.ko : label.en;
  };

  const concernLabelText = (key: string) => {
    const labels: Record<string, { ko: string; en: string }> = {
      hydration: { ko: "수분 공급", en: "Hydration" },
      acne: { ko: "트러블", en: "Acne" },
      aging: { ko: "탄력", en: "Aging" },
      dullness: { ko: "톤 개선", en: "Dullness" },
      redness: { ko: "진정", en: "Redness" },
      texture: { ko: "결 개선", en: "Texture" },
      pores: { ko: "모공", en: "Pores" },
      puffiness: { ko: "붓기", en: "Puffiness" },
      all: { ko: "전체", en: "All" },
    };
    const label = labels[key];
    if (!label) {
      return key;
    }
    return locale === "ko" ? label.ko : label.en;
  };

  const skinTypeLabelText = (key: string) => {
    const labels: Record<string, { ko: string; en: string }> = {
      dry: { ko: "건성", en: "Dry" },
      oily: { ko: "지성", en: "Oily" },
      combination: { ko: "복합성", en: "Combination" },
      normal: { ko: "중성", en: "Normal" },
      sensitive: { ko: "민감성", en: "Sensitive" },
      all: { ko: "전체", en: "All" },
    };
    const label = labels[key];
    if (!label) {
      return key;
    }
    return locale === "ko" ? label.ko : label.en;
  };

  const categories = useMemo(() => {
    return Array.from(new Set(db.products.map((product) => product.category))).sort();
  }, [db.products]);

  const skinTypes = useMemo(() => {
    return Array.from(new Set(db.products.flatMap((product) => product.skinTypes))).sort();
  }, [db.products]);

  const concerns = useMemo(() => {
    return Array.from(new Set(db.products.flatMap((product) => product.concerns))).sort();
  }, [db.products]);

  const collections = useMemo(() => {
    return [...db.collections]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((collection) => ({
        slug: collection.slug,
        name: resolveText(collection.name, locale),
      }));
  }, [db.collections, locale]);

  const filtered = useMemo(() => {
    const result = db.products.filter((product) => {
      const categoryPass = filters.category === "all" || product.category === filters.category;
      const skinTypePass = filters.skinType === "all" || product.skinTypes.includes(filters.skinType as SkinType);
      const concernPass = filters.concern === "all" || product.concerns.includes(filters.concern as Concern);
      const collectionPass = filters.collection === "all" || product.collectionSlugs.includes(filters.collection);
      const pricePass = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const searchable = [
        product.slug,
        resolveSearchText(product.name),
        resolveSearchText(product.shortDescription),
        resolveSearchText(product.description),
      ]
        .join(" ")
        .toLowerCase();
      const queryPass = !searchQuery || searchable.includes(searchQuery);
      return categoryPass && skinTypePass && concernPass && collectionPass && pricePass && queryPass;
    });

    const sorted = [...result];
    if (sort === "priceAsc") {
      sorted.sort((a, b) => a.price - b.price);
    }
    if (sort === "priceDesc") {
      sorted.sort((a, b) => b.price - a.price);
    }
    if (sort === "best") {
      sorted.sort(
        (a, b) =>
          b.rating - a.rating ||
          b.reviewCount - a.reviewCount ||
          +new Date(b.createdAt) - +new Date(a.createdAt),
      );
    }
    if (sort === "newest") {
      sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return sorted;
  }, [db.products, filters, sort, searchQuery]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / SHOP_PAGE_SIZE));
  const paged = filtered.slice(0, page * SHOP_PAGE_SIZE);
  const wishlistSet = useMemo(() => new Set(currentUser?.wishlist ?? []), [currentUser]);

  const categoryLabel =
    filters.category === "all" ? t("카테고리", "Category") : categoryLabelText(filters.category);
  const concernLabel =
    filters.concern === "all" ? t("고민", "Concern") : concernLabelText(filters.concern);
  const collectionLabel =
    filters.collection === "all"
      ? t("컬렉션", "Collection")
      : collections.find((entry) => entry.slug === filters.collection)?.name ?? filters.collection;

  const updateFilters = (next: Partial<ShopFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
    setPage(1);
  };

  const openPanel = (panel: ActivePanel) => {
    setDesktopPanel(null);
    setActivePanel(panel);
    setDrawerOpen(true);
  };

  const toggleDesktopPanel = (
    panel: DesktopPanel,
    anchorElement?: HTMLElement,
  ) => {
    if (desktopPanel === panel) {
      setDesktopPanel(null);
      setDesktopPanelRight(null);
      return;
    }

    if (anchorElement && desktopMenuRef.current) {
      const menuRect = desktopMenuRef.current.getBoundingClientRect();
      const anchorRect = anchorElement.getBoundingClientRect();
      const nextLeft = Math.max(0, anchorRect.left - menuRect.left);
      setDesktopPanelLeft(nextLeft);
      if (panel === "sort") {
        setDesktopPanelRight(Math.max(0, menuRect.right - anchorRect.right));
      } else {
        setDesktopPanelRight(null);
      }
    }

    setDesktopPanel(panel);
  };

  const applyDesktopFilter = (next: Partial<ShopFilters>) => {
    updateFilters(next);
    setDesktopPanel(null);
  };

  const applyDesktopSort = (nextSort: (typeof SORTS)[number]) => {
    setSort(nextSort);
    setPage(1);
    setDesktopPanel(null);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSort("newest");
    setPage(1);
    setDesktopPanel(null);
  };

  const showPanel = (panel: Exclude<ActivePanel, "all">) => activePanel === "all" || activePanel === panel;

  useEffect(() => {
    if (!desktopPanel) {
      return;
    }

    const onPointerDown = (event: MouseEvent) => {
      if (!desktopMenuRef.current?.contains(event.target as Node)) {
        setDesktopPanel(null);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDesktopPanel(null);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, [desktopPanel]);

  const quickAddFromCard = (product: Product) => {
    addToCart(product.slug, 1, getDefaultProductSizeKey(product));
  };

  const toggleWishlistFromCard = (productSlug: string) => {
    if (!currentUser) {
      router.push(withLocalePath("/account/login", locale));
      return;
    }
    toggleWishlist(productSlug);
  };

  const filledStarStyle = { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 20" } as const;
  const emptyStarStyle = { fontVariationSettings: "'FILL' 0, 'wght' 500, 'GRAD' 0, 'opsz' 20" } as const;

  const desktopTriggerClass = (isActive: boolean) =>
    [
      "group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
      isActive
        ? "border-[#e6194c]/45 bg-[#fff0f4] text-[#8a1d3d] shadow-[0_6px_14px_rgba(230,25,76,0.14)]"
        : "border-[#e6d7dd] bg-white/90 text-slate-700 hover:border-[#e6194c]/45 hover:bg-[#fff6f8]",
    ].join(" ");

  const desktopDropdownClass =
    "absolute top-[calc(100%+10px)] z-50 rounded-2xl border border-[#ecd3dc] bg-white/95 p-1.5 shadow-[0_20px_34px_rgba(53,18,31,0.18)] backdrop-blur";

  const desktopOptionClass = (isActive: boolean) =>
    [
      "w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
      isActive ? "bg-[#fff0f4] text-[#bf0f42] font-semibold" : "text-slate-700 hover:bg-[#fcf2f6]",
    ].join(" ");

  return (
    <>
      <section className="px-6 lg:px-12 pt-12 pb-8">
        <div className="max-w-[960px] mx-auto text-center space-y-4">
          <span className="text-[#e6194c] text-sm font-bold tracking-widest uppercase">
            {t("신상품", "New Arrivals")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-white">
            {t("시그니처 컬렉션", "The Collection")}
          </h2>
        </div>
      </section>

      <section className="sticky top-[var(--public-header-height)] z-40 border-y border-[#f0dde4] bg-[#fff7fa]/95 backdrop-blur-md">
        <div className="px-6 lg:px-12 py-3">
          <div
            ref={desktopMenuRef}
            className="relative flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#eed7df] bg-white/85 px-3 py-3 shadow-[0_10px_24px_rgba(86,32,46,0.07)] md:px-4"
          >
            <div className="flex flex-wrap items-center gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                type="button"
                className={desktopTriggerClass(desktopPanel === "category")}
                onClick={(event) =>
                  window.innerWidth >= 768
                    ? toggleDesktopPanel("category", event.currentTarget)
                    : openPanel("category")
                }
              >
                {categoryLabel}
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform ${desktopPanel === "category" ? "rotate-180 text-[#e6194c]" : "text-slate-500"}`}
                >
                  keyboard_arrow_down
                </span>
              </button>
              <button
                type="button"
                className={desktopTriggerClass(desktopPanel === "concern")}
                onClick={(event) =>
                  window.innerWidth >= 768
                    ? toggleDesktopPanel("concern", event.currentTarget)
                    : openPanel("concern")
                }
              >
                {concernLabel}
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform ${desktopPanel === "concern" ? "rotate-180 text-[#e6194c]" : "text-slate-500"}`}
                >
                  keyboard_arrow_down
                </span>
              </button>
              <button
                type="button"
                className={desktopTriggerClass(desktopPanel === "collection")}
                onClick={(event) =>
                  window.innerWidth >= 768
                    ? toggleDesktopPanel("collection", event.currentTarget)
                    : openPanel("collection")
                }
              >
                {collectionLabel}
                <span
                  className={`material-symbols-outlined text-[18px] transition-transform ${desktopPanel === "collection" ? "rotate-180 text-[#e6194c]" : "text-slate-500"}`}
                >
                  keyboard_arrow_down
                </span>
              </button>
              <button
                type="button"
                className="hidden md:inline-flex items-center gap-1.5 rounded-full border border-[#ebd4dc] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#7b5a66] transition-colors hover:border-[#e6194c]/45 hover:text-[#e6194c]"
                onClick={resetFilters}
              >
                <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                {t("초기화", "Clear All")}
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <span className="hidden sm:inline-flex items-center rounded-full border border-[#efd8e0] bg-white/80 px-3 py-1 text-xs font-semibold text-[#7a5763]">
                {filtered.length} {t("개 상품", "Products")}
              </span>
              <button
                type="button"
                className={desktopTriggerClass(desktopPanel === "sort")}
                onClick={(event) =>
                  window.innerWidth >= 768
                    ? toggleDesktopPanel("sort", event.currentTarget)
                    : openPanel("sort")
                }
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                <span className="hidden sm:inline">{sortLabel(sort)}</span>
                <span className="sm:hidden">{t("정렬", "Sort")}</span>
              </button>
            </div>

            {desktopPanel === "category" && (
              <div
                className={`${desktopDropdownClass} w-[240px]`}
                style={{ left: desktopPanelLeft }}
              >
                <button type="button" className={desktopOptionClass(filters.category === "all")} onClick={() => applyDesktopFilter({ category: "all" })}>
                  {t("전체", "All")}
                </button>
                {categories.map((option) => (
                  <button key={option} type="button" className={desktopOptionClass(filters.category === option)} onClick={() => applyDesktopFilter({ category: option })}>
                    {categoryLabelText(option)}
                  </button>
                ))}
              </div>
            )}

            {desktopPanel === "concern" && (
              <div
                className={`${desktopDropdownClass} w-[240px]`}
                style={{ left: desktopPanelLeft }}
              >
                <button type="button" className={desktopOptionClass(filters.concern === "all")} onClick={() => applyDesktopFilter({ concern: "all" })}>
                  {t("전체", "All")}
                </button>
                {concerns.map((option) => (
                  <button key={option} type="button" className={desktopOptionClass(filters.concern === option)} onClick={() => applyDesktopFilter({ concern: option })}>
                    {concernLabelText(option)}
                  </button>
                ))}
              </div>
            )}

            {desktopPanel === "collection" && (
              <div
                className={`${desktopDropdownClass} w-[260px]`}
                style={{ left: desktopPanelLeft }}
              >
                <button type="button" className={desktopOptionClass(filters.collection === "all")} onClick={() => applyDesktopFilter({ collection: "all" })}>
                  {t("전체", "All")}
                </button>
                {collections.map((option) => (
                  <button key={option.slug} type="button" className={desktopOptionClass(filters.collection === option.slug)} onClick={() => applyDesktopFilter({ collection: option.slug })}>
                    {option.name}
                  </button>
                ))}
              </div>
            )}

            {desktopPanel === "sort" && (
              <div
                className={`${desktopDropdownClass} w-[230px]`}
                style={desktopPanelRight === null ? { left: desktopPanelLeft } : { right: desktopPanelRight }}
              >
                {SORTS.map((option) => (
                  <button key={option} type="button" className={desktopOptionClass(sort === option)} onClick={() => applyDesktopSort(option)}>
                    {sortLabel(option)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {paged.map((product) => {
            const roundedRating = Math.max(0, Math.min(5, Math.round(product.rating * 2) / 2));
            const isWishlisted = wishlistSet.has(product.slug);
            return (
              <article key={product.id} className="group product-card-hover cursor-pointer">
                <div className="relative overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800 aspect-[3/4] mb-4">
                  <Link href={`/product/${product.slug}`} className="block h-full w-full">
                    <img
                      alt={resolveText(product.name, locale)}
                      className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                      src={product.images[0]}
                    />
                  </Link>

                  <div className="absolute inset-x-0 bottom-0 p-4 z-20 opacity-0 translate-y-4 transition-all duration-300 ease-out bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100 group-hover:translate-y-0">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="flex-1 bg-white text-slate-900 hover:bg-white/90 font-medium text-sm py-3 rounded-sm shadow-lg transition-colors flex items-center justify-center gap-2"
                        onClick={() => quickAddFromCard(product)}
                      >
                        <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                        {t("바로 담기", "Add to Bag")}
                      </button>
                      <button
                        type="button"
                        className={`min-w-[44px] px-3 py-3 rounded-sm shadow-lg transition-colors flex items-center justify-center gap-1.5 ${
                          isWishlisted
                            ? "bg-[#e6194c] text-white hover:bg-[#d01644]"
                            : "bg-white text-slate-900 hover:bg-white/90"
                        }`}
                        aria-label={t("위시리스트 등록", "Add to Wishlist")}
                        onClick={() => toggleWishlistFromCard(product.slug)}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {isWishlisted ? "favorite" : "favorite_border"}
                        </span>
                        <span className="hidden lg:inline text-xs font-semibold">
                          {t("위시", "Wish")}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <h3 className="text-lg font-serif font-medium text-slate-900 dark:text-white leading-tight group-hover:text-[#e6194c] transition-colors">
                    {resolveText(product.name, locale)}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                    {resolveText(product.shortDescription, locale)}
                  </p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-base font-medium text-slate-900 dark:text-white">
                      {currency(product.price)}
                    </span>
                    {product.freeShipping && (
                      <span className="text-[11px] font-semibold text-[#e6194c]">
                        {t("무료배송", "Free Shipping")}
                      </span>
                    )}
                    {product.reviewCount > 0 && (
                      <div className="flex items-center text-[12px] text-yellow-400">
                        {Array.from({ length: 5 }, (_, iconIndex) => {
                          const fillLevel = Math.max(0, Math.min(1, roundedRating - iconIndex));
                          const icon = fillLevel >= 1 ? "star" : fillLevel >= 0.5 ? "star_half" : "star";
                          const colorClass = fillLevel > 0 ? "text-amber-400" : "text-slate-300";
                          return (
                            <span
                              key={`${product.id}-star-${iconIndex + 1}`}
                              className={`material-symbols-outlined text-[14px] leading-none ${colorClass}`}
                              style={fillLevel > 0 ? filledStarStyle : emptyStarStyle}
                            >
                              {icon}
                            </span>
                          );
                        })}
                        <span className="ml-1 text-slate-400 text-xs">({product.reviewCount})</span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {paged.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              {t("설정한 필터에 맞는 상품이 없습니다.", "No products match your filters.")}
            </p>
          </div>
        )}

        {page < pageCount && (
          <div className="flex justify-center mt-24 mb-12">
            <button
              type="button"
              className="px-8 py-3 rounded-full border border-stone-300 dark:border-stone-700 text-sm font-bold text-slate-900 dark:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors uppercase tracking-wider"
              onClick={() => setPage((prev) => Math.min(prev + 1, pageCount))}
            >
              {t("상품 더 보기", "Load More Products")}
            </button>
          </div>
        )}
      </section>

      <Drawer open={drawerOpen} title={t("필터", "Filters")} onClose={() => setDrawerOpen(false)} side="right">
        <div className="grid gap-6">
          {showPanel("category") && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">
                {t("카테고리", "Category")}
              </p>
              <select
                className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                value={filters.category}
                onChange={(event) => updateFilters({ category: event.target.value })}
              >
                <option value="all">{t("전체", "All")}</option>
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {categoryLabelText(option)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showPanel("concern") && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">
                {t("고민", "Concern")}
              </p>
              <select
                className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                value={filters.concern}
                onChange={(event) => updateFilters({ concern: event.target.value })}
              >
                <option value="all">{t("전체", "All")}</option>
                {concerns.map((option) => (
                  <option key={option} value={option}>
                    {concernLabelText(option)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {showPanel("collection") && (
            <>
              <div>
                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">
                  {t("컬렉션", "Collection")}
                </p>
                <select
                  className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                  value={filters.collection}
                  onChange={(event) => updateFilters({ collection: event.target.value })}
                >
                  <option value="all">{t("전체", "All")}</option>
                  {collections.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">
                  {t("피부 타입", "Skin Type")}
                </p>
                <select
                  className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                  value={filters.skinType}
                  onChange={(event) => updateFilters({ skinType: event.target.value })}
                >
                  <option value="all">{t("전체", "All")}</option>
                  {skinTypes.map((option) => (
                    <option key={option} value={option}>
                      {skinTypeLabelText(option)}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {showPanel("sort") && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">
                {t("정렬", "Sort By")}
              </p>
              <select
                className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                value={sort}
                onChange={(event) => {
                  setSort(event.target.value as (typeof SORTS)[number]);
                  setPage(1);
                }}
              >
                {SORTS.map((option) => (
                  <option key={option} value={option}>
                    {sortLabel(option)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            className="h-11 rounded-full border border-[#e3d5da] text-sm font-semibold"
            onClick={resetFilters}
          >
            {t("초기화", "Clear All")}
          </button>
        </div>
      </Drawer>
    </>
  );
}
