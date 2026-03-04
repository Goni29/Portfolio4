"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PublicSiteFooterProps {
  locale: "ko" | "en";
  localize: (path: string) => string;
  className?: string;
}

export function PublicSiteFooter({ locale, localize, className }: PublicSiteFooterProps) {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  return (
    <footer className={cn("bg-stone-100 border-t border-stone-200 mt-auto", className)}>
      <div className="px-6 lg:px-12 py-16">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          <div className="w-full md:w-1/3 space-y-6">
            <Image
              src="/logo_header.png"
              alt="Portfolio logo"
              width={520}
              height={214}
              className="h-16 sm:h-20 w-auto object-contain"
            />
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
              {locale === "ko"
                ? "정제된 효능과 감각적 사용감을 갖춘 스킨케어 루틴을 제안합니다."
                : "Elevate your daily ritual with precision skincare engineered for visible performance."}
            </p>
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
                {locale === "ko" ? "컬렉션" : "Collections"}
              </h3>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/collections/ritual-essentials")}>{locale === "ko" ? "리추얼 에센셜" : "Ritual Essentials"}</Link></li>
                <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/collections/night-repair")}>{locale === "ko" ? "나이트 리페어" : "Night Repair"}</Link></li>
                <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/collections/daily-defense")}>{locale === "ko" ? "데일리 디펜스" : "Daily Defense"}</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
                {locale === "ko" ? "브랜드" : "Company"}
              </h3>
              <ul className="space-y-3 text-sm text-slate-500">
                <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/about")}>{locale === "ko" ? "브랜드 철학" : "Brand Philosophy"}</Link></li>
                <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/journal")}>{locale === "ko" ? "저널" : "Journal"}</Link></li>
                <li><Link className="hover:text-[#e6194c] transition-colors" href={localize("/contact")}>{locale === "ko" ? "고객문의" : "Contact Us"}</Link></li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-6">
                {locale === "ko" ? "뉴스레터" : "Newsletter"}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {locale === "ko"
                  ? "신제품 소식, 리추얼 인사이트, 멤버 전용 혜택을 가장 먼저 받아보세요."
                  : "Receive product launches, ritual insights, and member-only offers first."}
              </p>
              <form
                className="flex flex-col gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (!newsletterEmail.trim()) {
                    return;
                  }
                  setNewsletterSubscribed(true);
                  setNewsletterEmail("");
                }}
              >
                <input
                  className="w-full bg-white border-none rounded-sm px-4 py-3 text-sm shadow-sm focus:ring-1 focus:ring-[#e6194c] placeholder:text-slate-400"
                  placeholder={locale === "ko" ? "이메일 주소를 입력해 주세요" : "Enter your email"}
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => {
                    setNewsletterEmail(event.target.value);
                    if (newsletterSubscribed) {
                      setNewsletterSubscribed(false);
                    }
                  }}
                />
                <button
                  className="w-full bg-[#e6194c] text-white px-4 py-3 rounded-sm text-sm font-bold uppercase tracking-wider hover:bg-[#cb1743] transition-colors"
                  type="submit"
                >
                  {locale === "ko" ? "구독하기" : "Subscribe"}
                </button>
                <p className="text-[11px] text-slate-400">
                  {newsletterSubscribed
                    ? locale === "ko"
                      ? "구독이 완료되었습니다."
                      : "Thanks for subscribing."
                    : locale === "ko"
                      ? "구독 시 개인정보 처리방침에 동의한 것으로 간주됩니다."
                      : "By subscribing, you agree to our Privacy Policy."}
                </p>
              </form>
            </div>
          </div>
        </div>

        <div className="border-t border-stone-200 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>Copyright 2026 Portfolio Beauty. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="hover:text-[#e6194c] transition-colors" href="#">
              {locale === "ko" ? "개인정보 처리방침" : "Privacy Policy"}
            </a>
            <a className="hover:text-[#e6194c] transition-colors" href="#">
              {locale === "ko" ? "이용약관" : "Terms of Service"}
            </a>
            <a className="hover:text-[#e6194c] transition-colors" href="#">
              {locale === "ko" ? "배송 정책" : "Shipping Policy"}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
