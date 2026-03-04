import type {
  Address,
  Article,
  Banner,
  CartItem,
  Collection,
  Coupon,
  Order,
  Product,
  Review,
  SupportInquiry,
  SessionState,
  StoreDB,
  User,
} from "@/lib/types";
import { localized, localizedList } from "@/lib/i18n";

const products: Product[] = [
  {
    id: "prod_1",
    slug: "luminous-silk-serum",
    name: localized("루미너스 실크 세럼", "Luminous Silk Serum"),
    shortDescription: localized(
      "비타민 C 광채를 정교하게 끌어올리는 프레스티지 브라이트닝 세럼.",
      "A prestige brightening serum that elevates radiance with stabilized Vitamin C.",
    ),
    description: localized(
      "실크처럼 얇게 밀착되는 제형이 피부결을 매끈하게 정돈하고 은은한 광채 피니시를 완성합니다.",
      "A silk-light texture that smooths skin texture and leaves a polished, luminous finish.",
    ),
    category: "serum",
    skinTypes: ["dry", "combination", "normal", "sensitive"],
    concerns: ["dullness", "hydration", "texture"],
    price: 85,
    freeShipping: true,
    compareAtPrice: 98,
    badge: "best",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCR0vGcTkTddM2D3DEO5q95EHs01I0pqK2QD5k3nO1IrXc7VW-Nz-4Y5nIKAUozzku1j_bO7W5dLXAKGcto1ez0r7DFYBbd8DzFGioydDxlJ56NR6TaxbzmUfMPlzl3lYjNmWCVDsBPwjrKpLoKtSZDgRDx89cCn8QR-stvf1OdP4NlxFzPk4eAOopAXZtWSzSn1HO8mefThHkteDV1Z6OELjb28ebvwE8KRcP3HNNUk8cmRS6Z0dTpq2xTsC3caKA0vTNlgdpwTi0",
      "/serum1.png",
    ],
    ingredients: [
      {
        name: localized("비타민 C", "Vitamin C"),
        benefit: localized("칙칙한 톤을 맑게 밝혀 균일한 광채를 완성합니다.", "Visibly brightens uneven tone for a clearer glow."),
      },
      {
        name: localized("나이아신아마이드", "Niacinamide"),
        benefit: localized("모공과 결을 섬세하게 정돈해 피부 장벽 균형을 돕습니다.", "Refines pores and texture while supporting barrier balance."),
      },
      {
        name: localized("스쿠알란", "Squalane"),
        benefit: localized("가볍게 밀착되어 수분을 오래 유지하고 편안한 피니시를 남깁니다.", "Locks in moisture with a weightless, elegant finish."),
      },
    ],
    howToUse: localizedList(
      [
        "세안 후 토너 단계 다음, 2-3방울을 얼굴과 목에 부드럽게 펴 발라 주세요.",
        "얼굴 중앙에서 바깥 방향으로 가볍게 눌러 밀착시켜 주세요.",
        "아침 루틴에서는 크림과 SPF로 마무리해 주세요.",
      ],
      [
        "Apply 2-3 drops to face and neck after cleansing.",
        "Press gently from the center outward for better absorption.",
        "Finish with moisturizer and SPF in your morning routine.",
      ],
    ),
    routineTip: localized(
      "벨벳 클라우드 크림과 레이어링하면 결감이 정돈된 윤광 피니시가 완성됩니다.",
      "Layer with Velvet Cloud Cream for a polished, glass-skin finish.",
    ),
    collectionSlugs: ["ritual-essentials", "night-repair"],
    isFeatured: true,
    createdAt: "2026-01-08T10:00:00.000Z",
    rating: 4.8,
    reviewCount: 42,
  },
  {
    id: "prod_2",
    slug: "midnight-recovery-oil",
    name: localized("미드나이트 리커버리 오일", "Midnight Recovery Oil"),
    shortDescription: localized(
      "밤사이 피부 장벽 컨디션을 끌어올리는 인텐시브 리페어 오일.",
      "An intensive overnight oil for barrier recovery and comfort.",
    ),
    description: localized(
      "고농축 오일 블렌드가 붉은기와 건조 스트레스를 완화해, 아침까지 유연한 결감을 유지하도록 돕습니다.",
      "A concentrated oil blend that calms visible redness and dryness for supple morning skin.",
    ),
    category: "serum",
    skinTypes: ["dry", "normal", "sensitive"],
    concerns: ["redness", "aging", "hydration"],
    price: 110,
    badge: "new",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAO18jMRYXNz6S5D4iHo47j1E3gh2V2xnvHDPHGi5g3E_hd6B1W5R3iQvBoe4a6Qi7JQXmbJT8-69n9LGq8taGAzjFI0-iEGKkO5gLcjMcbxIlR9hcgHn8oG9yCMPi0tvgrA2kVPJG8904uxAxpIf_bUZfkBUJRGOg751Ur34jzYnPQ_KXq_p2AhBsAeNHHr1t_Hfkh0-nhGkwos25nv087SEWpj3nN1pFYBwT3J1xsLgiSDIUXBCMmnBumYvoCIuukyUd9W14oC0Y",
      "/oil1.png",
    ],
    ingredients: [
      {
        name: localized("로즈힙 오일", "Rosehip Oil"),
        benefit: localized("거친 피부결을 부드럽게 정돈하고 탄력 인상을 높여줍니다.", "Softens rough texture and supports visible elasticity."),
      },
      {
        name: localized("바쿠치올", "Bakuchiol"),
        benefit: localized("자극 부담은 낮추고 매끈함을 높여주는 레티놀 대체 성분입니다.", "A retinol alternative that smooths with less irritation."),
      },
      {
        name: localized("블루 탠지", "Blue Tansy"),
        benefit: localized("외부 자극으로 예민해진 피부를 편안하게 진정시킵니다.", "Comforts skin under visible stress."),
      },
    ],
    howToUse: localizedList(
      ["손바닥에 2-3방울을 덜어 체온으로 데운 뒤 사용해 주세요.", "세럼 다음 단계에서 얼굴을 감싸듯 눌러 흡수시켜 주세요."],
      ["Warm 2-3 drops between palms.", "Press over serum as your final treatment step."],
    ),
    routineTip: localized(
      "수분 세럼 다음 단계에 사용하면 밤사이 장벽 컨디셔닝 효과를 높일 수 있습니다.",
      "Use after a hydration serum to maximize overnight recovery.",
    ),
    collectionSlugs: ["night-repair"],
    isFeatured: true,
    createdAt: "2026-01-14T10:00:00.000Z",
    rating: 4.7,
    reviewCount: 19,
  },
  {
    id: "prod_3",
    slug: "rose-quartz-roller",
    name: localized("로즈 쿼츠 롤러", "Rose Quartz Roller"),
    shortDescription: localized(
      "페이스 라인을 섬세하게 정돈하는 쿨링 마사저.",
      "A cooling massage tool for sculpted, depuffed contours.",
    ),
    description: localized(
      "쿨링 텍스처의 로즈 쿼츠가 붓기를 완화하고 스킨케어 흡수를 도와 결감 있는 피니시를 완성합니다.",
      "Cooling rose quartz helps reduce puffiness while improving product absorption.",
    ),
    category: "tool",
    skinTypes: ["dry", "oily", "combination", "normal", "sensitive"],
    concerns: ["puffiness", "texture"],
    price: 65,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDDeaMjfnRcsb-EhCZ8Jzeg-QWUApRk3zY8Vft0kc0pCGpEQ4qZkh5JLLUYhqybZVBSLLecMGW4N8HaKc8pMVuwFt1dbdFsoIndrkHaPbwCs2BIvkl6yhKpoMk9cTS4JWPiYr8LszIQ6Mh8RUPBV55GjQaMsXjQYSSpdDfunvTaS1iDflAV9UGLllK1e348CXMU5MO--dyXahtPBF2CZOymVo9gmztr5AECArz-vTJ2LSI3Wo8M_4aSElpHDMz6HL7B18EpCgGspGE",
      "/roller.png",
    ],
    ingredients: [
      {
        name: localized("로즈 쿼츠", "Rose Quartz"),
        benefit: localized("자연스러운 쿨링감으로 피부를 빠르게 진정시킵니다.", "Naturally cool stone that quickly soothes skin."),
      },
    ],
    howToUse: localizedList(
      ["턱선에서 광대 방향으로 위로 롤링해 주세요.", "세럼 도포 후 2-3분간 부드럽게 마사지해 주세요."],
      ["Roll upward from jawline to cheekbones.", "Massage for 2-3 minutes after serum."],
    ),
    routineTip: localized(
      "냉장 보관 후 사용하면 붓기 완화와 선명한 결감 표현에 더욱 효과적입니다.",
      "Chill before use for extra depuffing and contour definition.",
    ),
    collectionSlugs: ["ritual-essentials"],
    isFeatured: false,
    createdAt: "2025-12-20T10:00:00.000Z",
    rating: 4.6,
    reviewCount: 28,
  },
  {
    id: "prod_4",
    slug: "velvet-cloud-cream",
    name: localized("벨벳 클라우드 크림", "Velvet Cloud Cream"),
    shortDescription: localized(
      "하루 종일 편안한 보호막을 형성하는 배리어 모이스처라이저.",
      "A barrier-first moisturizer for all-day comfort.",
    ),
    description: localized(
      "세라마이드와 바이오 지질이 건조로 흔들린 피부 장벽을 감싸 깊고 안정적인 보습을 제공합니다.",
      "Ceramides and bio-lipids cocoon compromised skin with deep, steady hydration.",
    ),
    category: "moisturizer",
    skinTypes: ["dry", "combination", "normal", "sensitive"],
    concerns: ["hydration", "redness", "aging"],
    price: 74,
    images: [
      "/cream.png",
      "/cream1.png",
    ],
    ingredients: [
      {
        name: localized("세라마이드", "Ceramides"),
        benefit: localized("피부 장벽을 강화하고 수분 손실을 줄여줍니다.", "Strengthens the barrier and minimizes moisture loss."),
      },
      {
        name: localized("판테놀", "Panthenol"),
        benefit: localized("민감해진 피부를 부드럽게 진정시켜 편안함을 유지합니다.", "Calms sensitivity and restores comfort."),
      },
    ],
    howToUse: localizedList(
      ["스킨케어 마지막 단계에서 얼굴과 목에 고르게 발라 주세요.", "아침과 저녁 루틴 모두 사용 가능합니다."],
      ["Apply evenly to face and neck as the final step.", "Use in both AM and PM routines."],
    ),
    routineTip: localized(
      "건조함이 심한 날에는 오일 한 방울을 섞어 밀도감 있는 피니시를 완성해 보세요.",
      "On drier days, blend with one drop of oil for a richer finish.",
    ),
    collectionSlugs: ["ritual-essentials"],
    isFeatured: true,
    createdAt: "2026-02-01T10:00:00.000Z",
    rating: 4.9,
    reviewCount: 61,
  },
  {
    id: "prod_5",
    slug: "mineral-veil-spf50",
    name: localized("미네랄 베일 SPF50", "Mineral Veil SPF50"),
    shortDescription: localized(
      "새틴 피니시를 남기는 프리미엄 무기자차 SPF50.",
      "A mineral SPF50 veil with an elegant satin finish.",
    ),
    description: localized(
      "메이크업 전 단계에서도 들뜸 없이 밀착되는 데일리 광범위 SPF로, 피부 결을 정돈해 줍니다.",
      "A daily broad-spectrum SPF that layers seamlessly under makeup while refining skin texture.",
    ),
    category: "sunscreen",
    skinTypes: ["dry", "oily", "combination", "normal", "sensitive"],
    concerns: ["redness", "aging"],
    price: 48,
    images: [
      "/suncream.png",
      "/suncream1.png",
    ],
    ingredients: [
      {
        name: localized("징크옥사이드", "Zinc Oxide"),
        benefit: localized("UVA/UVB를 균형 있게 차단해 피부를 보호합니다.", "Balanced broad-spectrum UVA/UVB protection."),
      },
      {
        name: localized("그린티", "Green Tea"),
        benefit: localized("항산화 케어로 외부 자극으로부터 피부를 보호합니다.", "Antioxidant support against daily stressors."),
      },
    ],
    howToUse: localizedList(
      ["아침 루틴 마지막 단계에서 충분한 양을 고르게 발라 주세요.", "야외 활동 시 2시간 간격으로 덧발라 주세요."],
      ["Apply generously as the final AM step.", "Reapply every 2 hours during outdoor exposure."],
    ),
    routineTip: localized(
      "아침에는 루미너스 실크 세럼과 함께 사용하면 광채와 보호를 동시에 완성할 수 있습니다.",
      "Pair with Luminous Silk Serum in the morning for glow plus protection.",
    ),
    collectionSlugs: ["daily-defense"],
    isFeatured: false,
    createdAt: "2025-11-17T10:00:00.000Z",
    rating: 4.5,
    reviewCount: 33,
  },
  {
    id: "prod_6",
    slug: "enzyme-polish-cleanser",
    name: localized("엔자임 폴리시 클렌저", "Enzyme Polish Cleanser"),
    shortDescription: localized(
      "피부결을 섬세하게 폴리싱하는 엔자임 파우더 클렌저.",
      "An enzyme powder cleanser that refines texture without stripping.",
    ),
    description: localized(
      "물과 만나 활성화되는 효소가 묵은 각질을 부드럽게 정돈해, 매끈하고 균일한 결감을 남깁니다.",
      "Water-activated enzymes dissolve buildup and leave skin visibly smooth and even.",
    ),
    category: "cleanser",
    skinTypes: ["oily", "combination", "normal"],
    concerns: ["texture", "dullness", "pores"],
    price: 52,
    images: [
      "/form.png",
      "/form1.png",
    ],
    ingredients: [
      {
        name: localized("파파야 효소", "Papaya Enzyme"),
        benefit: localized("부드럽게 각질을 케어해 피부결을 매끈하게 정돈합니다.", "Gentle resurfacing for smoother texture."),
      },
      {
        name: localized("라이스 파우더", "Rice Powder"),
        benefit: localized("자극 부담 없이 미세한 폴리싱 효과를 더해줍니다.", "Soft polishing with a smooth finish."),
      },
    ],
    howToUse: localizedList(
      ["적당량을 물과 섞어 크리미한 거품을 만들어 주세요.", "30초간 부드럽게 마사지한 뒤 미온수로 헹궈 주세요."],
      ["Mix with water to create a creamy foam.", "Massage for 30 seconds, then rinse with lukewarm water."],
    ),
    routineTip: localized(
      "주 3-4회 저녁 루틴에 사용하면 피부결 정돈 효과를 높일 수 있습니다.",
      "Use 3-4 evenings per week for enhanced texture refinement.",
    ),
    collectionSlugs: ["daily-defense"],
    isFeatured: false,
    createdAt: "2025-10-08T10:00:00.000Z",
    rating: 4.4,
    reviewCount: 22,
  },
  {
    id: "prod_7",
    slug: "bio-cellulose-mask",
    name: localized("바이오 셀룰로오스 마스크", "Bio Cellulose Mask"),
    shortDescription: localized(
      "즉각적인 윤광과 수분 볼륨을 채워주는 집중 케어 마스크.",
      "An intensive mask that delivers instant glow and plumped hydration.",
    ),
    description: localized(
      "얼굴 곡선에 밀착되는 바이오 셀룰로오스 시트가 멀티 히알루론산 에센스를 고르게 전달합니다.",
      "A contour-hugging bio-cellulose sheet infuses skin with multi-weight hyaluronic essence.",
    ),
    category: "mask",
    skinTypes: ["dry", "combination", "normal", "sensitive"],
    concerns: ["hydration", "dullness", "redness"],
    price: 28,
    freeShipping: false,
    images: [
      "/mask.png",
      "/mask1.png",
    ],
    ingredients: [
      {
        name: localized("멀티 히알루론산", "Multi HA"),
        benefit: localized("즉각적인 수분 볼륨과 탄탄한 결감을 제공합니다.", "Instant plumping hydration and bounce."),
      },
      {
        name: localized("센텔라", "Centella"),
        benefit: localized("붉은기와 자극을 완화해 편안한 컨디션을 유지합니다.", "Soothes redness and visible irritation."),
      },
    ],
    howToUse: localizedList(
      ["세안 후 토너 단계 다음, 피부에 15분간 밀착시켜 주세요.", "남은 에센스는 가볍게 두드려 흡수시켜 주세요."],
      ["Apply to cleansed, toned skin for 15 minutes.", "Pat in remaining essence until absorbed."],
    ),
    routineTip: localized(
      "중요한 일정 전 사용하면 메이크업 베이스가 균일하고 매끈하게 정돈됩니다.",
      "Use before events for a smoother, more even makeup base.",
    ),
    collectionSlugs: ["night-repair"],
    isFeatured: false,
    createdAt: "2026-02-11T10:00:00.000Z",
    rating: 4.8,
    reviewCount: 15,
  },
  {
    id: "prod_8",
    slug: "clarity-gel-cream",
    name: localized("클래리티 젤 크림", "Clarity Gel Cream"),
    shortDescription: localized(
      "번들거림을 섬세하게 다스리는 유수분 밸런싱 젤 크림.",
      "A balancing gel cream for clearer, shine-controlled skin.",
    ),
    description: localized(
      "빠르게 흡수되는 젤 제형이 과도한 유분은 조절하고 필요한 수분은 유지해, 피부 밸런스를 편안하게 맞춰줍니다.",
      "A fast-absorbing gel texture controls excess oil while preserving hydration balance.",
    ),
    category: "moisturizer",
    skinTypes: ["oily", "combination", "sensitive"],
    concerns: ["acne", "pores", "redness"],
    price: 58,
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0Stt_m5xrB6B08-IgBeMkcHG1nPKt0CVTAq15anCdad9jctGNvNiWpUPiZXVmYGHRZ7VDFJFeTI7NeuuQPC_-_KZKwhuFkSHVWK2ZMKHJvN0CvQYRFbINWthuiNUMIHtdrswZlGfyQRANxDwzq115d2zp_5TQ7oqbhG5I1WLnd2ESIHHj4xpDTFqCT8wGQSNpPMJdyfIcPVApQ0tOtxHOYeecy-F27Z_e2Iaai_RdZpU-bdSuFUQA8gfTLZ6mV4q803R37yAAmfA",
      "/cream2.png",
    ],
    ingredients: [
      {
        name: localized("아젤라익 콤플렉스", "Azelaic Complex"),
        benefit: localized("피부 톤을 균일하게 정돈하고 트러블 흔적 완화에 도움을 줍니다.", "Visibly evens tone and improves post-breakout marks."),
      },
      {
        name: localized("징크 PCA", "Zinc PCA"),
        benefit: localized("과도한 유분을 조절해 피부 밸런스를 안정적으로 유지합니다.", "Helps regulate sebum for a balanced finish."),
      },
    ],
    howToUse: localizedList(
      ["아침과 저녁, 세안 후 피부에 고르게 펴 발라 주세요.", "눈가를 피해 사용해 주세요."],
      ["Apply evenly to clean skin morning and night.", "Avoid direct eye area."],
    ),
    routineTip: localized(
      "엔자임 폴리시 클렌저와 함께 사용하면 피부결과 유분 밸런스 개선에 도움이 됩니다.",
      "Pair with Enzyme Polish Cleanser for smoother texture and better balance.",
    ),
    collectionSlugs: ["daily-defense"],
    isFeatured: false,
    createdAt: "2026-01-25T10:00:00.000Z",
    rating: 4.3,
    reviewCount: 12,
  },
];

const collections: Collection[] = [
  {
    id: "col_1",
    slug: "ritual-essentials",
    name: localized("리추얼 에센셜", "Ritual Essentials"),
    description: localized(
      "아침과 저녁 루틴의 완성도를 높여주는 시그니처 에센셜 세트.",
      "Signature essentials for a complete daily ritual.",
    ),
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMNfmrlgRK6FX_0GyLa93kIyrNdUHzpCT6JJJDqhMlDlRih_wOM0HWjdTplzroD10OjZC-rbF0FAwfTOM4s3TKyXqdQUHm1uf0Ix_AYjGigG1Yvf7IWrFehgwgGfLYcHIkM-cGcqHDyIiytxnvi9SZ_tcSmz0pN2Q5Xhe7dAh4IPlKdgHfpvc2JgdjCl4wX7pXj-KndYED9nHgwU9spRejP4K4AxA-sA_gnARZAoR7wmP1o_pcjXKcEcvl8H9OBdLbUGnNd6m18xg",
    productSlugs: ["luminous-silk-serum", "velvet-cloud-cream", "rose-quartz-roller"],
    sortOrder: 1,
  },
  {
    id: "col_2",
    slug: "night-repair",
    name: localized("나이트 리페어", "Night Repair"),
    description: localized(
      "수면 시간 동안 피부 장벽과 결감을 정밀하게 케어하는 리페어 포뮬러.",
      "Targeted repair formulas that work while you rest.",
    ),
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDclVy48WOKbOruUtt4kSkObsqwjeOlRvqrfy8eEOUfnXEER99Z1307sHLjwwr-DXURfYapVVLADMRE5HUqrzhggY0mJiEX1R-Nmp_4_gj5O2Cya3s61BMlE0A2Wq6w0_Jw32ypJNA2S8Ca_sHkpGAByq_5QhQ4z4B9PaX73ZcxWWRafP5K7g92qqSdx9hoCrqIPRzynoVe-THy1MqENlf53o9PT8hjzojs9BC9hU9-ldkkZ3DqYaooS4NKaxsmYOtHLBXUCOdBeGs",
    productSlugs: ["luminous-silk-serum", "midnight-recovery-oil", "bio-cellulose-mask"],
    sortOrder: 2,
  },
  {
    id: "col_3",
    slug: "daily-defense",
    name: localized("데일리 디펜스", "Daily Defense"),
    description: localized(
      "가볍게 밀착되어 일상에서 편안한 보호를 완성하는 데이 루틴.",
      "Lightweight daytime defense with elegant wearability.",
    ),
    heroImage: "/collection3.png",
    productSlugs: ["mineral-veil-spf50", "enzyme-polish-cleanser", "clarity-gel-cream"],
    sortOrder: 3,
  },
];

const articles: Article[] = [
  {
    id: "art_1",
    slug: "the-art-of-evening-routine",
    title: localized("이브닝 리추얼의 정밀한 순서", "The Precision of the Evening Ritual"),
    excerpt: localized(
      "잠들기 전 5분의 정제된 루틴이 다음 날 피부 결감을 바꾸는 이유.",
      "Why five intentional minutes before bed can transform next-morning skin.",
    ),
    category: "Rituals",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlQ6DOZ3HXmtzLhHRA4bHl-ViXi_9HpcDH3UjcdFEiioTuY3A1KkhtEDAb60FxEb6VtaZXyBsiGPVt0GQ8_sxu7tm1np8YhxvRbNylSaNKpxy7U0UbjHuPVmyIAIk5J0XXzp1dryiNqV9fMY2kZN04y-VWB4hq2PJAfG3RX9m7QqErcrM0boS1TgIfz-t06s4MtUipw2YHiTlZI_kNZMRDXK8tF9q5q3V2YryOx8s-SmktjUTZZoF6XviJxWUSRrVprBcYz2jRjsY",
    content: localized(
      "<p>이브닝 케어의 핵심은 단계 수가 아니라 순서입니다. 충분한 클렌징 후 목적성 있는 리페어를 더하고, 마지막에 수분을 밀봉해 밤사이 회복을 유도하세요.</p><p>액티브는 하나에 집중하고 진정 레이어로 균형을 맞추면 피부 장벽 부담을 줄이면서도 선명한 변화를 경험할 수 있습니다.</p>",
      "<p>Evening care is defined by sequence, not excess. Cleanse thoroughly, apply one targeted treatment, then seal in hydration for overnight recovery.</p><p>Focusing on a single active and balancing with comforting layers improves performance while respecting barrier integrity.</p>",
    ),
    relatedProductSlugs: ["luminous-silk-serum", "midnight-recovery-oil", "bio-cellulose-mask"],
    publishedAt: "2026-02-05T10:00:00.000Z",
  },
  {
    id: "art_2",
    slug: "ingredient-forecast-2026",
    title: localized("2026 성분 인사이트 리포트", "Ingredient Forecast 2026"),
    excerpt: localized(
      "캡슐화 항산화 성분부터 저자극 레티노이드 대체 성분까지, 프리미엄 포뮬러의 기준을 읽습니다.",
      "From encapsulated antioxidants to low-irritation retinoid alternatives, the next premium standard is taking shape.",
    ),
    category: "Ingredients",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCRM5rkpvp_iK42ffBNDsudLAz_20eLIdAuXEH8JsWUQJCMrkd6oCxK8pvr_CGGilh3EMm5fqIB0oiLmGWssBpc0zEWv0ZDUdmocg1t2rMb35Qb2gJsRIzmv6hkVB_uAf85MRFU23KvzmKdBjYix7xUydYgit-iBziynppgb-S1DQLPbx-tQUabW8pWOBcBrh_xZDVk5etDRJYUrBQbmnzf8_38Y3xpR436kS8u67iULcCfVVHrAYg4DQj8Ms6fLRl5VQJEKdc7xF0",
    content: localized(
      "<p>스킨케어 혁신은 강한 효능보다 정제된 균형으로 이동하고 있습니다. 보습, 브라이트닝, 진정을 동시에 설계하는 다중 작용 성분이 하이엔드 기준을 새롭게 정의합니다.</p>",
      "<p>Skincare innovation is moving from intensity to precision. Multi-pathway ingredients that hydrate, brighten, and calm in one formula are redefining modern luxury performance.</p>",
    ),
    relatedProductSlugs: ["luminous-silk-serum", "clarity-gel-cream"],
    publishedAt: "2026-01-21T10:00:00.000Z",
  },
  {
    id: "art_3",
    slug: "minimal-morning-system",
    title: localized("미니멀 모닝 시스템", "The Minimal Morning System"),
    excerpt: localized("세 가지 단계로 완성하는 정돈된 모닝 루틴.", "Three steps. One polished complexion."),
    category: "Guides",
    coverImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDMNfmrlgRK6FX_0GyLa93kIyrNdUHzpCT6JJJDqhMlDlRih_wOM0HWjdTplzroD10OjZC-rbF0FAwfTOM4s3TKyXqdQUHm1uf0Ix_AYjGigG1Yvf7IWrFehgwgGfLYcHIkM-cGcqHDyIiytxnvi9SZ_tcSmz0pN2Q5Xhe7dAh4IPlKdgHfpvc2JgdjCl4wX7pXj-KndYED9nHgwU9spRejP4K4AxA-sA_gnARZAoR7wmP1o_pcjXKcEcvl8H9OBdLbUGnNd6m18xg",
    content: localized(
      "<p>클렌징, 집중 케어, 보호. 이 세 단계만으로도 선택 피로를 줄이고 하루 종일 균형 잡힌 피부 컨디션을 유지할 수 있습니다.</p>",
      "<p>Cleanse, treat, protect. This focused triad minimizes decision fatigue while preserving skin balance all day.</p>",
    ),
    relatedProductSlugs: ["enzyme-polish-cleanser", "luminous-silk-serum", "mineral-veil-spf50"],
    publishedAt: "2025-12-30T10:00:00.000Z",
  },
];

const createSeedAddress = (
  id: string,
  label: string,
  recipient: string,
  phone: string,
  line1: string,
  city: string,
  state: string,
  zip: string,
  line2?: string,
): Address => ({
  id,
  label,
  recipient,
  phone,
  line1,
  line2,
  city,
  state,
  zip,
  country: "US",
  isDefault: true,
});

const users: User[] = [
  {
    id: "usr_admin",
    email: "admin@portfolio.com",
    password: "Admin123!",
    name: "Portfolio Admin",
    role: "admin",
    wishlist: [],
    addresses: [],
    createdAt: "2025-12-01T10:00:00.000Z",
  },
  {
    id: "usr_1",
    email: "user@portfolio.com",
    password: "User123!",
    name: "Soojin Kim",
    role: "user",
    wishlist: ["luminous-silk-serum", "velvet-cloud-cream"],
    addresses: [createSeedAddress("addr_1", "Home", "Soojin Kim", "310-555-0149", "2458 Sunset Blvd", "Los Angeles", "CA", "90026")],
    createdAt: "2026-01-05T10:00:00.000Z",
  },
  {
    id: "usr_2",
    email: "guest@portfolio.com",
    password: "Guest123!",
    name: "Mina Park",
    role: "user",
    wishlist: ["bio-cellulose-mask"],
    addresses: [createSeedAddress("addr_2_home", "Home", "Mina Park", "213-555-0115", "84 Melrose Ave", "Los Angeles", "CA", "90038")],
    createdAt: "2026-01-20T10:00:00.000Z",
  },
  {
    id: "usr_3",
    email: "alex.johnson@portfolio.com",
    password: "User123!",
    name: "Alex Johnson",
    role: "user",
    wishlist: ["midnight-recovery-oil", "rose-quartz-roller"],
    addresses: [createSeedAddress("addr_3_home", "Home", "Alex Johnson", "646-555-0103", "18 7th Ave", "New York", "NY", "10011")],
    createdAt: "2025-12-22T09:40:00.000Z",
  },
  {
    id: "usr_4",
    email: "hannah.lee@portfolio.com",
    password: "User123!",
    name: "Hannah Lee",
    role: "user",
    wishlist: ["velvet-cloud-cream"],
    addresses: [createSeedAddress("addr_4_home", "Home", "Hannah Lee", "323-555-0190", "905 Beverly Blvd", "Los Angeles", "CA", "90048")],
    createdAt: "2025-12-29T14:20:00.000Z",
  },
  {
    id: "usr_5",
    email: "daniel.choi@portfolio.com",
    password: "User123!",
    name: "Daniel Choi",
    role: "user",
    wishlist: ["enzyme-polish-cleanser", "clarity-gel-cream"],
    addresses: [createSeedAddress("addr_5_home", "Home", "Daniel Choi", "206-555-0172", "112 Pine St", "Seattle", "WA", "98101")],
    createdAt: "2026-01-02T11:10:00.000Z",
  },
  {
    id: "usr_6",
    email: "emma.wilson@portfolio.com",
    password: "User123!",
    name: "Emma Wilson",
    role: "user",
    wishlist: ["mineral-veil-spf50"],
    addresses: [createSeedAddress("addr_6_home", "Home", "Emma Wilson", "512-555-0134", "230 Congress Ave", "Austin", "TX", "78701")],
    createdAt: "2026-01-08T17:45:00.000Z",
  },
  {
    id: "usr_7",
    email: "grace.park@portfolio.com",
    password: "User123!",
    name: "Grace Park",
    role: "user",
    wishlist: ["luminous-silk-serum", "bio-cellulose-mask"],
    addresses: [createSeedAddress("addr_7_home", "Home", "Grace Park", "949-555-0168", "42 Sand Canyon Ave", "Irvine", "CA", "92618")],
    createdAt: "2026-01-15T08:55:00.000Z",
  },
  {
    id: "usr_8",
    email: "ethan.kim@portfolio.com",
    password: "User123!",
    name: "Ethan Kim",
    role: "user",
    wishlist: ["mineral-veil-spf50", "velvet-cloud-cream"],
    addresses: [createSeedAddress("addr_8_home", "Home", "Ethan Kim", "201-555-0144", "90 Hudson St", "Jersey City", "NJ", "07302")],
    createdAt: "2026-01-18T12:25:00.000Z",
  },
  {
    id: "usr_9",
    email: "chloe.moon@portfolio.com",
    password: "User123!",
    name: "Chloe Moon",
    role: "user",
    wishlist: ["clarity-gel-cream"],
    addresses: [createSeedAddress("addr_9_home", "Home", "Chloe Moon", "312-555-0129", "401 N Wabash Ave", "Chicago", "IL", "60611")],
    createdAt: "2026-01-24T09:05:00.000Z",
  },
  {
    id: "usr_10",
    email: "noah.lim@portfolio.com",
    password: "User123!",
    name: "Noah Lim",
    role: "user",
    wishlist: ["enzyme-polish-cleanser", "luminous-silk-serum"],
    addresses: [createSeedAddress("addr_10_home", "Home", "Noah Lim", "619-555-0156", "701 5th Ave", "San Diego", "CA", "92101")],
    createdAt: "2026-01-30T15:35:00.000Z",
  },
  {
    id: "usr_11",
    email: "olivia.jeon@portfolio.com",
    password: "User123!",
    name: "Olivia Jeon",
    role: "user",
    wishlist: ["midnight-recovery-oil", "bio-cellulose-mask"],
    addresses: [createSeedAddress("addr_11_home", "Home", "Olivia Jeon", "425-555-0118", "600 Bellevue Way", "Bellevue", "WA", "98004")],
    createdAt: "2026-02-04T10:50:00.000Z",
  },
  {
    id: "usr_12",
    email: "james.yoo@portfolio.com",
    password: "User123!",
    name: "James Yoo",
    role: "user",
    wishlist: ["rose-quartz-roller", "velvet-cloud-cream"],
    addresses: [createSeedAddress("addr_12_home", "Home", "James Yoo", "408-555-0182", "120 S Market St", "San Jose", "CA", "95113")],
    createdAt: "2026-02-11T13:15:00.000Z",
  },
];

const reviews: Review[] = [
  {
    id: "rev_1",
    productSlug: "luminous-silk-serum",
    userId: "usr_1",
    userName: "Soojin Kim",
    rating: 5,
    title: localized("피니시가 섬세하게 살아나요", "Refined finish"),
    body: localized(
      "흡수가 빠르고 메이크업 전 단계에서 피부 결이 고르게 정돈됩니다.",
      "Absorbs quickly and leaves skin smooth and polished under makeup.",
    ),
    approved: true,
    createdAt: "2026-02-10T10:00:00.000Z",
  },
  {
    id: "rev_2",
    productSlug: "luminous-silk-serum",
    userId: "usr_2",
    userName: "Mina Park",
    rating: 4,
    title: localized("제형 밸런스가 뛰어나요", "Excellent texture balance"),
    body: localized(
      "가볍게 밀착되면서도 보습 밀도가 충분해 재구매 의사가 높습니다.",
      "Lightweight yet deeply hydrating. Definitely repurchasing.",
    ),
    approved: true,
    createdAt: "2026-02-12T10:00:00.000Z",
  },
  {
    id: "rev_3",
    productSlug: "clarity-gel-cream",
    userId: "usr_2",
    userName: "Mina Park",
    rating: 4,
    title: localized("민감한 날에도 편안해요", "Calmed visible redness"),
    body: localized(
      "약 일주일 사용 후 붉은기가 완화되고 피부가 한층 편안해졌습니다.",
      "After about a week, visible redness looked calmer and skin felt more comfortable.",
    ),
    approved: false,
    createdAt: "2026-02-14T10:00:00.000Z",
  },
];

const inquiries: SupportInquiry[] = [
  {
    id: "inq_1",
    userId: "usr_1",
    userName: "Soojin Kim",
    userEmail: "user@portfolio.com",
    topic: "product",
    message: "Can I use Luminous Silk Serum with retinoids at night?",
    status: "new",
    adminNote: "",
    createdAt: "2026-02-18T09:30:00.000Z",
    updatedAt: "2026-02-18T09:30:00.000Z",
  },
  {
    id: "inq_2",
    userId: "usr_2",
    userName: "Mina Park",
    userEmail: "guest@portfolio.com",
    topic: "shipping",
    message: "My order says delivered but I cannot find the package in my building.",
    status: "in_progress",
    adminNote: "Carrier investigation opened. Waiting for last-mile photo proof.",
    createdAt: "2026-02-20T14:05:00.000Z",
    updatedAt: "2026-02-20T16:42:00.000Z",
  },
  {
    id: "inq_3",
    userId: "usr_3",
    userName: "Alex Johnson",
    userEmail: "alex.johnson@portfolio.com",
    topic: "membership",
    message: "Do VIP points expire if I don't place an order for two months?",
    status: "resolved",
    adminNote: "Explained annual expiration policy and bonus carryover terms.",
    createdAt: "2026-01-29T11:20:00.000Z",
    updatedAt: "2026-01-29T12:10:00.000Z",
  },
  {
    id: "inq_4",
    userId: "usr_4",
    userName: "Hannah Lee",
    userEmail: "hannah.lee@portfolio.com",
    topic: "other",
    message: "Please merge two accounts under one email if possible.",
    status: "resolved",
    adminNote: "Identity confirmed and duplicate guest account merged.",
    createdAt: "2026-02-01T08:50:00.000Z",
    updatedAt: "2026-02-01T10:25:00.000Z",
  },
  {
    id: "inq_5",
    userId: "usr_5",
    userName: "Daniel Choi",
    userEmail: "daniel.choi@portfolio.com",
    topic: "shipping",
    message: "Can I change the shipping address after payment for order ord_1017?",
    status: "new",
    adminNote: "",
    createdAt: "2026-03-02T09:10:00.000Z",
    updatedAt: "2026-03-02T09:10:00.000Z",
  },
  {
    id: "inq_6",
    userId: "usr_6",
    userName: "Emma Wilson",
    userEmail: "emma.wilson@portfolio.com",
    topic: "product",
    message: "Is Midnight Recovery Oil safe to use together with an AHA toner?",
    status: "resolved",
    adminNote: "Shared cadence guide and advised alternating nights.",
    createdAt: "2026-02-12T18:35:00.000Z",
    updatedAt: "2026-02-12T19:18:00.000Z",
  },
  {
    id: "inq_7",
    userId: "usr_7",
    userName: "Grace Park",
    userEmail: "grace.park@portfolio.com",
    topic: "other",
    message: "Please issue a tax invoice for my January business purchases.",
    status: "in_progress",
    adminNote: "Finance team requested company registration document.",
    createdAt: "2026-02-25T07:55:00.000Z",
    updatedAt: "2026-02-25T13:04:00.000Z",
  },
  {
    id: "inq_8",
    userId: "usr_8",
    userName: "Ethan Kim",
    userEmail: "ethan.kim@portfolio.com",
    topic: "shipping",
    message: "How long does expedited shipping take to New Jersey?",
    status: "resolved",
    adminNote: "Provided ETA and same-day cutoff for express lanes.",
    createdAt: "2026-02-07T10:18:00.000Z",
    updatedAt: "2026-02-07T10:41:00.000Z",
  },
  {
    id: "inq_9",
    userId: "usr_9",
    userName: "Chloe Moon",
    userEmail: "chloe.moon@portfolio.com",
    topic: "product",
    message: "Which product should I start with for enlarged pores and redness?",
    status: "new",
    adminNote: "",
    createdAt: "2026-03-01T17:28:00.000Z",
    updatedAt: "2026-03-01T17:28:00.000Z",
  },
  {
    id: "inq_10",
    userId: "usr_10",
    userName: "Noah Lim",
    userEmail: "noah.lim@portfolio.com",
    topic: "membership",
    message: "My welcome coupon disappeared before checkout. Can it be restored?",
    status: "resolved",
    adminNote: "Coupon re-issued with 7-day extension.",
    createdAt: "2026-02-11T15:12:00.000Z",
    updatedAt: "2026-02-11T15:47:00.000Z",
  },
  {
    id: "inq_11",
    userId: "usr_11",
    userName: "Olivia Jeon",
    userEmail: "olivia.jeon@portfolio.com",
    topic: "shipping",
    message: "Can my recurring delivery date be changed from Friday to Monday?",
    status: "in_progress",
    adminNote: "Subscription schedule update queued for next billing cycle.",
    createdAt: "2026-02-27T09:42:00.000Z",
    updatedAt: "2026-02-27T10:09:00.000Z",
  },
  {
    id: "inq_12",
    userId: "usr_12",
    userName: "James Yoo",
    userEmail: "james.yoo@portfolio.com",
    topic: "other",
    message: "Please remove my old office address from the account profile.",
    status: "resolved",
    adminNote: "Legacy address removed and defaults updated.",
    createdAt: "2026-01-23T11:05:00.000Z",
    updatedAt: "2026-01-23T11:26:00.000Z",
  },
  {
    id: "inq_13",
    userId: "usr_3",
    userName: "Alex Johnson",
    userEmail: "alex.johnson@portfolio.com",
    topic: "product",
    message: "Can I use Bio Cellulose Mask right after enzyme cleansing?",
    status: "resolved",
    adminNote: "Confirmed compatibility and recommended 2-3 uses per week.",
    createdAt: "2026-02-14T20:11:00.000Z",
    updatedAt: "2026-02-14T20:43:00.000Z",
  },
  {
    id: "inq_14",
    userId: "usr_6",
    userName: "Emma Wilson",
    userEmail: "emma.wilson@portfolio.com",
    topic: "membership",
    message: "Could you apply points to my latest order before it ships?",
    status: "new",
    adminNote: "",
    createdAt: "2026-03-03T10:30:00.000Z",
    updatedAt: "2026-03-03T10:30:00.000Z",
  },
];

const orderPriceBySlug = new Map(products.map((product) => [product.slug, product.price]));
const userDefaultAddressById = new Map(
  users
    .filter((user) => user.role === "user")
    .map((user) => [user.id, user.addresses[0]] as const)
    .filter((entry): entry is readonly [string, Address] => Boolean(entry[1])),
);

const roundCurrency = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const resolveOrderSubtotal = (items: CartItem[]): number => {
  const subtotal = items.reduce((sum, item) => {
    const unitPrice = orderPriceBySlug.get(item.productSlug) ?? 0;
    return sum + unitPrice * Math.max(1, item.quantity);
  }, 0);
  return roundCurrency(subtotal);
};

const resolveCouponDiscount = (subtotal: number, couponCode?: string): number => {
  if (!couponCode) {
    return 0;
  }
  if (couponCode === "WELCOME10") {
    return subtotal >= 60 ? roundCurrency(subtotal * 0.1) : 0;
  }
  if (couponCode === "GLOW20") {
    return subtotal >= 150 ? 20 : 0;
  }
  return 0;
};

const resolveOrderAddress = (userId: string, orderId: string): Address => {
  const base = userDefaultAddressById.get(userId);
  if (!base) {
    return createSeedAddress(`addr_${orderId}`, "Home", "Guest Customer", "000-000-0000", "100 Market St", "San Francisco", "CA", "94105");
  }
  return {
    ...base,
    id: `addr_${orderId}`,
  };
};

interface SeedOrderInput {
  id: string;
  userId: string;
  items: CartItem[];
  couponCode?: string;
  discount?: number;
  paymentStatus: Order["paymentStatus"];
  status: Order["status"];
  trackingNumber?: string;
  refundRequested?: boolean;
  createdAt: string;
}

const buildSeedOrder = (input: SeedOrderInput): Order => {
  const subtotal = resolveOrderSubtotal(input.items);
  const discount = roundCurrency(input.discount ?? resolveCouponDiscount(subtotal, input.couponCode));
  const total = roundCurrency(Math.max(0, subtotal - discount));
  const hasTracking = input.status === "shipped" || input.status === "delivered";

  return {
    id: input.id,
    userId: input.userId,
    items: input.items,
    couponCode: input.couponCode,
    subtotal,
    discount,
    total,
    paymentStatus: input.paymentStatus,
    status: input.status,
    trackingNumber: hasTracking ? input.trackingNumber ?? `TRK${input.id.replace("ord_", "").padStart(8, "0")}` : "",
    refundRequested: input.refundRequested ?? false,
    shippingAddress: resolveOrderAddress(input.userId, input.id),
    createdAt: input.createdAt,
  };
};

const seedOrderInputs: SeedOrderInput[] = [
  {
    id: "ord_1001",
    userId: "usr_1",
    items: [
      { productSlug: "luminous-silk-serum", quantity: 1 },
      { productSlug: "velvet-cloud-cream", quantity: 1 },
    ],
    couponCode: "WELCOME10",
    paymentStatus: "paid",
    status: "processing",
    createdAt: "2026-02-15T12:00:00.000Z",
  },
  {
    id: "ord_1002",
    userId: "usr_2",
    items: [{ productSlug: "bio-cellulose-mask", quantity: 2 }],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-02-18T10:28:00.000Z",
  },
  {
    id: "ord_1003",
    userId: "usr_3",
    items: [
      { productSlug: "velvet-cloud-cream", quantity: 1 },
      { productSlug: "mineral-veil-spf50", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "shipped",
    createdAt: "2026-02-19T14:12:00.000Z",
  },
  {
    id: "ord_1004",
    userId: "usr_4",
    items: [
      { productSlug: "midnight-recovery-oil", quantity: 1 },
      { productSlug: "luminous-silk-serum", quantity: 1 },
    ],
    couponCode: "GLOW20",
    paymentStatus: "paid",
    status: "cancelled",
    refundRequested: true,
    createdAt: "2026-02-20T09:43:00.000Z",
  },
  {
    id: "ord_1005",
    userId: "usr_5",
    items: [{ productSlug: "luminous-silk-serum", quantity: 1 }],
    paymentStatus: "pending",
    status: "pending",
    createdAt: "2026-02-21T18:05:00.000Z",
  },
  {
    id: "ord_1006",
    userId: "usr_6",
    items: [
      { productSlug: "midnight-recovery-oil", quantity: 1 },
      { productSlug: "bio-cellulose-mask", quantity: 1 },
    ],
    couponCode: "WELCOME10",
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-02-22T11:37:00.000Z",
  },
  {
    id: "ord_1007",
    userId: "usr_7",
    items: [
      { productSlug: "clarity-gel-cream", quantity: 1 },
      { productSlug: "enzyme-polish-cleanser", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "processing",
    createdAt: "2026-02-23T13:12:00.000Z",
  },
  {
    id: "ord_1008",
    userId: "usr_8",
    items: [
      { productSlug: "luminous-silk-serum", quantity: 1 },
      { productSlug: "bio-cellulose-mask", quantity: 1 },
      { productSlug: "rose-quartz-roller", quantity: 1 },
    ],
    couponCode: "GLOW20",
    paymentStatus: "paid",
    status: "shipped",
    createdAt: "2026-02-24T16:54:00.000Z",
  },
  {
    id: "ord_1009",
    userId: "usr_9",
    items: [{ productSlug: "mineral-veil-spf50", quantity: 2 }],
    paymentStatus: "pending",
    status: "pending",
    createdAt: "2026-02-24T19:06:00.000Z",
  },
  {
    id: "ord_1010",
    userId: "usr_10",
    items: [{ productSlug: "velvet-cloud-cream", quantity: 2 }],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-02-25T08:24:00.000Z",
  },
  {
    id: "ord_1011",
    userId: "usr_11",
    items: [
      { productSlug: "luminous-silk-serum", quantity: 1 },
      { productSlug: "velvet-cloud-cream", quantity: 1 },
      { productSlug: "mineral-veil-spf50", quantity: 1 },
    ],
    couponCode: "GLOW20",
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-02-26T15:45:00.000Z",
  },
  {
    id: "ord_1012",
    userId: "usr_12",
    items: [
      { productSlug: "enzyme-polish-cleanser", quantity: 1 },
      { productSlug: "clarity-gel-cream", quantity: 1 },
      { productSlug: "bio-cellulose-mask", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "processing",
    createdAt: "2026-02-27T10:58:00.000Z",
  },
  {
    id: "ord_1013",
    userId: "usr_3",
    items: [
      { productSlug: "luminous-silk-serum", quantity: 1 },
      { productSlug: "midnight-recovery-oil", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "shipped",
    createdAt: "2026-02-28T17:20:00.000Z",
  },
  {
    id: "ord_1014",
    userId: "usr_1",
    items: [{ productSlug: "bio-cellulose-mask", quantity: 1 }],
    paymentStatus: "pending",
    status: "pending",
    createdAt: "2026-03-01T09:52:00.000Z",
  },
  {
    id: "ord_1015",
    userId: "usr_2",
    items: [
      { productSlug: "rose-quartz-roller", quantity: 1 },
      { productSlug: "bio-cellulose-mask", quantity: 2 },
    ],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-03-01T14:16:00.000Z",
  },
  {
    id: "ord_1016",
    userId: "usr_4",
    items: [
      { productSlug: "velvet-cloud-cream", quantity: 1 },
      { productSlug: "clarity-gel-cream", quantity: 1 },
      { productSlug: "mineral-veil-spf50", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "processing",
    createdAt: "2026-03-02T12:08:00.000Z",
  },
  {
    id: "ord_1017",
    userId: "usr_5",
    items: [{ productSlug: "midnight-recovery-oil", quantity: 1 }],
    paymentStatus: "paid",
    status: "cancelled",
    refundRequested: true,
    createdAt: "2026-03-02T16:41:00.000Z",
  },
  {
    id: "ord_1018",
    userId: "usr_6",
    items: [
      { productSlug: "luminous-silk-serum", quantity: 1 },
      { productSlug: "bio-cellulose-mask", quantity: 1 },
      { productSlug: "mineral-veil-spf50", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "shipped",
    createdAt: "2026-03-03T11:12:00.000Z",
  },
  {
    id: "ord_1019",
    userId: "usr_7",
    items: [
      { productSlug: "mineral-veil-spf50", quantity: 1 },
      { productSlug: "enzyme-polish-cleanser", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-01-12T10:04:00.000Z",
  },
  {
    id: "ord_1020",
    userId: "usr_8",
    items: [
      { productSlug: "velvet-cloud-cream", quantity: 1 },
      { productSlug: "midnight-recovery-oil", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-01-16T15:29:00.000Z",
  },
  {
    id: "ord_1021",
    userId: "usr_9",
    items: [{ productSlug: "clarity-gel-cream", quantity: 2 }],
    paymentStatus: "paid",
    status: "shipped",
    createdAt: "2026-01-21T13:44:00.000Z",
  },
  {
    id: "ord_1022",
    userId: "usr_10",
    items: [{ productSlug: "luminous-silk-serum", quantity: 1 }],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-01-28T09:17:00.000Z",
  },
  {
    id: "ord_1023",
    userId: "usr_11",
    items: [{ productSlug: "bio-cellulose-mask", quantity: 3 }],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-01-31T19:34:00.000Z",
  },
  {
    id: "ord_1024",
    userId: "usr_12",
    items: [
      { productSlug: "rose-quartz-roller", quantity: 1 },
      { productSlug: "velvet-cloud-cream", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "processing",
    createdAt: "2026-02-05T07:58:00.000Z",
  },
  {
    id: "ord_1025",
    userId: "usr_1",
    items: [
      { productSlug: "luminous-silk-serum", quantity: 1 },
      { productSlug: "midnight-recovery-oil", quantity: 1 },
      { productSlug: "velvet-cloud-cream", quantity: 1 },
    ],
    couponCode: "GLOW20",
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2025-12-19T16:18:00.000Z",
  },
  {
    id: "ord_1026",
    userId: "usr_2",
    items: [
      { productSlug: "enzyme-polish-cleanser", quantity: 1 },
      { productSlug: "mineral-veil-spf50", quantity: 1 },
      { productSlug: "clarity-gel-cream", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2025-12-27T11:06:00.000Z",
  },
  {
    id: "ord_1027",
    userId: "usr_6",
    items: [
      { productSlug: "bio-cellulose-mask", quantity: 2 },
      { productSlug: "luminous-silk-serum", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-02-10T18:41:00.000Z",
  },
  {
    id: "ord_1028",
    userId: "usr_3",
    items: [{ productSlug: "velvet-cloud-cream", quantity: 1 }],
    paymentStatus: "pending",
    status: "pending",
    createdAt: "2026-03-03T16:53:00.000Z",
  },
  {
    id: "ord_1029",
    userId: "usr_4",
    items: [
      { productSlug: "luminous-silk-serum", quantity: 1 },
      { productSlug: "rose-quartz-roller", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "processing",
    createdAt: "2026-03-04T09:21:00.000Z",
  },
  {
    id: "ord_1030",
    userId: "usr_8",
    items: [
      { productSlug: "bio-cellulose-mask", quantity: 1 },
      { productSlug: "clarity-gel-cream", quantity: 1 },
    ],
    paymentStatus: "paid",
    status: "delivered",
    createdAt: "2026-03-04T11:02:00.000Z",
  },
];

const orders: Order[] = seedOrderInputs
  .map((entry) => buildSeedOrder(entry))
  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

const seedProductViewsBySlug: Record<string, number> = {
  "luminous-silk-serum": 4360,
  "midnight-recovery-oil": 1785,
  "rose-quartz-roller": 1320,
  "velvet-cloud-cream": 4025,
  "mineral-veil-spf50": 2690,
  "enzyme-polish-cleanser": 2410,
  "bio-cellulose-mask": 3890,
  "clarity-gel-cream": 2125,
};

const coupons: Coupon[] = [
  {
    id: "cp_1",
    code: "WELCOME10",
    type: "percent",
    value: 10,
    minSubtotal: 60,
    active: true,
    expiresAt: "2027-01-01T00:00:00.000Z",
  },
  {
    id: "cp_2",
    code: "GLOW20",
    type: "fixed",
    value: 20,
    minSubtotal: 150,
    active: true,
    expiresAt: "2026-12-31T00:00:00.000Z",
  },
];

const banners: Banner[] = [
  {
    id: "bn_1",
    key: "hero",
    type: "image",
    url: "/Hero.png",
    headline: "The New Standard",
    subheadline: "Refined radiance for the modern ritual.",
    ctaText: "Explore the Edit",
    ctaHref: "/collections",
    active: true,
  },
  {
    id: "bn_2",
    key: "secondary",
    type: "video",
    url: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    headline: "The Ritual of Balance",
    subheadline: "Calm formulas. Visible refinement.",
    ctaText: "Read the Philosophy",
    ctaHref: "/about",
    active: true,
  },
];

export const createSeedDb = (): StoreDB => ({
  schemaVersion: 1,
  products,
  collections,
  articles,
  users,
  reviews,
  inquiries,
  orders,
  coupons,
  banners,
  settings: {
    storeName: "Portfolio",
    supportEmail: "support@portfolio.com",
    currency: "USD",
    shippingFlat: 8,
    freeShippingThreshold: 120,
    taxRate: 0.08,
  },
  analytics: {
    productViewsBySlug: seedProductViewsBySlug,
  },
  cartByUser: {
    guest: [],
    usr_1: [{ productSlug: "bio-cellulose-mask", quantity: 1 }],
    usr_2: [{ productSlug: "velvet-cloud-cream", quantity: 1 }],
    usr_7: [{ productSlug: "luminous-silk-serum", quantity: 1 }, { productSlug: "mineral-veil-spf50", quantity: 1 }],
    usr_10: [{ productSlug: "enzyme-polish-cleanser", quantity: 1 }],
  },
  couponByUser: {},
});

export const createSeedSession = (): SessionState => ({
  userId: null,
});
