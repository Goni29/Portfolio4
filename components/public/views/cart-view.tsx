"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { EmptyState } from "@/components/public/shared/ui";
import { BRAND_LABELS, CONTENT_COPY, resolveText } from "@/lib/i18n";
import { getProductSizeLabel, getProductSizeOptions, hasMultipleProductSizes } from "@/lib/product-pricing";
import { cn, currency } from "@/lib/utils";

export function CartView() {
  const router = useRouter();
  const {
    cartLines,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartFreeShippingReason,
    updateCartQuantity,
    updateCartItemSize,
    removeFromCart,
    db,
    locale,
  } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);

  const [selectedSampleSlug, setSelectedSampleSlug] = useState(db.products[0]?.slug ?? "");
  const [giftMessage, setGiftMessage] = useState("");

  if (cartLines.length === 0) {
    return (
      <section className="px-6 lg:px-12 py-14">
        <EmptyState
          title={resolveText(CONTENT_COPY.cartEmptyTitle, locale)}
          body={resolveText(CONTENT_COPY.cartEmptyBody, locale)}
          ctaHref="/shop"
          ctaLabel={resolveText(BRAND_LABELS.navShop, locale)}
        />
      </section>
    );
  }

  const checkoutAmount = Math.max(0, cartSubtotal - cartDiscount);
  const freeShippingGap = Math.max(0, db.settings.freeShippingThreshold - cartSubtotal);
  const progressPercent = cartFreeShippingReason
    ? 100
    : Math.min(100, Math.round((cartSubtotal / Math.max(db.settings.freeShippingThreshold, 1)) * 100));
  const freeShippingMessage =
    cartFreeShippingReason === "product"
      ? t("무료배송 상품이 포함되어 배송비가 무료입니다", "A free-shipping item in your bag unlocks free shipping")
      : cartFreeShippingReason === "threshold"
        ? t("무료배송 기준을 충족해 배송비가 무료입니다", "You reached the free-shipping threshold")
        : t(
            `무료 배송까지 ${currency(freeShippingGap)} 남았습니다`,
            `${currency(freeShippingGap)} away from complimentary shipping`,
          );

  return (
    <section className="fixed inset-x-0 bottom-0 top-[var(--public-header-height)] z-[70] overflow-hidden bg-[#f8f6f6] dark:bg-[#211115]">
      <div className="relative flex h-full w-full flex-col overflow-hidden opacity-40 pointer-events-none blur-[2px] transition-all duration-300">
        <main className="flex-1 px-10 py-10 bg-[#f8f6f6] dark:bg-[#211115]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="aspect-[3/4] bg-white dark:bg-[#2d1b20] rounded-lg" />
            <div className="aspect-[3/4] bg-white dark:bg-[#2d1b20] rounded-lg" />
            <div className="aspect-[3/4] bg-white dark:bg-[#2d1b20] rounded-lg" />
          </div>
        </main>
      </div>

      <div className="absolute inset-0 z-50 flex justify-end">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-black/30 backdrop-blur-md transition-opacity animate-[fadeIn_0.3s_ease-out_forwards]"
          onClick={() => router.push("/shop")}
        />

        <aside className="relative w-full max-w-md h-full bg-white dark:bg-[#2d1b20] shadow-2xl flex flex-col animate-[slideIn_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards]">
          <div className="flex-none px-6 py-5 border-b border-[#f3e7ea] dark:border-[#4a3b3e] bg-white/95 dark:bg-[#2d1b20]/95 backdrop-blur z-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold tracking-tight text-[#1b0e11] dark:text-white uppercase flex items-center gap-2">
                {t("쇼핑백", "Your Bag")}
                <span className="bg-[#e6194c]/10 text-[#e6194c] px-2 py-0.5 rounded-full text-xs font-bold">
                  {t(`${cartLines.length}개 상품`, `${cartLines.length} items`)}
                </span>
              </h2>
              <Link
                href="/shop"
                className="group p-2 -mr-2 text-[#1b0e11] dark:text-white hover:text-[#e6194c] transition-colors rounded-full hover:bg-[#f8f6f6] dark:hover:bg-[#211115]"
                aria-label={t("닫기", "Close")}
              >
                <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">close</span>
              </Link>
            </div>

            <div className="space-y-2 bg-[#f8f6f6] dark:bg-[#211115] p-3 rounded-lg border border-[#f3e7ea] dark:border-[#4a3b3e]">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-[#1b0e11] dark:text-gray-200">{freeShippingMessage}</span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#e6194c] to-rose-400 rounded-full shadow-[0_0_10px_rgba(230,25,76,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-2 space-y-8 bg-white dark:bg-[#2d1b20]">
            <div className="space-y-6 mt-4">
              {cartLines.map((line, index) => {
                const sizeOptions = hasMultipleProductSizes(line.product) ? getProductSizeOptions(line.product) : [];
                const currentSizeKey = line.item.sizeKey ?? sizeOptions[0]?.key ?? "default";
                return (
                  <article
                    key={`${line.product.slug}-${index}`}
                    className="flex gap-4 group"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-[#f8f6f6] dark:bg-[#211115] relative border border-[#f3e7ea] dark:border-[#4a3b3e]">
                    <img
                      alt={resolveText(line.product.name, locale)}
                      className="w-full h-full object-cover"
                      src={line.product.images[0]}
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-[#1b0e11] dark:text-white leading-tight text-sm hover:text-[#e6194c] transition-colors cursor-pointer">
                          {resolveText(line.product.name, locale)}
                        </h3>
                        <span className="font-bold text-[#1b0e11] dark:text-white text-sm">{currency(line.lineTotal)}</span>
                      </div>
                      <p className="text-xs text-[#974e60] dark:text-gray-400 mt-1">
                        {resolveText(line.product.shortDescription, locale)}
                      </p>
                      {hasMultipleProductSizes(line.product) && (
                        <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-[#974e60] dark:text-gray-400">
                          <span>{t("용량", "Size")}:</span>
                          {sizeOptions.map((option, optionIndex) => {
                            const selected = option.key === currentSizeKey;
                            return (
                              <div key={option.key} className="contents">
                                <button
                                  type="button"
                                  aria-pressed={selected}
                                  className={cn(
                                    "text-xs transition-colors",
                                    selected
                                      ? "font-medium text-[#1b0e11] dark:text-white"
                                      : "hover:text-[#e6194c]",
                                  )}
                                  onClick={() => updateCartItemSize(line.product.slug, option.key, currentSizeKey)}
                                >
                                  {getProductSizeLabel(line.product, locale, option.key)}
                                </button>
                                {optionIndex < sizeOptions.length - 1 && <span className="opacity-50">/</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border border-[#f3e7ea] dark:border-[#4a3b3e] rounded-md h-7 w-fit bg-[#f8f6f6] dark:bg-[#211115] overflow-hidden">
                        <button
                          type="button"
                          className="px-2 h-full hover:bg-gray-100 dark:hover:bg-[#3b2a30] hover:text-[#e6194c] transition-colors flex items-center justify-center border-r border-[#f3e7ea] dark:border-[#4a3b3e]"
                          onClick={() =>
                            updateCartQuantity(
                              line.product.slug,
                              Math.max(1, line.item.quantity - 1),
                              line.item.sizeKey,
                            )
                          }
                        >
                          <span className="material-symbols-outlined text-[14px]">remove</span>
                        </button>
                        <span className="text-xs font-medium w-8 text-center tabular-nums text-[#1b0e11] dark:text-white">{line.item.quantity}</span>
                        <button
                          type="button"
                          className="px-2 h-full hover:bg-gray-100 dark:hover:bg-[#3b2a30] hover:text-[#e6194c] transition-colors flex items-center justify-center border-l border-[#f3e7ea] dark:border-[#4a3b3e]"
                          onClick={() =>
                            updateCartQuantity(line.product.slug, line.item.quantity + 1, line.item.sizeKey)
                          }
                        >
                          <span className="material-symbols-outlined text-[14px]">add</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        className="text-xs text-[#974e60] dark:text-gray-400 hover:text-[#e6194c] border-b border-transparent hover:border-[#e6194c] transition-all"
                        onClick={() => removeFromCart(line.product.slug, line.item.sizeKey)}
                      >
                        {resolveText(CONTENT_COPY.cartRemove, locale)}
                      </button>
                    </div>
                  </div>
                  </article>
                );
              })}
            </div>

            <div className="pt-6 border-t border-[#f3e7ea] dark:border-[#4a3b3e]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-bold tracking-wider text-[#1b0e11] dark:text-white uppercase">{t("컴플리먼터리 샘플", "Complimentary Sample")}</h4>
                <span className="text-[10px] font-bold text-[#e6194c] bg-[#e6194c]/10 px-2 py-0.5 rounded-full uppercase tracking-wide">
                  {t("1개 선택", "Choose 1")}
                </span>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 snap-x no-scrollbar">
                {db.products.slice(0, 3).map((product) => {
                  const selected = selectedSampleSlug === product.slug;
                  return (
                    <button
                      key={product.id}
                      type="button"
                      className="snap-start shrink-0 w-[130px] flex flex-col gap-2 group cursor-pointer text-left"
                      onClick={() => setSelectedSampleSlug(product.slug)}
                      aria-pressed={selected}
                    >
                      <div
                        className={cn(
                          "relative aspect-square rounded-lg bg-[#f8f6f6] dark:bg-[#211115] overflow-hidden transition-colors duration-300",
                          selected
                            ? "border-2 border-[#e6194c] ring-2 ring-[#e6194c]/10 shadow-sm"
                            : "border border-[#f3e7ea] dark:border-[#4a3b3e] group-hover:border-[#e6194c]",
                        )}
                      >
                        <img
                          alt={resolveText(product.name, locale)}
                          className={cn(
                            "w-full h-full object-cover p-2 transition-opacity",
                            selected ? "opacity-100" : "opacity-90 group-hover:opacity-100",
                          )}
                          src={product.images[0]}
                        />

                        {selected ? (
                          <div className="absolute inset-0 bg-[#e6194c]/5 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="bg-[#e6194c] text-white rounded-full p-1.5 shadow-lg">
                              <span className="material-symbols-outlined text-lg">check</span>
                            </div>
                          </div>
                        ) : (
                          <div className="absolute top-2 right-2">
                            <div className="bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-110">
                              <span className="material-symbols-outlined text-[#e6194c] text-[16px]">add</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className={cn("text-xs font-bold truncate transition-colors", selected ? "text-[#e6194c]" : "text-[#1b0e11] dark:text-white group-hover:text-[#e6194c]")}>
                          {resolveText(product.name, locale)}
                        </p>
                        <p className="text-[10px] text-[#974e60] dark:text-gray-400">{t("체험용", "Trial")}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 pb-6">
              <details className="group border border-[#f3e7ea] dark:border-[#4a3b3e] rounded-lg bg-[#f8f6f6] dark:bg-[#211115] overflow-hidden">
                <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-[#1b0e11] dark:text-white hover:bg-white dark:hover:bg-[#2d1b20] transition-colors select-none list-none">
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-[#2d1b20] p-1.5 rounded-md text-[#e6194c] shadow-sm border border-[#f3e7ea] dark:border-[#4a3b3e]">
                      <span className="material-symbols-outlined text-[18px] block">card_giftcard</span>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wide">{t("기프트 메시지 추가", "Add a Gift Note")}</span>
                  </div>
                  <span className="material-symbols-outlined text-[#974e60] dark:text-gray-400 transition-transform group-open:rotate-180 text-xl">
                    expand_more
                  </span>
                </summary>

                <div className="border-t border-[#f3e7ea] dark:border-[#4a3b3e] bg-white dark:bg-[#2d1b20] p-4">
                  <label className="sr-only" htmlFor="gift-message">
                    {t("기프트 메시지", "Gift Message")}
                  </label>
                  <textarea
                    id="gift-message"
                    className="w-full rounded-md border border-[#f3e7ea] dark:border-[#4a3b3e] bg-[#f8f6f6] dark:bg-[#211115] text-sm p-3 focus:border-[#e6194c] focus:ring-1 focus:ring-[#e6194c] outline-none transition-all placeholder:text-[#974e60]/60 resize-none"
                    maxLength={140}
                    placeholder={t("소중한 메시지를 남겨주세요", "Enter your personal message here...")}
                    rows={3}
                    value={giftMessage}
                    onChange={(event) => setGiftMessage(event.target.value)}
                  />
                  <div className="flex justify-between mt-2 items-center">
                    <span className="text-[10px] text-[#974e60] dark:text-gray-400 italic">{t("*프리미엄 카드에 인쇄됩니다", "*Printed on a premium card")}</span>
                    <span className="text-[10px] text-[#974e60] dark:text-gray-400 font-mono">{giftMessage.length}/140</span>
                  </div>
                </div>
              </details>
            </div>
          </div>

          <div className="flex-none bg-white dark:bg-[#2d1b20] border-t border-[#f3e7ea] dark:border-[#4a3b3e] px-6 py-6 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] z-20">
            <div className="space-y-3 mb-5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#974e60] dark:text-gray-400">{resolveText(CONTENT_COPY.cartSubtotal, locale)}</span>
                <span className="font-bold text-[#1b0e11] dark:text-white text-base">{currency(checkoutAmount)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#974e60] dark:text-gray-400">{resolveText(CONTENT_COPY.cartShipping, locale)}</span>
                <span
                  className={
                    cartShipping === 0
                      ? "text-green-600 font-medium text-xs bg-green-50 px-2 py-0.5 rounded-full"
                      : "text-[#1b0e11] dark:text-white font-medium text-sm"
                  }
                >
                  {cartShipping === 0 ? t("무료", "Free") : currency(cartShipping)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/checkout"
                className="w-full bg-[#e6194c] hover:bg-[#c91542] text-white py-4 rounded-md font-bold text-sm tracking-widest uppercase transition-all duration-300 transform active:scale-[0.99] flex items-center justify-between px-6 shadow-lg shadow-[#e6194c]/20 hover:shadow-[#e6194c]/40 group"
              >
                <span className="group-hover:translate-x-1 transition-transform">{resolveText(BRAND_LABELS.ctaCheckout, locale)}</span>
                <span className="flex items-center gap-2">
                  <span className="w-px h-4 bg-white/30 mx-1" />
                  {currency(checkoutAmount)}
                </span>
              </Link>

              <div className="flex justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="h-5 w-8 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-8 bg-gray-200 rounded animate-pulse delay-75" />
                <div className="h-5 w-8 bg-gray-200 rounded animate-pulse delay-150" />
              </div>

              <p className="text-center text-[10px] text-[#974e60] dark:text-gray-400 mt-2 flex items-center justify-center gap-1.5 uppercase tracking-wide font-medium">
                <span className="material-symbols-outlined text-[12px]">lock</span>
                {t("보안 결제 적용", "Secure Checkout")}
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

