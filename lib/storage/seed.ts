import type {
  Article,
  Banner,
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
    compareAtPrice: 98,
    badge: "best",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCR0vGcTkTddM2D3DEO5q95EHs01I0pqK2QD5k3nO1IrXc7VW-Nz-4Y5nIKAUozzku1j_bO7W5dLXAKGcto1ez0r7DFYBbd8DzFGioydDxlJ56NR6TaxbzmUfMPlzl3lYjNmWCVDsBPwjrKpLoKtSZDgRDx89cCn8QR-stvf1OdP4NlxFzPk4eAOopAXZtWSzSn1HO8mefThHkteDV1Z6OELjb28ebvwE8KRcP3HNNUk8cmRS6Z0dTpq2xTsC3caKA0vTNlgdpwTi0",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDjV1lSFnrXXHGuwpSPXJpx6mtRyfI6TWwIHzcdIa8KcdnP6913gCofSYchtwp-qBmGodmbTiVBX0SyBO0UINbaXpqaB31dPutjpeZra3MFfVuiP_sJ4yvUttXp7qrmDv7cDs-OrGFwPeCYkvfucQ_IZNwrRtd8R2a__d2y7DFJPDeFwPMKBUrXZf0vjuGa2zZOb54XYMXUgKGeH9-5KQWCOnYXszcVIeBq-nkUPdhvDmGNbgord205N1b2AbRI3PeOGirc3OmwZrY",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAt5mogCIe_VIZOkv4hiNN8EF5ElJ9kx4DNdC_McMEoEo1aYKWOUWxlzoaCn3iZyLgyQgwOy-EaUoHfehQ9qTG4ztN9gngGrbTPO1O2KcGwuXJA7NRiOhfSG8eTdTZJiSOAMPqGij7p9JuYIMOJ14cTIcwzZQoSjzv6vKQ_yKm2beuHU1Mfus89V09GuZky_b9FBHByyXRiKo0TteIRuLRlwuDj6cqzOpKR8-Jks7xqRyj6aJ4-p466IRkW1kb9GzbLRphjAQR28kg",
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB8rFCb4eSLAWGesmzQsJof9VGrcq6ERudpGqWqeBUNVHSR4Iu9f3n06QyE_jp4I0qE3RmqwlHwIDRR8GCsS-CUZ6rOaJAomYRDtbgkDNu9jhLM34hg-VtVEYXkD1NH9wcEjFvW9hjrcBZBZaKAkRq8NWN0pV9Kee4p8HWkdC2kw8ZVWEjP-VOjB732bogXlQx8KukHn0faV14PzbCBlETcA-Klm2PgTbVkD7BhvZ5L6NqyKFWGZbQYvE73W7bpKBZILGqfIjAr5To",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCYq3sBwemj9sF7Zm7PA1FpwFRgUC_XP_dr2XWLg51lXte2cJs37EQt1ycq2TKQV8eYMEN-VADENltqbl-LdRylSnh_ty8j9eTFroj929bK_JRGG2H2fO8YkUZpDKeUUGQrMpczpLauVididFF0yv9WGeH-Di7Nyts5ZzfTB9kVvq2MFR7rbGpJ02CFFqXUzJmk3L4KN7VP4eE7bI8_xfkwp7DKBVCxZ6WqdQinYoiV3AXErZyha9smFV8Qbefb3YfXe-wPwqKTN1U",
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDclVy48WOKbOruUtt4kSkObsqwjeOlRvqrfy8eEOUfnXEER99Z1307sHLjwwr-DXURfYapVVLADMRE5HUqrzhggY0mJiEX1R-Nmp_4_gj5O2Cya3s61BMlE0A2Wq6w0_Jw32ypJNA2S8Ca_sHkpGAByq_5QhQ4z4B9PaX73ZcxWWRafP5K7g92qqSdx9hoCrqIPRzynoVe-THy1MqENlf53o9PT8hjzojs9BC9hU9-ldkkZ3DqYaooS4NKaxsmYOtHLBXUCOdBeGs",
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA0Stt_m5xrB6B08-IgBeMkcHG1nPKt0CVTAq15anCdad9jctGNvNiWpUPiZXVmYGHRZ7VDFJFeTI7NeuuQPC_-_KZKwhuFkSHVWK2ZMKHJvN0CvQYRFbINWthuiNUMIHtdrswZlGfyQRANxDwzq115d2zp_5TQ7oqbhG5I1WLnd2ESIHHj4xpDTFqCT8wGQSNpPMJdyfIcPVApQ0tOtxHOYeecy-F27Z_e2Iaai_RdZpU-bdSuFUQA8gfTLZ6mV4q803R37yAAmfA",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBOI0qlIvTXJTYPtHNxKmphjnlGOQj95ebXPgwgvn9RpxBejuBh3C-aCVPwyWTkp8o4AuiDzhxG9KfoTZw4btG0wEx8w9w-6_qnxPBZ5qKyFORyX99YpFDUZPh1dIbkkr8AK3mN43SrJ75dl3jeVlp0iwspA22lWsglXbI7XZ1gI5sqrfzWn9lDJJsNsKqFFBENliKlap7KETE4gnqSFnYG91vCzuL5qp5EtmAk559Eq3Z3celrxRZtBKeKeOxgRzWCWMy9iJcWcyo",
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB8rFCb4eSLAWGesmzQsJof9VGrcq6ERudpGqWqeBUNVHSR4Iu9f3n06QyE_jp4I0qE3RmqwlHwIDRR8GCsS-CUZ6rOaJAomYRDtbgkDNu9jhLM34hg-VtVEYXkD1NH9wcEjFvW9hjrcBZBZaKAkRq8NWN0pV9Kee4p8HWkdC2kw8ZVWEjP-VOjB732bogXlQx8KukHn0faV14PzbCBlETcA-Klm2PgTbVkD7BhvZ5L6NqyKFWGZbQYvE73W7bpKBZILGqfIjAr5To",
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCRM5rkpvp_iK42ffBNDsudLAz_20eLIdAuXEH8JsWUQJCMrkd6oCxK8pvr_CGGilh3EMm5fqIB0oiLmGWssBpc0zEWv0ZDUdmocg1t2rMb35Qb2gJsRIzmv6hkVB_uAf85MRFU23KvzmKdBjYix7xUydYgit-iBziynppgb-S1DQLPbx-tQUabW8pWOBcBrh_xZDVk5etDRJYUrBQbmnzf8_38Y3xpR436kS8u67iULcCfVVHrAYg4DQj8Ms6fLRl5VQJEKdc7xF0",
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
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlQ6DOZ3HXmtzLhHRA4bHl-ViXi_9HpcDH3UjcdFEiioTuY3A1KkhtEDAb60FxEb6VtaZXyBsiGPVt0GQ8_sxu7tm1np8YhxvRbNylSaNKpxy7U0UbjHuPVmyIAIk5J0XXzp1dryiNqV9fMY2kZN04y-VWB4hq2PJAfG3RX9m7QqErcrM0boS1TgIfz-t06s4MtUipw2YHiTlZI_kNZMRDXK8tF9q5q3V2YryOx8s-SmktjUTZZoF6XviJxWUSRrVprBcYz2jRjsY",
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
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB8rFCb4eSLAWGesmzQsJof9VGrcq6ERudpGqWqeBUNVHSR4Iu9f3n06QyE_jp4I0qE3RmqwlHwIDRR8GCsS-CUZ6rOaJAomYRDtbgkDNu9jhLM34hg-VtVEYXkD1NH9wcEjFvW9hjrcBZBZaKAkRq8NWN0pV9Kee4p8HWkdC2kw8ZVWEjP-VOjB732bogXlQx8KukHn0faV14PzbCBlETcA-Klm2PgTbVkD7BhvZ5L6NqyKFWGZbQYvE73W7bpKBZILGqfIjAr5To",
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
    addresses: [
      {
        id: "addr_1",
        label: "Home",
        recipient: "Soojin Kim",
        phone: "310-555-0149",
        line1: "2458 Sunset Blvd",
        city: "Los Angeles",
        state: "CA",
        zip: "90026",
        country: "US",
        isDefault: true,
      },
    ],
    createdAt: "2026-01-05T10:00:00.000Z",
  },
  {
    id: "usr_2",
    email: "guest@portfolio.com",
    password: "Guest123!",
    name: "Mina Park",
    role: "user",
    wishlist: [],
    addresses: [],
    createdAt: "2026-01-20T10:00:00.000Z",
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
];

const orders: Order[] = [
  {
    id: "ord_1001",
    userId: "usr_1",
    items: [
      { productSlug: "luminous-silk-serum", quantity: 1 },
      { productSlug: "velvet-cloud-cream", quantity: 1 },
    ],
    subtotal: 159,
    discount: 15.9,
    total: 143.1,
    couponCode: "WELCOME10",
    paymentStatus: "paid",
    status: "processing",
    trackingNumber: "",
    refundRequested: false,
    shippingAddress: {
      id: "addr_order_1",
      label: "Home",
      recipient: "Soojin Kim",
      phone: "310-555-0149",
      line1: "2458 Sunset Blvd",
      city: "Los Angeles",
      state: "CA",
      zip: "90026",
      country: "US",
      isDefault: true,
    },
    createdAt: "2026-02-15T12:00:00.000Z",
  },
];

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
    ctaHref: "/shop",
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
    supportEmail: "support@portfolio4.com",
    currency: "USD",
    shippingFlat: 8,
    freeShippingThreshold: 120,
    taxRate: 0.08,
  },
  cartByUser: {
    guest: [],
    usr_1: [{ productSlug: "bio-cellulose-mask", quantity: 1 }],
  },
  couponByUser: {},
});

export const createSeedSession = (): SessionState => ({
  userId: null,
});
