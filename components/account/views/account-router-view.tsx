"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { EmptyState, InputField, Row } from "@/components/public/shared/ui";
import { BRAND_LABELS, CONTENT_COPY, resolveText } from "@/lib/i18n";
import { withLocalePath } from "@/lib/locale-routing";
import { getProductPriceBySize, getProductSizeLabel, hasMultipleProductSizes } from "@/lib/product-pricing";
import type { Address, Locale } from "@/lib/types";
import { currency, formatDate, uid } from "@/lib/utils";

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

function localizePath(path: string, locale: Locale): string {
  return withLocalePath(path, locale);
}

export function AccountRouterView({ segments }: { segments: string[] }) {
  if (segments[0] === "login") {
    return <AccountLoginView />;
  }
  if (segments[0] === "register") {
    return <AccountRegisterView />;
  }
  if (segments[0] === "orders" && segments[1]) {
    return <AccountOrderDetailView id={segments[1]} />;
  }
  if (segments[0] === "orders") {
    return <AccountOrdersView />;
  }
  if (segments[0] === "wishlist") {
    return <AccountWishlistView />;
  }
  if (segments[0] === "addresses") {
    return <AccountAddressesView />;
  }

  return <AccountOverviewView />;
}

function AccountLoginView() {
  const router = useRouter();
  const { login, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [email, setEmail] = useState(locale === "ko" ? "" : "user@portfolio.com");
  const [password, setPassword] = useState("User123!");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-1 w-full min-h-[calc(100vh-var(--public-header-height))] overflow-hidden bg-white">
      <div className="hidden lg:flex w-1/2 relative bg-[#f8f9fc] items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNUDTShfYRsycptElm5NNhOaefNeFiyoREgpX0GSOFc9GSXXyksiZBEFvGdU8jj-PHTInI2eeaNW40YqjPIyzKiFxrexvEKp6oCvk69FomHnOZoJ7WVBvE7Q8AsT39QR_fcvR1xdDHDT_8wxVKW4FPIlvVsQatbtvTgt85IkvNvORP1zwm-Uo5AMs2uh724IGbmvvMZWYm6NvnJZCILmgO2FtwhTkhxbcs7ZAjZVJaDmnwq05Hgw6n15-bflgan37g1YKGa8wjLbo')",
          }}
        >
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="relative z-10 p-12 text-white text-center opacity-0 hover:opacity-100 transition-opacity duration-500">
          <p className="font-serif text-3xl italic tracking-wide">{t("아름다움의 기준을 다시 씁니다.", "Redefining Beauty.")}</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 bg-white relative">
        <div className="w-full max-w-[420px] flex flex-col gap-10">
          <div className="text-center flex flex-col items-center gap-2">
            <h1 className="text-4xl sm:text-5xl font-serif text-[#0e121b] font-bold tracking-tight mb-2">{t("Portfolio", "Portfolio")}</h1>
            <p className="text-[#4e6797] text-sm sm:text-base font-normal">{t("다시 오신 것을 환영합니다. 로그인 정보를 입력해 주세요.", "Welcome back. Please enter your details.")}</p>
          </div>

          <form
            className="flex flex-col gap-6"
            onSubmit={(event) => {
              event.preventDefault();
              const result = login(email, password);
              if (!result.ok) {
                setMessage(result.error ?? resolveText(CONTENT_COPY.accountUnableSignIn, locale));
                return;
              }
              router.push(result.role === "admin" ? localizePath("/admin", locale) : localizePath("/account", locale));
            }}
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#0e121b]" htmlFor="account-login-email">
                {t("이메일", "Email")}
              </label>
              <div className="relative group">
                <input
                  id="account-login-email"
                  className="w-full px-4 py-3.5 bg-white border border-[#e2e8f0] rounded-lg text-[#0e121b] text-base placeholder:text-[#4e6797]/60 focus:ring-2 focus:ring-[#1754cf]/20 focus:border-[#1754cf] transition-all duration-200 outline-none"
                  placeholder={t("이메일 주소를 입력해 주세요", "name@example.com")}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <div className="absolute right-3 top-3.5 text-[#4e6797] pointer-events-none group-focus-within:text-[#1754cf] transition-colors">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-[#0e121b]" htmlFor="account-login-password">
                {t("비밀번호", "Password")}
              </label>
              <div className="relative group">
                <input
                  id="account-login-password"
                  className="w-full px-4 py-3.5 bg-white border border-[#e2e8f0] rounded-lg text-[#0e121b] text-base placeholder:text-[#4e6797]/60 focus:ring-2 focus:ring-[#1754cf]/20 focus:border-[#1754cf] transition-all duration-200 outline-none"
                  placeholder="********"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <div
                  className="absolute right-3 top-3.5 text-[#4e6797] cursor-pointer hover:text-[#1754cf] transition-colors"
                  role="button"
                  tabIndex={0}
                  aria-label={showPassword ? t("비밀번호 숨기기", "Hide password") : t("비밀번호 보기", "Show password")}
                  onClick={() => setShowPassword((prev) => !prev)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setShowPassword((prev) => !prev);
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    className="peer h-4 w-4 appearance-none rounded border border-[#e2e8f0] bg-white checked:bg-[#1754cf] checked:border-[#1754cf] transition-all cursor-pointer"
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none material-symbols-outlined text-[12px]">
                    check
                  </span>
                </div>
                <span className="text-sm text-[#4e6797] group-hover:text-[#0e121b] transition-colors">{t("로그인 상태 유지", "Remember me")}</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-[#1754cf] hover:text-[#1754cf]/80 hover:underline transition-colors"
              >
                {t("비밀번호를 잊으셨나요?", "Forgot Password?")}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1754cf] hover:bg-[#1754cf]/90 text-white font-semibold h-12 rounded-lg shadow-lg shadow-[#1754cf]/20 transition-all duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2 group"
            >
              <span>{t("로그인", "Sign In")}</span>
              <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[18px]">
                arrow_forward
              </span>
            </button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-[#e2e8f0]" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-[#4e6797]">{t("또는 다음으로 계속", "Or continue with")}</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full bg-white border border-[#e2e8f0] hover:bg-[#f8f9fc] text-[#0e121b] font-medium h-12 rounded-lg transition-colors flex items-center justify-center gap-3"
            >
              <img
                alt={t("구글", "Google")}
                className="w-5 h-5"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXIuXe6oyMbhSk08HYKGK7QqzQZP0EXTXz-Jdtp7YYuGW0KavgKaDMkXIbkkkPNKS3cgQacmCtq5Uxnwf42mLKCmSj5urSRqcy4VpshfybrxYn1D4kTWOaY-CxY3LqV_AkrniNUeH9vOa2wMEy7rqTX0wEV7FTehCHz8fDr144A62K8wH-k_hh1Aip9fZOVEcJGRVHY37ptpOF5ZPf80maJeedrxkyH56TcgrUFoDpCx1xCz97RUEQUS33XSWkZaCvuHFa19bG-Zc"
              />
              <span>{t("구글 계정으로 로그인", "Sign in with Google")}</span>
            </button>

            {message && <p className="text-sm text-[#6f5560]">{message}</p>}
          </form>

          <div className="text-center mt-4">
            <p className="text-[#4e6797] text-sm">
              {t("아직 회원이 아니신가요?", "New to Portfolio?")}
              <Link href={localizePath("/account/register", locale)} className="font-semibold text-[#1754cf] hover:text-[#1754cf]/80 transition-colors ml-1">
                {t("회원가입", "Create an Account")}
              </Link>
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 text-center w-full px-6">
          <p className="text-xs text-[#4e6797]/60">{t("(c) 2024 Portfolio Beauty. 모든 권리 보유.", "(c) 2024 Portfolio Beauty. All rights reserved.")}</p>
        </div>
      </div>
    </div>
  );
}

function AccountRegisterView() {
  const router = useRouter();
  const { register, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [name, setName] = useState(locale === "ko" ? "새 고객" : "New Customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(true);
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-1 min-h-[calc(100vh-var(--public-header-height))] w-full bg-[#f6f7f8]">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden bg-slate-200">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuACm6ouhUCoPnA34Fu37z4BmueSqH20TnAw4YnVEzPBz8tAKWAW0gYWhRuf_BnTOVHrv2Dt4oyzfeFeg-jvifqaiaeAhl4VlYWV0tQpgfyX3_t5r3oiyoL7GjLZpbxi3avtoly0DDKr6jpTvMglby8VbD0Z7lYBvdkvhBDYD4oC2o_j3kKCWdos62ypT4wyY2dLKhmlDvfTEtiTWBM7hUa1jRHVA0-SahSgFR67xkAJoxPzy1j7ZtA06uRzTeFIJ_uHjtC6iIUQ4KY')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <p className="text-3xl font-bold tracking-tight mb-2">{t("정제된 럭셔리 뷰티", "Refined Beauty.")}</p>
          <p className="text-lg text-slate-200 font-medium">
            {t("큐레이션 컬렉션과 멤버 전용 혜택을 가장 먼저 만나보세요.", "Join our community for exclusive access to the curated collection.")}
          </p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col bg-white relative overflow-y-auto">
        <div className="flex-1 flex flex-col justify-center px-6 lg:px-20 xl:px-32 py-8">
          <div className="w-full max-w-md mx-auto">
            <div className="mb-10">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">{t("회원가입", "Create Account")}</h1>
              <p className="text-slate-500 text-lg">{t("Portfolio 멤버십으로 더 특별한 뷰티 경험을 시작해 보세요.", "Join Portfolio for an exclusive beauty experience.")}</p>
            </div>

            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                const result = register(name, email, password);
                if (!result.ok) {
                  setMessage(result.error ?? resolveText(CONTENT_COPY.accountUnableRegister, locale));
                  return;
                }
                router.push(localizePath("/account", locale));
              }}
            >
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900" htmlFor="account-register-name">
                  {t("이름", "Full Name")}
                </label>
                <input
                  id="account-register-name"
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19b3e6]/50 focus:border-[#19b3e6] transition-all text-slate-900 placeholder-slate-400"
                  placeholder={t("이름을 입력해 주세요", "Enter your full name")}
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900" htmlFor="account-register-email">
                  {t("이메일 주소", "Email Address")}
                </label>
                <input
                  id="account-register-email"
                  className="w-full h-12 px-4 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19b3e6]/50 focus:border-[#19b3e6] transition-all text-slate-900 placeholder-slate-400"
                  placeholder={t("이메일 주소를 입력해 주세요", "name@example.com")}
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900" htmlFor="account-register-password">
                  {t("비밀번호", "Password")}
                </label>
                <div className="relative group">
                  <input
                    id="account-register-password"
                    className="w-full h-12 px-4 pr-12 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#19b3e6]/50 focus:border-[#19b3e6] transition-all text-slate-900 placeholder-slate-400"
                    placeholder={t("비밀번호를 설정해 주세요", "Create a password")}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#19b3e6] transition-colors"
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? t("비밀번호 숨기기", "Hide password") : t("비밀번호 보기", "Show password")}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 pl-1">{t("비밀번호는 8자 이상으로 입력해 주세요.", "Must be at least 8 characters.")}</p>
              </div>

              <div className="flex items-start gap-3 py-2">
                <div className="flex items-center h-6">
                  <input
                    id="account-register-subscribe"
                    className="size-5 rounded border-slate-300 text-[#19b3e6] focus:ring-[#19b3e6] cursor-pointer"
                    type="checkbox"
                    checked={marketingOptIn}
                    onChange={(event) => setMarketingOptIn(event.target.checked)}
                  />
                </div>
                <div className="text-sm leading-6">
                  <label className="font-medium text-slate-900 cursor-pointer" htmlFor="account-register-subscribe">
                    {t("Portfolio 저널 뉴스레터 구독", "Subscribe to the Portfolio Journal")}
                  </label>
                  <p className="text-slate-500">{t("최신 뷰티 인사이트와 트렌드, 멤버 전용 혜택을 받아보세요.", "Get the latest beauty tips, trends, and exclusive offers.")}</p>
                </div>
              </div>

              <button className="w-full h-12 flex items-center justify-center bg-[#19b3e6] hover:bg-[#159cc9] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg active:scale-[0.99] mt-2">
                {t("회원가입 완료", "Create Account")}
              </button>

              {message && <p className="text-sm text-[#6f5560]">{message}</p>}

              <p className="text-center text-sm text-slate-600 mt-6">
                {t("이미 계정이 있으신가요?", "Already have an account?")}
                <Link href={localizePath("/account/login", locale)} className="font-bold text-[#19b3e6] hover:text-[#159cc9] transition-colors ml-1">
                  {t("로그인", "Sign In")}
                </Link>
              </p>
            </form>
          </div>
        </div>

        <footer className="px-6 py-6 lg:px-12 text-center lg:text-left border-t border-slate-100 mt-auto">
          <p className="text-xs text-slate-400">
            {t("계정을 생성하면 다음 정책에 동의한 것으로 간주됩니다.", "By creating an account, you agree to our")} {" "}
            <button type="button" className="underline hover:text-slate-600">
              {t("이용약관", "Terms & Conditions")}
            </button>{" "}
            {t("및", "and")}{" "}
            <button type="button" className="underline hover:text-slate-600">
              {t("개인정보 처리방침", "Privacy Policy")}
            </button>
            {t("입니다.", ".")}
          </p>
        </footer>
      </div>
    </div>
  );
}

function AccountOverviewView() {
  const { currentUser, db, addToCart, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const countryLabel = (value: string) => {
    if (locale !== "ko") return value;
    const normalized = value.trim().toLowerCase();
    if (normalized === "us" || normalized === "united states") return "미국";
    if (normalized === "ca" || normalized === "canada") return "캐나다";
    if (normalized === "uk" || normalized === "united kingdom") return "영국";
    if (normalized === "kr" || normalized === "korea" || normalized === "south korea" || normalized === "대한민국") return "대한민국";
    return value;
  };
  const orderStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      processing: "처리 중",
      shipped: "배송 중",
      delivered: "배송 완료",
      cancelled: "주문 취소",
      pending: "준비 중",
    };
    return locale === "ko" ? map[status] ?? status : status;
  };
  if (!currentUser) {
    return null;
  }

  const orders = db.orders
    .filter((order) => order.userId === currentUser.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const latestOrder = orders[0];
  const latestOrderProducts = latestOrder
    ? latestOrder.items
        .map((item) => db.products.find((product) => product.slug === item.productSlug))
        .filter((product): product is (typeof db.products)[number] => Boolean(product))
    : [];
  const wishlistProducts = db.products.filter((product) => currentUser.wishlist.includes(product.slug));
  const recommended = db.products.filter((product) => !wishlistProducts.some((entry) => entry.id === product.id)).slice(0, 4);
  const defaultAddress = currentUser.addresses.find((address) => address.isDefault) ?? currentUser.addresses[0];

  return (
    <section className="flex-1 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl font-light text-slate-900">
          {t("다시 오신 것을 환영합니다.", "Welcome back,")} <span className="font-bold">{currentUser.name}.</span>
        </h2>
        <p className="text-slate-500 max-w-2xl">
          {t("오늘의 뷰티 포트폴리오 현황입니다. 다음 플래티넘 리워드까지", "Here is what is happening with your beauty portfolio today. You have")} {" "}
          <span className="text-[#e6194c] font-medium">320 {t("포인트", "points")}</span> {t("남아 있습니다.", "until your next Platinum reward.")}
        </p>
      </div>

      <div className="bg-[#fcf8f9] border border-[#f3e7ea] rounded-xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-[#f3e7ea] pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-bold text-slate-900">{latestOrder ? latestOrder.id : t("최근 주문이 없습니다", "No recent order")}</h3>
              {latestOrder && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide bg-green-100 text-green-700 border-green-200">
                  {orderStatusLabel(latestOrder.status)}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {latestOrder ? `${t("주문일", "Placed on")} ${formatDate(latestOrder.createdAt, locale)}` : t("첫 주문 후 배송 현황을 여기에서 확인할 수 있습니다.", "Place your first order to track delivery updates here.")}
            </p>
          </div>
          <Link
            href={latestOrder ? localizePath(`/account/orders/${latestOrder.id}`, locale) : localizePath("/shop", locale)}
            className="bg-[#e6194c] hover:bg-[#e6194c]/90 text-white px-6 py-2.5 rounded-lg text-sm font-semibold tracking-wide transition-all shadow-sm hover:shadow-md flex items-center gap-2 w-full md:w-auto justify-center"
          >
            {latestOrder ? t("배송 조회", "Track Package") : t("지금 쇼핑하기", "Shop Now")}
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex -space-x-4 overflow-hidden py-2 px-2">
            {latestOrderProducts.slice(0, 2).map((product) => (
              <div key={product.id} className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-lg bg-white border border-[#f3e7ea] p-2 shadow-sm transition-transform group-hover:-translate-y-1">
                  <img
                    alt={resolveText(product.name, locale)}
                    className="w-full h-full object-cover rounded-md mix-blend-multiply"
                    src={product.images[0]}
                  />
                </div>
              </div>
            ))}
            <div className="relative group cursor-pointer flex items-center justify-center">
              <div className="w-24 h-24 rounded-lg bg-[#fcf8f9] border border-[#f3e7ea] shadow-sm flex items-center justify-center text-slate-400 text-xs font-medium">
                {latestOrderProducts.length > 2 ? t(`+${latestOrderProducts.length - 2}개`, `+${latestOrderProducts.length - 2} more`) : latestOrder ? t("주문", "Order") : t("상품 없음", "No items")}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center sm:border-l sm:border-[#f3e7ea] sm:pl-6">
            <p className="text-sm font-medium text-slate-900 mb-1">
              {latestOrder ? `${t("예상 결제 금액", "Estimated total")} ${currency(latestOrder.total)}` : t("다음 리추얼을 준비해 보세요.", "Ready for your next ritual?")}
            </p>
            <p className="text-sm text-slate-500">
              {latestOrder?.trackingNumber
                ? `${t("배송 추적번호", "Tracking")}: ${latestOrder.trackingNumber}`
                : latestOrder
                  ? t("상품 배송 후 송장번호가 표시됩니다.", "Tracking number will be available once shipped.")
                  : t("고객님의 취향에 맞춘 추천 에센스를 확인해 보세요.", "Discover recommended essentials curated for your profile.")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#f3e7ea] rounded-xl p-6 flex flex-col h-full hover:border-[#e6194c]/30 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#fcf8f9] rounded-lg text-[#e6194c]">
              <span className="material-symbols-outlined">home_pin</span>
            </div>
            <Link href={localizePath("/account/addresses", locale)} className="text-sm font-semibold text-[#e6194c] hover:text-[#e6194c]/80 transition-colors">
              {t("수정", "Edit")}
            </Link>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{t("기본 배송지", "Default Shipping")}</h3>
          <div className="text-sm text-slate-500 leading-relaxed flex-grow">
            {defaultAddress ? (
              <>
                <p>{defaultAddress.recipient}</p>
                <p>
                  {defaultAddress.line1}
                  {defaultAddress.line2 ? `, ${defaultAddress.line2}` : ""}
                </p>
                <p>
                  {defaultAddress.city}, {defaultAddress.state} {defaultAddress.zip}
                </p>
                <p>{countryLabel(defaultAddress.country)}</p>
              </>
            ) : (
              <p>{t("저장된 배송지가 없습니다.", "No saved address yet.")}</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#f3e7ea] rounded-xl p-6 flex flex-col h-full hover:border-[#e6194c]/30 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-[#fcf8f9] rounded-lg text-[#e6194c]">
              <span className="material-symbols-outlined">favorite</span>
            </div>
            <Link href={localizePath("/account/wishlist", locale)} className="text-sm font-semibold text-[#e6194c] hover:text-[#e6194c]/80 transition-colors">
              {t("전체 보기", "View All")}
            </Link>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{t("위시리스트", "Wishlist")}</h3>
          <p className="text-sm text-slate-500 mb-4">{t(`저장된 상품 ${wishlistProducts.length}개`, `${wishlistProducts.length} items saved for later`)}</p>
          <div className="flex gap-3 mt-auto">
            {wishlistProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="size-12 rounded bg-[#fcf8f9] border border-[#f3e7ea] p-1">
                <img
                  alt={resolveText(product.name, locale)}
                  className="w-full h-full object-cover rounded mix-blend-multiply"
                  src={product.images[0]}
                />
              </div>
            ))}
            {wishlistProducts.length === 0 && (
              <p className="text-xs text-slate-400 self-center">{t("저장된 상품이 없습니다.", "No saved items yet.")}</p>
            )}
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-[#f3e7ea]">
        <h3 className="text-lg font-bold text-slate-900 mb-6">{t("고객님을 위한 추천", "Recommended for you")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommended.map((product, index) => (
            <div key={product.id} className={`group cursor-pointer${index > 1 ? " hidden md:block" : ""}`}>
              <div className="relative overflow-hidden rounded-lg bg-[#fcf8f9] aspect-[3/4] mb-3">
                <img
                  alt={resolveText(product.name, locale)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  src={product.images[0]}
                />
                <button
                  type="button"
                  className="absolute bottom-3 right-3 size-8 bg-white rounded-full flex items-center justify-center shadow-md text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0"
                  onClick={() => addToCart(product.slug, 1)}
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                </button>
              </div>
              <h4 className="text-sm font-semibold text-slate-900">{resolveText(product.name, locale)}</h4>
              <p className="text-xs text-slate-500 mt-1">{currency(product.price)}</p>
            </div>
          ))}
          {recommended.length === 0 && <p className="text-sm text-slate-500">{t("아직 준비된 추천 상품이 없습니다.", "No recommendations available yet.")}</p>}
        </div>
      </div>
    </section>
  );
}

function AccountOrdersView() {
  const { currentUser, db, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const orderStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      processing: "처리 중",
      shipped: "배송 중",
      delivered: "배송 완료",
      cancelled: "주문 취소",
      pending: "준비 중",
    };
    return locale === "ko" ? map[status] ?? status : status.toUpperCase();
  };
  if (!currentUser) {
    return null;
  }

  const orders = db.orders
    .filter((order) => order.userId === currentUser.id)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

  if (orders.length === 0) {
    return (
      <EmptyState
        title={resolveText(CONTENT_COPY.accountNoOrders, locale)}
        body={resolveText(CONTENT_COPY.accountOrderHistoryEmptyBody, locale)}
        ctaHref={localizePath("/shop", locale)}
        ctaLabel={resolveText(BRAND_LABELS.navShop, locale)}
      />
    );
  }

  return (
    <div className="rounded-xl border border-[#f3e7ea] bg-white p-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-5">{t("주문 내역", "Order History")}</h1>
      <div className="space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={localizePath(`/account/orders/${order.id}`, locale)} className="block rounded-lg border border-[#f3e7ea] p-4 hover:border-[#e6194c] transition-colors">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="font-semibold text-slate-900">{order.id}</p>
              <p className="text-sm text-slate-500">{formatDate(order.createdAt, locale)}</p>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-sm text-slate-500">{orderStatusLabel(order.status)}</p>
              <p className="font-semibold text-slate-900">{currency(order.total)}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AccountOrderDetailView({ id }: { id: string }) {
  const { currentUser, db, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const orderStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      processing: "처리 중",
      shipped: "배송 중",
      delivered: "배송 완료",
      cancelled: "주문 취소",
      pending: "준비 중",
    };
    return locale === "ko" ? map[status] ?? status : status.toUpperCase();
  };
  const paymentStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      paid: "결제 완료",
      pending: "결제 대기",
      refunded: "환불 완료",
      failed: "결제 실패",
    };
    return locale === "ko" ? map[status] ?? status : status.toUpperCase();
  };
  if (!currentUser) {
    return null;
  }

  const order = db.orders.find((entry) => entry.id === id && entry.userId === currentUser.id);
  if (!order) {
    return (
      <EmptyState
        title={t("주문 정보를 찾을 수 없습니다", "Order not found")}
        body={resolveText(CONTENT_COPY.accountOrderNotFoundBody, locale)}
        ctaHref={localizePath("/account/orders", locale)}
        ctaLabel={t("주문 내역으로 돌아가기", "Back to Orders")}
      />
    );
  }

  const lines = order.items
    .map((item) => {
      const product = db.products.find((entry) => entry.slug === item.productSlug);
      if (!product) {
        return null;
      }
      return {
        item,
        product,
        unitPrice: getProductPriceBySize(product, item.sizeKey),
      };
    })
    .filter(
      (
        line,
      ): line is {
        item: (typeof order.items)[number];
        product: (typeof db.products)[number];
        unitPrice: number;
      } => Boolean(line),
    );

  return (
    <div className="rounded-xl border border-[#f3e7ea] bg-white p-6">
      <h1 className="text-3xl font-bold text-slate-900">{t(`주문 ${order.id}`, `Order ${order.id}`)}</h1>
      <p className="text-sm text-slate-500 mt-2">
        {resolveText(CONTENT_COPY.accountPlacedOn, locale)} {formatDate(order.createdAt, locale)}
      </p>

      <div className="mt-6 space-y-3">
        {lines.map((line) => (
          <div key={`${line.product.id}:${line.item.sizeKey ?? "default"}`} className="rounded-lg border border-[#f3e7ea] p-4 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-slate-900">
                {typeof line.product.name === "string" ? line.product.name : line.product.name[locale]}
              </p>
              {hasMultipleProductSizes(line.product) && (
                <p className="text-sm text-slate-500">
                  {t("용량", "Size")} {getProductSizeLabel(line.product, locale, line.item.sizeKey)}
                </p>
              )}
              <p className="text-sm text-slate-500">
                {resolveText(CONTENT_COPY.accountQty, locale)} {line.item.quantity}
              </p>
            </div>
            <p className="font-semibold text-slate-900">{currency(line.unitPrice * line.item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg border border-[#f3e7ea] p-4 space-y-2">
        <Row label={t("주문 상태", "Status")} value={orderStatusLabel(order.status)} />
        <Row label={resolveText(CONTENT_COPY.accountPayment, locale)} value={paymentStatusLabel(order.paymentStatus)} />
        <Row
          label={resolveText(CONTENT_COPY.accountTracking, locale)}
          value={order.trackingNumber || resolveText(CONTENT_COPY.accountPending, locale)}
        />
        <Row label={resolveText(CONTENT_COPY.cartTotal, locale)} value={currency(order.total)} bold />
      </div>
    </div>
  );
}

function AccountWishlistView() {
  const { currentUser, db, toggleWishlist, addToCart, locale } = useStore();
  if (!currentUser) {
    return null;
  }

  const wishlistProducts = db.products.filter((product) => currentUser.wishlist.includes(product.slug));
  if (wishlistProducts.length === 0) {
    return (
      <EmptyState
        title={resolveText(CONTENT_COPY.accountWishlistEmptyTitle, locale)}
        body={resolveText(CONTENT_COPY.accountWishlistEmptyBody, locale)}
        ctaHref={localizePath("/shop", locale)}
        ctaLabel={resolveText(CONTENT_COPY.accountBrowseProducts, locale)}
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {wishlistProducts.map((product) => (
        <article key={product.id} className="rounded-xl border border-[#f3e7ea] bg-white p-4">
          <img
            src={product.images[0]}
            alt={typeof product.name === "string" ? product.name : product.name[locale]}
            className="w-full aspect-[4/3] object-cover rounded-xl"
          />
          <h2 className="font-serif text-3xl mt-4 text-slate-900">
            {typeof product.name === "string" ? product.name : product.name[locale]}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{currency(product.price)}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="h-11 rounded-full bg-[#e6194c] text-white text-sm hover:bg-[#cb1743] transition-colors"
              onClick={() => addToCart(product.slug, 1)}
            >
              {resolveText(BRAND_LABELS.ctaAddToBag, locale)}
            </button>
            <button
              type="button"
              className="h-11 rounded-full border border-[#e4d7db] text-sm"
              onClick={() => toggleWishlist(product.slug)}
            >
              {resolveText(CONTENT_COPY.cartRemove, locale)}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function AccountAddressesView() {
  const { currentUser, upsertAddress, deleteAddress, setDefaultAddress, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const countryLabel = (value: string) => {
    if (locale !== "ko") return value;
    const normalized = value.trim().toLowerCase();
    if (normalized === "us" || normalized === "united states") return "미국";
    if (normalized === "ca" || normalized === "canada") return "캐나다";
    if (normalized === "uk" || normalized === "united kingdom") return "영국";
    return value;
  };
  const [form, setForm] = useState({
    label: locale === "ko" ? "집" : "Home",
    recipient: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: locale === "ko" ? "미국" : "US",
  });

  if (!currentUser) {
    return null;
  }

  const createAddress = (): Address => ({
    id: uid("addr"),
    label: localizeAddressLabel(form.label, locale),
    recipient: form.recipient,
    phone: form.phone,
    line1: form.line1,
    line2: form.line2,
    city: form.city,
    state: form.state,
    zip: form.zip,
    country: form.country,
    isDefault: currentUser.addresses.length === 0,
  });

  return (
    <div className="grid gap-6">
      <div className="rounded-xl border border-[#f3e7ea] bg-white p-6">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {resolveText(CONTENT_COPY.accountSavedAddresses, locale)}
        </h1>
        <div className="space-y-3">
          {currentUser.addresses.map((address) => (
            <div key={address.id} className="rounded-lg border border-[#f3e7ea] p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <p className="font-semibold text-slate-900">{localizeAddressLabel(address.label, locale)}</p>
                {address.isDefault && (
                  <span className="text-xs uppercase tracking-[0.12em] text-[#e6194c] font-bold">
                    {resolveText(CONTENT_COPY.accountDefault, locale)}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                {address.recipient} - {address.phone}
                <br />
                {address.line1} {address.line2}
                <br />
                {address.city}, {address.state} {address.zip}, {countryLabel(address.country)}
              </p>
              <div className="mt-3 flex gap-2">
                {!address.isDefault && (
                  <button
                    type="button"
                    className="h-10 px-4 rounded-full border border-[#e4d7db] text-sm"
                    onClick={() => setDefaultAddress(address.id)}
                  >
                    {resolveText(CONTENT_COPY.accountMakeDefault, locale)}
                  </button>
                )}
                <button
                  type="button"
                  className="h-10 px-4 rounded-full border border-[#e4d7db] text-sm"
                  onClick={() => deleteAddress(address.id)}
                >
                  {resolveText(CONTENT_COPY.cartRemove, locale)}
                </button>
              </div>
            </div>
          ))}
          {currentUser.addresses.length === 0 && (
            <p className="text-sm text-slate-500">{resolveText(CONTENT_COPY.accountNoAddresses, locale)}</p>
          )}
        </div>
      </div>

      <form
        className="rounded-xl border border-[#f3e7ea] bg-white p-6 grid gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          upsertAddress(createAddress());
          setForm({
            label: locale === "ko" ? "집" : "Home",
            recipient: "",
            phone: "",
            line1: "",
            line2: "",
            city: "",
            state: "",
            zip: "",
            country: locale === "ko" ? "미국" : "US",
          });
        }}
      >
        <h2 className="text-2xl font-bold text-slate-900">{resolveText(CONTENT_COPY.accountAddAddress, locale)}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("\uC8FC\uC18C \uBCC4\uCE6D", "Label")} value={form.label} onChange={(value) => setForm((prev) => ({ ...prev, label: value }))} />
          <InputField label={t("수령인", "Recipient")} value={form.recipient} onChange={(value) => setForm((prev) => ({ ...prev, recipient: value }))} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("연락처", "Phone")} value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))} />
          <InputField label={t("국가", "Country")} value={form.country} onChange={(value) => setForm((prev) => ({ ...prev, country: value }))} />
        </div>
        <InputField label={t("주소 1", "Address line 1")} value={form.line1} onChange={(value) => setForm((prev) => ({ ...prev, line1: value }))} />
        <InputField label={t("주소 2", "Address line 2")} value={form.line2} onChange={(value) => setForm((prev) => ({ ...prev, line2: value }))} />
        <div className="grid sm:grid-cols-3 gap-3">
          <InputField label={t("도시", "City")} value={form.city} onChange={(value) => setForm((prev) => ({ ...prev, city: value }))} />
          <InputField label={t("주", "State")} value={form.state} onChange={(value) => setForm((prev) => ({ ...prev, state: value }))} />
          <InputField label={t("우편번호", "ZIP")} value={form.zip} onChange={(value) => setForm((prev) => ({ ...prev, zip: value }))} />
        </div>
        <button
          type="submit"
          className="h-12 rounded-xl bg-[#e6194c] text-white text-sm font-semibold uppercase tracking-[0.12em] hover:bg-[#cb1743] transition-colors"
          aria-label={t("주소 저장", "Save Address")}
        >
          {resolveText(CONTENT_COPY.accountSaveAddress, locale)}
        </button>
      </form>
    </div>
  );
}


