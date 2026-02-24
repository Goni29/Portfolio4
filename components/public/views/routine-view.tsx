"use client";

import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";

type SkinFeel = "tight" | "oily" | "combination" | "balanced";

const ROUTINE_OPTIONS: Array<{
  value: SkinFeel;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  icon: string;
}> = [
  {
    value: "tight",
    title: { ko: "당김·건조", en: "Tight & Dry" },
    description: {
      ko: "세안 후 얼굴이 당기고 수분감이 부족해 각질이 쉽게 올라옵니다.",
      en: "My face feels stretched and lacks moisture, sometimes flaky.",
    },
    icon: "water_drop",
  },
  {
    value: "oily",
    title: { ko: "번들·유분", en: "Oily & Shiny" },
    description: {
      ko: "이마와 코 중심으로 유분이 빠르게 올라오고 번들거림이 느껴집니다.",
      en: "Visible shine across the forehead and nose, feels slick to touch.",
    },
    icon: "wb_sunny",
  },
  {
    value: "combination",
    title: { ko: "복합성", en: "Combination" },
    description: {
      ko: "T존은 번들거리지만 볼은 건조하거나 편안한 상태가 공존합니다.",
      en: "Oily T-zone (forehead, nose) but dry or normal cheeks.",
    },
    icon: "contrast",
  },
  {
    value: "balanced",
    title: { ko: "밸런스", en: "Balanced" },
    description: {
      ko: "과한 유분이나 건조함 없이 전반적으로 안정적인 피부 컨디션입니다.",
      en: "Comfortable, neither too oily nor too dry. Smooth texture.",
    },
    icon: "spa",
  },
];

export function RoutineView() {
  const { locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [selection, setSelection] = useState<SkinFeel>("balanced");

  return (
    <main className="flex-grow flex flex-col lg:flex-row h-full">
      <aside className="w-full lg:w-4/12 bg-[#fdf2f4] dark:bg-[#7d112b]/20 p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden order-1">
        <div className="absolute inset-0 z-0 opacity-80">
          <img
            className="w-full h-full object-cover"
            alt={t("부드러운 핑크 톤의 크리미한 스킨케어 텍스처", "Soft pink gradient texture of creamy skincare product")}
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWjizcIIrNlf_Eleb78vRk7VL_IXlDXVv_34QgunPjWfr2thAleOJ9Ql0whFTuii2PupU2vjxwdU42CAnvh1alANwer8zUZEg_N8s637hf7dGYC8I1V3XideXTJuoVrmKcFVw42hwvoiu4YW0g1u0bP8HwxpwVhJUt0dr9XroAhZ7FxFqVwFrdFXg_ieSqdKgp6bPEotTWQ_T9lx9-U5zGU-whFoUJAwXA-Hdeh23AlHf_EIJW2_iJe2P6Tb6RTha-zx17CKdfp0c"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#fdf2f4]/90 to-transparent dark:from-[#211115]/90" />
        </div>

        <div className="relative z-10 pt-4">
          <div className="flex flex-wrap gap-2 mb-8 text-xs font-semibold tracking-wider uppercase">
            <Link className="text-[#d11140] hover:text-[#930e2e] transition-colors" href="/">
              {t("홈", "Home")}
            </Link>
            <span className="text-[#f2aab9]">/</span>
            <span className="text-[#7d112b]">{t("루틴 진단", "Routine")}</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-[#440513] dark:text-[#fdf2f4] tracking-tight leading-[1.1] mb-6">
            {t("당신의 피부 리듬을 정밀하게 분석해 드립니다.", "Let's decode your skin needs.")}
          </h1>
          <p className="text-[#b00c32] dark:text-[#f8d0da] text-lg leading-relaxed max-w-md">
            {t(
              "약 2분이면 충분합니다. 피부 타입과 생활 리듬을 분석해 맞춤형 프리미엄 루틴을 제안합니다.",
              "Discover your bespoke regimen in 2 minutes. We analyze your skin type, environment, and lifestyle to curate the perfect Portfolio.",
            )}
          </p>
        </div>

        <div className="relative z-10 mt-12 bg-white/70 dark:bg-black/40 backdrop-blur-md rounded-2xl p-6 border border-white/50 dark:border-white/10 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-[#d11140] rounded-full text-white shadow-md shadow-[#e6194c]/20 shrink-0">
              <span className="material-symbols-outlined text-xl">verified_user</span>
            </div>
            <div>
              <h4 className="font-bold text-[#7d112b] dark:text-white mb-1">{t("피부 전문가 검증", "Dermatologist Verified")}</h4>
              <p className="text-sm text-[#b00c32] dark:text-[#f2aab9] leading-snug">
                {t(
                  "임상적 정밀성을 위해 피부 전문가와 함께 설계한 루틴 추천 알고리즘입니다.",
                  "Our algorithm is developed with leading skin experts to ensure clinical precision.",
                )}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <section className="w-full lg:w-8/12 bg-[#fcf8f9] dark:bg-[#211115] flex flex-col items-center justify-center p-6 md:p-16 lg:p-24 order-2 relative">
        <div className="w-full max-w-3xl">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-[#ea7790] dark:text-[#e6194c] text-xs font-bold uppercase tracking-widest mb-1 block">
                {t("질문 1 / 5", "Question 1 of 5")}
              </span>
              <h2 className="text-[#440513] dark:text-white font-bold text-xl">{t("피부 타입 분석", "Skin Type Analysis")}</h2>
            </div>
            <span className="text-[#440513] dark:text-white font-bold text-xl">20%</span>
          </div>

          <div className="w-full bg-[#fce7ec] dark:bg-[#7d112b] rounded-full h-1.5 mb-16 overflow-hidden">
            <div
              className="bg-[#d11140] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(230,25,76,0.5)]"
              style={{ width: "20%" }}
            />
          </div>

          <div className="mb-12 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-[#440513] dark:text-white mb-4 leading-tight">
              {t("아침에 피부가 가장 먼저 어떻게 느껴지나요?", "How does your skin feel in the morning?")}
            </h2>
            <p className="text-lg text-[#d11140] dark:text-[#f2aab9]">
              {t("아무 제품도 바르기 전, 현재 피부 상태와 가장 가까운 항목을 선택해 주세요.", "Select the option that best describes your skin before applying any products.")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {ROUTINE_OPTIONS.map((option) => (
              <label key={option.value} className="group relative cursor-pointer">
                <input
                  className="peer sr-only"
                  name="skin_feel"
                  type="radio"
                  value={option.value}
                  checked={selection === option.value}
                  onChange={() => setSelection(option.value)}
                />
                <div className="p-6 rounded-2xl border border-[#f8d0da] dark:border-[#930e2e] bg-white dark:bg-[#7d112b]/10 hover:border-[#ea7790] dark:hover:border-[#d11140] hover:shadow-md peer-checked:border-[#d11140] peer-checked:ring-1 peer-checked:ring-[#d11140] peer-checked:bg-[#fdf2f4]/50 dark:peer-checked:bg-[#7d112b]/30 transition-all duration-200 h-full flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="size-12 rounded-xl bg-[#fdf2f4] dark:bg-[#930e2e]/50 flex items-center justify-center text-[#d11140] dark:text-[#f2aab9] group-hover:bg-[#fce7ec] dark:group-hover:bg-[#930e2e] transition-colors">
                      <span className="material-symbols-outlined text-[28px]">{option.icon}</span>
                    </div>
                    <div className="size-6 rounded-full border-2 border-[#f8d0da] dark:border-[#b00c32] flex items-center justify-center peer-checked:border-[#d11140] peer-checked:bg-[#d11140] transition-all">
                      <span className="material-symbols-outlined text-white text-[16px] opacity-0 peer-checked:opacity-100">
                        check
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-[#440513] dark:text-[#fdf2f4] mb-1">{option.title[locale]}</h3>
                    <p className="text-sm text-[#d11140] dark:text-[#ea7790] leading-relaxed">{option.description[locale]}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-[#fce7ec] dark:border-[#930e2e]">
            <button className="group flex items-center gap-2 text-[#e6194c] font-semibold hover:text-[#b00c32] dark:hover:text-[#f2aab9] transition-colors px-4 py-2 rounded-lg">
              <span className="material-symbols-outlined text-lg group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              {t("이전", "Back")}
            </button>
            <button className="flex items-center gap-3 bg-[#d11140] hover:bg-[#b00c32] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-[#d11140]/30 transition-all transform hover:-translate-y-0.5 hover:shadow-xl">
              {t("다음 단계", "Next Step")}
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          </div>

          <div className="mt-8 flex items-start gap-3 p-4 bg-[#fdf2f4] dark:bg-[#7d112b]/20 rounded-lg border border-[#fce7ec] dark:border-[#930e2e]">
            <span className="material-symbols-outlined text-[#e6194c] mt-0.5">lightbulb</span>
            <p className="text-sm text-[#b00c32] dark:text-[#f2aab9]">
              <strong>{t("전문가 팁:", "Pro Tip:")}</strong>{" "}
              {t(
                "피부 타입은 계절과 생활 패턴에 따라 달라질 수 있습니다. 최적의 결과를 위해 3개월마다 다시 진단해 보세요.",
                "Your skin type can change with seasons. We recommend retaking this test every 3 months for optimal results.",
              )}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
