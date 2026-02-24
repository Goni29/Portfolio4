"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { withLocalePath } from "@/lib/locale-routing";
import type { SupportInquiryTopic } from "@/lib/types";

const HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAq9ZPPQVHPV8WxlnkOFUpdpU0e7CoNfPEe_dTo-tcfsRNA1TqCo0Y0smvnq4TtQ4MHSRFnX6tCM_oMQS79er1crDbPpDbnbyBbb-Y45fYOTcSbUoBNXM2VzbCwGFnuRTbsRD3Z1UUO_tGj3Te7IOwdqLR1hXhyLXZRrNc-xJWSLDx6orjWX4sME0OlvT5FdF2Z8NNI79FPDjdGKii_mA1Xi1qJjif5adZbgq6HV2aL2lGYVkApwTVV4FcKuZBt_fGnwcsAAf-onX8I";

const FAQ_ITEMS = [
  {
    koQuestion: "배송은 얼마나 걸리나요?",
    enQuestion: "How long does shipping take?",
    koAnswer:
      "결제 완료 후 영업일 기준 2-3일 이내 출고됩니다. 제주 및 도서산간 지역은 1-2일 정도 추가 소요될 수 있습니다.",
    enAnswer:
      "Orders are dispatched within 2-3 business days after payment. Jeju and remote areas may require 1-2 extra days.",
  },
  {
    koQuestion: "교환 및 반품 규정은 어떻게 되나요?",
    enQuestion: "What is your exchange and return policy?",
    koAnswer:
      "상품 수령 후 7일 이내 미개봉 상태에서 교환 및 반품이 가능합니다. 단순 변심의 경우 왕복 배송비가 부과될 수 있습니다.",
    enAnswer:
      "Exchanges and returns are available within 7 days of delivery for unopened products. Return shipping may apply for non-defective requests.",
  },
  {
    koQuestion: "민감성 피부도 사용 가능한가요?",
    enQuestion: "Can sensitive skin use your products?",
    koAnswer:
      "대부분의 제품은 민감 피부를 고려해 설계되었지만 개인차가 있을 수 있습니다. 사용 전 패치 테스트를 권장드립니다.",
    enAnswer:
      "Most products are formulated with sensitive skin in mind, but responses vary by individual. We recommend a patch test before regular use.",
  },
] as const;

type ContactTopic = SupportInquiryTopic;

export function ContactView() {
  const { ready, locale, db, currentUser, createSupportInquiry } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);

  const [topic, setTopic] = useState<ContactTopic>("product");
  const [message, setMessage] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [submitted, setSubmitted] = useState(false);
  const name = currentUser?.name ?? "";
  const email = currentUser?.email ?? "";

  const loginHref = withLocalePath("/account/login", locale);
  const supportEmail = db.settings.supportEmail || "concierge@portfolio.com";
  const submitDisabled = !currentUser || !name.trim() || !email.trim() || !message.trim();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (submitDisabled) {
      return;
    }

    const createdId = createSupportInquiry({ topic, message });
    if (!createdId) {
      return;
    }

    setSubmitted(true);
    setMessage("");
    setTopic("product");
  };

  return (
    <>
      <section className="relative h-[52vh] md:h-[56vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          aria-label="Serene luxury skincare textures"
          style={{ backgroundImage: `url('${HERO_IMAGE}')`, backgroundPosition: "center 30%" }}
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 text-center px-4">
          <h1 className="text-white text-5xl md:text-7xl font-light mb-6 font-serif leading-tight">
            {t("무엇이 필요하신가요?", "How can we help you?")}
          </h1>
          <p className="text-white/90 text-lg md:text-xl font-light max-w-2xl mx-auto leading-relaxed">
            {t(
              "Portfolio 뷰티 컨시어지가 고객님의 루틴과 주문, 제품 문의를 도와드립니다.",
              "Our Portfolio beauty concierge is ready to assist with your ritual, order, and product journey.",
            )}
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-12 gap-20">
        <div className="lg:col-span-7">
          <h2 className="text-3xl font-bold mb-12 font-serif">{t("문의하기", "Contact Us")}</h2>

          {!ready ? (
            <div className="rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
              {t("로그인 상태를 확인 중입니다...", "Checking your session...")}
            </div>
          ) : !currentUser ? (
            <div className="rounded-xl border border-[#f1d9e1] bg-white p-8 space-y-4">
              <p className="text-lg font-medium text-[#1b0e11]">
                {t("문의하기는 로그인 후 이용할 수 있습니다.", "Please sign in to submit an inquiry.")}
              </p>
              <p className="text-sm text-slate-500">
                {t(
                  "로그인하면 계정 정보가 자동으로 입력되어 빠르게 문의할 수 있습니다.",
                  "After signing in, your account details will be prefilled automatically.",
                )}
              </p>
              <Link
                href={loginHref}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#dc1849] px-6 text-sm font-semibold text-white hover:bg-[#c51641] transition-colors"
              >
                {t("로그인하고 문의하기", "Sign In to Contact Us")}
              </Link>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={onSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-semibold text-slate-500" htmlFor="contact-name">
                    {t("성함", "Name")}
                  </label>
                  <input
                    id="contact-name"
                    className="w-full border-0 border-b border-slate-300 bg-slate-50/60 py-3 focus:ring-0 text-lg text-slate-600"
                    type="text"
                    value={name}
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-semibold text-slate-500" htmlFor="contact-email">
                    {t("이메일", "Email")}
                  </label>
                  <input
                    id="contact-email"
                    className="w-full border-0 border-b border-slate-300 bg-slate-50/60 py-3 focus:ring-0 text-lg text-slate-600"
                    type="email"
                    value={email}
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-slate-500" htmlFor="contact-topic">
                  {t("문의 주제", "Topic")}
                </label>
                <select
                  id="contact-topic"
                  className="w-full border-0 border-b border-slate-300 bg-transparent py-3 focus:ring-0 focus:border-[#dc1849] transition-colors text-lg appearance-none"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value as ContactTopic)}
                >
                  <option value="product">{t("제품 문의", "Product Inquiry")}</option>
                  <option value="shipping">{t("배송 및 주문", "Shipping & Orders")}</option>
                  <option value="membership">{t("멤버십 혜택", "Membership Benefits")}</option>
                  <option value="other">{t("기타 문의", "Other Inquiry")}</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-semibold text-slate-500" htmlFor="contact-message">
                  {t("메시지", "Message")}
                </label>
                <textarea
                  id="contact-message"
                  className="w-full border-0 border-b border-slate-300 bg-transparent py-3 focus:ring-0 focus:border-[#dc1849] transition-colors text-lg resize-none"
                  placeholder={t("문의 내용을 자유롭게 작성해주세요", "Share your request in detail")}
                  rows={4}
                  value={message}
                  onChange={(event) => {
                    setMessage(event.target.value);
                    if (submitted) {
                      setSubmitted(false);
                    }
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full md:w-auto px-12 py-4 bg-[#dc1849] text-white font-bold hover:bg-[#c51641] transition-all rounded-lg uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={submitDisabled}
              >
                {t("문의 보내기", "Send Inquiry")}
              </button>
              {submitted && (
                <p className="text-sm text-[#dc1849] font-medium">
                  {t("문의가 접수되었습니다. 확인 후 답변드리겠습니다.", "Your inquiry has been received. We will get back to you shortly.")}
                </p>
              )}
            </form>
          )}
        </div>

        <div className="lg:col-span-5 space-y-12">
          <div className="p-10 bg-white border border-slate-100 rounded-xl shadow-sm">
            <h3 className="text-2xl font-bold mb-8 font-serif">Brand Concierge</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#dc1849]">call</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">{t("고객센터", "Customer Center")}</p>
                  <p className="text-lg font-medium">1588-0000</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#dc1849]">mail</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">{t("이메일", "Email")}</p>
                  <a className="text-lg font-medium hover:text-[#dc1849] transition-colors" href={`mailto:${supportEmail}`}>
                    {supportEmail}
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-[#dc1849]">schedule</span>
                <div>
                  <p className="text-sm font-semibold text-slate-500 mb-1">{t("운영 시간", "Operating Hours")}</p>
                  <p className="text-lg font-medium">{t("평일 10:00 - 18:00", "Weekdays 10:00 - 18:00")}</p>
                  <p className="text-sm text-slate-400">{t("점심시간 12:00 - 13:00 (주말/공휴일 휴무)", "Break 12:00 - 13:00 (Closed on weekends/holidays)")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-12 text-center font-serif">{t("자주 묻는 질문", "Frequently Asked Questions")}</h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={faq.enQuestion} className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    className="w-full px-8 py-6 flex justify-between items-center text-left hover:bg-slate-50 transition-colors"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  >
                    <span className="font-medium">{t(faq.koQuestion, faq.enQuestion)}</span>
                    <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                      expand_more
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-8 pb-6 text-slate-600 text-sm leading-relaxed">
                      {t(faq.koAnswer, faq.enAnswer)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
