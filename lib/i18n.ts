import type { Locale, LocalizedListValue, LocalizedText, LocalizedValue } from "@/lib/types";

export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_OPTIONS: Locale[] = ["ko", "en"];

export const BRAND_LABELS = {
  navShop: { ko: "스토어", en: "Shop" },
  navJournal: { ko: "저널", en: "Journal" },
  navRoutine: { ko: "루틴 진단", en: "Routine" },
  navAbout: { ko: "브랜드", en: "About" },
  navPhilosophy: { ko: "브랜드 철학", en: "Philosophy" },
  navAccount: { ko: "마이페이지", en: "Account" },
  navCart: { ko: "쇼핑백", en: "Cart" },
  navLogin: { ko: "로그인", en: "Login" },
  navRegister: { ko: "가입하기", en: "Register" },
  navWishlist: { ko: "위시리스트", en: "Wishlist" },
  navSearch: { ko: "검색", en: "Search" },
  ctaAddToBag: { ko: "쇼핑백 담기", en: "Add to Bag" },
  ctaViewAllProducts: { ko: "제품 전체보기", en: "View All Products" },
  ctaDiscover: { ko: "컬렉션 보기", en: "Discover" },
  ctaLearnMore: { ko: "더 알아보기", en: "Learn More" },
  ctaReadMore: { ko: "콘텐츠 보기", en: "Read More" },
  ctaCheckout: { ko: "주문 진행", en: "Checkout" },
  ctaApply: { ko: "적용하기", en: "Apply" },
  ctaSubmit: { ko: "등록하기", en: "Submit" },
  ctaContinue: { ko: "계속하기", en: "Continue" },
  sectionCuratedEssentials: { ko: "큐레이션 에센셜", en: "Curated Essentials" },
  sectionTheCollection: { ko: "시그니처 컬렉션", en: "The Collection" },
  sectionOurPhilosophy: { ko: "브랜드 철학", en: "OUR PHILOSOPHY" },
  sectionTheJournal: { ko: "저널", en: "THE JOURNAL" },
  sectionNotesOnBeautyAndRitual: { ko: "리추얼 에디트", en: "Notes on Beauty & Ritual" },
  badgeBest: { ko: "베스트셀러", en: "BEST" },
  badgeNew: { ko: "신상품", en: "NEW" },
  badgeSoldOut: { ko: "품절", en: "SOLD OUT" },
} as const;

const isLocalizedText = (value: unknown): value is LocalizedText => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const target = value as LocalizedText;
  return typeof target.ko === "string" && typeof target.en === "string";
};

const isLocalizedList = (value: unknown): value is { ko: string[]; en: string[] } => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const target = value as { ko?: unknown; en?: unknown };
  return Array.isArray(target.ko) && Array.isArray(target.en);
};

export const localized = (ko: string, en: string): LocalizedText => ({ ko, en });
export const localizedList = (ko: string[], en: string[]): { ko: string[]; en: string[] } => ({ ko, en });

export const resolveText = (value: LocalizedValue, locale: Locale): string => {
  if (typeof value === "string") {
    return value;
  }

  if (isLocalizedText(value)) {
    return value[locale] || value.ko || value.en;
  }

  return "";
};

export const resolveList = (value: LocalizedListValue, locale: Locale): string[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (isLocalizedList(value)) {
    return value[locale] || value.ko || value.en;
  }

  return [];
};

export const CONTENT_COPY = {
  footerTagline: {
    ko: "정제된 포뮬러와 감각적 피니시를 담은 하이엔드 스킨케어 셀렉션.",
    en: "High-performance skincare defined by restraint, precision, and sensorial elegance.",
  },
  footerHours: {
    ko: "월-금 09:00-18:00 (PST)",
    en: "Mon-Fri 09:00-18:00 PST",
  },
  aboutIntro: {
    ko: "Portfolio는 효능 중심 설계와 감각적 제형의 균형으로, 일상의 루틴을 품격 있게 재정의합니다.",
    en: "Portfolio redefines daily skincare through efficacy-led formulas and refined sensorial textures.",
  },
  aboutMissionTitle: { ko: "우리의 미션", en: "Our Mission" },
  aboutMissionBody: {
    ko: "불필요한 단계를 덜고 핵심 효능에 집중해, 매일의 스킨케어를 더 정확하고 우아하게 완성합니다.",
    en: "We remove excess and focus on what performs, so each ritual feels clear, elevated, and intentional.",
  },
  aboutSustainabilityTitle: { ko: "지속가능 설계", en: "Sustainability" },
  aboutSustainabilityBody: {
    ko: "리필 중심 패키지와 책임 있는 원료 소싱, 소량 정밀 생산으로 품질은 높이고 낭비는 낮춥니다.",
    en: "Refill-forward design, responsible sourcing, and small-batch production reduce waste without compromising quality.",
  },
  aboutClinicalTitle: { ko: "임상적 정밀성", en: "Clinical Precision" },
  aboutClinicalBody: {
    ko: "모든 포뮬러는 수분 지속력, 피부결, 톤 균일도 등 측정 가능한 지표를 기준으로 검증합니다.",
    en: "Every formula is validated against measurable outcomes, including hydration retention, texture refinement, and tone clarity.",
  },
  routineQuestion1: {
    ko: "오후가 되면 피부 결감이 어떻게 변하나요?",
    en: "How does your skin feel by midday?",
  },
  routineQuestion2: {
    ko: "피부 장벽이 자극에 얼마나 민감한 편인가요?",
    en: "How reactive is your skin?",
  },
  routineQuestion3: {
    ko: "지금 가장 집중하고 싶은 피부 고민은 무엇인가요?",
    en: "Primary concern",
  },
  routineAction: {
    ko: "맞춤 루틴 보기",
    en: "Get My Routine",
  },
  routineResultTitle: {
    ko: "맞춤 리추얼 제안",
    en: "Recommended Routine",
  },
  cartEmptyTitle: {
    ko: "쇼핑백이 비어 있습니다",
    en: "Your bag is empty",
  },
  cartEmptyBody: {
    ko: "아직 담긴 제품이 없습니다. 오늘의 루틴을 채워보세요.",
    en: "Your bag is empty. Discover essentials for your routine.",
  },
  cartUnitEach: {
    ko: "개당",
    en: "each",
  },
  cartRemove: {
    ko: "삭제",
    en: "Remove",
  },
  cartSummaryTitle: {
    ko: "결제 요약",
    en: "Summary",
  },
  cartSubtotal: {
    ko: "상품 합계",
    en: "Subtotal",
  },
  cartDiscount: {
    ko: "할인 금액",
    en: "Discount",
  },
  cartShipping: {
    ko: "배송비",
    en: "Shipping",
  },
  cartEstimatedTax: {
    ko: "예상 세금 및 수수료",
    en: "Estimated Tax",
  },
  cartTotal: {
    ko: "총 결제 금액",
    en: "Total",
  },
  cartFree: {
    ko: "무료",
    en: "Free",
  },
  cartCouponLabel: {
    ko: "쿠폰",
    en: "Coupon",
  },
  cartCouponRemoved: {
    ko: "쿠폰 적용이 해제되었습니다.",
    en: "Coupon removed.",
  },
  cartProceedCheckout: {
    ko: "주문 진행",
    en: "Proceed to Checkout",
  },
  checkoutEmptyTitle: {
    ko: "쇼핑백이 비어 있습니다",
    en: "Your cart is empty",
  },
  checkoutEmptyBody: {
    ko: "결제를 시작하려면 제품을 먼저 쇼핑백에 담아주세요.",
    en: "Add products before checkout.",
  },
  checkoutSigninTitle: {
    ko: "로그인이 필요합니다",
    en: "Sign in required",
  },
  checkoutSigninBody: {
    ko: "주문 이력과 배송 상태를 안전하게 관리하려면 로그인 후 주문을 진행해 주세요.",
    en: "Checkout requires an account so your order history and tracking stay in one place.",
  },
  checkoutIncomplete: {
    ko: "필수 입력 항목을 모두 확인해 주세요.",
    en: "Please complete all required fields.",
  },
  checkoutCreateOrderFailed: {
    ko: "주문 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    en: "Unable to create your order. Please try again shortly.",
  },
  checkoutShippingAddress: {
    ko: "배송 정보",
    en: "Shipping Address",
  },
  checkoutSavedAddresses: {
    ko: "저장된 주소",
    en: "Saved addresses",
  },
  checkoutUseNewAddress: {
    ko: "새 주소 입력",
    en: "Use new address",
  },
  checkoutPaymentMock: {
    ko: "결제 수단 (데모)",
    en: "Payment (Mock)",
  },
  checkoutOrderSummary: {
    ko: "주문 요약",
    en: "Order Summary",
  },
  checkoutCompletePurchase: {
    ko: "결제 확정",
    en: "Complete Purchase",
  },
  checkoutOrderNotFoundTitle: {
    ko: "주문 정보를 찾을 수 없습니다",
    en: "Order not found",
  },
  checkoutOrderNotFoundBody: {
    ko: "해당 주문이 계정에 연결되어 있지 않습니다.",
    en: "We could not locate this order in your account.",
  },
  checkoutOrderConfirmed: {
    ko: "주문이 접수되었습니다",
    en: "Order Confirmed",
  },
  checkoutThanks: {
    ko: "Portfolio를 선택해 주셔서 감사합니다",
    en: "Thank you for your purchase",
  },
  checkoutOrderId: {
    ko: "주문 번호",
    en: "Order ID",
  },
  checkoutViewOrders: {
    ko: "주문 내역 확인",
    en: "View Orders",
  },
  checkoutContinueShopping: {
    ko: "스토어 계속보기",
    en: "Continue Shopping",
  },
  accountUnableSignIn: {
    ko: "로그인에 실패했습니다. 입력 정보를 다시 확인해 주세요.",
    en: "Unable to sign in. Please check your credentials.",
  },
  accountUnableRegister: {
    ko: "가입 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    en: "Unable to register at the moment.",
  },
  accountNewHere: {
    ko: "처음 방문하셨나요?",
    en: "New here?",
  },
  accountAlreadyRegistered: {
    ko: "이미 계정이 있으신가요?",
    en: "Already registered?",
  },
  accountWelcomeBody: {
    ko: "주문, 위시리스트, 배송 정보를 한 곳에서 정돈된 경험으로 관리해 보세요.",
    en: "Manage orders, wishlist, and saved addresses in one elegant workspace.",
  },
  accountCartItems: {
    ko: "쇼핑백 수량",
    en: "Cart Items",
  },
  accountRecentOrders: {
    ko: "최근 주문 내역",
    en: "Recent Orders",
  },
  accountNoOrders: {
    ko: "아직 주문 내역이 없습니다.",
    en: "No orders yet.",
  },
  accountOrderHistoryEmptyBody: {
    ko: "첫 주문이 완료되면 이곳에서 주문 상태를 확인할 수 있습니다.",
    en: "Your order history will appear here after your first checkout.",
  },
  accountOrderNotFoundBody: {
    ko: "요청하신 주문을 찾을 수 없습니다.",
    en: "The requested order could not be found.",
  },
  accountPlacedOn: {
    ko: "주문 일시",
    en: "Placed on",
  },
  accountQty: {
    ko: "수량",
    en: "Qty",
  },
  accountPayment: {
    ko: "결제 상태",
    en: "Payment",
  },
  accountTracking: {
    ko: "배송 추적",
    en: "Tracking",
  },
  accountPending: {
    ko: "준비 중",
    en: "Pending",
  },
  accountWishlistEmptyTitle: {
    ko: "저장된 제품이 없습니다",
    en: "Wishlist is empty",
  },
  accountWishlistEmptyBody: {
    ko: "마음에 드는 제품을 저장해 두고 루틴 구성에 맞춰 비교해 보세요.",
    en: "Nothing saved yet. Keep your favorites here.",
  },
  accountBrowseProducts: {
    ko: "제품 보러가기",
    en: "Browse products",
  },
  accountSavedAddresses: {
    ko: "저장된 주소",
    en: "Saved Addresses",
  },
  accountDefault: {
    ko: "기본",
    en: "Default",
  },
  accountMakeDefault: {
    ko: "기본 배송지로 설정",
    en: "Make default",
  },
  accountNoAddresses: {
    ko: "저장된 배송지가 없습니다.",
    en: "No addresses saved yet.",
  },
  accountAddAddress: {
    ko: "배송지 추가",
    en: "Add Address",
  },
  accountSaveAddress: {
    ko: "배송지 저장",
    en: "Save Address",
  },
  productHowToUse: {
    ko: "사용 가이드",
    en: "How to use",
  },
  productRoutineTip: {
    ko: "루틴 페어링",
    en: "Routine tip",
  },
  productNoReviewsTitle: {
    ko: "아직 등록된 리뷰가 없습니다",
    en: "No approved reviews yet",
  },
  productNoReviewsBody: {
    ko: "첫 리뷰를 남기고 제형, 결감, 피니시 경험을 공유해 주세요.",
    en: "Be the first to share your texture, finish, and routine experience.",
  },
  productSignInToReview: {
    ko: "리뷰 작성은 로그인 후 이용하실 수 있습니다.",
    en: "Sign in to submit a review.",
  },
  productReviewSubmitted: {
    ko: "리뷰가 접수되었습니다. 검수 후 노출됩니다.",
    en: "Your review was submitted for approval.",
  },
  productReviewTitlePlaceholder: {
    ko: "한 줄 리뷰",
    en: "Review title",
  },
  productReviewBodyPlaceholder: {
    ko: "사용 후 느낀 피부 변화와 마무리감을 남겨주세요",
    en: "Share your experience",
  },
  productRoutinePairing: {
    ko: "함께 쓰면 좋은 조합",
    en: "Routine Pairing",
  },
  articleRelatedProducts: {
    ko: "연관 제품",
    en: "Related Products",
  },
  journalStoriesAndGuides: {
    ko: "스토리 & 가이드",
    en: "Stories & Guides",
  },
  homePhilosophyBody: {
    ko: "우리는 피부 본연의 균형을 해치지 않으면서, 눈에 보이는 결과를 남기는 정제된 포뮬러를 만듭니다.",
    en: "We create precise formulas that respect skin balance while delivering visible, refined results.",
  },
} as const;
