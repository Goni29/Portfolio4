"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { Drawer } from "@/components/ui/drawer";
import { resolveText } from "@/lib/i18n";
import type { Concern, ProductFilters, SkinType } from "@/lib/types";
import { cn, currency } from "@/lib/utils";

type ShopFilters = ProductFilters & {
  collection: string;
};

type ActivePanel = "all" | "category" | "concern" | "collection" | "sort";

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
  const sortLabel = (key: (typeof SORTS)[number]) => {
    if (key === "newest") return t("\uCD5C\uC2E0\uC21C", "Newest");
    if (key === "priceAsc") return t("\uAC00\uACA9 \uB0AE\uC740\uC21C", "Price: Low to High");
    if (key === "priceDesc") return t("\uAC00\uACA9 \uB192\uC740\uC21C", "Price: High to Low");
    return t("\uD3C9\uC810\uC21C", "Best Rated");
  };
  const categoryLabelText = (key: string) => {
    const labels: Record<string, string> = {
      cleanser: "클렌징",
      serum: "세럼",
      moisturizer: "모이스처라이저",
      sunscreen: "선케어",
      mask: "마스크",
      tool: "뷰티 툴",
      all: "\uC804\uCCB4",
    };
    return locale === "ko" ? labels[key] ?? key : key;
  };
  const concernLabelText = (key: string) => {
    const labels: Record<string, string> = {
      hydration: "수분 부족",
      acne: "\uD2B8\uB7EC\uBE14",
      aging: "탄력",
      dullness: "톤 개선",
      redness: "진정",
      texture: "\uACB0 \uAC1C\uC120",
      pores: "\uBAA8\uACF5",
      puffiness: "\uBD93\uAE30",
      all: "\uC804\uCCB4",
    };
    return locale === "ko" ? labels[key] ?? key : key;
  };
  const skinTypeLabelText = (key: string) => {
    const labels: Record<string, string> = {
      dry: "\uAC74\uC131",
      oily: "\uC9C0\uC131",
      combination: "\uBCF5\uD569\uC131",
      normal: "\uC911\uC131",
      sensitive: "\uBBFC\uAC10\uC131",
      all: "\uC804\uCCB4",
    };
    return locale === "ko" ? labels[key] ?? key : key;
  };
  const [filters, setFilters] = useState<ShopFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<(typeof SORTS)[number]>("newest");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<ActivePanel>("all");

  const categories = useMemo(() => Array.from(new Set(db.products.map((product) => product.category))).sort(), [db.products]);
  const skinTypes = useMemo(() => Array.from(new Set(db.products.flatMap((product) => product.skinTypes))).sort(), [db.products]);
  const concerns = useMemo(() => Array.from(new Set(db.products.flatMap((product) => product.concerns))).sort(), [db.products]);
  const collections = useMemo(
    () =>
      [...db.collections].sort((a, b) => a.sortOrder - b.sortOrder).map((collection) => ({
        slug: collection.slug,
        name: resolveText(collection.name, locale),
      })),
    [db.collections, locale],
  );

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
      sorted.sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount);
    }
    if (sort === "newest") {
      sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }
    return sorted;
  }, [db.products, filters, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / SHOP_PAGE_SIZE));
  const paged = filtered.slice(0, page * SHOP_PAGE_SIZE);

  const categoryLabel = filters.category === "all" ? t("\uCE74\uD14C\uACE0\uB9AC", "Category") : categoryLabelText(filters.category);
  const concernLabel = filters.concern === "all" ? t("\uACE0\uBBFC", "Concern") : concernLabelText(filters.concern);
  const collectionLabel =
    filters.collection === "all"
      ? t("\uCF5C\uB809\uC158", "Collection")
      : collections.find((entry) => entry.slug === filters.collection)?.name ?? filters.collection;

  const openPanel = (panel: ActivePanel) => {
    setActivePanel(panel);
    setDrawerOpen(true);
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSort("newest");
    setPage(1);
  };

  const showPanel = (panel: Exclude<ActivePanel, "all">) => activePanel === "all" || activePanel === panel;

  return (
    <>
      <section className="px-6 lg:px-12 pt-12 pb-8">
        <div className="max-w-[960px] mx-auto text-center space-y-4">
          <span className="text-[#e6194c] text-sm font-bold tracking-widest uppercase">{t("신제품 큐레이션", "New Arrivals")}</span>
          <h2 className="text-4xl md:text-5xl font-serif font-medium tracking-tight text-slate-900 dark:text-white">
            {t("시그니처 컬렉션", "The Collection")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            {t(
              "정제된 포뮬러로 피부결, 광채, 장벽 균형을 섬세하게 완성해 보세요.",
              "Curated formulations for refined texture, balanced barrier, and visible radiance.",
            )}
          </p>
        </div>
      </section>

      <section className="sticky top-[var(--public-header-height)] z-40 bg-[#f8f6f6]/95 dark:bg-[#211115]/95 border-y border-stone-200 dark:border-stone-800 backdrop-blur-sm">
        <div className="px-6 lg:px-12 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto no-scrollbar pb-1 md:pb-0">
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-sm font-medium hover:border-[#e6194c] dark:hover:border-[#e6194c] transition-colors whitespace-nowrap"
                onClick={() => openPanel("category")}
              >
                {categoryLabel}
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-sm font-medium hover:border-[#e6194c] dark:hover:border-[#e6194c] transition-colors whitespace-nowrap"
                onClick={() => openPanel("concern")}
              >
                {concernLabel}
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-sm font-medium hover:border-[#e6194c] dark:hover:border-[#e6194c] transition-colors whitespace-nowrap"
                onClick={() => openPanel("collection")}
              >
                {collectionLabel}
                <span className="material-symbols-outlined text-[18px]">keyboard_arrow_down</span>
              </button>
              <div className="h-8 w-px bg-stone-200 dark:bg-stone-700 mx-1 hidden md:block" />
              <button
                type="button"
                className="text-sm font-medium text-slate-500 hover:text-[#e6194c] transition-colors whitespace-nowrap hidden md:block"
                onClick={resetFilters}
              >
                {t("\uCD08\uAE30\uD654", "Clear All")}
              </button>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:inline-block">
                {filtered.length} {t("\uAC1C \uC0C1\uD488", "Products")}
              </span>
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium hover:text-[#e6194c] transition-colors"
                onClick={() => openPanel("sort")}
              >
                {t("\uC815\uB82C", "Sort By")}
                <span className="material-symbols-outlined text-[18px]">sort</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {paged.map((product, index) => {
            const roundedRating = Math.round(product.rating * 2) / 2;

            return (
              <article key={product.id} className="group product-card-hover cursor-pointer">
                <div className="relative overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-800 aspect-[3/4] mb-4">
                  {index === 0 && <div className="absolute inset-0 bg-stone-200 animate-pulse" style={{ zIndex: 0 }} />}

                  <Link href={`/product/${product.slug}`} className="block h-full w-full">
                    <img
                      alt={resolveText(product.name, locale)}
                      className="product-image object-cover w-full h-full relative z-10 transition-transform duration-700 ease-out group-hover:scale-105"
                      src={product.images[0]}
                    />
                  </Link>

                  {product.badge && (
                    <div className="absolute top-3 left-3 z-20">
                      <span
                        className={cn(
                          "text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded",
                          product.badge === "new"
                            ? "bg-white/95 text-slate-900"
                            : "bg-white/90 dark:bg-black/80 backdrop-blur text-slate-900 dark:text-white",
                        )}
                      >
                        {product.badge === "best" ? t("베스트셀러", "Best") : t("신상품", "New")}
                      </span>
                    </div>
                  )}

                  <div className="product-details absolute inset-x-0 bottom-0 p-4 z-20 opacity-0 translate-y-4 transition-all duration-300 ease-out bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100 group-hover:translate-y-0">
                    <button
                      type="button"
                      className="w-full bg-white text-slate-900 hover:bg-white/90 font-medium text-sm py-3 rounded-sm shadow-lg backdrop-blur-sm transition-colors flex items-center justify-center gap-2"
                      onClick={() => addToCart(product.slug, 1)}
                    >
                      <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                      {t("담아두기", "Add to Bag")}
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-center">
                  <h3 className="text-lg font-serif font-medium text-slate-900 dark:text-white leading-tight group-hover:text-[#e6194c] transition-colors">
                    {resolveText(product.name, locale)}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{resolveText(product.shortDescription, locale)}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-base font-medium text-slate-900 dark:text-white">{currency(product.price)}</span>
                    {product.reviewCount > 0 && (
                      <div className="flex items-center text-yellow-400 text-[12px]">
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
              {t("\uC124\uC815\uD55C \uD544\uD130\uC5D0 \uB9DE\uB294 \uC0C1\uD488\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.", "No products match your filters.")}
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
              {t("제품 더 보기", "Load More Products")}
            </button>
          </div>
        )}
      </section>

      <Drawer open={drawerOpen} title={t("\uD544\uD130", "Filters")} onClose={() => setDrawerOpen(false)} side="right">
        <div className="grid gap-6">
          {showPanel("category") && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">{t("\uCE74\uD14C\uACE0\uB9AC", "Category")}</p>
              <select
                className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                value={filters.category}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, category: event.target.value }));
                  setPage(1);
                }}
              >
                <option value="all">{t("\uC804\uCCB4", "All")}</option>
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
              <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">{t("\uACE0\uBBFC", "Concern")}</p>
              <select
                className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                value={filters.concern}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, concern: event.target.value }));
                  setPage(1);
                }}
              >
                <option value="all">{t("\uC804\uCCB4", "All")}</option>
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
                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">{t("\uCF5C\uB809\uC158", "Collection")}</p>
                <select
                  className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                  value={filters.collection}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, collection: event.target.value }));
                    setPage(1);
                  }}
                >
                  <option value="all">{t("\uC804\uCCB4", "All")}</option>
                  {collections.map((option) => (
                    <option key={option.slug} value={option.slug}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">{t("\uD53C\uBD80 \uD0C0\uC785", "Skin Type")}</p>
                <select
                  className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                  value={filters.skinType}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, skinType: event.target.value }));
                    setPage(1);
                  }}
                >
                  <option value="all">{t("\uC804\uCCB4", "All")}</option>
                  {skinTypes.map((option) => (
                    <option key={option} value={option}>
                      {skinTypeLabelText(option)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">{t("\uAC00\uACA9 \uBC94\uC704", "Price Range")}</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                    type="number"
                    min={0}
                    max={filters.maxPrice}
                    value={filters.minPrice}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setFilters((prev) => ({ ...prev, minPrice: Number.isFinite(value) ? value : 0 }));
                      setPage(1);
                    }}
                  />
                  <input
                    className="h-11 w-full rounded-xl border border-[#e8dce0] bg-white px-4 text-sm"
                    type="number"
                    min={filters.minPrice}
                    value={filters.maxPrice}
                    onChange={(event) => {
                      const value = Number(event.target.value);
                      setFilters((prev) => ({ ...prev, maxPrice: Number.isFinite(value) ? value : 250 }));
                      setPage(1);
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {showPanel("sort") && (
            <div>
              <p className="text-xs uppercase tracking-[0.15em] font-semibold text-[#6f5560] mb-2">{t("\uC815\uB82C", "Sort By")}</p>
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

          <button type="button" className="h-11 rounded-full border border-[#e3d5da] text-sm font-semibold" onClick={resetFilters}>
            {t("\uCD08\uAE30\uD654", "Clear All")}
          </button>
        </div>
      </Drawer>
    </>
  );
}
