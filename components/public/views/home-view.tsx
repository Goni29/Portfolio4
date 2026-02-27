"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/store-provider";
import { BRAND_LABELS, CONTENT_COPY, resolveText } from "@/lib/i18n";

export function HomeView() {
  const { db, addToCart, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const articleCategoryLabel = (value: string) => {
    if (locale !== "ko") return value;
    const map: Record<string, string> = {
      Rituals: "리추얼",
      Ingredients: "성분",
      Guides: "가이드",
      Lifestyle: "라이프스타일",
      Education: "에듀케이션",
      Event: "이벤트",
      Interviews: "인터뷰",
      Wellness: "웰니스",
      Science: "사이언스",
    };
    return map[value] ?? value;
  };

  const hero = db.banners.find((banner) => banner.key === "hero" && banner.active);
  const heroSubheadline =
    locale === "ko"
      ? "정제된 포뮬러와 감각적인 제형으로, 일상의 루틴을 하이엔드 스킨케어 경험으로 완성하세요."
      : hero?.subheadline ?? "Discover precision skincare crafted for a refined daily ritual.";
  const heroCtaHref = !hero?.ctaHref || hero.ctaHref === "/shop" ? "/collections" : hero.ctaHref;
  const heroCtaText = locale === "ko" ? "에디트 컬렉션 보기" : hero?.ctaText || resolveText(BRAND_LABELS.ctaDiscover, locale);
  const featured = db.products.filter((product) => product.isFeatured).slice(0, 3);
  const journals = [...db.articles].sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)).slice(0, 3);
  const collections = [...db.collections].sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 3);

  return (
    <>
      <section className="relative w-full h-[68svh] min-h-[480px] sm:h-[74svh] md:h-[78svh] lg:h-[85vh] overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-no-repeat bg-[position:62%_20%] sm:bg-[position:58%_20%] md:bg-[position:54%_20%] lg:bg-[position:50%_20%]"
          style={{
            backgroundImage: `url(${hero?.url ?? collections[0]?.heroImage ?? ""})`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/32 sm:bg-black/28 lg:hidden" />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[76%] lg:block"
          style={{
            background:
              "linear-gradient(90deg, rgba(18,13,16,0.62) 0%, rgba(18,13,16,0.42) 36%, rgba(18,13,16,0.2) 60%, rgba(18,13,16,0) 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 hidden w-[76%] lg:block"
          style={{
            background:
              "radial-gradient(120% 90% at 0% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 72%)",
          }}
        />
        <div className="relative z-20 flex h-full w-full items-center justify-center px-4 sm:px-8 lg:max-w-4xl lg:mr-auto lg:ml-16 lg:px-4">
          <div className="flex w-full max-w-[20rem] sm:max-w-[30rem] md:max-w-[38rem] lg:max-w-none flex-col items-center text-center">
            <span className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/90 sm:mb-6 sm:text-sm">
              {t("새로운 기준", "The New Standard")}
            </span>
            <h1 className="mb-6 font-serif text-[2.85rem] font-medium leading-[1.06] text-white drop-shadow-sm sm:mb-8 sm:text-[3.9rem] md:text-7xl lg:text-8xl">
              {t("다시 정의하는", "Redefining")} <br />
              <span className="italic">{t("광채", "Radiance")}</span>
            </h1>
            <p className="mb-8 max-w-[19.5rem] text-base font-light leading-relaxed text-white/90 sm:mb-10 sm:max-w-lg sm:text-lg md:text-xl">
              {heroSubheadline}
            </p>
            <Link
              href={heroCtaHref}
              className="group flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-[#1b0e11] sm:px-8 sm:py-4"
            >
              <span className="text-sm font-bold tracking-wider uppercase">
                {heroCtaText}
              </span>
              <span className="material-symbols-outlined text-sm transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#fcf8f9]">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 text-left md:flex-row md:items-end md:gap-6">
            <div className="w-full md:w-auto">
              <span className="text-[#e6194c] text-xs font-bold tracking-[0.2em] uppercase block mb-2">
                {resolveText(BRAND_LABELS.sectionCuratedEssentials, locale)}
              </span>
              <h2 className="smart-wrap text-[2.1rem] leading-[1.14] sm:text-4xl md:text-5xl font-serif text-[#1b0e11]">
                {resolveText(BRAND_LABELS.sectionTheCollection, locale)}
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex self-start md:self-auto items-center gap-2 text-sm font-medium text-[#1b0e11] hover:text-[#e6194c] transition-colors"
            >
              {resolveText(BRAND_LABELS.ctaViewAllProducts, locale)}
              <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">
                arrow_right_alt
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featured.map((product) => (
              <article key={product.id} className="group relative flex flex-col gap-4">
                <Link
                  href={`/product/${product.slug}`}
                  className="absolute inset-0 z-10"
                  aria-label={
                    locale === "ko"
                      ? `${resolveText(product.name, locale)} 상세 보기`
                      : `View ${resolveText(product.name, locale)} details`
                  }
                />
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#f3e7ea]">
                  <img
                    src={product.images[0]}
                    alt={resolveText(product.name, locale)}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded-sm text-[#1b0e11]">
                      {product.badge === "best" ? resolveText(BRAND_LABELS.badgeBest, locale) : resolveText(BRAND_LABELS.badgeNew, locale)}
                    </span>
                  )}
                  <button
                    type="button"
                    className="absolute bottom-4 right-4 z-20 h-10 w-10 bg-[#e6194c] text-white rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#cb1743] shadow-lg"
                    onClick={() => addToCart(product.slug, 1)}
                    aria-label={resolveText(BRAND_LABELS.ctaAddToBag, locale)}
                  >
                    <span className="material-symbols-outlined text-lg">add_shopping_cart</span>
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="text-xl font-serif text-[#1b0e11] group-hover:text-[#e6194c] transition-colors">
                      {resolveText(product.name, locale)}
                    </h3>
                    <span className="text-sm font-medium text-[#1b0e11]/60">${product.price.toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-[#1b0e11]/60 line-clamp-2">
                    {resolveText(product.shortDescription, locale)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col lg:flex-row w-full bg-[#f3e7ea]">
        <div className="w-full lg:w-1/2 relative h-[500px] lg:h-auto overflow-hidden">
          <img
            src={collections[1]?.heroImage ?? collections[0]?.heroImage ?? ""}
            alt={t("\uBE0C\uB79C\uB4DC \uCCA0\uD559", "Philosophy")}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center items-start">
          <span className="text-[#e6194c] text-xs font-bold tracking-[0.2em] uppercase mb-4">
            {resolveText(BRAND_LABELS.sectionOurPhilosophy, locale)}
          </span>
          <h2 className="text-4xl lg:text-5xl font-serif text-[#1b0e11] mb-6 leading-tight">
            {t("정제된 스킨케어.", "Beauty, Curated.")} <br />
            <span className="italic text-[#1b0e11]/60">{t("덜어낼수록 더 선명하게", "Refined by Reduction.")}</span>
          </h2>
          <p className="text-[#1b0e11]/70 text-lg leading-relaxed mb-8 max-w-md">
            {resolveText(CONTENT_COPY.homePhilosophyBody, locale)}
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-[#1b0e11] border-b border-[#1b0e11] pb-1 hover:text-[#e6194c] hover:border-[#e6194c] transition-colors"
          >
            <span className="font-medium">{resolveText(BRAND_LABELS.ctaReadMore, locale)}</span>
          </Link>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#fcf8f9]">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#e6194c] text-xs font-bold tracking-[0.2em] uppercase mb-3 block">
              {resolveText(BRAND_LABELS.sectionTheJournal, locale)}
            </span>
            <h2 className="text-4xl font-serif text-[#1b0e11]">
              {resolveText(BRAND_LABELS.sectionNotesOnBeautyAndRitual, locale)}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {journals.map((article) => (
              <article key={article.id} className="group">
                <Link href={`/journal/${article.slug}`} className="block overflow-hidden rounded-lg mb-4 aspect-[3/2]">
                  <img
                    src={article.coverImage}
                    alt={resolveText(article.title, locale)}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-bold text-[#e6194c] uppercase tracking-wider">{articleCategoryLabel(article.category)}</span>
                  <h3 className="text-2xl font-serif text-[#1b0e11] group-hover:text-[#e6194c] transition-colors">
                    {resolveText(article.title, locale)}
                  </h3>
                  <p className="text-[#1b0e11]/60 text-sm leading-relaxed mt-1">
                    {resolveText(article.excerpt, locale)}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
