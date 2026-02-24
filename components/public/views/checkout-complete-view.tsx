"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useStore } from "@/components/providers/store-provider";
import { EmptyState } from "@/components/public/shared/ui";
import { CONTENT_COPY, resolveText } from "@/lib/i18n";
import { getProductPriceBySize, getProductSizeLabel, hasMultipleProductSizes } from "@/lib/product-pricing";
import { currency, formatDate } from "@/lib/utils";

export function CheckoutCompleteView() {
  const searchParams = useSearchParams();
  const { db, currentUser, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const orderStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      processing: "처리 중",
      shipped: "배송 중",
      delivered: "배송 완료",
      cancelled: "주문 취소",
      pending: "준비 중",
    };
    return locale === "ko" ? map[status] ?? status : status.toUpperCase();
  };
  const paymentStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      paid: "결제 완료",
      pending: "결제 대기",
      refunded: "환불 완료",
      failed: "결제 실패",
    };
    return locale === "ko" ? map[status] ?? status : status.toUpperCase();
  };
  const countryLabel = (value: string) => {
    if (locale !== "ko") return value;
    const normalized = value.trim().toLowerCase();
    if (normalized === "us" || normalized === "united states") return "미국";
    if (normalized === "ca" || normalized === "canada") return "캐나다";
    if (normalized === "uk" || normalized === "united kingdom") return "영국";
    return value;
  };
  const orderId = searchParams.get("orderId");

  const order = useMemo(() => {
    if (!orderId) {
      return null;
    }

    return db.orders.find((entry) => entry.id === orderId) ?? null;
  }, [db.orders, orderId]);

  if (!order || !currentUser || order.userId !== currentUser.id) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <EmptyState
          title={resolveText(CONTENT_COPY.checkoutOrderNotFoundTitle, locale)}
          body={resolveText(CONTENT_COPY.checkoutOrderNotFoundBody, locale)}
          ctaHref="/account/orders"
          ctaLabel={resolveText(CONTENT_COPY.checkoutViewOrders, locale)}
        />
      </section>
    );
  }

  const orderLines = order.items
    .map((item) => {
      const product = db.products.find((entry) => entry.slug === item.productSlug);
      if (!product) {
        return null;
      }

      return {
        item,
        product,
        unitPrice: getProductPriceBySize(product, item.sizeKey),
      };
    })
    .filter(
      (
        line,
      ): line is {
        item: (typeof order.items)[number];
        product: (typeof db.products)[number];
        unitPrice: number;
      } => Boolean(line),
    );

  const firstName = currentUser.name.split(" ")[0] ?? currentUser.name;
  const taxable = Math.max(0, order.subtotal - order.discount);
  const tax = Math.round(taxable * db.settings.taxRate * 100) / 100;
  const shipping = Math.max(0, Math.round((order.total - taxable - tax) * 100) / 100);

  return (
    <main className="flex-grow">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="mb-8 relative">
            <div className="absolute -inset-4 bg-[#e6194c]/5 rounded-full blur-xl" />
            <div className="relative size-24 rounded-full bg-[#e6194c]/10 flex items-center justify-center mb-6 ring-1 ring-[#e6194c]/20">
              <span className="material-symbols-outlined text-[#e6194c] !text-[48px]">check_circle</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-[#1b0e11] sm:text-5xl mb-4">
            {t("주문이 접수되었습니다", "Order Confirmed")}
          </h1>
          <p className="max-w-xl text-lg text-[#974e60] mb-8">
            {t(
              `${firstName}님, 주문해 주셔서 감사합니다. 주문이 정상 접수되었으며, 확인 메일을 ${currentUser.email}(으)로 발송했습니다.`,
              `Thank you, ${firstName}. Your order has been received and a confirmation email was sent to ${currentUser.email}.`,
            )}
          </p>

          <Link
            href="/shop"
            className="inline-flex items-center justify-center rounded-full bg-[#e6194c] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#e6194c]/25 transition-all hover:bg-[#e6194c]/90 hover:shadow-[#e6194c]/40"
          >
            {t("스토어 계속보기", "Continue Shopping")}
          </Link>
        </div>

        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-10">
            <div className="border-b border-[#f3e7ea] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[#1b0e11]">{t("\uC8FC\uBB38 \uC0C1\uC138", "Order Details")}</h2>
                <p className="mt-1 text-sm text-[#974e60]">
                {t(`주문 #${order.id} · ${formatDate(order.createdAt, locale)} 접수`, `Order #${order.id} · Placed on ${formatDate(order.createdAt, locale)}`)}
                </p>
              </div>
              <button
                type="button"
                className="text-sm font-medium text-[#e6194c] hover:text-[#e6194c]/80 underline decoration-[#e6194c]/30 underline-offset-4"
                onClick={() => window.print()}
              >
                {t("영수증 인쇄", "Print Invoice")}
              </button>
            </div>

            <div className="rounded-2xl border border-[#f3e7ea] bg-white overflow-hidden shadow-sm">
              <ul className="divide-y divide-[#f3e7ea]" role="list">
                {orderLines.map((line) => (
                  <li key={`${line.product.id}:${line.item.sizeKey ?? "default"}`} className="flex flex-col sm:flex-row p-6 gap-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-[#f3e7ea]">
                      <img
                        alt={typeof line.product.name === "string" ? line.product.name : line.product.name[locale]}
                        className="h-full w-full object-cover object-center"
                        src={line.product.images[0]}
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium text-[#1b0e11]">
                            {typeof line.product.name === "string" ? line.product.name : line.product.name[locale]}
                          </h3>
                          <p className="mt-1 text-sm text-[#974e60]">
                            {typeof line.product.shortDescription === "string"
                              ? line.product.shortDescription
                              : line.product.shortDescription[locale]}
                          </p>
                        </div>
                        <p className="text-lg font-medium text-[#1b0e11]">{currency(line.unitPrice * line.item.quantity)}</p>
                      </div>

                      <div className="mt-4 flex items-end justify-between sm:mt-0">
                        <div className="text-sm text-[#974e60]">
                          {hasMultipleProductSizes(line.product) && (
                            <p>
                              {t("용량", "Size")}: {getProductSizeLabel(line.product, locale, line.item.sizeKey)}
                            </p>
                          )}
                          <p>{t("\uC218\uB7C9", "Qty")}: {line.item.quantity}</p>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-6 border border-[#f3e7ea] shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-[#1b0e11]">
                  <span className="material-symbols-outlined text-[#e6194c]">local_shipping</span>
                  <h3 className="font-bold text-lg">{t("배송 정보", "Shipping Address")}</h3>
                </div>

                <address className="not-italic text-sm text-[#974e60] space-y-1">
                  <p className="font-medium text-[#1b0e11]">{order.shippingAddress.recipient}</p>
                  <p>{order.shippingAddress.line1}</p>
                  {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                  </p>
                  <p>{countryLabel(order.shippingAddress.country)}</p>
                  <p className="mt-2">{order.shippingAddress.phone}</p>
                </address>
              </div>

              <div className="rounded-2xl bg-white p-6 border border-[#f3e7ea] shadow-sm">
                <div className="flex items-center gap-3 mb-4 text-[#1b0e11]">
                  <span className="material-symbols-outlined text-[#e6194c]">credit_card</span>
                  <h3 className="font-bold text-lg">{t("결제 수단", "Payment Method")}</h3>
                </div>

                <div className="flex items-center gap-3 text-sm text-[#974e60]">
                  <div className="h-8 w-12 rounded bg-gray-100 flex items-center justify-center border border-gray-200">
                    <span className="font-bold text-[10px] text-blue-800">{locale === "ko" ? "비자" : "VISA"}</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1b0e11]">{t("비자 카드 (끝자리 4242)", "Visa ending in 4242")}</p>
                    <p>{paymentStatusLabel(order.paymentStatus)} / {orderStatusLabel(order.status)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl bg-white p-6 border border-[#f3e7ea] shadow-sm sticky top-[var(--public-sticky-offset)]">
              <h2 className="text-xl font-bold text-[#1b0e11] mb-6">{t("결제 요약", "Order Summary")}</h2>

              <dl className="space-y-4 text-sm text-[#974e60]">
                <div className="flex justify-between">
                  <dt>{t("\uC0C1\uD488 \uAE08\uC561", "Subtotal")}</dt>
                  <dd className="font-medium text-[#1b0e11]">{currency(order.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t("\uBC30\uC1A1\uBE44", "Shipping")}</dt>
                  <dd className="font-medium text-[#1b0e11]">{shipping === 0 ? t("\uBB34\uB8CC", "Free") : currency(shipping)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>{t("세금", "Tax")}</dt>
                  <dd className="font-medium text-[#1b0e11]">{currency(tax)}</dd>
                </div>
                <div className="border-t border-dashed border-[#f3e7ea] my-4 pt-4 flex justify-between items-center">
                  <dt className="text-base font-bold text-[#1b0e11]">{t("총 결제 금액", "Total")}</dt>
                  <dd className="text-xl font-bold text-[#e6194c]">{currency(order.total)}</dd>
                </div>
              </dl>

              <div className="mt-8 rounded-xl bg-[#fcf8f9] p-4 border border-[#f3e7ea]">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-[#e6194c]">loyalty</span>
                  <div>
                    <h4 className="text-sm font-bold text-[#1b0e11]">{t("Portfolio 멤버십", "Join The Portfolio Club")}</h4>
                    <p className="mt-1 text-xs text-[#974e60]">
                      {t("이번 주문 포인트를 적립하고 멤버 전용 혜택을 받아보세요.", "Earn points on this purchase and unlock member benefits.")}
                    </p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-lg border border-[#e6194c]/20 bg-white py-2 text-xs font-bold text-[#e6194c] hover:bg-[#e6194c]/5 transition-colors"
                    >
                      {t("무료로 가입하기", "Join for Free")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-[#f3e7ea] pt-10 text-center">
          <h3 className="text-lg font-bold text-[#1b0e11] mb-2">{t("도움이 필요하신가요?", "Need Help?")}</h3>
          <p className="text-[#974e60] text-sm mb-6">
            {t("주문 관련 문의가 있으시면 고객지원 팀으로 연락해 주세요.", "If you have any questions about your order, please contact our support team.")}
          </p>

          <div className="flex justify-center gap-6">
            <a className="inline-flex items-center gap-2 text-sm font-medium text-[#1b0e11] hover:text-[#e6194c] transition-colors" href="mailto:support@portfolio4.com">
              <span className="material-symbols-outlined text-[20px]">mail</span>
              support@portfolio4.com
            </a>
            <a className="inline-flex items-center gap-2 text-sm font-medium text-[#1b0e11] hover:text-[#e6194c] transition-colors" href="#">
              <span className="material-symbols-outlined text-[20px]">chat</span>
              {t("실시간 상담", "Live Chat")}
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
