"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import {
  getJournalCategoryKey,
  getJournalCategoryLabel,
  getJournalCategoryLabelByKey,
  JOURNAL_CATEGORY_ORDER,
  type JournalCategoryKey,
} from "@/components/public/views/journal-categories";
import { STATIC_JOURNAL_ARTICLES } from "@/components/public/views/journal-static-articles";
import { BRAND_LABELS, resolveText } from "@/lib/i18n";

type StaticCard = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryKey: Exclude<JournalCategoryKey, "all">;
  publishedAt: string;
  coverImage: string;
  href: string;
  ratioClass: string;
  dispatch?: boolean;
};

function formatShortDate(value: string, locale: "ko" | "en") {
  try {
    return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
      month: "short",
      day: "2-digit",
    }).format(new Date(value));
  } catch {
    return locale === "ko" ? "10\uC6D4 12\uC77C" : "Oct 12";
  }
}

export function JournalView() {
  const { db, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState<JournalCategoryKey>("all");

  const articles = useMemo(
    () => [...db.articles].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)),
    [db.articles],
  );

  const featured = articles[0];

  const dynamicCards: StaticCard[] = useMemo(
    () =>
      articles.slice(1).map((article, index) => ({
        id: article.id,
        title: resolveText(article.title, locale),
        excerpt: resolveText(article.excerpt, locale),
        category: article.category,
        categoryKey: getJournalCategoryKey(article.category),
        publishedAt: article.publishedAt,
        coverImage: article.coverImage,
        href: `/journal/${article.slug}`,
        ratioClass: index % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/3]",
      })),
    [articles, locale],
  );

  const fallbackCards = useMemo(
    () =>
      STATIC_JOURNAL_ARTICLES.filter((article) => article.showInFallbackGrid).map((article) => ({
        id: article.id,
        title: article.title[locale],
        excerpt: article.excerpt[locale],
        category: article.category,
        categoryKey: getJournalCategoryKey(article.category),
        publishedAt: article.publishedAt,
        coverImage: article.coverImage,
        href: `/journal/${article.slug}`,
        ratioClass: article.ratioClass,
        dispatch: article.dispatch,
      })),
    [locale],
  );
  const spotlightArticle =
    STATIC_JOURNAL_ARTICLES.find((article) => article.slug === "ingredient-spotlight-bakuchiol") ??
    STATIC_JOURNAL_ARTICLES[0];
  const launchArticle =
    STATIC_JOURNAL_ARTICLES.find((article) => article.slug === "night-reset-serum-launch") ??
    STATIC_JOURNAL_ARTICLES[0];
  const spotlightCategoryKey = getJournalCategoryKey(spotlightArticle.category);
  const launchCategoryKey = getJournalCategoryKey(launchArticle.category);

  const cards = useMemo(() => [...dynamicCards, ...fallbackCards].slice(0, 7), [dynamicCards, fallbackCards]);
  const availableCategoryKeys = new Set([...cards.map((card) => card.categoryKey), spotlightCategoryKey, launchCategoryKey]);
  const categoryChips = [
    { key: "all" as const, label: locale === "ko" ? "\uC804\uCCB4 \uC2A4\uD1A0\uB9AC" : "All Stories" },
    ...JOURNAL_CATEGORY_ORDER.filter((key) => availableCategoryKeys.has(key)).map((key) => ({
      key,
      label: getJournalCategoryLabelByKey(key, locale),
    })),
  ];

  const filteredCards = useMemo(() => {
    if (activeCategory === "all") {
      return cards;
    }

    return cards.filter((card) => card.categoryKey === activeCategory);
  }, [activeCategory, cards]);
  const showSpotlightCard = activeCategory === "all" || activeCategory === spotlightCategoryKey;
  const showLaunchCard = activeCategory === "all" || activeCategory === launchCategoryKey;
  const visibleCount = 6 + loadMoreCount;
  const visibleCards = filteredCards.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCards.length;

  const onSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    setSubscribed(true);
    setEmail("");
  };

  return (
    <main className="flex-grow">
      {featured && (
        <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
          <Link
            href={`/journal/${featured.slug}`}
            className="relative w-full overflow-hidden rounded-xl bg-[#2d1b20] group cursor-pointer aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] block"
          >
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-105 bg-cover bg-center"
              style={{ backgroundImage: `url(${featured.coverImage})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 lg:p-16 flex flex-col items-start gap-4 sm:gap-6">
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase rounded-full border border-white/10">
                {t("\uD53C\uCC98\uB4DC \uC2A4\uD1A0\uB9AC", "Featured Story")}
              </span>
              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium text-white leading-tight max-w-4xl tracking-tight">
                {resolveText(featured.title, locale)}
              </h1>
              <p className="text-gray-200 max-w-xl text-sm sm:text-base leading-relaxed line-clamp-2 sm:line-clamp-none font-light">
                {resolveText(featured.excerpt, locale)}
              </p>
              <span className="mt-2 flex items-center gap-2 text-white font-bold text-sm tracking-wide border-b border-[#e6194c] pb-1 uppercase">
                {resolveText(BRAND_LABELS.ctaReadMore, locale)}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </span>
            </div>
          </Link>
        </section>
      )}

      <section className="sticky top-[var(--public-header-height)] z-40 bg-[#fcf8f9]/95 backdrop-blur-sm border-b border-[#f3e7ea]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {categoryChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                className={
                  chip.key === activeCategory
                    ? "shrink-0 px-6 py-2 rounded-full bg-[#e6194c] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                    : "shrink-0 px-6 py-2 rounded-full border border-gray-200 text-[#974e60] hover:border-[#e6194c] hover:text-[#e6194c] text-xs font-bold uppercase tracking-wider transition-all bg-transparent"
                }
                onClick={() => {
                  setActiveCategory(chip.key);
                  setLoadMoreCount(0);
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-12">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-8 space-y-8">
          {visibleCards.map((card) => (
            <article key={card.id} className="break-inside-avoid group cursor-pointer flex flex-col gap-4">
              <Link
                href={card.href}
                className={`relative w-full ${card.ratioClass} overflow-hidden rounded-sm bg-gray-200 block`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-105"
                  style={{ backgroundImage: `url(${card.coverImage})` }}
                />
                {card.dispatch && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-sm text-[10px] font-bold uppercase tracking-widest border border-black/5">
                    {t("\uC18D\uBCF4", "Dispatch")}
                  </div>
                )}
              </Link>
              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-[#974e60] uppercase">
                  <span className="text-[#e6194c]">{getJournalCategoryLabelByKey(card.categoryKey, locale)}</span>
                  <span className="size-0.5 bg-gray-400 rounded-full" />
                  <span>{formatShortDate(card.publishedAt, locale)}</span>
                </div>
                <h3 className="font-serif text-2xl font-medium leading-snug group-hover:text-[#e6194c] transition-colors">
                  <Link href={card.href}>{card.title}</Link>
                </h3>
                <p className="text-sm text-[#1b0e11]/70 line-clamp-2 leading-relaxed font-light">{card.excerpt}</p>
              </div>
            </article>
          ))}

          {showSpotlightCard && (
            <article className="break-inside-avoid group cursor-pointer flex flex-col gap-4 p-8 bg-white rounded-sm border border-[#f3e7ea] transition-all hover:shadow-lg hover:border-[#e6194c]/20">
              <div className="flex flex-col gap-5">
                <div className="size-10 rounded-full bg-[#e6194c]/5 flex items-center justify-center text-[#e6194c] mb-2">
                  <span className="material-symbols-outlined">science</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-[#974e60] uppercase">
                  <span className="text-[#e6194c]">{getJournalCategoryLabel(spotlightArticle.category, locale)}</span>
                  <span className="size-0.5 bg-gray-400 rounded-full" />
                  <span>{formatShortDate(spotlightArticle.publishedAt, locale)}</span>
                </div>
                <h3 className="font-serif text-2xl italic font-medium leading-snug group-hover:text-[#e6194c] transition-colors">
                  {`"${spotlightArticle.title[locale]}"`}
                </h3>
                <p className="text-sm text-[#1b0e11]/80 leading-relaxed font-light">
                  {spotlightArticle.excerpt[locale]}
                </p>
                <Link
                  href={`/journal/${spotlightArticle.slug}`}
                  className="text-[#e6194c] text-xs font-bold mt-2 flex items-center gap-1 uppercase tracking-wider"
                >
                  {t("\uBD84\uC11D \uC77D\uAE30", "Read Analysis")} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </Link>
              </div>
            </article>
          )}

          {showLaunchCard && (
            <article className="break-inside-avoid group cursor-pointer flex flex-col relative overflow-hidden rounded-sm bg-[#211115] text-white min-h-[400px]">
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-[#1a0f12] opacity-100" />
              <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
              <div className="relative p-10 flex flex-col h-full justify-between gap-12 z-10">
                <div className="flex justify-between items-start">
                  <span className="text-[#e6194c] font-bold tracking-[0.2em] text-[10px] uppercase">{t("\uC2E0\uC0C1\uD488", "New Arrival")}</span>
                  <span className="material-symbols-outlined text-white/40">star</span>
                </div>
                <div className="flex flex-col gap-6">
                  <h3 className="font-serif text-3xl font-medium leading-tight text-white">
                    {launchArticle.title[locale]}
                  </h3>
                  <p className="text-white/70 text-sm font-light leading-relaxed">
                    {launchArticle.excerpt[locale]}
                  </p>
                  <Link
                    href={`/journal/${launchArticle.slug}`}
                    className="text-white/90 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1"
                  >
                    {t("\uC2A4\uD1A0\uB9AC \uBCF4\uAE30", "Read Story")}
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </Link>
                  <p className="text-white/55 text-[11px] leading-relaxed">
                    {t("\uC81C\uD488\uC744 \uBC14\uB85C \uBCF4\uB824\uBA74 \uC544\uB798 \uBC84\uD2BC\uC744 \uC774\uC6A9\uD558\uC138\uC694.", "If you want to shop the product directly, use the button below.")}
                  </p>
                  <Link
                    href="/product/luminous-silk-serum"
                    className="w-full py-4 bg-white hover:bg-white/90 text-[#211115] font-bold text-xs uppercase tracking-widest rounded-sm transition-colors mt-2 text-center"
                  >
                    {t("\uC9C0\uAE08 \uC1FC\uD551", "Shop Now")}
                  </Link>
                </div>
              </div>
            </article>
          )}
        </div>

        <div className="mt-20 flex justify-center">
          <button
            type="button"
            className="px-10 py-3 border border-gray-300 rounded-full text-xs font-bold uppercase tracking-widest text-[#1b0e11] hover:border-[#e6194c] hover:text-[#e6194c] transition-all hover:px-12"
            onClick={() => setLoadMoreCount((prev) => (hasMore ? prev + 3 : prev))}
          >
            {hasMore ? t("\uAE30\uC0AC \uB354 \uBCF4\uAE30", "Load More Articles") : t("\uBAA8\uB4E0 \uAE30\uC0AC\uB97C \uD655\uC778\uD588\uC2B5\uB2C8\uB2E4", "All Articles Loaded")}
          </button>
        </div>
      </section>

      <section className="bg-[#fcf8f9] py-24 px-4 mt-12 border-t border-[#f3e7ea]">
        <div className="max-w-xl mx-auto text-center flex flex-col items-center gap-6">
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-[#e6194c]">{t("\uB274\uC2A4\uB808\uD130", "Newsletter")}</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-medium text-[#1b0e11] tracking-tight">
            {t("\uD3EC\uD2B8\uD3F4\uB9AC\uC624 \uC5D0\uB514\uD2B8", "The Portfolio Edit")}
          </h2>
          <p className="text-[#1b0e11]/60 font-light text-lg leading-relaxed">
            {t(
              "\uB9E4\uC8FC \uC804\uD558\uB294 \uBDF0\uD2F0 \uC778\uC0AC\uC774\uD2B8, \uB2E8\uB3C5 \uD61C\uD0DD, \uACFC\uD559 \uAE30\uBC18 \uD301\uC744 \uBA54\uC77C\uB85C \uBC1B\uC544\uBCF4\uC138\uC694.",
              "Subscribe for weekly beauty insights, exclusive offers, and science-backed advice delivered to your inbox.",
            )}
          </p>
          <form className="w-full mt-6 relative" onSubmit={onSubscribe}>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                className="w-full bg-white border border-gray-200 px-4 py-3 text-sm focus:ring-0 focus:border-[#e6194c] placeholder:text-[#974e60]/50 rounded-sm"
                placeholder={t("\uC774\uBA54\uC77C \uC8FC\uC18C \uC785\uB825", "Enter your email address")}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button
                className="w-full sm:w-auto bg-[#1b0e11] text-white font-bold uppercase tracking-widest px-8 py-3 rounded-sm transition-colors text-xs hover:bg-[#e6194c] whitespace-nowrap"
                type="submit"
              >
                {t("\uAD6C\uB3C5\uD558\uAE30", "Subscribe")}
              </button>
            </div>
            <p className="text-[10px] text-[#974e60] mt-4 uppercase tracking-wider">
              {subscribed
                ? t("\uAD6C\uB3C5\uC774 \uC644\uB8CC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", "Thanks for subscribing.")
                : t("\uAD6C\uB3C5 \uC2DC \uAC1C\uC778\uC815\uBCF4 \uCC98\uB9AC\uBC29\uCE68\uC5D0 \uB3D9\uC758\uD558\uAC8C \uB429\uB2C8\uB2E4.", "By subscribing, you agree to our Privacy Policy.")}
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
