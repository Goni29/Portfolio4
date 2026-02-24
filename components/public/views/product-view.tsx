"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { NotFoundView } from "@/components/public/views/not-found-view";
import { resolveList, resolveText } from "@/lib/i18n";
import { currency } from "@/lib/utils";

const normalize = (value: string): string => value.trim().toLowerCase();

const FALLBACK_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCYq3sBwemj9sF7Zm7PA1FpwFRgUC_XP_dr2XWLg51lXte2cJs37EQt1ycq2TKQV8eYMEN-VADENltqbl-LdRylSnh_ty8j9eTFroj929bK_JRGG2H2fO8YkUZpDKeUUGQrMpczpLauVididFF0yv9WGeH-Di7Nyts5ZzfTB9kVvq2MFR7rbGpJ02CFFqXUzJmk3L4KN7VP4eE7bI8_xfkwp7DKBVCxZ6WqdQinYoiV3AXErZyha9smFV8Qbefb3YfXe-wPwqKTN1U";

export function ProductView({ slug }: { slug: string }) {
  const { db, addToCart, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<"50ml" | "100ml">("50ml");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const product = db.products.find((entry) => normalize(entry.slug) === normalize(slug));

  if (!product) {
    return <NotFoundView />;
  }

  const productName = resolveText(product.name, locale);
  const productSubtitle = resolveText(product.shortDescription, locale);
  const productDescription = resolveText(product.description, locale);

  const heroImage = product.images[0] ?? FALLBACK_IMAGE;
  const detailImageA = product.images[1] ?? heroImage;
  const detailImageB = product.images[2] ?? heroImage;
  const detailImageWide = product.images[3] ?? detailImageB;
  const gallery = [heroImage, detailImageA, detailImageB, detailImageWide];
  const selectedImage = gallery[selectedImageIndex] ?? heroImage;

  const categoryLabelMap: Record<string, string> = {
    cleanser: "클렌징",
    serum: "세럼",
    moisturizer: "모이스처라이저",
    sunscreen: "선케어",
    mask: "마스크",
    tool: "뷰티 툴",
  };
  const categoryLabel =
    locale === "ko"
      ? categoryLabelMap[product.category] ?? product.category
      : product.category.charAt(0).toUpperCase() + product.category.slice(1);
  const roundedRating = Math.round(product.rating * 2) / 2;

  const ingredientA = product.ingredients[0] ?? {
    name: t("보태니컬 콤플렉스", "Botanical Complex"),
    benefit: t("피부 장벽 균형 케어", "Daily barrier support"),
  };
  const ingredientB = product.ingredients[1] ?? ingredientA;

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

  const nameWords = productName.split(/\s+/).filter(Boolean);
  const splitIndex = nameWords.length > 1 ? Math.ceil(nameWords.length / 2) : 1;
  const nameTop = nameWords.slice(0, splitIndex).join(" ");
  const nameBottom = nameWords.slice(splitIndex).join(" ");

  const activateTile = (index: number) => {
    setSelectedImageIndex(index);
  };

  const onTileKeyDown = (event: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateTile(index);
    }
  };

  return (
    <>
      <main className="max-w-[1440px] mx-auto">
        <div className="lg:hidden px-6 py-4 flex gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-[#e6194c]">
            {t("홈", "Home")}
          </Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-[#e6194c]">
            {t("스토어", "Store")}
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200">{categoryLabel}</span>
        </div>

        <div className="lg:flex min-h-screen">
          <div className="w-full lg:w-1/2 lg:sticky lg:top-[var(--public-header-height)] lg:h-[calc(100vh-var(--public-header-height))] overflow-y-auto no-scrollbar bg-white dark:bg-[#211115]">
            <div className="grid gap-1">
              <div className="relative w-full aspect-[4/5] bg-slate-100 dark:bg-slate-800 overflow-hidden group">
                <img
                  alt={productName}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={selectedImage}
                />
              </div>

              <div className="grid grid-cols-2 gap-1">
                <div
                  className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => activateTile(1)}
                  onKeyDown={(event) => onTileKeyDown(event, 1)}
                >
                  <img
                    alt={`${productName} ${t("디테일 이미지 1", "detail 1")}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={detailImageA}
                  />
                </div>
                <div
                  className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden group cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => activateTile(2)}
                  onKeyDown={(event) => onTileKeyDown(event, 2)}
                >
                  <img
                    alt={`${productName} ${t("디테일 이미지 2", "detail 2")}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={detailImageB}
                  />
                </div>
              </div>

              <div
                className="relative w-full aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden group cursor-pointer"
                role="button"
                tabIndex={0}
                onClick={() => activateTile(3)}
                onKeyDown={(event) => onTileKeyDown(event, 3)}
              >
                <img
                  alt={`${productName} ${t("디테일 이미지 3", "detail 3")}`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  src={detailImageWide}
                />
                <div className="absolute bottom-4 left-4 bg-white/80 dark:bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
                  {t("내추럴 오리진", "Natural Origin")}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 px-6 py-8 lg:px-16 lg:py-12 flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <div className="hidden lg:flex gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <Link href="/" className="hover:text-[#e6194c] transition-colors">
                  {t("홈", "Home")}
                </Link>
                <span>/</span>
                <Link href="/shop" className="hover:text-[#e6194c] transition-colors">
                  {t("스토어", "Store")}
                </Link>
                <span>/</span>
                <span className="text-slate-900 dark:text-slate-200">{categoryLabel}</span>
              </div>

              <div>
                <h1 className="text-3xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 font-display">
                  {nameBottom ? (
                    <>
                      {nameTop}
                      <br />
                      {nameBottom}
                    </>
                  ) : (
                    nameTop
                  )}
                </h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-light">{productSubtitle}</p>
              </div>

              <div className="flex items-baseline gap-4 mt-2">
                <span className="text-2xl font-semibold text-slate-900 dark:text-white">{currency(product.price)}</span>
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
                  <span className="text-slate-600 dark:text-slate-400 ml-1 underline decoration-[#e6194c]/30 cursor-pointer">
                    {product.rating.toFixed(1)} ({product.reviewCount} {t("리뷰", "Reviews")})
                  </span>
                </div>
              </div>
            </div>

            <div className="prose dark:prose-invert text-slate-600 dark:text-slate-300 leading-relaxed font-light">
              <p>{productDescription}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-[#e6194c]/10 rounded-full text-[#e6194c]">
                  <span className="material-symbols-outlined">local_florist</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{resolveText(ingredientA.name, locale)}</h4>
                  <p className="text-xs text-slate-500 mt-1">{resolveText(ingredientA.benefit, locale)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-[#e6194c]/10 rounded-full text-[#e6194c]">
                  <span className="material-symbols-outlined">water_drop</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{resolveText(ingredientB.name, locale)}</h4>
                  <p className="text-xs text-slate-500 mt-1">{resolveText(ingredientB.benefit, locale)}</p>
                </div>
              </div>
            </div>

            <div className="h-px bg-slate-200 dark:bg-slate-800" />

            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-900 dark:text-white">{t("용량", "Size")}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={
                      selectedSize === "50ml"
                        ? "px-4 py-2 border border-[#e6194c] bg-[#e6194c] text-white rounded text-sm font-medium"
                        : "px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 rounded text-sm transition-colors"
                    }
                    onClick={() => setSelectedSize("50ml")}
                  >
                    50ml
                  </button>
                  <button
                    type="button"
                    className={
                      selectedSize === "100ml"
                        ? "px-4 py-2 border border-[#e6194c] bg-[#e6194c] text-white rounded text-sm font-medium"
                        : "px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 rounded text-sm transition-colors"
                    }
                    onClick={() => setSelectedSize("100ml")}
                  >
                    100ml
                  </button>
                </div>
              </div>

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
                  onClick={() => addToCart(product.slug, quantity)}
                >
                  <span>{t("쇼핑백 담기", "Add to Bag")}</span>
                  <span className="w-px h-4 bg-white/20 mx-2" />
                  <span>{currency(product.price * quantity)}</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined !text-base">local_shipping</span>
                  <span>{t("무료 배송", "Complimentary Shipping")}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined !text-base">verified</span>
                  <span>{t("정품 보증", "Authenticity Assured")}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col divide-y divide-slate-200 dark:divide-slate-800 border-t border-b border-slate-200 dark:border-slate-800 mt-4">
              <details className="group py-4 cursor-pointer">
                <summary className="flex items-center justify-between font-medium list-none text-slate-900 dark:text-white hover:text-[#e6194c] transition-colors">
                  <span>{t("주요 효능", "Benefits")}</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
                </summary>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  <ul className="list-disc pl-5 space-y-1 marker:text-[#e6194c]">
                    {benefitLines.length > 0 ? (
                      benefitLines.map((line) => <li key={line}>{line}</li>)
                    ) : (
                      <li>{t("수분감과 피부결 개선을 돕습니다.", "Visible hydration and texture support.")}</li>
                    )}
                  </ul>
                </div>
              </details>

              <details className="group py-4 cursor-pointer">
                <summary className="flex items-center justify-between font-medium list-none text-slate-900 dark:text-white hover:text-[#e6194c] transition-colors">
                  <span>{t("전성분 안내", "Full Ingredients List")}</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
                </summary>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  {fullIngredientText || t("전성분 정보는 제품 패키지에서 확인하실 수 있습니다.", "Ingredient details are available on product packaging.")}
                </div>
              </details>

              <details className="group py-4 cursor-pointer">
                <summary className="flex items-center justify-between font-medium list-none text-slate-900 dark:text-white hover:text-[#e6194c] transition-colors">
                  <span>{t("배송 및 교환·반품", "Shipping & Returns")}</span>
                  <span className="material-symbols-outlined transition-transform duration-300 group-open:rotate-180">expand_more</span>
                </summary>
                <div className="text-sm text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
                  {t(
                    "일정 금액 이상 주문 시 무료 배송이 제공되며, 미개봉 제품은 구매일로부터 30일 이내 교환·반품이 가능합니다.",
                    "Complimentary shipping is available above the threshold. Unopened items may be returned within 30 days.",
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      </main>

      <div className="bg-white dark:bg-slate-900 py-20 px-6 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-[1440px] mx-auto">
          <div className="mb-24">
            <div className="text-center mb-12">
              <span className="text-[#e6194c] font-bold tracking-widest text-xs uppercase mb-2 block">{t("리추얼 가이드", "The Ritual")}</span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{t("사용 가이드", "How to Use")}</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-0 w-full h-px bg-slate-200 dark:bg-slate-800 -z-10" />

              <div className="flex flex-col items-center text-center group">
                <div className="size-24 rounded-full bg-[#f8f6f6] dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined !text-4xl text-[#e6194c]">clean_hands</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{t("1. 클렌징", "1. Cleanse")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px]">{t("클렌징으로 노폐물을 정리해 피부 결을 깨끗하게 준비해 주세요.", "Begin with a clean canvas by removing residue and impurities.")}</p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="size-24 rounded-full bg-[#e6194c] text-white border-4 border-white dark:border-slate-900 flex items-center justify-center mb-6 shadow-lg shadow-[#e6194c]/30 group-hover:scale-110 transition-transform duration-300 z-10">
                  <span className="material-symbols-outlined !text-4xl">water_drop</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{t("2. 도포", "2. Apply")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px]">{t("2-3방울을 체온으로 데운 뒤 얼굴과 목에 눌러 밀착시켜 주세요.", "Warm 2-3 drops in palms and press gently into face and neck.")}</p>
              </div>

              <div className="flex flex-col items-center text-center group">
                <div className="size-24 rounded-full bg-[#f8f6f6] dark:bg-slate-800 border-4 border-white dark:border-slate-900 flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined !text-4xl text-[#e6194c]">lock</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">{t("3. 마무리", "3. Seal")}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[250px]">{t("크림으로 마무리해 수분과 유효 성분을 안정적으로 유지해 주세요.", "Finish with moisturizer to seal hydration and treatment benefits.")}</p>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-end mb-8 px-2">
              <div>
                <span className="text-[#e6194c] font-bold tracking-widest text-xs uppercase mb-2 block">{t("루틴 완성 제안", "Complete The Routine")}</span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{t("함께 추천하는 제품", "Recommended For You")}</h2>
              </div>
              <Link href="/shop" className="hidden sm:flex items-center gap-1 text-sm font-bold text-slate-900 dark:text-white hover:text-[#e6194c] transition-colors">
                {t("전체 보기", "View All")} <span className="material-symbols-outlined !text-lg">arrow_forward</span>
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

                    {entry.badge === "best" && (
                      <div className="absolute top-3 left-3 bg-[#e6194c] text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                        {t("베스트셀러", "Best Seller")}
                      </div>
                    )}

                    <button
                      type="button"
                      className="absolute bottom-4 right-4 bg-white text-slate-900 p-2 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#e6194c] hover:text-white"
                      onClick={() => addToCart(entry.slug, 1)}
                    >
                      <span className="material-symbols-outlined">add_shopping_cart</span>
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 dark:text-white text-base">{resolveText(entry.name, locale)}</h3>
                  <p className="text-sm text-slate-500 mb-2">{resolveText(entry.shortDescription, locale)}</p>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{currency(entry.price)}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
