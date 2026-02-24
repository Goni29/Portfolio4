import type { LocalizedText } from "@/lib/types";

export type StaticJournalArticle = {
  id: string;
  slug: string;
  title: LocalizedText;
  excerpt: LocalizedText;
  content: LocalizedText;
  category: string;
  publishedAt: string;
  coverImage: string;
  ratioClass: string;
  dispatch?: boolean;
  showInFallbackGrid: boolean;
  relatedProductSlugs?: string[];
};

const localized = (ko: string, en: string): LocalizedText => ({ ko, en });

export const STATIC_JOURNAL_ARTICLES: StaticJournalArticle[] = [
  {
    id: "journal-static-1",
    slug: "morning-rituals-with-our-founder",
    title: localized("창립자와 함께하는 아침 루틴", "Morning Rituals with our Founder"),
    excerpt: localized(
      "마음을 깨우는 호흡과 과학적 스킨케어를 결합한 15분 아침 루틴을 소개합니다.",
      "Discover the 15-minute morning routine that started it all, blending mindfulness with clinical skincare.",
    ),
    content: localized(
      "<p>포트폴리오의 아침은 천천히 시작됩니다. 먼저 물 한 잔과 호흡으로 몸을 깨운 뒤, 피부 리듬에 맞춘 10분 레이어링 루틴을 진행합니다.</p><p>첫 단계는 밤사이 쌓인 잔여물을 정리하는 순한 클렌저입니다. 다음으로 수분 세럼으로 피부 장벽을 채우고, 가벼운 크림으로 수분막을 고정합니다.</p><p>핵심은 제품 개수보다 순서와 질감의 균형입니다. 자극은 줄이고 메이크업 밀착력은 높여 하루 컨디션을 안정적으로 유지할 수 있습니다.</p>",
      "<p>At Portfolio, mornings begin slowly. The first five minutes are for hydration and breath, followed by a ten-minute layering routine tuned to your skin rhythm.</p><p>Step one is a gentle cleanse to reset overnight buildup. Step two is a hydrating serum that activates the barrier. Step three seals moisture with a lightweight cream for all-day stability.</p><p>The secret is not the number of products, but the order and texture match. A precise routine reduces irritation and improves makeup longevity.</p>",
    ),
    category: "Lifestyle",
    publishedAt: "2025-10-12T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgsl_2HTDXglyMBerBIuYun3CFfsJwyKdJcUMeKwXJjHru4bk31K_Yo7ivzTpd-Ol5J5nfP4qHzF8ga7f2TW8dgGqxlrhpKGY-BlhFkcID-DgnLFFA_cztWoX9KnYZEBdcFSYBvg2KIWXkSIxZ4Sht1IryqvQHCSI4NyT0gLMSxGHIgGlehIU8C-LewhKwdhQ1Ou8nO_6WlBQU7Gw1V2wINZR9Iqqw7ffGN_S5AFwkMaX2ekC1xlOHtLsdTE1BgBvP9L5g-3NC6Iw",
    ratioClass: "aspect-[3/4]",
    showInFallbackGrid: true,
    relatedProductSlugs: ["enzyme-polish-cleanser", "luminous-silk-serum", "velvet-cloud-cream"],
  },
  {
    id: "journal-static-2",
    slug: "five-steps-to-glass-skin",
    title: localized("유리알 피부를 위한 5단계", "5 Steps to Glass Skin"),
    excerpt: localized(
      "피부과 전문의가 권장하는 레이어링으로 맑고 투명한 광채 피부를 완성해 보세요.",
      "Achieve that coveted dewy look with these simple, dermatologist-approved layering techniques.",
    ),
    content: localized(
      "<p>유리알 피부는 한 번에 많은 제품을 바른다고 만들어지지 않습니다. 피부가 흡수할 만큼만 얇게 바르고, 각 단계 사이에 짧은 휴지 시간을 주는 것이 중요합니다.</p><p>클렌징, 수분 토너, 기능성 세럼, 보습, SPF의 다섯 단계를 기본 축으로 유지하면 과한 자극 없이도 맑은 결과 광채를 얻을 수 있습니다.</p><p>세럼 단계에서는 한 번에 두껍게 바르기보다 두 번 얇게 레이어링하는 방식이 밀림을 줄이고 완성도를 높입니다.</p>",
      "<p>Glass skin is not built in one heavy step. Apply only what your skin can absorb and allow each layer to settle.</p><p>Follow a clean five-step structure: cleanse, hydrating toner, treatment serum, moisturizer, and daily SPF.</p><p>At the serum stage, avoid overloading. Two thin layers perform better than one thick layer and reduce pilling.</p>",
    ),
    category: "Education",
    publishedAt: "2025-10-10T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCajrXDrvqoz2mfp9JHioeR0wCSgfQ4h0KY_lUpMDn5xRMX7DR93ZAVikd-XiHtBmDEc3YuhXhaL_z5tD7mVihYsraPHMErK2f-XTsyFdYT-73e0VwPaPJJ8tSiXcLl1yfvuqrXb4XKlYNk_r5THhNT1TfttzKwFCjwSjs4_irXKZ5ZY4mKC4o2roFE_9h3yutlfQftj_WJgXx3HytQPFKbrDA6l38Z6-xaAA-N-o0usy1IgMCpaTtWK_L7_E-8Rxt-w6fDF3Y4LSo",
    ratioClass: "aspect-[4/3]",
    showInFallbackGrid: true,
    relatedProductSlugs: ["clarity-gel-cream", "luminous-silk-serum", "mineral-veil-spf50"],
  },
  {
    id: "journal-static-3",
    slug: "paris-fashion-week-dispatch",
    title: localized("파리 패션위크 디스패치", "Paris Fashion Week Dispatch"),
    excerpt: localized(
      "런웨이에서 포착한 뷰티 트렌드와 다음 시즌의 핵심 메이크업 포인트를 정리했습니다.",
      "Highlights and beauty trends straight from the runway. What to expect for the upcoming Spring season.",
    ),
    content: localized(
      "<p>이번 시즌 파리 런웨이의 핵심 키워드는 투명한 피부 표현과 절제된 컬러였습니다. 강한 광채보다 피부 결을 정돈해 보이게 하는 연출이 중심이었습니다.</p><p>백스테이지에서는 깊은 보습 프렙과 얇은 베이스 레이어가 공통적으로 사용됐고, 립과 치크는 톤 온 톤으로 통일해 안정적인 무드를 만들었습니다.</p><p>다음 시즌에도 스킨케어 중심 메이크업 흐름이 주요 방향으로 이어질 가능성이 큽니다.</p>",
      "<p>This season in Paris, the dominant beauty language was transparent skin and restrained color. The focus shifted from high-shine glow to refined texture.</p><p>Backstage teams consistently used deep hydration prep and thin complexion layers. Lips and cheeks stayed tone-on-tone for cohesion.</p><p>Expect skin-first makeup to remain the strongest direction into next season.</p>",
    ),
    category: "Event",
    publishedAt: "2025-10-08T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAhk7iO_7cg3T7tS5CSOlBe5Ced9zqd_CsabLv_LMELa6Bvz7KLpnCYUt4hK9CG6e0fGk1JgZcPvR1cTxQeFB3q1JeWHf1c1fxnE3ocI5asa6vdGem9w3JyFw0xx8p1DfDkNGRk-PnNlEwcfK-3YUAUnaM6S43pQHm6a7UCWa92g383l2itMSAEGaOQY48RCESsB6XDseIJ7d7OQbWyDanWLTmx8RHl_YKWs5NNixnsOExXZvzvsJOkfbWd7aC6mCH-PAKzx2ebRe0",
    ratioClass: "aspect-[3/5]",
    dispatch: true,
    showInFallbackGrid: true,
    relatedProductSlugs: ["velvet-cloud-cream", "mineral-veil-spf50"],
  },
  {
    id: "journal-static-4",
    slug: "conversation-with-dr-elena-ross",
    title: localized("엘레나 로스 박사 인터뷰", "In Conversation with Dr. Elena Ross"),
    excerpt: localized(
      "SPF와 블루라이트 차단에 관한 질문에 피부과 전문의가 명확한 기준을 제시합니다.",
      "The leading dermatologist answers your most burning questions about SPF and blue light protection.",
    ),
    content: localized(
      "<p>로스 박사는 SPF를 선택이 아닌 일상의 기본값으로 정의합니다. 실내 환경에서도 간접 자외선 노출이 누적되기 때문에 매일 차단 루틴이 필요하다는 설명입니다.</p><p>블루라이트는 단일 요인보다 생활 전반과 함께 해석해야 하며, 항산화 케어와 수면 위생을 병행하면 피부 컨디션을 더 안정적으로 관리할 수 있다고 말합니다.</p><p>결론은 단순합니다. 규칙적인 SPF, 순한 클렌징, 충분한 보습이 장기적으로 가장 강력한 전략입니다.</p>",
      "<p>Dr. Ross defines SPF as a daily behavioral baseline, not an occasional product. Even indoors, ambient UV exposure through windows accumulates over time.</p><p>She frames blue light as one factor among many, recommending antioxidant support and sleep hygiene alongside topical protection.</p><p>Her conclusion is practical: consistent SPF, gentle cleansing, and stable hydration remain the strongest long-term strategy.</p>",
    ),
    category: "Interviews",
    publishedAt: "2025-09-28T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDnAYI_XjVBJj-nYkUzHfSeZ2UI8NZCBhZbwwGFjBk4lNesGqs_xvajt7tlllWMuGHCNnJvEbkPTmVmiBMxM_NmH8_J3QEIQdgIfOr02eiZuHMfQTCXcox5SlsIANeuHRcg26M3-wsZPIzkbKX3kaHZisitIH8nvXsoCuZQnei399xPnpoNFAiW7nVh5-hQJerniusMra7fIdeqhry-FXdVKFTFnt0ci2nSGfz7uymn-4zkbVUt_IqPwOVZ15Ad9I2-v_rKaEGCHMw",
    ratioClass: "aspect-square",
    showInFallbackGrid: true,
    relatedProductSlugs: ["mineral-veil-spf50", "bio-cellulose-mask"],
  },
  {
    id: "journal-static-5",
    slug: "digital-detox-evenings",
    title: localized("디지털 디톡스, 저녁을 되찾는 방법", "Digital Detox: Reclaiming Your Evenings"),
    excerpt: localized(
      "잠들기 2시간 전 화면을 멀리하면 수면 질과 피부 컨디션이 어떻게 달라지는지 살펴봅니다.",
      "Why putting your phone away 2 hours before bed changes your skin health and sleep quality.",
    ),
    content: localized(
      "<p>취침 전 스크린 노출을 줄이면 수면 진입 시간이 짧아지고 다음 날 피부 톤과 부기 개선에 도움이 됩니다.</p><p>저녁 루틴은 복잡할 필요가 없습니다. 순한 클렌징, 보습, 가벼운 스트레칭, 조도 낮추기만 지켜도 체감 변화가 생깁니다.</p><p>중요한 것은 강도가 아니라 반복입니다. 작은 습관의 지속이 피부 안정성을 만듭니다.</p>",
      "<p>Reducing screen exposure before sleep shortens sleep onset and often improves next-day skin tone and puffiness.</p><p>An effective evening routine is usually simple: cleanse, moisturize, stretch briefly, and lower ambient light.</p><p>Consistency matters more than intensity. Small repeated habits create visible stability over time.</p>",
    ),
    category: "Wellness",
    publishedAt: "2025-09-15T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyqLTCZmplDu4Q3C6wkYH0Lg8mI5yEWNI-houSQJtr5DnO7blXbW1E5oq2uwYJvKNtqGa5mFcmNVj3OHbB8_8IuPOusX-v5AowfXN1Dev56Q7gUU6k3dHNq8Z8IfruF7lfqHuYBsFtk_6bxvvxDXsSgWJSiFt8x8SGytSTjZFLmRhrfU15BE3LHN-PWj2t-We-09eMmaN4D8dM5Ckki7ClNKk0JNHH-eo-C05Gbpd-jQuzfGjZOc1WChmC_dVUb4nlZET6A1JoIQo",
    ratioClass: "aspect-[16/9]",
    showInFallbackGrid: true,
    relatedProductSlugs: ["midnight-recovery-oil", "velvet-cloud-cream"],
  },
  {
    id: "journal-static-6",
    slug: "ingredient-spotlight-bakuchiol",
    title: localized("성분 스포트라이트: 바쿠치올이 주목받는 이유", "Ingredient Spotlight: Why Bakuchiol is the Retinol Alternative You Need"),
    excerpt: localized(
      "민감한 피부도 비교적 편안하게 사용할 수 있는 식물성 안티에이징 성분, 바쿠치올을 분석합니다.",
      "For those with sensitive skin, Bakuchiol offers a plant-based alternative that delivers similar anti-aging benefits with less irritation.",
    ),
    content: localized(
      "<p>바쿠치올은 식물 유래 활성 성분으로, 자극 반응이 걱정되는 피부에서 레티놀 대체제로 자주 선택됩니다.</p><p>주요 강점은 피부 결 개선, 탄력 보조, 톤 균형입니다. 초기에는 주 2~3회로 시작해 피부 적응도에 맞춰 사용 빈도를 늘리는 것이 좋습니다.</p><p>저녁 루틴에서 장벽 보습과 함께 사용하면 안티에이징 효율과 사용감을 동시에 확보할 수 있습니다.</p>",
      "<p>Bakuchiol is a plant-derived active often chosen as a gentler alternative to retinol for reactive skin types.</p><p>Its main strengths include texture refinement, elasticity support, and tone balance. Start with lower frequency, then scale as tolerance improves.</p><p>Paired with barrier-supporting hydration in evening care, it can deliver anti-aging benefits with a more comfortable experience.</p>",
    ),
    category: "Science",
    publishedAt: "2025-10-05T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC397RvjF-qpnvfOKUyf-Onb8dKgaKTHPea5ZD0oZDwp6w8dM2cMYdP0mUyF6mWzFMwCH1pNRr64ZnEZPPr3IfQ0XyGuf3xsJ3qy7mMj-GNSb8wNSVwcXyFtaSG6aW0K-wvciq84HrhS1rhM_b0DaxcJOfQU-spKw3LqBIu91MUJP9qe9kuhXkVafs9YEIKSM8SsS6yLpk1_7sSzOZCUv5m4F044-55eel6LA7g6kfa9mtd37gY_RS0YZd7h3JpkWQhBJTJyFhaKxM",
    ratioClass: "aspect-[4/3]",
    showInFallbackGrid: false,
    relatedProductSlugs: ["midnight-recovery-oil", "luminous-silk-serum", "velvet-cloud-cream"],
  },
  {
    id: "journal-static-7",
    slug: "night-reset-serum-launch",
    title: localized("나이트 리셋 세럼 출시", "The Night Reset Serum Is Here"),
    excerpt: localized(
      "잠자는 동안 피부 회복을 돕는 신제품 세럼을 지금 만나보세요.",
      "Recharge your skin while you sleep. Our latest formula is now available.",
    ),
    content: localized(
      "<p>나이트 리셋 세럼은 수면 시간 동안 피부 회복 리듬을 지원하도록 설계된 신제품입니다.</p><p>가벼운 텍스처지만 깊은 보습을 제공해 다음 날 아침 피부 결을 매끈하게 정돈해 줍니다.</p><p>최적의 효과를 위해 저녁 클렌징 직후 첫 번째 트리트먼트 단계에서 사용해 보세요.</p>",
      "<p>The Night Reset Serum is engineered to support skin recovery while you sleep.</p><p>Its lightweight texture delivers dense hydration and helps smooth visible texture by morning.</p><p>For best results, apply as the first treatment step after evening cleansing.</p>",
    ),
    category: "Science",
    publishedAt: "2025-10-03T10:00:00.000Z",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgsl_2HTDXglyMBerBIuYun3CFfsJwyKdJcUMeKwXJjHru4bk31K_Yo7ivzTpd-Ol5J5nfP4qHzF8ga7f2TW8dgGqxlrhpKGY-BlhFkcID-DgnLFFA_cztWoX9KnYZEBdcFSYBvg2KIWXkSIxZ4Sht1IryqvQHCSI4NyT0gLMSxGHIgGlehIU8C-LewhKwdhQ1Ou8nO_6WlBQU7Gw1V2wINZR9Iqqw7ffGN_S5AFwkMaX2ekC1xlOHtLsdTE1BgBvP9L5g-3NC6Iw",
    ratioClass: "aspect-[3/4]",
    showInFallbackGrid: false,
    relatedProductSlugs: ["midnight-recovery-oil", "luminous-silk-serum"],
  },
];

export const STATIC_JOURNAL_ARTICLE_BY_SLUG = new Map(
  STATIC_JOURNAL_ARTICLES.map((article) => [article.slug.toLowerCase(), article]),
);