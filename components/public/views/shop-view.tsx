"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { Drawer } from "@/components/ui/drawer";
import { resolveText } from "@/lib/i18n";
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

export function ShopView() {
  const { db, addToCart, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);

  const [filters, setFilters] = useState<ShopFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("newest");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>("all");
  const [desktopPanel, setDesktopPanel] = useState<DesktopPanel | null>(null);
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
      sunscreen: { ko: "선케어", en: "Sunscreen" },
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
      hydration: { ko: "수분 부족", en: "Hydration" },
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
      return categoryPass && skinTypePass && concernPass && collectionPass && pricePass;
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
  }, [db.products, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / SHOP_PAGE_SIZE));
  const paged = filtered.slice(0, page * SHOP_PAGE_SIZE);

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

  const toggleDesktopPanel = (panel: DesktopPanel) => {
    setDesktopPanel((prev) => (prev === panel ? null : panel));
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

  return (
    <>
      <section className="px-6 lg:px-12 pt-12 pb-8">
        <div className="max-w-[960px] mx-auto text-center space-y-4">
          <span className="text-[#e6194c] text-sm font-bold tracking-widest uppercase">
            {t("뉴 시즌 컬렉션", "New Arrivals")}
          </span>
          <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-white">
            {t("시그니처 컬렉션", "The Collection")}
          </h2>
        </div>
      </section>

      <section className="sticky top-[var(--public-header-height)] z-40 border-y border-stone-200 dark:border-stone-800 bg-[#f8f6f6]/95 dark:bg-[#211115]/95 backdrop-blur-sm">
        <div className="px-6 lg:px-12 py-3">
          <div ref={desktopMenuRef} className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-[#e6194c] transition-colors"
                onClick={() => (window.innerWidth >= 768 ? toggleDesktopPanel("category") : openPanel("category"))}
              >
                {categoryLabel}
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-[#e6194c] transition-colors"
                onClick={() => (window.innerWidth >= 768 ? toggleDesktopPanel("concern") : openPanel("concern"))}
              >
                {concernLabel}
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 hover:border-[#e6194c] transition-colors"
                onClick={() =>
                  window.innerWidth >= 768 ? toggleDesktopPanel("collection") : openPanel("collection")
                }
              >
                {collectionLabel}
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
              <button
                type="button"
                className="text-sm font-medium text-slate-500 hover:text-[#e6194c] transition-colors whitespace-nowrap hidden md:block"
                onClick={resetFilters}
              >
                {t("초기화", "Clear All")}
              </button>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                {filtered.length} {t("개 상품", "Products")}
              </span>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium hover:text-[#e6194c] transition-colors"
                onClick={() => (window.innerWidth >= 768 ? toggleDesktopPanel("sort") : openPanel("sort"))}
              >
                {t("정렬", "Sort")}
                <span className="material-symbols-outlined text-[18px]">sort</span>
              </button>
            </div>

            {desktopPanel === "category" && (
              <div className="absolute left-6 top-[calc(100%+8px)] z-50 w-[220px] rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
                <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50" onClick={() => applyDesktopFilter({ category: "all" })}>
                  {t("전체", "All")}
                </button>
                {categories.map((option) => (
                  <button key={option} type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50" onClick={() => applyDesktopFilter({ category: option })}>
                    {categoryLabelText(option)}
                  </button>
                ))}
              </div>
            )}

            {desktopPanel === "concern" && (
              <div className="absolute left-[240px] top-[calc(100%+8px)] z-50 w-[220px] rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
                <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50" onClick={() => applyDesktopFilter({ concern: "all" })}>
                  {t("전체", "All")}
                </button>
                {concerns.map((option) => (
                  <button key={option} type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50" onClick={() => applyDesktopFilter({ concern: option })}>
                    {concernLabelText(option)}
                  </button>
                ))}
              </div>
            )}

            {desktopPanel === "collection" && (
              <div className="absolute left-[474px] top-[calc(100%+8px)] z-50 w-[240px] rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
                <button type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50" onClick={() => applyDesktopFilter({ collection: "all" })}>
                  {t("전체", "All")}
                </button>
                {collections.map((option) => (
                  <button key={option.slug} type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50" onClick={() => applyDesktopFilter({ collection: option.slug })}>
                    {option.name}
                  </button>
                ))}
              </div>
            )}

            {desktopPanel === "sort" && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-[220px] rounded-xl border border-stone-200 bg-white shadow-lg overflow-hidden">
                {SORTS.map((option) => (
                  <button key={option} type="button" className="w-full px-4 py-2 text-left text-sm hover:bg-stone-50" onClick={() => applyDesktopSort(option)}>
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
                    <button
                      type="button"
                      className="w-full bg-white text-slate-900 hover:bg-white/90 font-medium text-sm py-3 rounded-sm shadow-lg transition-colors flex items-center justify-center gap-2"
                      onClick={() => quickAddFromCard(product)}
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                      {t("바로담기", "Add to Bag")}
                    </button>
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
                          const value = iconIndex + 1;
                          let icon = "star_outline";
                          if (roundedRating >= value) {
                            icon = "star";
                          } else if (roundedRating + 0.5 === value) {
                            icon = "star_half";
                          }
                          return (
                            <span key={`${product.id}-star-${value}`} className="material-symbols-outlined text-[14px]">
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
