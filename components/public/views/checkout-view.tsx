"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { EmptyState } from "@/components/public/shared/ui";
import { BRAND_LABELS, CONTENT_COPY, resolveText } from "@/lib/i18n";
import { withLocalePath } from "@/lib/locale-routing";
import type { Address, Locale } from "@/lib/types";
import { currency, uid } from "@/lib/utils";

const ADDRESS_LABEL_KO_MAP: Record<string, string> = {
  home: "집",
  office: "오피스",
  work: "직장",
  default: "기본 배송지",
};

function localizeAddressLabel(label: string, locale: Locale): string {
  if (locale !== "ko") {
    return label;
  }
  const normalized = label.trim().toLowerCase();
  return ADDRESS_LABEL_KO_MAP[normalized] ?? label;
}

const parseRecipient = (recipient?: string): { firstName: string; lastName: string } => {
  if (!recipient) {
    return { firstName: "", lastName: "" };
  }

  const parts = recipient.split(" ").filter(Boolean);
  if (parts.length <= 1) {
    return { firstName: parts[0] ?? "", lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
};

export function CheckoutView() {
  const router = useRouter();
  const {
    currentUser,
    cartLines,
    cartSubtotal,
    cartDiscount,
    cartTotal,
    createOrder,
    db,
    cartCoupon,
    applyCoupon,
    clearCoupon,
    locale,
  } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const localize = (path: string) => withLocalePath(path, locale);

  const defaultAddress = currentUser?.addresses.find((address) => address.isDefault) ?? currentUser?.addresses[0];
  const nameParts = parseRecipient(defaultAddress?.recipient);

  const [contactEmail, setContactEmail] = useState(currentUser?.email ?? "");
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [couponInput, setCouponInput] = useState(cartCoupon?.code ?? "");
  const [couponMessage, setCouponMessage] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: nameParts.firstName,
    lastName: nameParts.lastName,
    address: defaultAddress?.line1 ?? "",
    apartment: defaultAddress?.line2 ?? "",
    city: defaultAddress?.city ?? "",
    country: defaultAddress?.country || "United States",
    state: defaultAddress?.state ?? "",
    postalCode: defaultAddress?.zip ?? "",
    phone: defaultAddress?.phone ?? "",
  });

  if (cartLines.length === 0) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-14">
        <EmptyState
          title={resolveText(CONTENT_COPY.checkoutEmptyTitle, locale)}
          body={resolveText(CONTENT_COPY.checkoutEmptyBody, locale)}
          ctaHref={localize("/shop")}
          ctaLabel={resolveText(BRAND_LABELS.navShop, locale)}
        />
      </section>
    );
  }

  if (!currentUser) {
    return (
      <section className="px-4 sm:px-6 lg:px-8 py-14">
        <EmptyState
          title={resolveText(CONTENT_COPY.checkoutSigninTitle, locale)}
          body={resolveText(CONTENT_COPY.checkoutSigninBody, locale)}
          ctaHref={localize("/account/login")}
          ctaLabel={resolveText(BRAND_LABELS.navLogin, locale)}
        />
      </section>
    );
  }

  const estimatedTax = Math.round(Math.max(0, cartSubtotal - cartDiscount) * db.settings.taxRate * 100) / 100;
  const totalPreview = Math.max(0, cartTotal + estimatedTax);

  const createAddressPayload = (): Address => {
    const recipient = `${form.firstName} ${form.lastName}`.trim();

    return {
      id: defaultAddress?.id ?? uid("addr"),
      label: defaultAddress?.label
        ? localizeAddressLabel(defaultAddress.label, locale)
        : t("\uC9D1", "Home"),
      recipient,
      phone: form.phone,
      line1: form.address,
      line2: form.apartment,
      city: form.city,
      state: form.state,
      zip: form.postalCode,
      country: form.country,
      isDefault: defaultAddress?.isDefault ?? currentUser.addresses.length === 0,
    };
  };

  return (
    <main className="flex-grow">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 xl:gap-x-16">
          <div className="lg:col-span-7">
            <nav className="mb-8 flex items-center text-sm font-medium">
              <span className="text-[#e6194c]">{t("\uBC30\uC1A1", "Shipping")}</span>
              <span className="mx-3 text-[#974e60]/50 material-symbols-outlined text-base">chevron_right</span>
              <span className="text-[#974e60]">{t("\uACB0\uC81C", "Payment")}</span>
              <span className="mx-3 text-[#974e60]/50 material-symbols-outlined text-base">chevron_right</span>
              <span className="text-[#974e60]">{t("\uD655\uC778", "Review")}</span>
            </nav>

            <form
              className="space-y-10"
              onSubmit={(event) => {
                event.preventDefault();
                setIsSubmitting(true);
                setMessage("");

                const required = [
                  contactEmail,
                  form.firstName,
                  form.lastName,
                  form.address,
                  form.city,
                  form.state,
                  form.postalCode,
                  form.phone,
                ];

                if (required.some((value) => value.trim() === "")) {
                  setMessage(resolveText(CONTENT_COPY.checkoutIncomplete, locale));
                  setIsSubmitting(false);
                  return;
                }

                const order = createOrder({
                  address: createAddressPayload(),
                  couponCode: cartCoupon?.code,
                });

                if (!order) {
                  setMessage(resolveText(CONTENT_COPY.checkoutCreateOrderFailed, locale));
                  setIsSubmitting(false);
                  return;
                }

                router.push(`${localize("/checkout/complete")}?orderId=${order.id}`);
              }}
            >
              <section className="mb-10">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-[#1b0e11]">{t("연락처", "Contact Information")}</h2>
                  <div className="text-sm">
                    <span className="text-[#974e60]">{t("\uC774\uBBF8 \uACC4\uC815\uC774 \uC788\uC73C\uC2E0\uAC00\uC694?", "Already have an account?")}</span>
                    <Link className="ml-1 font-semibold text-[#e6194c] hover:text-[#b8143d]" href={localize("/account/login")}>
                      {t("\uB85C\uADF8\uC778", "Log in")}
                    </Link>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="email">
                      {t("\uC774\uBA54\uC77C \uC8FC\uC18C", "Email address")}
                    </label>
                    <input
                      id="email"
                      type="email"
                      className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                      placeholder={t("\uC774\uBA54\uC77C \uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694", "you@example.com")}
                      value={contactEmail}
                      onChange={(event) => setContactEmail(event.target.value)}
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="newsletter"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#e6194c] focus:ring-[#e6194c]"
                      checked={newsletterOptIn}
                      onChange={(event) => setNewsletterOptIn(event.target.checked)}
                    />
                    <label className="ml-2 block text-sm text-[#974e60]" htmlFor="newsletter">
                      {t("신제품 소식과 멤버 혜택 받기", "Email me with news and offers")}
                    </label>
                  </div>
                </div>
              </section>

              <section className="mb-10 border-t border-[#f0e4e6] pt-10">
                <h2 className="mb-6 text-xl font-bold text-[#1b0e11]">{t("\uBC30\uC1A1 \uC8FC\uC18C", "Shipping Address")}</h2>

                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="first-name">
                      {t("\uC774\uB984", "First name")}
                    </label>
                    <input
                      id="first-name"
                      type="text"
                      className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                      placeholder={t("\uAE38\uB3D9", "Jane")}
                      value={form.firstName}
                      onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="last-name">
                      {t("\uC131", "Last name")}
                    </label>
                    <input
                      id="last-name"
                      type="text"
                      className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                      placeholder={t("\uD64D", "Doe")}
                      value={form.lastName}
                      onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="address">
                      {t("\uC8FC\uC18C", "Address")}
                    </label>
                    <div className="relative">
                      <input
                        id="address"
                        type="text"
                        className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 pr-10 text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                        placeholder={t("\uC8FC\uC18C\uB97C \uC785\uB825\uD574\uC8FC\uC138\uC694", "123 Portfolio Lane")}
                        value={form.address}
                        onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#974e60]">
                        <span className="material-symbols-outlined text-lg">home</span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="apartment">
                      {t("상세 주소(선택)", "Apartment, suite, etc. (optional)")}
                    </label>
                    <input
                      id="apartment"
                      type="text"
                      className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                      value={form.apartment}
                      onChange={(event) => setForm((prev) => ({ ...prev, apartment: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="city">
                      {t("\uC2DC/\uAD70/\uAD6C", "City")}
                    </label>
                    <input
                      id="city"
                      type="text"
                      className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                      placeholder={t("\uC11C\uC6B8", "New York")}
                      value={form.city}
                      onChange={(event) => setForm((prev) => ({ ...prev, city: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="country">
                      {t("\uAD6D\uAC00/\uC9C0\uC5ED", "Country/Region")}
                    </label>
                    <select
                      id="country"
                      className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 text-[#1b0e11] focus:border-[#e6194c] focus:ring-[#e6194c]"
                      value={form.country}
                      onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
                    >
                      <option value="United States">{t("\uBBF8\uAD6D", "United States")}</option>
                      <option value="Canada">{t("\uCE90\uB098\uB2E4", "Canada")}</option>
                      <option value="United Kingdom">{t("\uC601\uAD6D", "United Kingdom")}</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="state">
                      {t("\uC2DC/\uB3C4", "State / Province")}
                    </label>
                    <input
                      id="state"
                      type="text"
                      className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                      placeholder={t("\uAC15\uB0A8\uAD6C", "NY")}
                      value={form.state}
                      onChange={(event) => setForm((prev) => ({ ...prev, state: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="postal-code">
                      {t("\uC6B0\uD3B8\uBC88\uD638", "Postal code")}
                    </label>
                    <input
                      id="postal-code"
                      type="text"
                      className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                      placeholder="10001"
                      value={form.postalCode}
                      onChange={(event) => setForm((prev) => ({ ...prev, postalCode: event.target.value }))}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-[#1b0e11]" htmlFor="phone">
                      {t("\uC5F0\uB77D\uCC98", "Phone")}
                    </label>
                    <div className="relative">
                      <input
                        id="phone"
                        type="tel"
                        className="block w-full rounded-lg border-[#f0e4e6] bg-white px-4 py-3 pr-10 text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                        placeholder={t("010-1234-5678", "(555) 123-4567")}
                        value={form.phone}
                        onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#974e60]">
                        <span className="material-symbols-outlined text-lg">call</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-10 border-t border-[#f0e4e6] pt-10 opacity-60 pointer-events-none select-none grayscale">
                <h2 className="mb-6 text-xl font-bold text-[#1b0e11] flex justify-between">
                  {t("\uACB0\uC81C", "Payment")}
                  <span className="material-symbols-outlined text-[#974e60]">lock</span>
                </h2>
                <div className="rounded-lg border border-[#f0e4e6] bg-white p-6 text-center">
                  <p className="text-[#974e60]">{t("배송 정보를 입력하면 결제 수단이 활성화됩니다.", "Enter your shipping address to view payment options.")}</p>
                </div>
              </section>

              <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between pt-4">
                <Link href={localize("/cart")} className="flex items-center justify-center gap-2 text-sm font-medium text-[#1b0e11] hover:text-[#e6194c]">
                  <span className="material-symbols-outlined text-lg">arrow_back</span>
                  {t("쇼핑백으로 돌아가기", "Return to Bag")}
                </Link>

                <button
                  type="submit"
                  className="flex items-center justify-center rounded-full bg-[#e6194c] px-8 py-4 text-base font-bold text-white shadow-lg shadow-[#e6194c]/30 transition-all hover:bg-[#b8143d] hover:shadow-[#e6194c]/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {t("결제 단계로 이동", "Continue to Payment")}
                </button>
              </div>

              {message && <p className="text-sm text-[#974e60]">{message}</p>}
            </form>
          </div>

          <div className="mt-12 lg:col-span-5 lg:mt-0">
            <div className="sticky top-[var(--public-sticky-offset)] rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#f0e4e6] lg:p-8">
              <h2 className="mb-6 text-lg font-bold text-[#1b0e11]">{t("\uC8FC\uBB38 \uC694\uC57D", "Order Summary")}</h2>

              <ul className="divide-y divide-[#f0e4e6]" role="list">
                {cartLines.map((line) => (
                  <li key={line.product.slug} className="flex py-6">
                    <div className="relative h-20 w-20 flex-shrink-0">
                      <div className="h-full w-full overflow-hidden rounded-md border border-[#f0e4e6]">
                        <img
                          alt={resolveText(line.product.name, locale)}
                          className="h-full w-full object-cover object-center"
                          src={line.product.images[0]}
                        />
                      </div>
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#e6194c] text-xs font-bold text-white shadow-sm ring-2 ring-white">
                        {line.item.quantity}
                      </span>
                    </div>
                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-[#1b0e11]">
                          <h3>{resolveText(line.product.name, locale)}</h3>
                          <p className="ml-4">{currency(line.lineTotal)}</p>
                        </div>
                        <p className="mt-1 text-sm text-[#974e60]">{resolveText(line.product.shortDescription, locale)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center space-x-2">
                <input
                  type="text"
                  className="block w-full rounded-lg border-[#f0e4e6] bg-[#f8f6f6] px-4 py-3 text-sm text-[#1b0e11] placeholder-[#974e60]/50 focus:border-[#e6194c] focus:ring-[#e6194c]"
                  placeholder={t("프로모션 코드", "Discount code")}
                  value={couponInput}
                  onChange={(event) => setCouponInput(event.target.value)}
                />
                <button
                  type="button"
                  className="shrink-0 whitespace-nowrap rounded-lg bg-[#f0e4e6] px-4 py-3 text-sm font-semibold text-[#1b0e11] hover:bg-[#e8dadd]"
                  onClick={() => {
                    const result = applyCoupon(couponInput);
                    setCouponMessage(result.message);
                  }}
                >
                  {t("\uC801\uC6A9", "Apply")}
                </button>
              </div>

              {cartCoupon && (
                <button
                  type="button"
                  className="mt-3 h-10 w-full rounded-full border border-[#f0e4e6] text-sm"
                  onClick={() => {
                    clearCoupon();
                    setCouponMessage(t("\uD560\uC778 \uCF54\uB4DC\uAC00 \uC81C\uAC70\uB418\uC5C8\uC2B5\uB2C8\uB2E4.", "Coupon removed."));
                  }}
                >
                  {t("\uC81C\uAC70", "Remove")} {cartCoupon.code}
                </button>
              )}

              {couponMessage && <p className="mt-2 text-xs text-[#974e60]">{couponMessage}</p>}

              <div className="mt-6 space-y-4 border-t border-[#f0e4e6] pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#974e60]">{t("\uC0C1\uD488 \uAE08\uC561", "Subtotal")}</p>
                  <p className="text-sm font-medium text-[#1b0e11]">{currency(cartSubtotal)}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#974e60]">{t("\uBC30\uC1A1\uBE44", "Shipping")}</p>
                  <p className="text-sm font-medium text-[#1b0e11]">{t("다음 단계에서 계산", "Calculated next step")}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#974e60]">{t("\uC608\uC0C1 \uC138\uAE08", "Estimated Tax")}</p>
                  <p className="text-sm font-medium text-[#1b0e11]">{currency(estimatedTax)}</p>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#f0e4e6] pt-6">
                <p className="text-base font-medium text-[#1b0e11]">{t("\uCD1D \uACB0\uC81C\uAE08\uC561", "Total")}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-[#974e60]">{t("USD", "USD")}</span>
                  <span className="text-2xl font-bold text-[#1b0e11]">{currency(totalPreview)}</span>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-4 opacity-50 grayscale transition-all hover:grayscale-0">
                <span className="material-symbols-outlined text-3xl">credit_card</span>
                <span className="material-symbols-outlined text-3xl">account_balance</span>
                <span className="material-symbols-outlined text-3xl">payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

