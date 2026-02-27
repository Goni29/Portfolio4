"use client";

import Link from "next/link";
import { useStore } from "@/components/providers/store-provider";

export function AboutView() {
  const { locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);

  return (
    <main className="w-full">
      <section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
        <div
          className="absolute inset-0 z-0 parallax-bg"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('https://lh3.googleusercontent.com/aida-public/AB6AXuAKj4lHjoW3MDQh1yB01v5eIL5KwJ46xELz5lBxVMY-QeekpoyRiJEAybgNKi8CmxymJig6b9si0K_ujPyA-DwDDsHesS4F4VsAu0_8bq43LQkZCGjH6SC6lNb7yUrhrwpWZ2ej-Oxyl_MF66zQKBD5dicq-2U1fuMpBhOelSK7nMBZZswHqRYj8cSo23fN8gCCFynDEoaPmEIAo6DYUB5gkkPBDOaJqhb6ePlF3N8gN9eRUcD1kszVtrxyhAI6aPCM-nXIQvNN6yo')",
          }}
        />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto flex flex-col items-center gap-6">
          <p className="text-white/90 text-sm md:text-base font-bold tracking-[0.2em] uppercase mb-2">{t("브랜드 철학", "The Philosophy")}</p>
          <h1 className="text-white font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.1] italic">
            {t("정제된 아름다움", "Beauty, Curated")} <br />
            <span className="not-italic">{t("자연에서 시작됩니다.", "by Nature.")}</span>
          </h1>
          <p className="text-white/80 text-lg md:text-xl font-light max-w-xl mt-4 leading-relaxed">
            {t(
              "예술성과 과학, 그리고 감각적 완성도를 향한 선언. 진정한 럭셔리는 눈에 보이는 결과를 넘어 피부에 남는 경험입니다.",
              "A manifesto of art, biology, and the pursuit of the exquisite. True luxury is not just what you see, but what you feel.",
            )}
          </p>
          <div className="mt-10">
            <span className="material-symbols-outlined text-white animate-bounce text-4xl">keyboard_arrow_down</span>
          </div>
        </div>
      </section>

      <section className="py-24 md:py-32 px-6 bg-[#f8f6f6]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-px h-16 bg-[#e6194c] mx-auto mb-10" />
          <h2 className="font-serif text-3xl md:text-5xl text-[#1b0e11] mb-8 leading-tight">
            {t(
              '"우리는 스킨케어를 자연과 피부가 나누는 가장 섬세한 대화라고 믿습니다."',
              '"We believe that skincare is an intimate dialogue between the earth and your body."',
            )}
          </h2>
          <p className="text-lg text-[#1b0e11]/70 leading-loose font-light">
            <span className="text-5xl float-left mr-3 mt-[-10px] text-[#e6194c] font-serif">{t("장", "O")}</span>
            {t(
              "인정신에 대한 우리의 약속은 단순한 용기를 넘어섭니다. 흙에서 시작해 피부에 머무는 마지막 순간까지, 원료의 산지와 계절, 추출 과정을 정교하게 관리합니다. 일본의 안개 낀 계곡부터 프랑스 프로방스의 햇살 가득한 들판까지, 한 방울마다 고유한 기원을 담아냅니다.",
              "Our commitment to craftsmanship goes beyond the jar, it begins in the soil and ends in the soul. We traverse the globe to source ingredients that are as rare as they are potent. From the mist-covered valleys of Japan to the sun-drenched fields of Provence, every drop tells a story of place and provenance.",
            )}
          </p>
        </div>
      </section>

      <section
        className="relative h-[60vh] md:h-[80vh] w-full overflow-hidden parallax-bg flex items-center"
        style={{
          backgroundImage: "url('/brand_flower.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 w-full px-6 md:px-20">
          <div className="max-w-lg bg-white/90 backdrop-blur-sm p-10 md:p-14 rounded-lg shadow-xl">
            <span className="text-[#e6194c] text-xs font-bold tracking-widest uppercase mb-3 block">{t("챕터 1", "Chapter I")}</span>
            <h3 className="font-serif text-3xl md:text-4xl text-[#1b0e11] mb-4">{t("원료의 기원", "The Origin")}</h3>
            <p className="text-[#1b0e11]/80 leading-relaxed">
              {t(
                "합성 성분에 의존하지 않고, 효능이 가장 높아지는 시기에 식물 원료를 수확합니다. 계절의 리듬을 이해하는 현지 재배 파트너와 함께 자연이 허락한 만큼만 정직하게 담아냅니다.",
                "Untouched by synthetics, our botanicals are harvested at the peak of their potency. We partner with local growers who understand the rhythm of the seasons, ensuring that we take from nature only what she is willing to give.",
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-white overflow-hidden">
        <div className="px-6 md:px-10 mb-12 max-w-[1440px] mx-auto">
          <div className="max-w-xl">
            <span className="text-[#e6194c] text-xs font-bold tracking-widest uppercase mb-3 block">{t("챕터 2", "Chapter II")}</span>
            <h3 className="font-serif text-4xl md:text-5xl text-[#1b0e11] mb-4 italic">{t("포뮬러 장인정신", "The Craftsmanship")}</h3>
            <p className="text-[#1b0e11]/70">
              {t(
                "현대 과학과 오래된 지혜가 만납니다. 포뮬러링은 천천히, 정밀하게, 그리고 타협 없이 진행됩니다.",
                "Modern science meets ancient wisdom. Our formulation process is slow, deliberate, and uncompromising.",
              )}
            </p>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto px-6 md:px-10 pb-10 no-scrollbar snap-x snap-mandatory">
          <div className="min-w-[300px] md:min-w-[400px] snap-center flex flex-col gap-4 group cursor-pointer">
            <div className="aspect-[4/5] rounded-lg overflow-hidden relative">
              <img
                alt={t("투명한 액체와 꽃잎이 담긴 실험 비커", "Laboratory beaker with clear liquid and flower petal")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjBRhyHI3BsMWoTKbLgTd_wVcxluKJ4qL-awIrNG3rpxJMMbB1oagMOQL0FfvPlfc9Y_l3DzKGx9W3Ir-DaBy3h3zj8FtIkC2Yf9zSkONwik8s6iJQXqXw0KJeshd84cIY3iS6WWJFPiQ-a0MVyTn_sgr70BcPSRMlywFV7DsZ62biH2QcN0JGx1cnz-xNrt1DndptckyYGFKJKOzBtJkYl59AMMf9jSZXdZyP-OCXW4CsMlORFv6CFm_pJvMLwf9Q5386oQXBMDI"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-serif italic text-xl">{t("저온 추출", "Cold Extraction")}</span>
              </div>
            </div>
            <div className="px-2">
              <h4 className="text-lg font-bold text-[#1b0e11]">{t("01. 저온 추출", "01. Cold Extraction")}</h4>
              <p className="text-sm text-[#1b0e11]/60 mt-1">{t("원료 본연의 활성을 지키는 정교한 공정입니다.", "Preserving the integrity of raw ingredients.")}</p>
            </div>
          </div>

          <div className="min-w-[300px] md:min-w-[400px] snap-center flex flex-col gap-4 group cursor-pointer">
            <div className="aspect-[4/5] rounded-lg overflow-hidden relative">
              <img
                alt={t("스톤 위에 펼쳐진 크림 텍스처", "Cream texture smear on stone surface")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC397RvjF-qpnvfOKUyf-Onb8dKgaKTHPea5ZD0oZDwp6w8dM2cMYdP0mUyF6mWzFMwCH1pNRr64ZnEZPPr3IfQ0XyGuf3xsJ3qy7mMj-GNSb8wNSVwcXyFtaSG6aW0K-wvciq84HrhS1rhM_b0DaxcJOfQU-spKw3LqBIu91MUJP9qe9kuhXkVafs9YEIKSM8SsS6yLpk1_7sSzOZCUv5m4F044-55eel6LA7g6kfa9mtd37gY_RS0YZd7h3JpkWQhBJTJyFhaKxM"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-serif italic text-xl">{t("텍스처 리파인", "Texture Refinement")}</span>
              </div>
            </div>
            <div className="px-2">
              <h4 className="text-lg font-bold text-[#1b0e11]">{t("02. 텍스처 리파인", "02. Texture Refinement")}</h4>
              <p className="text-sm text-[#1b0e11]/60 mt-1">{t("피부 위에서 완성되는 감각적 사용감을 구현합니다.", "Achieving the perfect sensory experience.")}</p>
            </div>
          </div>

          <div className="min-w-[300px] md:min-w-[400px] snap-center flex flex-col gap-4 group cursor-pointer">
            <div className="aspect-[4/5] rounded-lg overflow-hidden relative">
              <img
                alt={t("빛과 그림자가 있는 미니멀 패키지", "Minimalist packaging design with light shadow")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCaY7OrUZ_wegtt7bZGSE8IM7Xxe1ppz2TRMr8IucggEIdMhCLrRkLgesaqY4or3Q-iLkRrxWUTxq8Izn_YF3I7N9CkQZrawWmVVuSwQuPJ651kPBLj57f2O31P72zJW07rfMGmqeQYgtA_OlqL3tfWkc1tkOBLHyEfg3SLQ1WcBVq1pG2S4Mg98ciGy8aj28OwCNern3AFwONZzIhdsA5JphDYD79ekLQ6m8mpQBMtuyNyZpWe2fumRTrjo_F8I8sHMz9WYScEUCw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-serif italic text-xl">{t("지속가능 보틀링", "Sustainable Bottling")}</span>
              </div>
            </div>
            <div className="px-2">
              <h4 className="text-lg font-bold text-[#1b0e11]">{t("03. 지속가능 보틀링", "03. Sustainable Bottling")}</h4>
              <p className="text-sm text-[#1b0e11]/60 mt-1">{t("언제나 플라스틱보다 유리를 우선합니다.", "Glass over plastic, always.")}</p>
            </div>
          </div>

          <div className="min-w-[300px] md:min-w-[400px] snap-center flex flex-col gap-4 group cursor-pointer">
            <div className="aspect-[4/5] rounded-lg overflow-hidden relative">
              <img
                alt={t("원료를 담은 손", "Hands holding raw clay material")}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDquC8IYQgZnS3R93RzNlNB4G5TuHcaaiPe8qRa3uYJoyuEFIVZEx1jAjGPBTe4XYRuPz-BTxfVSBB7UEVrksSm2Q0cY-Y_G8oxuebZJJGuEuCnplSM-xAK3FlACnz_VQPDAO_0DD92v-Hx9cGDPinn9J2Vha6Wouy6x2ds0Bn09mGgSVeF9p26NdEuAsrsb7Jeg4VwTDvE6rxGmrtSGScdxRP-w03laaKf9QEgt6ctslTODH2RdhfGsaDLMwTAh5d12yuPVZ903II"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <span className="text-white font-serif italic text-xl">{t("장인의 손길", "Human Touch")}</span>
              </div>
            </div>
            <div className="px-2">
              <h4 className="text-lg font-bold text-[#1b0e11]">{t("04. 장인의 손길", "04. Human Touch")}</h4>
              <p className="text-sm text-[#1b0e11]/60 mt-1">{t("핸드 포어링으로 마지막 품질을 확인합니다.", "Hand-poured for quality assurance.")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-[#f3e7ea]/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-[#f3e7ea]/50 to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="w-full aspect-square rounded-full overflow-hidden border-4 border-white shadow-2xl relative">
              <img
                alt={t("추상적인 녹색 잎의 질감", "Abstract green leaf texture macro")}
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD27EHpnEbhmmPCT1j-svLIpgcl81i7er0zuPniZ_UzNG6G2CHeQqXwtHgWAxQsIexY3ex7NtEoCkWeJktC9DiliY7rJY_yOH4qo4Bq5BLYfO3k6s0OsrqWp-gF2CLmKy7nj92HyK5ZcTXHe4ZO7suW6f_3BLGD4mShfnv-tAxbrtxK-lNd8jOrm-4ilj5Ca_cc9eZQSbkOl6N11B0oE-ZloGhZLdyJLNnHIHGt8L5v2leZah2J0qwQcdfYBxIWpHnyz9d4Fjb4pPY"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="text-[#e6194c] text-xs font-bold tracking-widest uppercase mb-3 block">{t("챕터 3", "Chapter III")}</span>
            <h3 className="font-serif text-3xl md:text-5xl text-[#1b0e11] mb-6 italic">
              {t('"지속가능성은 선택이 아닌, 브랜드의 기준입니다."', '"Sustainability is not a choice, but a canvas."')}
            </h3>
            <p className="text-[#1b0e11]/80 leading-relaxed mb-8">
              {t(
                "제로 웨이스트 이니셔티브를 통해 패키지의 모든 구성 요소를 재사용, 재활용, 또는 생분해 가능한 방식으로 설계합니다. 아름다움은 지구가 아닌 당신에게만 오래 남아야 한다고 믿습니다.",
                "Our zero-waste initiative ensures that every component of our packaging is either reusable, recyclable, or compostable. We believe beauty should leave a mark on you, not the planet.",
              )}
            </p>
            <a
              className="inline-flex items-center gap-2 text-[#e6194c] font-bold hover:text-[#c61542] transition-colors border-b-2 border-[#e6194c] pb-1"
              href="#"
            >
              {t("지속가능성 리포트 보기", "Read our Sustainability Report")}
              <span className="material-symbols-outlined text-[18px]">arrow_outward</span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 bg-[#f8f6f6] flex flex-col items-center text-center">
        <h2 className="font-serif text-4xl md:text-6xl text-[#1b0e11] mb-6">{t("Portfolio와 함께하세요", "Join the Portfolio")}</h2>
        <p className="text-[#1b0e11]/60 max-w-lg mb-10 text-lg">
          {t(
            "자연과 과학이 만나는 정제된 스킨케어 경험을 만나보세요. 더 깊고 우아한 피부 여정이 지금 시작됩니다.",
            "Experience the culmination of nature and science. Your journey to exquisite skin begins here.",
          )}
        </p>
        <Link
          href="/shop"
          className="bg-[#e6194c] hover:bg-[#d11645] text-white !text-white font-bold py-4 px-10 rounded-lg shadow-lg shadow-[#e6194c]/30 transition-all transform hover:-translate-y-1 flex items-center gap-3"
        >
          <span className="text-white">{t("컬렉션 쇼핑하기", "Shop the Collection")}</span>
          <span className="material-symbols-outlined text-white">arrow_right_alt</span>
        </Link>
      </section>
    </main>
  );
}
