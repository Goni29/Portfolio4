"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { NotFoundView } from "@/components/public/views/not-found-view";
import { resolveList, resolveText } from "@/lib/i18n";
import {
  getDefaultProductSizeKey,
  getProductPriceBySize,
  getProductSizeOptions,
  hasMultipleProductSizes,
} from "@/lib/product-pricing";
import { currency } from "@/lib/utils";

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYq3sBwemj9sF7Zm7PA1FpwFRgUC_XP_dr2XWLg51lXte2cJs37EQt1ycq2TKQV8eYMEN-VADENltqbl-LdRylSnh_ty8j9eTFroj929bK_JRGG2H2fO8YkUZpDKeUUGQrMpczpLauVididFF0yv9WGeH-Di7Nyts5ZzfTB9kVvq2MFR7rbGpJ02CFFqXUzJmk3L4KN7VP4eE7bI8_xfkwp7DKBVCxZ6WqdQinYoiV3AXErZyha9smFV8Qbefb3YfXe-wPwqKTN1U";

const normalize = (value: string): string => value.trim().toLowerCase();

export function ProductView({ slug }: { slug: string }) {
  const { db, addToCart, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);

  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSizeKey, setSelectedSizeKey] = useState("");

  const product = db.products.find((entry) => normalize(entry.slug) === normalize(slug));
  const sizeOptions = product ? getProductSizeOptions(product) : [];
  const defaultSizeKey = product ? getDefaultProductSizeKey(product) : "";
  const activeSizeKey = sizeOptions.some((option) => option.key === selectedSizeKey)
    ? selectedSizeKey
    : defaultSizeKey;
  const activeUnitPrice = product ? getProductPriceBySize(product, activeSizeKey) : 0;
  const showSizeOptions = product ? hasMultipleProductSizes(product) : false;

  if (!product) {
    return <NotFoundView />;
  }

  const productName = resolveText(product.name, locale);
  const productSubtitle = resolveText(product.shortDescription, locale);
  const productDescription = resolveText(product.description, locale);

  const heroImage = product.images[0] ?? FALLBACK_IMAGE;
  const detailImageA = product.images[1] ?? heroImage;
  const detailImageB = product.images[2] ?? heroImage;
  const detailImageC = product.images[3] ?? detailImageB;
  const gallery = [heroImage, detailImageA, detailImageB, detailImageC];

  const selectedImage = gallery[selectedImageIndex] ?? gallery[0] ?? FALLBACK_IMAGE;

  const roundedRating = Math.round(product.rating * 2) / 2;
  const benefitLines = [
    ...resolveList(product.howToUse, locale),
    ...product.ingredients.map((ingredient) => resolveText(ingredient.benefit, locale)),
  ]
    .filter(Boolean)
    .slice(0, 4);

  const fullIngredientText = product.ingredients
    .map((ingredient) => `${resolveText(ingredient.name, locale)} (${resolveText(ingredient.benefit, locale)})`)
    .join(", ");

  const related = db.products.filter(
    (entry) =>
      entry.slug !== product.slug &&
      entry.collectionSlugs.some((collectionSlug) => product.collectionSlugs.includes(collectionSlug)),
  );
  const fallbackProducts = db.products.filter(
    (entry) => entry.slug !== product.slug && !related.some((item) => item.slug === entry.slug),
  );
  const recommended = [...related, ...fallbackProducts].slice(0, 4);

  return (
    <>
      <main className="max-w-[1440px] mx-auto px-6 py-8 lg:py-12">
        <div className="flex gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-[#e6194c] transition-colors">
            {t("홈", "Home")}
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#e6194c] transition-colors">
            {t("스토어", "Store")}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200">{productName}</span>
        </div>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 aspect-[4/5]">
              <img alt={productName} className="h-full w-full object-cover" src={selectedImage} />
            </div>

            <div className="mt-3 grid grid-cols-4 gap-2">
              {gallery.map((image, index) => (
                <button
                  key={`${product.slug}-image-${index}`}
                  type="button"
                  className={`overflow-hidden rounded-lg border ${
                    index === selectedImageIndex
                      ? "border-[#e6194c]"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                  onClick={() => setSelectedImageIndex(index)}
                >
                  <img
                    alt={`${productName} ${index + 1}`}
                    className="h-full w-full object-cover aspect-square"
                    src={image}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                {productName}
              </h1>
              <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">{productSubtitle}</p>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                {currency(activeUnitPrice)}
              </span>
              {product.freeShipping && (
                <span className="text-sm font-semibold text-[#e6194c]">
                  {t("무료배송", "Free Shipping")}
                </span>
              )}
              <div className="flex items-center gap-1 text-[#e6194c] text-sm font-medium">
                {Array.from({ length: 5 }, (_, index) => {
                  const value = index + 1;
                  let icon = "star_outline";
                  if (roundedRating >= value) {
                    icon = "star";
                  } else if (roundedRating + 0.5 === value) {
                    icon = "star_half";
                  }

                  return (
                    <span key={`${product.id}-rating-${value}`} className="material-symbols-outlined !text-sm">
                      {icon}
                    </span>
                  );
                })}
                <span className="text-slate-600 dark:text-slate-400 ml-1">
                  {product.rating.toFixed(1)} ({product.reviewCount} {t("리뷰", "Reviews")})
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{productDescription}</p>

            {showSizeOptions && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{t("용량", "Size")}</span>
                <div className="flex gap-2">
                  {sizeOptions.map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      className={
                        activeSizeKey === option.key
                          ? "px-4 py-2 border border-[#e6194c] bg-[#e6194c] text-white rounded text-sm font-medium"
                          : "px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 rounded text-sm transition-colors"
                      }
                      onClick={() => setSelectedSizeKey(option.key)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg h-12 w-32">
                <button
                  type="button"
                  className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-[#e6194c] transition-colors"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  <span className="material-symbols-outlined !text-lg">remove</span>
                </button>
                <input
                  className="w-full text-center border-none bg-transparent focus:ring-0 p-0 font-medium text-slate-900 dark:text-white"
                  type="text"
                  readOnly
                  value={quantity}
                />
                <button
                  type="button"
                  className="w-10 h-full flex items-center justify-center text-slate-500 hover:text-[#e6194c] transition-colors"
                  onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                >
                  <span className="material-symbols-outlined !text-lg">add</span>
                </button>
              </div>

              <button
                type="button"
                className="flex-1 bg-[#e6194c] hover:bg-[#e6194c]/90 text-white font-bold h-12 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg shadow-[#e6194c]/20"
                onClick={() => addToCart(product.slug, quantity, activeSizeKey)}
              >
                <span>{t("쇼핑백 담기", "Add to Bag")}</span>
                <span className="w-px h-4 bg-white/20 mx-2" />
                <span>{currency(activeUnitPrice * quantity)}</span>
              </button>
            </div>

            <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800">
              <details className="group py-4">
                <summary className="flex items-center justify-between font-medium list-none text-slate-900 dark:text-white cursor-pointer">
                  <span>{t("주요 효능", "Benefits")}</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                  {benefitLines.length > 0 ? (
                    benefitLines.map((line) => <li key={line}>{line}</li>)
                  ) : (
                    <li>{t("효능 정보를 준비 중입니다.", "Benefit details are being prepared.")}</li>
                  )}
                </ul>
              </details>

              <details className="group py-4">
                <summary className="flex items-center justify-between font-medium list-none text-slate-900 dark:text-white cursor-pointer">
                  <span>{t("전성분 안내", "Full Ingredients List")}</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">
                    expand_more
                  </span>
                </summary>
                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                  {fullIngredientText || t("전성분 정보를 준비 중입니다.", "Ingredient details are being prepared.")}
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>

      <section className="bg-white dark:bg-slate-900 py-16 px-6 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex justify-between items-end mb-8">
            <div>
              <span className="text-[#e6194c] font-bold tracking-widest text-xs uppercase mb-2 block">
                {t("함께 쓰면 좋아요", "Complete The Routine")}
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t("추천 제품", "Recommended For You")}
              </h2>
            </div>
            <Link
              href="/shop"
              className="hidden sm:flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white hover:text-[#e6194c] transition-colors"
            >
              {t("전체 보기", "View All")}
              <span className="material-symbols-outlined !text-lg">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map((entry) => (
              <article key={entry.id} className="group flex flex-col">
                <div className="relative overflow-hidden rounded-lg bg-[#f8f6f6] dark:bg-slate-800 aspect-[4/5] mb-4">
                  <Link href={`/product/${entry.slug}`} className="block h-full w-full">
                    <img
                      alt={resolveText(entry.name, locale)}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      src={entry.images[0] ?? FALLBACK_IMAGE}
                    />
                  </Link>

                  <button
                    type="button"
                    className="absolute bottom-4 right-4 bg-white text-slate-900 p-2 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#e6194c] hover:text-white"
                    onClick={() => addToCart(entry.slug, 1)}
                  >
                    <span className="material-symbols-outlined">add_shopping_cart</span>
                  </button>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {resolveText(entry.name, locale)}
                </h3>
                <p className="text-sm text-slate-500 mb-2">
                  {resolveText(entry.shortDescription, locale)}
                </p>
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {currency(entry.price)}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
