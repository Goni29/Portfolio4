"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { resolveText } from "@/lib/i18n";
import type { Concern, Product, ProductCategory, SkinType } from "@/lib/types";
import { cn, currency } from "@/lib/utils";

type SkinFeel = "tight" | "oily" | "combination" | "balanced";
type Reactivity = "calm" | "reactive" | "highlyReactive";
type RoutinePace = "minimal" | "balanced" | "layered";
type RoutineWindow = "am" | "pm" | "both";

interface RoutineAnswers {
  skinFeel: SkinFeel;
  reactivity: Reactivity;
  goal: Concern;
  pace: RoutinePace;
  window: RoutineWindow;
}

type RoutineQuestionKey = keyof RoutineAnswers;

interface RoutineOption {
  value: string;
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  icon: string;
}

interface RoutineQuestion {
  key: RoutineQuestionKey;
  stepLabel: { ko: string; en: string };
  title: { ko: string; en: string };
  description: { ko: string; en: string };
  options: RoutineOption[];
}

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

const REACTIVITY_OPTIONS: RoutineOption[] = [
  {
    value: "calm",
    title: { ko: "안정적", en: "Calm" },
    description: {
      ko: "새 제품을 사용해도 자극이나 붉은기 반응이 거의 없는 편입니다.",
      en: "My skin is usually stable with very little visible irritation.",
    },
    icon: "sentiment_satisfied",
  },
  {
    value: "reactive",
    title: { ko: "가끔 민감", en: "Occasionally Reactive" },
    description: {
      ko: "계절 변화나 컨디션에 따라 당김, 붉은기, 따가움이 가끔 나타납니다.",
      en: "Seasonal or stress changes can trigger occasional sensitivity.",
    },
    icon: "routine",
  },
  {
    value: "highlyReactive",
    title: { ko: "자주 민감", en: "Frequently Sensitive" },
    description: {
      ko: "새 포뮬러나 외부 환경에 자극 반응이 자주 나타나는 편입니다.",
      en: "My skin reacts quickly to new formulas and environmental stress.",
    },
    icon: "health_and_safety",
  },
];

const GOAL_OPTIONS: RoutineOption[] = [
  {
    value: "hydration",
    title: { ko: "수분 충전", en: "Hydration" },
    description: { ko: "당김 없이 오래 유지되는 촉촉함", en: "Long-lasting hydration and comfort." },
    icon: "water_full",
  },
  {
    value: "acne",
    title: { ko: "트러블 케어", en: "Breakouts" },
    description: { ko: "유분 밸런스와 트러블 흔적 관리", en: "Balance oil and support breakout-prone skin." },
    icon: "dermatology",
  },
  {
    value: "aging",
    title: { ko: "탄력/주름", en: "Firmness" },
    description: { ko: "탄력 저하, 잔주름 완화에 집중", en: "Improve firmness and smooth fine lines." },
    icon: "face_retouching_natural",
  },
  {
    value: "dullness",
    title: { ko: "톤/광채", en: "Glow" },
    description: { ko: "칙칙한 톤을 맑고 균일하게", en: "Boost radiance and even skin tone." },
    icon: "wb_iridescent",
  },
  {
    value: "redness",
    title: { ko: "진정", en: "Calming" },
    description: { ko: "붉은기와 자극 완화", en: "Reduce visible redness and discomfort." },
    icon: "mood",
  },
  {
    value: "texture",
    title: { ko: "결 개선", en: "Texture" },
    description: { ko: "거친 피부결을 매끈하게 정돈", en: "Refine uneven, rough texture." },
    icon: "blur_on",
  },
  {
    value: "pores",
    title: { ko: "모공", en: "Pores" },
    description: { ko: "모공과 피지 표현 완화", en: "Improve pore appearance and sebum control." },
    icon: "radio_button_checked",
  },
  {
    value: "puffiness",
    title: { ko: "붓기", en: "Depuffing" },
    description: { ko: "부기 완화와 윤곽 케어", en: "Reduce puffiness and refresh contours." },
    icon: "air",
  },
];

const PACE_OPTIONS: RoutineOption[] = [
  {
    value: "minimal",
    title: { ko: "3단계 미니멀", en: "3-Step Minimal" },
    description: { ko: "짧고 간결한 핵심 루틴", en: "Fast routine with only essential steps." },
    icon: "timer",
  },
  {
    value: "balanced",
    title: { ko: "4-5단계 밸런스", en: "Balanced" },
    description: { ko: "효능과 사용감을 함께 챙기는 기본 루틴", en: "Balanced routine for efficacy and comfort." },
    icon: "tune",
  },
  {
    value: "layered",
    title: { ko: "집중 레이어링", en: "Layered Ritual" },
    description: { ko: "카테고리를 넓혀 밀도 있게 관리", en: "More categories for a richer regimen." },
    icon: "layers",
  },
];

const WINDOW_OPTIONS: RoutineOption[] = [
  {
    value: "am",
    title: { ko: "아침 중심", en: "AM Focus" },
    description: { ko: "가벼운 사용감 + 자외선 방어 중심", en: "Daytime comfort and UV defense priority." },
    icon: "light_mode",
  },
  {
    value: "pm",
    title: { ko: "저녁 중심", en: "PM Focus" },
    description: { ko: "회복/진정/보습 중심의 야간 루틴", en: "Recovery-focused evening care." },
    icon: "dark_mode",
  },
  {
    value: "both",
    title: { ko: "아침+저녁", en: "AM + PM" },
    description: { ko: "낮과 밤을 분리한 풀 루틴", en: "Full cycle routine for day and night." },
    icon: "autorenew",
  },
];

const ROUTINE_QUESTIONS: RoutineQuestion[] = [
  {
    key: "skinFeel",
    stepLabel: { ko: "피부 타입", en: "Skin Type" },
    title: { ko: "아침에 피부가 가장 먼저 어떻게 느껴지나요?", en: "How does your skin feel in the morning?" },
    description: {
      ko: "아무 제품도 바르기 전, 현재 피부 상태와 가장 가까운 항목을 선택해 주세요.",
      en: "Choose the option that best describes your skin before applying products.",
    },
    options: ROUTINE_OPTIONS,
  },
  {
    key: "reactivity",
    stepLabel: { ko: "민감도", en: "Reactivity" },
    title: { ko: "피부 반응성은 어느 정도인가요?", en: "How reactive is your skin?" },
    description: {
      ko: "새 제품 또는 환경 변화에 대한 피부 반응을 기준으로 선택해 주세요.",
      en: "Select based on how your skin responds to new formulas or environment changes.",
    },
    options: REACTIVITY_OPTIONS,
  },
  {
    key: "goal",
    stepLabel: { ko: "우선 고민", en: "Primary Goal" },
    title: { ko: "지금 가장 집중하고 싶은 피부 고민은 무엇인가요?", en: "What is your top skin goal right now?" },
    description: {
      ko: "루틴 추천의 우선순위를 정하는 핵심 질문입니다.",
      en: "This sets the top priority for your regimen.",
    },
    options: GOAL_OPTIONS,
  },
  {
    key: "pace",
    stepLabel: { ko: "루틴 밀도", en: "Routine Depth" },
    title: { ko: "원하는 루틴 밀도를 선택해 주세요.", en: "Choose your preferred routine depth." },
    description: {
      ko: "시간과 사용 습관에 맞는 단계 수로 최적화합니다.",
      en: "We tailor steps to your available time and habits.",
    },
    options: PACE_OPTIONS,
  },
  {
    key: "window",
    stepLabel: { ko: "사용 시간대", en: "Usage Window" },
    title: { ko: "루틴 적용 시간대를 선택해 주세요.", en: "When will you use this routine?" },
    description: {
      ko: "아침/저녁/통합 루틴 중 원하는 방식을 고르세요.",
      en: "Pick AM, PM, or a full day-and-night routine.",
    },
    options: WINDOW_OPTIONS,
  },
];

const DEFAULT_ANSWERS: RoutineAnswers = {
  skinFeel: "balanced",
  reactivity: "reactive",
  goal: "hydration",
  pace: "balanced",
  window: "both",
};

const SKIN_TYPE_BY_FEEL: Record<SkinFeel, SkinType> = {
  tight: "dry",
  oily: "oily",
  combination: "combination",
  balanced: "normal",
};

const CATEGORY_PLAN: Record<RoutineWindow, Record<RoutinePace, ProductCategory[]>> = {
  am: {
    minimal: ["cleanser", "serum", "sunscreen"],
    balanced: ["cleanser", "serum", "moisturizer", "sunscreen"],
    layered: ["cleanser", "serum", "moisturizer", "sunscreen", "tool"],
  },
  pm: {
    minimal: ["cleanser", "serum", "moisturizer"],
    balanced: ["cleanser", "serum", "moisturizer", "mask"],
    layered: ["cleanser", "serum", "moisturizer", "mask", "tool"],
  },
  both: {
    minimal: ["cleanser", "serum", "moisturizer"],
    balanced: ["cleanser", "serum", "moisturizer", "sunscreen", "mask"],
    layered: ["cleanser", "serum", "moisturizer", "sunscreen", "mask", "tool"],
  },
};

const CATEGORY_LABELS: Record<ProductCategory, { ko: string; en: string }> = {
  cleanser: { ko: "클렌저", en: "Cleanser" },
  serum: { ko: "세럼", en: "Serum" },
  moisturizer: { ko: "모이스처라이저", en: "Moisturizer" },
  sunscreen: { ko: "선케어", en: "Sunscreen" },
  mask: { ko: "마스크", en: "Mask" },
  tool: { ko: "툴", en: "Tool" },
};

const STEP_TITLE_BY_WINDOW: Record<RoutineWindow, { ko: string; en: string }> = {
  am: { ko: "아침 루틴", en: "AM Routine" },
  pm: { ko: "저녁 루틴", en: "PM Routine" },
  both: { ko: "종일 루틴", en: "All-Day Routine" },
};

export function RoutineView() {
  const { locale, db, addToCart } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [answers, setAnswers] = useState<RoutineAnswers>(DEFAULT_ANSWERS);
  const [step, setStep] = useState(0);
  const totalQuestions = ROUTINE_QUESTIONS.length;
  const isResultView = step >= totalQuestions;
  const activeStep = isResultView ? totalQuestions : step + 1;
  const progress = Math.round((activeStep / totalQuestions) * 100);
  const currentQuestion = ROUTINE_QUESTIONS[Math.min(step, totalQuestions - 1)];

  const optionLabel = (key: RoutineQuestionKey, value: string) => {
    const question = ROUTINE_QUESTIONS.find((entry) => entry.key === key);
    const option = question?.options.find((entry) => entry.value === value);
    return option ? option.title[locale] : value;
  };

  const updateAnswer = (key: RoutineQuestionKey, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value } as RoutineAnswers));
  };

  const recommendation = useMemo(() => {
    const primarySkin = SKIN_TYPE_BY_FEEL[answers.skinFeel];
    const targetSkins = new Set<SkinType>([primarySkin]);
    if (answers.reactivity !== "calm") {
      targetSkins.add("sensitive");
    }

    const preferredCategories = CATEGORY_PLAN[answers.window][answers.pace];

    const scored = db.products
      .map((product) => {
        let score = 0;

        if (product.skinTypes.includes(primarySkin)) {
          score += 18;
        }

        for (const skin of targetSkins) {
          if (product.skinTypes.includes(skin)) {
            score += 6;
          }
        }

        if (product.concerns.includes(answers.goal)) {
          score += 22;
        }

        if (answers.reactivity === "highlyReactive" && product.concerns.includes("redness")) {
          score += 10;
        }

        if (answers.reactivity !== "calm" && product.skinTypes.includes("sensitive")) {
          score += 8;
        }

        if (preferredCategories.includes(product.category)) {
          score += 9;
        }

        if (answers.window === "am" && product.category === "sunscreen") {
          score += 9;
        }

        if (answers.window === "pm" && product.category === "mask") {
          score += 6;
        }

        if (answers.pace === "minimal" && product.category === "tool") {
          score -= 8;
        }

        score += product.rating * 2;
        score += Math.min(product.reviewCount, 50) / 10;

        return { product, score };
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.product.rating - a.product.rating ||
          b.product.reviewCount - a.product.reviewCount ||
          +new Date(b.product.createdAt) - +new Date(a.product.createdAt),
      );

    const used = new Set<string>();
    const routineProducts = preferredCategories
      .map((category) => {
        const byCategory = scored.find((entry) => entry.product.category === category && !used.has(entry.product.slug));
        const fallback = scored.find((entry) => !used.has(entry.product.slug));
        const picked = byCategory ?? fallback;
        if (!picked) {
          return null;
        }
        used.add(picked.product.slug);
        return {
          category,
          product: picked.product,
        };
      })
      .filter((entry): entry is { category: ProductCategory; product: Product } => Boolean(entry));

    const extras = scored
      .map((entry) => entry.product)
      .filter((product) => !used.has(product.slug))
      .slice(0, 3);

    return {
      routineProducts,
      extras,
    };
  }, [answers, db.products]);

  const resetRoutine = () => {
    setAnswers(DEFAULT_ANSWERS);
    setStep(0);
  };

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
                {isResultView ? t("분석 완료", "Analysis Complete") : t(`질문 ${activeStep} / ${totalQuestions}`, `Question ${activeStep} of ${totalQuestions}`)}
              </span>
              <h2 className="text-[#440513] dark:text-white font-bold text-xl">
                {isResultView ? t("맞춤 리추얼 제안", "Recommended Routine") : currentQuestion.stepLabel[locale]}
              </h2>
            </div>
            <span className="text-[#440513] dark:text-white font-bold text-xl">{progress}%</span>
          </div>

          <div className="w-full bg-[#fce7ec] dark:bg-[#7d112b] rounded-full h-1.5 mb-16 overflow-hidden">
            <div
              className="bg-[#d11140] h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(230,25,76,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>

          {!isResultView && (
            <>
              <div className="mb-12 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl font-bold text-[#440513] dark:text-white mb-4 leading-tight">{currentQuestion.title[locale]}</h2>
                <p className="text-lg text-[#d11140] dark:text-[#f2aab9]">{currentQuestion.description[locale]}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                {currentQuestion.options.map((option) => (
                  <label key={option.value} className="group relative cursor-pointer">
                    <input
                      className="peer sr-only"
                      name={currentQuestion.key}
                      type="radio"
                      value={option.value}
                      checked={answers[currentQuestion.key] === option.value}
                      onChange={() => updateAnswer(currentQuestion.key, option.value)}
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
            </>
          )}

          {isResultView && (
            <div className="space-y-8 mb-10">
              <div className="p-6 rounded-2xl border border-[#f8d0da] dark:border-[#930e2e] bg-white dark:bg-[#7d112b]/20">
                <h2 className="text-3xl md:text-4xl font-bold text-[#440513] dark:text-white mb-3 leading-tight">
                  {t("당신에게 맞는 루틴이 준비되었습니다.", "Your personalized routine is ready.")}
                </h2>
                <p className="text-[#d11140] dark:text-[#f2aab9] leading-relaxed">
                  {t(
                    "선택한 피부 타입과 고민, 루틴 밀도에 맞춰 제품 순서를 제안합니다. 필요 시 개별 제품을 교체해도 전체 밸런스는 유지됩니다.",
                    "Your routine is mapped to skin type, concern, and routine depth. You can swap individual products without losing overall balance.",
                  )}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#fdf2f4] text-[#b00c32] border border-[#f8d0da]">
                    {t("피부감", "Skin")}: {optionLabel("skinFeel", answers.skinFeel)}
                  </span>
                  <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#fdf2f4] text-[#b00c32] border border-[#f8d0da]">
                    {t("우선 고민", "Goal")}: {optionLabel("goal", answers.goal)}
                  </span>
                  <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#fdf2f4] text-[#b00c32] border border-[#f8d0da]">
                    {t("루틴 밀도", "Depth")}: {optionLabel("pace", answers.pace)}
                  </span>
                  <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-[#fdf2f4] text-[#b00c32] border border-[#f8d0da]">
                    {t("시간대", "Window")}: {optionLabel("window", answers.window)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#440513] dark:text-white mb-4">{STEP_TITLE_BY_WINDOW[answers.window][locale]}</h3>
                {recommendation.routineProducts.length === 0 ? (
                  <p className="rounded-xl border border-[#f8d0da] bg-white p-4 text-sm text-[#b00c32]">
                    {t("조건에 맞는 루틴 제품을 찾지 못했습니다. 다시 진단해 주세요.", "No matching routine products were found. Please retake the quiz.")}
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {recommendation.routineProducts.map(({ category, product }, index) => (
                      <article
                        key={`${category}-${product.id}`}
                        className="rounded-2xl border border-[#f8d0da] dark:border-[#930e2e] bg-white dark:bg-[#7d112b]/10 p-4 md:p-5"
                      >
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                          <div className="h-24 w-full md:w-24 rounded-xl overflow-hidden bg-[#fdf2f4] shrink-0">
                            <img alt={resolveText(product.name, locale)} className="h-full w-full object-cover" src={product.images[0]} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[#fdf2f4] text-[#b00c32] border border-[#f8d0da]">
                                {t(`${index + 1}단계`, `Step ${index + 1}`)}
                              </span>
                              <span className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold bg-[#f7f3f4] text-slate-600 border border-[#ede2e5]">
                                {CATEGORY_LABELS[category][locale]}
                              </span>
                            </div>
                            <h4 className="font-semibold text-[#440513] dark:text-white truncate">{resolveText(product.name, locale)}</h4>
                            <p className="text-sm text-[#d11140] dark:text-[#ea7790] line-clamp-2">{resolveText(product.shortDescription, locale)}</p>
                            <p className="text-xs text-slate-500 mt-2">{resolveText(product.routineTip, locale)}</p>
                          </div>

                          <div className="flex md:flex-col gap-2 md:items-end">
                            <span className="text-base font-semibold text-[#440513] dark:text-white">{currency(product.price)}</span>
                            <button
                              type="button"
                              className="h-9 px-4 rounded-full bg-[#d11140] hover:bg-[#b00c32] text-white text-sm font-semibold transition-colors"
                              onClick={() => addToCart(product.slug, 1)}
                            >
                              {t("담기", "Add")}
                            </button>
                            <Link
                              className="h-9 px-4 rounded-full border border-[#f8d0da] text-[#b00c32] text-sm font-semibold inline-flex items-center hover:bg-[#fdf2f4] transition-colors"
                              href={`/product/${product.slug}`}
                            >
                              {t("상세", "View")}
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              {recommendation.extras.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-[#440513] dark:text-white mb-3">{t("추가 제안", "Optional Add-ons")}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recommendation.extras.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        className={cn(
                          "text-left rounded-xl border border-[#f8d0da] dark:border-[#930e2e] bg-white dark:bg-[#7d112b]/10 p-3 hover:border-[#ea7790] transition-colors",
                        )}
                        onClick={() => addToCart(product.slug, 1)}
                      >
                        <p className="text-sm font-semibold text-[#440513] dark:text-white truncate">{resolveText(product.name, locale)}</p>
                        <p className="text-xs text-[#d11140] dark:text-[#ea7790] mt-1">{CATEGORY_LABELS[product.category][locale]}</p>
                        <p className="text-sm font-semibold text-[#440513] dark:text-white mt-2">{currency(product.price)}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-8 border-t border-[#fce7ec] dark:border-[#930e2e]">
            <button
              type="button"
              disabled={step === 0}
              className={cn(
                "group flex items-center gap-2 font-semibold transition-colors px-4 py-2 rounded-lg",
                step === 0
                  ? "text-[#f2aab9] cursor-not-allowed"
                  : "text-[#e6194c] hover:text-[#b00c32] dark:hover:text-[#f2aab9]",
              )}
              onClick={() => setStep((prev) => Math.max(prev - 1, 0))}
            >
              <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              {isResultView ? t("응답 수정", "Edit Answers") : t("이전", "Back")}
            </button>

            <div className="flex items-center gap-3">
              {isResultView && (
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white border border-[#f8d0da] text-[#b00c32] font-bold py-3 px-5 rounded-full transition-colors hover:bg-[#fdf2f4]"
                  onClick={resetRoutine}
                >
                  <span className="material-symbols-outlined text-lg">refresh</span>
                  {t("다시 진단", "Retake")}
                </button>
              )}
              {!isResultView && (
                <button
                  type="button"
                  className="flex items-center gap-3 bg-[#d11140] hover:bg-[#b00c32] text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-[#d11140]/30 transition-all transform hover:-translate-y-0.5 hover:shadow-xl"
                  onClick={() => {
                    if (step === totalQuestions - 1) {
                      setStep(totalQuestions);
                      return;
                    }
                    setStep((prev) => prev + 1);
                  }}
                >
                  {step === totalQuestions - 1 ? t("결과 보기", "See Result") : t("다음 단계", "Next Step")}
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </button>
              )}
              {isResultView && (
                <Link
                  className="flex items-center gap-2 bg-[#d11140] hover:bg-[#b00c32] text-white font-bold py-3 px-5 rounded-full transition-colors"
                  href="/shop"
                >
                  {t("스토어 이동", "Go to Shop")}
                  <span className="material-symbols-outlined text-lg">north_east</span>
                </Link>
              )}
            </div>
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
