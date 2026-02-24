"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/store-provider";
import { BRAND_LABELS, resolveText } from "@/lib/i18n";
import { NotFoundView } from "@/components/public/views/not-found-view";
import { currency } from "@/lib/utils";

const normalize = (value: string): string => value.trim().toLowerCase();

export function CollectionView({ slug }: { slug: string }) {
  const { db, addToCart, locale } = useStore();
  const collection = db.collections.find((entry) => normalize(entry.slug) === normalize(slug));

  if (!collection) {
    return <NotFoundView />;
  }

  const products = db.products.filter((product) => collection.productSlugs.includes(product.slug));

  return (
    <>
      <section className="relative w-full h-[70vh] overflow-hidden">
        <img
          src={collection.heroImage}
          alt={resolveText(collection.name, locale)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto">
          <span className="text-white/90 text-sm font-medium tracking-[0.2em] uppercase mb-6">
            {locale === "ko" ? "\uCF5C\uB809\uC158" : "Collection"}
          </span>
          <h1 className="text-white text-5xl md:text-7xl font-serif font-medium leading-[1.1] mb-5">
            {resolveText(collection.name, locale)}
          </h1>
          <p className="text-white/90 text-lg font-light max-w-xl leading-relaxed">
            {resolveText(collection.description, locale)}
          </p>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-8 bg-[#f8f6f6]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => (
            <article key={product.id} className="group cursor-pointer">
              <div className="relative overflow-hidden rounded-xl bg-[#efe6e8] aspect-[3/4] mb-4">
                <Link href={`/product/${product.slug}`} className="block h-full w-full">
                  <img
                    src={product.images[0]}
                    alt={resolveText(product.name, locale)}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                </Link>
                {product.badge && (
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-white/90 backdrop-blur text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded">
                      {product.badge === "best" ? resolveText(BRAND_LABELS.badgeBest, locale) : resolveText(BRAND_LABELS.badgeNew, locale)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-4 z-20 opacity-0 translate-y-4 transition-all duration-300 ease-out bg-gradient-to-t from-black/60 to-transparent group-hover:opacity-100 group-hover:translate-y-0">
                  <button
                    type="button"
                    className="w-full bg-white text-[#1b0e11] hover:bg-white/90 font-medium text-sm py-3 rounded-sm shadow-lg transition-colors flex items-center justify-center gap-2"
                    onClick={() => addToCart(product.slug, 1)}
                  >
                    <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
                    {resolveText(BRAND_LABELS.ctaAddToBag, locale)}
                  </button>
                </div>
              </div>
              <div className="space-y-1 text-center">
                <h3 className="text-lg font-serif font-medium text-[#1b0e11] leading-tight group-hover:text-[#e6194c] transition-colors">
                  {resolveText(product.name, locale)}
                </h3>
                <p className="text-sm text-[#6f5560] line-clamp-1">
                  {resolveText(product.shortDescription, locale)}
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="text-base font-medium text-[#1b0e11]">{currency(product.price)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

