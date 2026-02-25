"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/store-provider";
import { resolveText } from "@/lib/i18n";

const normalize = (value: string): string => value.trim().toLowerCase();

export function CollectionsView() {
  const { db, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const collections = [...db.collections].sort((a, b) => a.sortOrder - b.sortOrder);
  const productCountBySlug = new Map<string, number>();

  db.products.forEach((product) => {
    product.collectionSlugs.forEach((collectionSlug) => {
      productCountBySlug.set(collectionSlug, (productCountBySlug.get(collectionSlug) ?? 0) + 1);
    });
  });

  return (
    <main className="px-6 lg:px-12 py-12 bg-[#fcf8f9]">
      <div className="max-w-[1440px] mx-auto">
        <header className="text-center mb-10">
          <span className="text-[#e6194c] text-xs font-bold tracking-[0.2em] uppercase block mb-3">
            {t("시그니처 큐레이션", "Signature Curation")}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-[#1b0e11] mb-4">
            {t("컬렉션", "Collections")}
          </h1>
          <p className="text-[#1b0e11]/70 max-w-2xl mx-auto">
            {t(
              "피부 컨디션과 루틴 목적에 맞춰 큐레이션된 컬렉션을 확인해보세요.",
              "Explore curated collections tailored to your skin goals and daily ritual.",
            )}
          </p>
        </header>

        {collections.length === 0 ? (
          <div className="rounded-2xl border border-[#eadde0] bg-white px-6 py-16 text-center text-[#6f5560]">
            {t("표시할 컬렉션이 아직 없습니다.", "No collections are available yet.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collections.map((collection) => {
              const collectionName = resolveText(collection.name, locale);
              const collectionDescription = resolveText(collection.description, locale);
              const collectionHref = `/collections/${collection.slug}`;
              const productCount = productCountBySlug.get(collection.slug) ?? 0;
              const heroObjectPosition =
                normalize(collection.slug) === "daily-defense" ? "50% 72%" : "50% 50%";

              return (
                <article
                  key={collection.id}
                  className="group overflow-hidden rounded-2xl border border-[#eadde0] bg-white shadow-sm hover:shadow-lg transition-shadow"
                >
                  <Link href={collectionHref} className="block">
                    <div className="relative aspect-[4/5] overflow-hidden bg-[#efe6e8]">
                      <img
                        src={collection.heroImage}
                        alt={collectionName}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={{ objectPosition: heroObjectPosition }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      <div className="absolute left-4 bottom-4 right-4 flex items-center justify-between">
                        <span className="text-white text-sm tracking-wider uppercase font-semibold">
                          {t("컬렉션 보기", "View Collection")}
                        </span>
                        <span className="material-symbols-outlined text-white">arrow_forward</span>
                      </div>
                    </div>

                    <div className="px-5 py-5">
                      <h2 className="text-2xl font-serif text-[#1b0e11] mb-2 group-hover:text-[#e6194c] transition-colors">
                        {collectionName}
                      </h2>
                      <p className="text-[#6f5560] text-sm leading-relaxed line-clamp-2">
                        {collectionDescription}
                      </p>
                      <p className="mt-4 text-xs font-semibold tracking-[0.14em] uppercase text-[#1b0e11]/55">
                        {t(`${productCount}개 제품`, `${productCount} products`)}
                      </p>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
