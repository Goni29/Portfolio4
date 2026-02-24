"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/store-provider";
import { getJournalCategoryLabel } from "@/components/public/views/journal-categories";
import { STATIC_JOURNAL_ARTICLE_BY_SLUG } from "@/components/public/views/journal-static-articles";
import { NotFoundView } from "@/components/public/views/not-found-view";
import { CONTENT_COPY, resolveText } from "@/lib/i18n";
import { currency, formatDate } from "@/lib/utils";

const normalize = (value: string): string => value.trim().toLowerCase();

export function ArticleView({ slug }: { slug: string }) {
  const { db, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);

  const normalizedSlug = normalize(slug);
  const article = db.articles.find((entry) => normalize(entry.slug) === normalizedSlug);
  const staticArticle = STATIC_JOURNAL_ARTICLE_BY_SLUG.get(normalizedSlug);

  if (!article && !staticArticle) {
    return <NotFoundView />;
  }

  const title = article ? resolveText(article.title, locale) : staticArticle!.title[locale];
  const excerpt = article ? resolveText(article.excerpt, locale) : staticArticle!.excerpt[locale];
  const coverImage = article ? article.coverImage : staticArticle!.coverImage;
  const category = article ? article.category : staticArticle!.category;
  const publishedAt = article ? article.publishedAt : staticArticle!.publishedAt;
  const contentHtml = article ? resolveText(article.content, locale) : staticArticle!.content[locale];
  const relatedProductSlugs = article ? article.relatedProductSlugs : staticArticle!.relatedProductSlugs ?? [];
  const relatedBySlug = db.products.filter((product) => relatedProductSlugs.includes(product.slug));
  const related = relatedBySlug.length > 0 ? relatedBySlug : db.products.filter((product) => product.isFeatured).slice(0, 3);

  return (
    <article className="bg-[#fcf8f9]">
      <section className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
        <div className="relative w-full overflow-hidden rounded-xl bg-[#2d1b20] group cursor-pointer aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9]">
          <img
            src={coverImage}
            alt={title}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 w-full p-6 sm:p-10 lg:p-16 flex flex-col items-start gap-4 sm:gap-6">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold tracking-widest uppercase rounded-full border border-white/10">
              {t("\uD53C\uCC98\uB4DC \uC2A4\uD1A0\uB9AC", "Featured Story")}
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-medium text-white leading-tight max-w-4xl tracking-tight">
              {title}
            </h1>
            <p className="text-gray-200 max-w-xl text-sm sm:text-base leading-relaxed font-light">
              {excerpt}
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-[960px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-[#974e60] uppercase mb-6">
          <span className="text-[#e6194c]">{getJournalCategoryLabel(category, locale)}</span>
          <span className="size-0.5 bg-[#c3aab2] rounded-full" />
          <span>{formatDate(publishedAt, locale)}</span>
        </div>
        <div
          className="prose max-w-none prose-p:text-[#1b0e11]/75 prose-p:leading-relaxed prose-headings:font-serif prose-headings:text-[#1b0e11]"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 border-t border-[#f3e7ea]">
        <h2 className="font-serif text-3xl text-[#1b0e11]">{resolveText(CONTENT_COPY.articleRelatedProducts, locale)}</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {related.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="rounded-2xl border border-[#f0e3e7] bg-white p-4 group"
            >
              <img
                src={product.images[0]}
                alt={resolveText(product.name, locale)}
                className="w-full aspect-[4/3] object-cover rounded-xl transition-transform duration-500 group-hover:scale-[1.02]"
              />
              <h3 className="font-serif text-2xl mt-4 text-[#1b0e11] group-hover:text-[#e6194c] transition-colors">
                {resolveText(product.name, locale)}
              </h3>
              <p className="text-sm text-[#6f5560] mt-2">{currency(product.price)}</p>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
