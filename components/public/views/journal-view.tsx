"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { BRAND_LABELS, resolveText } from "@/lib/i18n";

type StaticCard = {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  coverImage: string;
  href: string;
  ratioClass: string;
  dispatch?: boolean;
};

const FALLBACK_CARDS: StaticCard[] = [
  {
    id: "journal-static-1",
    title: "Morning Rituals with our Founder",
    excerpt: "Discover the 15-minute morning routine that started it all, blending mindfulness with clinical skincare.",
    category: "Lifestyle",
    publishedAt: "2025-10-12T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgsl_2HTDXglyMBerBIuYun3CFfsJwyKdJcUMeKwXJjHru4bk31K_Yo7ivzTpd-Ol5J5nfP4qHzF8ga7f2TW8dgGqxlrhpKGY-BlhFkcID-DgnLFFA_cztWoX9KnYZEBdcFSYBvg2KIWXkSIxZ4Sht1IryqvQHCSI4NyT0gLMSxGHIgGlehIU8C-LewhKwdhQ1Ou8nO_6WlBQU7Gw1V2wINZR9Iqqw7ffGN_S5AFwkMaX2ekC1xlOHtLsdTE1BgBvP9L5g-3NC6Iw",
    href: "/journal",
    ratioClass: "aspect-[3/4]",
  },
  {
    id: "journal-static-2",
    title: "5 Steps to Glass Skin",
    excerpt: "Achieve that coveted dewy look with these simple, dermatologist-approved layering techniques.",
    category: "Education",
    publishedAt: "2025-10-10T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCajrXDrvqoz2mfp9JHioeR0wCSgfQ4h0KY_lUpMDn5xRMX7DR93ZAVikd-XiHtBmDEc3YuhXhaL_z5tD7mVihYsraPHMErK2f-XTsyFdYT-73e0VwPaPJJ8tSiXcLl1yfvuqrXb4XKlYNk_r5THhNT1TfttzKwFCjwSjs4_irXKZ5ZY4mKC4o2roFE_9h3yutlfQftj_WJgXx3HytQPFKbrDA6l38Z6-xaAA-N-o0usy1IgMCpaTtWK_L7_E-8Rxt-w6fDF3Y4LSo",
    href: "/journal",
    ratioClass: "aspect-[4/3]",
  },
  {
    id: "journal-static-3",
    title: "Paris Fashion Week Dispatch",
    excerpt: "Highlights and beauty trends straight from the runway. What to expect for the upcoming Spring season.",
    category: "Event",
    publishedAt: "2025-10-08T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhk7iO_7cg3T7tS5CSOlBe5Ced9zqd_CsabLv_LMELa6Bvz7KLpnCYUt4hK9CG6e0fGk1JgZcPvR1cTxQeFB3q1JeWHf1c1fxnE3ocI5asa6vdGem9w3JyFw0xx8p1DfDkNGRk-PnNlEwcfK-3YUAUnaM6S43pQHm6a7UCWa92g383l2itMSAEGaOQY48RCESsB6XDseIJ7d7OQbWyDanWLTmx8RHl_YKWs5NNixnsOExXZvzvsJOkfbWd7aC6mCH-PAKzx2ebRe0",
    href: "/journal",
    ratioClass: "aspect-[3/5]",
    dispatch: true,
  },
  {
    id: "journal-static-4",
    title: "In Conversation with Dr. Elena Ross",
    excerpt: "The leading dermatologist answers your most burning questions about SPF and blue light protection.",
    category: "Interviews",
    publishedAt: "2025-09-28T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnAYI_XjVBJj-nYkUzHfSeZ2UI8NZCBhZbwwGFjBk4lNesGqs_xvajt7tlllWMuGHCNnJvEbkPTmVmiBMxM_NmH8_J3QEIQdgIfOr02eiZuHMfQTCXcox5SlsIANeuHRcg26M3-wsZPIzkbKX3kaHZisitIH8nvXsoCuZQnei399xPnpoNFAiW7nVh5-hQJerniusMra7fIdeqhry-FXdVKFTFnt0ci2nSGfz7uymn-4zkbVUt_IqPwOVZ15Ad9I2-v_rKaEGCHMw",
    href: "/journal",
    ratioClass: "aspect-square",
  },
  {
    id: "journal-static-5",
    title: "Digital Detox: Reclaiming Your Evenings",
    excerpt: "Why putting your phone away 2 hours before bed changes your skin health and sleep quality.",
    category: "Wellness",
    publishedAt: "2025-09-15T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyqLTCZmplDu4Q3C6wkYH0Lg8mI5yEWNI-houSQJtr5DnO7blXbW1E5oq2uwYJvKNtqGa5mFcmNVj3OHbB8_8IuPOusX-v5AowfXN1Dev56Q7gUU6k3dHNq8Z8IfruF7lfqHuYBsFtk_6bxvvxDXsSgWJSiFt8x8SGytSTjZFLmRhrfU15BE3LHN-PWj2t-We-09eMmaN4D8dM5Ckki7ClNKk0JNHH-eo-C05Gbpd-jQuzfGjZOc1WChmC_dVUb4nlZET6A1JoIQo",
    href: "/journal",
    ratioClass: "aspect-[16/9]",
  },
];

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
  const categoryDisplay = (value: string) => {
    if (locale !== "ko") return value;
    const labels: Record<string, string> = {
      Lifestyle: "\uB77C\uC774\uD504\uC2A4\uD0C0\uC77C",
      Education: "\uC5D0\uB4C0\uCF00\uC774\uC158",
      Event: "\uC774\uBCA4\uD2B8",
      Interviews: "\uC778\uD130\uBDF0",
      Wellness: "\uC6F0\uB2C8\uC2A4",
      Science: "\uC0AC\uC774\uC5B8\uC2A4",
    };
    return labels[value] ?? value;
  };
  const [loadMoreCount, setLoadMoreCount] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

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
        publishedAt: article.publishedAt,
        coverImage: article.coverImage,
        href: `/journal/${article.slug}`,
        ratioClass: index % 2 === 0 ? "aspect-[3/4]" : "aspect-[4/3]",
      })),
    [articles, locale],
  );

  const fallbackCards = useMemo(
    () =>
      locale === "ko"
        ? FALLBACK_CARDS.map((card) => {
            const titleMap: Record<string, string> = {
              "journal-static-1": "\uCC3D\uC5C5\uC790\uC758 \uC544\uCE68 \uB8E8\uD2F4",
              "journal-static-2": "\uAE00\uB798\uC2A4 \uC2A4\uD0A8\uC744 \uC704\uD55C 5\uB2E8\uACC4",
              "journal-static-3": "\uD30C\uB9AC \uD328\uC158\uC704\uD06C \uBE44\uD558\uC778\uB4DC",
              "journal-static-4": "\uB2E5\uD130 \uC5D8\uB808\uB098 \uB85C\uC2A4 \uC778\uD130\uBDF0",
              "journal-static-5": "\uB514\uC9C0\uD138 \uB514\uD1A1\uC2A4: \uC800\uB141 \uC2B5\uAD00 \uB9AC\uC14B",
            };
            const excerptMap: Record<string, string> = {
              "journal-static-1": "15\uBD84 \uC544\uCE68 \uB8E8\uD2F4\uC73C\uB85C \uBA85\uC0C1\uACFC \uC2A4\uD0A8\uCF00\uC5B4\uB97C \uD568\uAED8 \uC2DC\uC791\uD574\uBCF4\uC138\uC694.",
              "journal-static-2": "\uD53C\uBD80\uACFC \uC804\uBB38\uC758\uAC00 \uAD8C\uD558\uB294 \uB808\uC774\uC5B4\uB9C1 \uD301\uC73C\uB85C \uB9D1\uACE0 \uD22C\uBA85\uD55C \uD53C\uBD80\uB97C \uC644\uC131\uD558\uC138\uC694.",
              "journal-static-3": "\uB7F0\uC6E8\uC774\uC5D0\uC11C \uBC14\uB85C \uAC74\uB108\uC628 \uBE44\uD558\uC778\uB4DC \uD2B8\uB80C\uB4DC\uC640 \uB2E4\uC74C \uC2DC\uC98C \uD558\uC774\uB77C\uC774\uD2B8.",
              "journal-static-4": "SPF\uC640 \uBE14\uB8E8\uB77C\uC774\uD2B8 \uCC28\uB2E8\uC5D0 \uB300\uD55C \uAD81\uAE08\uC99D\uC744 \uC804\uBB38\uC758\uAC00\uC5D0\uAC8C \uBB3B\uB2E4.",
              "journal-static-5": "\uC790\uAE30 \uC804 2\uC2DC\uAC04, \uD578\uB4DC\uD3F0\uC744 \uB193\uC73C\uBA74 \uD53C\uBD80\uC640 \uC218\uBA74 \uD488\uC9C8\uC774 \uB2EC\uB77C\uC9D1\uB2C8\uB2E4.",
            };
            return {
              ...card,
              title: titleMap[card.id] ?? card.title,
              excerpt: excerptMap[card.id] ?? card.excerpt,
            };
          })
        : FALLBACK_CARDS,
    [locale],
  );

  const cards = [...dynamicCards, ...fallbackCards].slice(0, 7);

  const filteredCards = useMemo(() => {
    if (activeCategory === "all") {
      return cards;
    }

    return cards.filter((card) => {
      const normalized = card.category.toLowerCase();
      const target = activeCategory;

      if (target === "events") {
        return normalized.includes("event") || normalized.includes("dispatch");
      }

      if (target === "skincare") {
        return (
          normalized.includes("skin") ||
          normalized.includes("ritual") ||
          normalized.includes("ingredient") ||
          normalized.includes("science") ||
          normalized.includes("seasonal") ||
          normalized.includes("education") ||
          normalized.includes("wellness")
        );
      }

      return normalized.includes(target) || target.includes(normalized);
    });
  }, [activeCategory, cards]);
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
            {[
              { key: "all", label: t("\uC804\uCCB4 \uC2A4\uD1A0\uB9AC", "All Stories") },
              { key: "skincare", label: t("\uC2A4\uD0A8\uCF00\uC5B4", "Skincare") },
              { key: "lifestyle", label: t("\uB77C\uC774\uD504\uC2A4\uD0C0\uC77C", "Lifestyle") },
              { key: "science", label: t("\uC0AC\uC774\uC5B8\uC2A4", "Science") },
              { key: "interviews", label: t("\uC778\uD130\uBDF0", "Interviews") },
              { key: "events", label: t("\uC774\uBCA4\uD2B8", "Events") },
            ].map((chip) => (
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
                  <span className="text-[#e6194c]">{categoryDisplay(card.category)}</span>
                  <span className="size-0.5 bg-gray-400 rounded-full" />
                  <span>{formatShortDate(card.publishedAt, locale)}</span>
                </div>
                <h3 className="font-serif text-2xl font-medium leading-snug group-hover:text-[#e6194c] transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-[#1b0e11]/70 line-clamp-2 leading-relaxed font-light">{card.excerpt}</p>
              </div>
            </article>
          ))}

          <article className="break-inside-avoid group cursor-pointer flex flex-col gap-4 p-8 bg-white rounded-sm border border-[#f3e7ea] transition-all hover:shadow-lg hover:border-[#e6194c]/20">
            <div className="flex flex-col gap-5">
              <div className="size-10 rounded-full bg-[#e6194c]/5 flex items-center justify-center text-[#e6194c] mb-2">
                <span className="material-symbols-outlined">science</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-[#974e60] uppercase">
                <span className="text-[#e6194c]">{t("\uC0AC\uC774\uC5B8\uC2A4", "Science")}</span>
                <span className="size-0.5 bg-gray-400 rounded-full" />
                <span>{locale === "ko" ? "10\uC6D4 05\uC77C" : "Oct 05"}</span>
              </div>
              <h3 className="font-serif text-2xl italic font-medium leading-snug group-hover:text-[#e6194c] transition-colors">
                {t(
                  "\"\uC131\uBD84 \uD3EC\uCEE4\uC2A4: \uBC14\uCFE0\uCE58\uC62C\uC774 \uD544\uC694\uD55C \uC774\uC720\"",
                  "\"Ingredient Spotlight: Why Bakuchiol is the Retinol Alternative you need.\"",
                )}
              </h3>
              <p className="text-sm text-[#1b0e11]/80 leading-relaxed font-light">
                {t(
                  "\uBBFC\uAC10\uC131 \uD53C\uBD80\uB77C\uBA74 \uBC14\uCFE0\uCE58\uC62C\uC774 \uC88B\uC740 \uB300\uC548\uC785\uB2C8\uB2E4. \uC790\uADF9\uC740 \uC904\uC774\uACE0 \uC548\uD2F0\uC5D0\uC774\uC9D5 \uD6A8\uACFC\uB294 \uC720\uC0AC\uD558\uAC8C \uAE30\uB300\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.",
                  "For those with sensitive skin, Bakuchiol offers a plant-based alternative that delivers similar anti-aging benefits without the harsh irritation often associated with traditional retinoids.",
                )}
              </p>
              <span className="text-[#e6194c] text-xs font-bold mt-2 flex items-center gap-1 uppercase tracking-wider">
                {t("\uBD84\uC11D \uC77D\uAE30", "Read Analysis")} <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </span>
            </div>
          </article>

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
                  {t("\uB098\uC774\uD2B8 \uB9AC\uC14B \uC138\uB7FC \uCD9C\uC2DC", "The Night Reset Serum is Here.")}
                </h3>
                <p className="text-white/70 text-sm font-light leading-relaxed">
                  {t("\uC218\uBA74 \uC911 \uD53C\uBD80 \uCEE8\uB514\uC158\uC744 \uB044\uC5B4\uC62C\uB9AC\uC138\uC694. \uCD5C\uC2E0 \uD3EC\uBBAC\uB7EC\uAC00 \uCD9C\uC2DC\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", "Recharge your skin while you sleep. Our latest formula is now available.")}
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
            {t("Portfolio 에디트", "The Portfolio Edit")}
          </h2>
          <p className="text-[#1b0e11]/60 font-light text-lg leading-relaxed">
            {t(
              "\uB9E4\uC8FC \uC804\uD558\uB294 \uBE44\uC728\uD2F0 \uC778\uC0AC\uC774\uD2B8, \uB2E8\uB3C5 \uD61C\uD0DD, \uACFC\uD559 \uAE30\uBC18 \uD301\uC744 \uBA54\uC77C\uB85C \uBC1B\uC544\uBCF4\uC138\uC694.",
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

