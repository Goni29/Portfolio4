"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { EmptyState, InputField } from "@/components/public/shared/ui";
import { resolveText } from "@/lib/i18n";
import { getProductPriceBySize, getProductSizeLabel, hasMultipleProductSizes } from "@/lib/product-pricing";
import type { Article, Banner, Collection, Coupon, Order, Product, SupportInquiry } from "@/lib/types";
import { cn, currency, formatDate, uid } from "@/lib/utils";

export function AdminRouterView({ segments }: { segments: string[] }) {
  if (segments[0] === "login") {
    return <AdminLoginView />;
  }

  if (segments[0] === "products") {
    const editSlug = segments[1] === "edit" && segments[2] ? decodeURIComponent(segments[2]) : null;
    return <AdminProductsView key={editSlug ?? "products"} editSlug={editSlug} />;
  }

  if (segments[0] === "analytics") {
    return <AdminAnalyticsView />;
  }

  if (segments[0] === "collections") {
    return <AdminCollectionsView />;
  }

  if (segments[0] === "orders" && segments[1]) {
    return <AdminOrderDetailView id={segments[1]} />;
  }

  if (segments[0] === "orders") {
    return <AdminOrdersView />;
  }

  if (segments[0] === "customers") {
    return <AdminCustomersView />;
  }

  if (segments[0] === "reviews") {
    return <AdminReviewsView />;
  }

  if (segments[0] === "journal") {
    return <AdminJournalView />;
  }

  if (segments[0] === "banners") {
    return <AdminBannersView />;
  }

  if (segments[0] === "coupons") {
    return <AdminCouponsView />;
  }

  if (segments[0] === "inquiries") {
    return <AdminInquiriesView />;
  }

  if (segments[0] === "settings") {
    return <AdminSettingsView />;
  }

  return <AdminDashboardView />;
}

function AdminLoginView() {
  const router = useRouter();
  const { login, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [email, setEmail] = useState("admin@portfolio4.com");
  const [password, setPassword] = useState("Admin123!");
  const [message, setMessage] = useState("");

  return (
    <section className="container-edge py-14 min-h-[70vh] grid place-items-center">
      <form
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 grid gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          const result = login(email, password);

          if (!result.ok) {
            setMessage(result.error ?? t("로그인에 실패했습니다.", "Unable to sign in."));
            return;
          }

          if (result.role !== "admin") {
            setMessage(t("관리자 계정이 필요합니다.", "Admin account is required."));
            return;
          }

          router.push("/admin");
        }}
      >
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[#e82e5c] font-bold">{t("관리자", "Admin")}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mt-2">{t("로그인", "Sign In")}</h1>
        </div>
        <InputField label={t("이메일", "Email")} value={email} onChange={setEmail} />
        <InputField label={t("비밀번호", "Password")} value={password} onChange={setPassword} />
        <button type="submit" className="h-12 rounded-xl bg-[#e82e5c] text-white text-sm font-semibold uppercase tracking-[0.12em]">
          {t("로그인", "Sign In")}
        </button>
        {message && <p className="text-sm text-slate-500">{message}</p>}
      </form>
    </section>
  );
}

function AdminDashboardView() {
  const { db, locale } = useStore();
  const [trendRange, setTrendRange] = useState<"7d" | "30d" | "90d">("7d");
  const [mobileProductTab, setMobileProductTab] = useState<"revenue" | "views">("revenue");
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const statusLabelMap: Record<Order["status"], { ko: string; en: string }> = {
    pending: { ko: "대기", en: "Pending" },
    processing: { ko: "처리 중", en: "Processing" },
    shipped: { ko: "배송 중", en: "Shipped" },
    delivered: { ko: "배송 완료", en: "Delivered" },
    cancelled: { ko: "취소", en: "Cancelled" },
  };
  const orderStatusLabel = (status: Order["status"]) => statusLabelMap[status][locale];
  const usersById = useMemo(() => new Map(db.users.map((user) => [user.id, user])), [db.users]);

  const paidOrders = db.orders.filter((order) => order.paymentStatus === "paid" && order.status !== "cancelled");
  const pendingReviews = db.reviews.filter((review) => !review.approved);
  const unpaidOrders = db.orders.filter((order) => order.paymentStatus !== "paid");
  const refundRequestedOrders = db.orders.filter((order) => order.refundRequested);
  const openInquiries = db.inquiries.filter((inquiry) => inquiry.status !== "resolved");
  const activeCoupons = db.coupons.filter((coupon) => coupon.active);
  const totalProductViews = Object.values(db.analytics.productViewsBySlug ?? {}).reduce((sum, count) => sum + count, 0);

  const toTimestamp = (value: string): number => {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dayKeys = Array.from({ length: 90 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - (89 - index));
    return day.toISOString().slice(0, 10);
  });

  const dailyMetrics: Record<string, { revenue: number; orders: number; units: number }> = Object.fromEntries(
    dayKeys.map((key) => [
      key,
      {
        revenue: 0,
        orders: 0,
        units: 0,
      },
    ]),
  );

  const productBySlug = new Map(db.products.map((product) => [product.slug, product]));
  const productMetricsBySlug = new Map(
    db.products.map((product) => [
      product.slug,
      {
        views: db.analytics.productViewsBySlug[product.slug] ?? 0,
        unitsSold: 0,
        revenue: 0,
        orderCount: 0,
      },
    ]),
  );

  paidOrders.forEach((order) => {
    const dayKey = order.createdAt.slice(0, 10);
    if (dailyMetrics[dayKey]) {
      dailyMetrics[dayKey].revenue += order.total;
      dailyMetrics[dayKey].orders += 1;
    }

    const countedProducts = new Set<string>();
    order.items.forEach((item) => {
      const product = productBySlug.get(item.productSlug);
      const metrics = productMetricsBySlug.get(item.productSlug);
      if (!product || !metrics) {
        return;
      }

      const quantity = Math.max(1, item.quantity);
      const unitPrice = getProductPriceBySize(product, item.sizeKey);

      metrics.unitsSold += quantity;
      metrics.revenue += unitPrice * quantity;
      if (dailyMetrics[dayKey]) {
        dailyMetrics[dayKey].units += quantity;
      }

      if (!countedProducts.has(item.productSlug)) {
        metrics.orderCount += 1;
        countedProducts.add(item.productSlug);
      }
    });
  });

  const dailySeries = dayKeys.map((key) => {
    const entry = dailyMetrics[key];
    return {
      key,
      revenue: entry.revenue,
      orders: entry.orders,
      units: entry.units,
      aov: entry.orders > 0 ? entry.revenue / entry.orders : null,
    };
  });

  const latestSeven = dailySeries.slice(-7);
  const latestTwelve = dailySeries.slice(-12);
  const sumSeries = (series: Array<{ revenue: number; orders: number; units: number }>) =>
    series.reduce(
      (acc, point) => ({
        revenue: acc.revenue + point.revenue,
        orders: acc.orders + point.orders,
        units: acc.units + point.units,
      }),
      { revenue: 0, orders: 0, units: 0 },
    );

  const buildWeeklySeries = (weeks: number) => {
    const buckets: Array<{ revenue: number; orders: number; units: number; aov: number | null }> = [];
    const startIndex = Math.max(0, dailySeries.length - weeks * 7);
    for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
      const weekSlice = dailySeries.slice(startIndex + weekIndex * 7, startIndex + (weekIndex + 1) * 7);
      if (weekSlice.length === 0) {
        continue;
      }
      const weeklyTotals = sumSeries(weekSlice);
      buckets.push({
        ...weeklyTotals,
        aov: weeklyTotals.orders > 0 ? weeklyTotals.revenue / weeklyTotals.orders : null,
      });
    }
    return buckets;
  };

  const weeklyAovWindow = 8;
  const weeklyAovExpandedWindow = 12;
  const weeklySeries = buildWeeklySeries(weeklyAovWindow);
  const expandedWeeklySeries = buildWeeklySeries(weeklyAovExpandedWindow);
  const emptyWeeklyMetric = { revenue: 0, orders: 0, units: 0, aov: null as number | null };
  const currentWeek = weeklySeries[weeklySeries.length - 1] ?? emptyWeeklyMetric;
  const previousWeek = weeklySeries[weeklySeries.length - 2] ?? emptyWeeklyMetric;
  const currentWeekAov = currentWeek.aov ?? 0;
  const previousWeekAov = previousWeek.aov ?? 0;
  const rawWeeklyAovSeries = weeklySeries.map((point) => point.aov);
  const expandedWeeklyAovSeries = expandedWeeklySeries.map((point) => point.aov);
  const displayAovSeries = buildDisplayAovSparkline(rawWeeklyAovSeries, expandedWeeklyAovSeries, weeklyAovWindow);

  const buildDeltaState = (current: number, previous: number): KpiDeltaState => {
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
      return { kind: "none" };
    }
    if (previous === 0) {
      if (current > 0) {
        return { kind: "up" };
      }
      return { kind: "flat" };
    }
    return { kind: "percent", value: ((current - previous) / previous) * 100 };
  };

  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const paidOrderCount = paidOrders.length;
  const averageOrderValue = paidOrderCount > 0 ? totalRevenue / paidOrderCount : 0;
  const orderToViewRate = totalProductViews > 0 ? (paidOrderCount / totalProductViews) * 100 : 0;

  const productStats = db.products.map((product) => {
    const metrics = productMetricsBySlug.get(product.slug) ?? {
      views: 0,
      unitsSold: 0,
      revenue: 0,
      orderCount: 0,
    };

    return {
      slug: product.slug,
      name: resolveText(product.name, locale),
      image: product.images[0] ?? "/logo_header.png",
      views: metrics.views,
      unitsSold: metrics.unitsSold,
      orderCount: metrics.orderCount,
      revenue: metrics.revenue,
      unitConversionRate: metrics.views > 0 ? (metrics.unitsSold / metrics.views) * 100 : 0,
    };
  });

  const topViewedProducts = [...productStats]
    .filter((entry) => entry.views > 0 || entry.unitsSold > 0)
    .sort((a, b) => b.views - a.views || b.unitsSold - a.unitsSold)
    .slice(0, 5);

  const topRevenueProducts = [...productStats]
    .filter((entry) => entry.revenue > 0 || entry.unitsSold > 0)
    .sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold)
    .slice(0, 5);

  const rangeDays = trendRange === "7d" ? 7 : trendRange === "30d" ? 30 : 90;
  const trendSlice = dailySeries.slice(-rangeDays);
  const labelStep = trendSlice.length <= 7 ? 1 : trendSlice.length <= 30 ? 6 : 15;
  const trendSeries: TrendPoint[] = trendSlice.map((entry, index) => ({
    key: entry.key,
    label: index % labelStep === 0 || index === trendSlice.length - 1 ? entry.key.slice(5).replace("-", "/") : "",
    revenue: entry.revenue,
    orders: entry.orders,
    units: entry.units,
  }));

  const rangeRevenue = trendSlice.reduce((sum, point) => sum + point.revenue, 0);
  const rangeOrders = trendSlice.reduce((sum, point) => sum + point.orders, 0);
  const rangeAov = rangeOrders > 0 ? rangeRevenue / rangeOrders : 0;
  const rangeUnits = trendSlice.reduce((sum, point) => sum + point.units, 0);

  const recentOrders = [...db.orders]
    .sort((a, b) => toTimestamp(b.createdAt) - toTimestamp(a.createdAt))
    .slice(0, 8);
  const recentOrderRows: DashboardOrderRow[] = recentOrders.map((order) => ({
    id: order.id,
    customer: usersById.get(order.userId)?.name ?? order.shippingAddress.recipient ?? t("비회원", "Guest"),
    status: order.status,
    statusLabel: orderStatusLabel(order.status),
    total: order.total,
    createdAt: order.createdAt,
  }));

  const kpiCards: DashboardKpi[] = [
    {
      key: "kpi-weekly-revenue",
      label: t("주간 매출", "Weekly Revenue"),
      mobileLabel: t("매출", "Revenue"),
      value: currency(currentWeek.revenue),
      delta: buildDeltaState(currentWeek.revenue, previousWeek.revenue),
      href: "/admin/analytics",
      sparkline: latestSeven.map((point) => point.revenue),
      sparklineType: "line",
      icon: "trending_up",
    },
    {
      key: "kpi-weekly-orders",
      label: t("주간 주문", "Weekly Orders"),
      mobileLabel: t("주문", "Orders"),
      value: currentWeek.orders.toLocaleString(),
      delta: buildDeltaState(currentWeek.orders, previousWeek.orders),
      href: "/admin/orders",
      sparkline: latestTwelve.map((point) => point.orders),
      sparklineType: "bar",
      icon: "receipt_long",
    },
    {
      key: "kpi-weekly-units",
      label: t("주간 판매수량", "Weekly Units"),
      mobileLabel: t("판매", "Units"),
      value: currentWeek.units.toLocaleString(),
      delta: buildDeltaState(currentWeek.units, previousWeek.units),
      href: "/admin/products",
      sparkline: latestTwelve.map((point) => point.units),
      sparklineType: "bar",
      icon: "inventory_2",
    },
    {
      key: "kpi-weekly-aov",
      label: t("주간 객단가", "Weekly AOV"),
      mobileLabel: t("객단가", "AOV"),
      value: currency(currentWeekAov),
      delta: buildDeltaState(currentWeekAov, previousWeekAov),
      href: "/admin/analytics",
      sparkline: displayAovSeries,
      sparklineType: "line",
      icon: "toll",
    },
  ];

  const topViewedList: RichListItem[] = topViewedProducts.map((entry) => ({
    key: `view-${entry.slug}`,
    href: `/admin/products`,
    productSlug: entry.slug,
    image: entry.image,
    name: entry.name,
    secondary: `${t("조회", "Views")} ${entry.views.toLocaleString()} | ${t("전환", "Conversion")} ${entry.unitConversionRate.toFixed(1)}% | ${t("주문", "Orders")} ${entry.orderCount.toLocaleString()}`,
    valueLabel: t("조회수", "Views"),
    value: entry.views.toLocaleString(),
  }));

  const topRevenueList: RichListItem[] = topRevenueProducts.map((entry) => ({
    key: `revenue-${entry.slug}`,
    href: `/admin/products`,
    productSlug: entry.slug,
    image: entry.image,
    name: entry.name,
    secondary: `${t("매출 전환", "Revenue Conv.")} ${entry.unitConversionRate.toFixed(1)}% | ${t("주문", "Orders")} ${entry.orderCount.toLocaleString()} | ${t("조회", "Views")} ${entry.views.toLocaleString()}`,
    valueLabel: t("매출", "Revenue"),
    value: currency(entry.revenue),
  }));

  const todoItems = [
    { key: "todo-unpaid", label: t("미결제 주문", "Unpaid Orders"), count: unpaidOrders.length, href: "/admin/orders" },
    { key: "todo-refund", label: t("환불 요청", "Refund Requests"), count: refundRequestedOrders.length, href: "/admin/orders" },
    { key: "todo-reviews", label: t("검수 대기 리뷰", "Pending Reviews"), count: pendingReviews.length, href: "/admin/reviews" },
    { key: "todo-inquiries", label: t("미해결 문의", "Open Inquiries"), count: openInquiries.length, href: "/admin/inquiries" },
    { key: "todo-coupons", label: t("활성 쿠폰", "Active Coupons"), count: activeCoupons.length, href: "/admin/coupons" },
  ];
  const mobileTopItems = (mobileProductTab === "revenue" ? topRevenueList : topViewedList).slice(0, 5);
  const mobileRecentOrderRows = recentOrderRows.slice(0, 3);

  return (
    <div className="grid gap-10">
      <header className="grid gap-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-black/90">{t("대시보드", "Dashboard")}</h1>
        <p className="text-sm text-black/55">
          {t("오늘 스냅샷, 매출 추세, 최근 주문 및 운영 할 일을 한 화면에서 확인합니다.", "Monitor snapshot KPIs, sales trends, recent orders, and operational tasks in one view.")}
        </p>
      </header>

      <section className="grid gap-6 md:hidden">
        <section className="grid grid-cols-2 gap-3">
          {kpiCards.map((card) => (
            <DashboardKpiCard
              key={`mobile-${card.key}`}
              className="col-span-1 h-[104px]"
              compact
              label={card.mobileLabel}
              value={card.value}
              delta={card.delta}
              href={card.href}
              sparkline={card.sparkline}
              sparklineType={card.sparklineType}
              icon={card.icon}
              noBaselineLabel={t("기준없음", "No base")}
              upLabel={t("상승", "Up")}
              deltaSuffix={t("전주 대비", "vs LW")}
            />
          ))}
        </section>

        <article className="admin-surface p-4">
          <h2 className="text-[14px] font-medium text-black/55">{t("오늘 처리할 일", "Today's To-do")}</h2>
          <div className="mt-4 grid gap-2">
            {todoItems.map((item) => (
              <Link
                key={`mobile-${item.key}`}
                href={item.href}
                className="admin-hover-subtle flex items-center justify-between rounded-[14px] border border-black/10 bg-white px-3 py-2.5 transition-[background-color,border-color,color] duration-200 ease-out"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-black/74">
                  <span className={cn("h-2 w-2 rounded-full", item.count > 0 ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
                  {item.label}
                </span>
                <span
                  className={cn(
                    "inline-flex min-w-9 items-center justify-center rounded-full border px-2 py-1 text-xs tabular-nums",
                    item.count > 0
                      ? "border-[rgba(232,46,92,0.25)] bg-[rgba(232,46,92,0.04)] font-semibold text-[color:var(--admin-accent)]"
                      : "border-black/10 bg-black/[0.02] text-black/55",
                  )}
                >
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        </article>

        <article className="admin-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[14px] font-medium text-black/55">{t("매출 추세", "Revenue Trend")}</h2>
            <SegmentedControl
              value={trendRange}
              onChange={setTrendRange}
              options={[
                { label: "7D", value: "7d" },
                { label: "30D", value: "30d" },
                { label: "90D", value: "90d" },
              ]}
            />
          </div>
          <div className="mt-3">
            <RevenueOrdersTrendChart
              data={trendSeries}
              revenueLegend={t("매출", "Revenue")}
              ordersLegend={t("주문", "Orders")}
              unitsLabel={t("판매수량", "Units")}
              aovLabel={t("객단가", "AOV")}
              emptyLabel={t("차트 데이터가 없습니다.", "No chart data")}
              compact
              allowHorizontalScroll={false}
            />
          </div>
        </article>

        <article className="admin-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex rounded-2xl border border-black/10 bg-white p-1">
              <button
                type="button"
                onClick={() => setMobileProductTab("revenue")}
                className={cn(
                  "relative h-9 rounded-xl px-4 text-xs font-semibold transition-[background-color,color] duration-200 ease-out",
                  mobileProductTab === "revenue" ? "bg-[color:var(--admin-subtle-bg)] text-black/88" : "text-black/55",
                )}
              >
                {t("상위 매출", "Top Revenue")}
                <span className={cn("absolute bottom-1 left-3 right-3 h-[2px] rounded-full", mobileProductTab === "revenue" ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
              </button>
              <button
                type="button"
                onClick={() => setMobileProductTab("views")}
                className={cn(
                  "relative h-9 rounded-xl px-4 text-xs font-semibold transition-[background-color,color] duration-200 ease-out",
                  mobileProductTab === "views" ? "bg-[color:var(--admin-subtle-bg)] text-black/88" : "text-black/55",
                )}
              >
                {t("상위 조회", "Top Views")}
                <span className={cn("absolute bottom-1 left-3 right-3 h-[2px] rounded-full", mobileProductTab === "views" ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
              </button>
            </div>
            <Link href="/admin/products" className="text-xs font-semibold text-[color:var(--admin-accent)]">
              {t("전체보기", "View all")}
            </Link>
          </div>
          <div className="mt-3 grid gap-2">
            {mobileTopItems.length === 0 && (
              <p className="rounded-[14px] border border-black/10 bg-white p-3 text-sm text-black/55">
                {mobileProductTab === "revenue" ? t("매출 데이터가 아직 없습니다.", "No sales data yet.") : t("조회 데이터가 아직 없습니다.", "No view data yet.")}
              </p>
            )}
            {mobileTopItems.map((item) => (
              <Link
                key={`mobile-list-${item.key}`}
                href={item.href}
                className="admin-hover-subtle flex items-center gap-3 rounded-[14px] border border-black/10 bg-white px-3 py-2.5 transition-[background-color,border-color,color] duration-200 ease-out"
              >
                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-[12px] border border-black/10 object-cover" loading="lazy" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-black/85">{item.name}</p>
                  <p className="mt-0.5 truncate text-xs text-black/55">{item.secondary}</p>
                </div>
                <p className="tabular-nums text-xs font-semibold text-black/82">{item.value}</p>
              </Link>
            ))}
          </div>
        </article>

        <article className="admin-surface p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-[14px] font-medium text-black/55">{t("최근 주문", "Recent Orders")}</h2>
            <Link href="/admin/orders" className="text-xs font-semibold text-[color:var(--admin-accent)]">
              {t("전체보기", "View all")}
            </Link>
          </div>
          <div className="grid gap-2.5">
            {mobileRecentOrderRows.length === 0 && <p className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/55">{t("주문 데이터가 없습니다.", "No orders yet.")}</p>}
            {mobileRecentOrderRows.map((row) => (
              <Link
                key={`mobile-dashboard-${row.id}`}
                href={`/admin/orders/${row.id}`}
                className="admin-hover-subtle rounded-2xl border border-black/10 bg-white p-3.5 transition-[background-color,border-color,color] duration-200 ease-out"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-black/85">{row.id}</p>
                  <OrderStatusPill status={row.status} label={row.statusLabel} />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <p className="text-black/55">{row.customer}</p>
                  <p className="tabular-nums text-right font-semibold text-black/85">{currency(row.total)}</p>
                  <p className="col-span-2 text-right tabular-nums text-xs text-black/55">{formatDate(row.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>
      </section>

      <section className="hidden md:grid grid-cols-2 gap-5 xl:grid-cols-12">
        {kpiCards.map((card) => (
          <DashboardKpiCard
            key={card.key}
            className="col-span-1 min-h-[118px] xl:col-span-3"
            label={card.label}
            value={card.value}
            delta={card.delta}
            href={card.href}
            sparkline={card.sparkline}
            sparklineType={card.sparklineType}
            icon={card.icon}
            noBaselineLabel={t("전주 데이터 없음", "No last-week baseline")}
            upLabel={t("상승", "Up")}
            deltaSuffix={t("전주 대비", "vs last week")}
          />
        ))}
      </section>

      <section className="hidden md:grid items-start gap-6 xl:grid-cols-12">
        <article className="admin-surface self-start p-5 xl:col-span-12 flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-black/5 pb-4">
            <div className="grid gap-2">
              <h2 className="text-[14px] font-medium text-black/55">{t("매출/주문 추세", "Revenue & Order Trend")}</h2>
              <SegmentedControl
                value={trendRange}
                onChange={setTrendRange}
                options={[
                  { label: "7D", value: "7d" },
                  { label: "30D", value: "30d" },
                  { label: "90D", value: "90d" },
                ]}
              />
            </div>
            <div className="grid w-full grid-cols-2 gap-3 text-right sm:w-auto sm:grid-cols-3">
              <div>
                <p className="text-[12px] font-medium text-black/50">{t("총매출", "Revenue")}</p>
                <p className="mt-1 tabular-nums text-base font-semibold text-black/88">{currency(rangeRevenue)}</p>
              </div>
              <div>
                <p className="text-[12px] font-medium text-black/50">{t("객단가", "AOV")}</p>
                <p className="mt-1 tabular-nums text-base font-semibold text-black/88">{currency(rangeAov)}</p>
              </div>
              <div className="hidden sm:block">
                <p className="text-[12px] font-medium text-black/50">{t("주문/조회", "Conv.")}</p>
                <p className="mt-1 tabular-nums text-base font-semibold text-black/88">{orderToViewRate.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-col justify-center">
            <RevenueOrdersTrendChart
              data={trendSeries}
              revenueLegend={t("매출", "Revenue")}
              ordersLegend={t("주문", "Orders")}
              unitsLabel={t("판매수량", "Units")}
              aovLabel={t("객단가", "AOV")}
              emptyLabel={t("차트 데이터가 없습니다.", "No chart data")}
              allowHorizontalScroll={false}
            />
          </div>
          <p className="mt-1.5 overflow-x-auto whitespace-nowrap text-[12px] leading-[1.35] text-black/52">
            {t("선택", "Selected")}: <span className="tabular-nums font-semibold text-black/78">{t("주문", "Orders")} {rangeOrders.toLocaleString()} · {t("매출", "Revenue")} {currency(rangeRevenue)} · {t("판매수량", "Units")} {rangeUnits.toLocaleString()}</span>
          </p>
        </article>
      </section>

      <section className="hidden md:grid gap-6 md:grid-cols-2 xl:grid-cols-12">
        <div className="xl:col-span-6">
          <ProductRichList
            title={t("상위 조회 상품", "Top Viewed Products")}
            emptyLabel={t("조회 데이터가 아직 없습니다.", "No view data yet.")}
            items={topViewedList}
          />
        </div>
        <div className="xl:col-span-6">
          <ProductRichList
            title={t("상위 매출 상품", "Top Revenue Products")}
            emptyLabel={t("매출 데이터가 아직 없습니다.", "No sales data yet.")}
            items={topRevenueList}
          />
        </div>
      </section>

      <section className="hidden md:grid gap-6 xl:grid-cols-12">
        <article className="admin-surface p-6 md:p-7 xl:col-span-6">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-[14px] font-medium text-black/55">{t("최근 주문", "Recent Orders")}</h2>
            <Link href="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--admin-accent)] transition-colors duration-200 ease-out hover:text-black/80">
              {t("전체보기", "View all")}
              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
            </Link>
          </div>

          <OrdersTable
            rows={recentOrderRows}
            labels={{
              orderNumber: t("주문번호", "Order"),
              customer: t("고객", "Customer"),
              status: t("상태", "Status"),
              amount: t("금액", "Amount"),
              createdAt: t("일시", "Date"),
              action: t("액션", "Action"),
              view: t("보기", "View"),
              empty: t("주문 데이터가 없습니다.", "No orders yet."),
            }}
          />

          <div className="mt-3 grid gap-3 md:hidden">
            {recentOrderRows.length === 0 && <p className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/55">{t("주문 데이터가 없습니다.", "No orders yet.")}</p>}
            {recentOrderRows.map((row) => (
              <Link
                key={`mobile-${row.id}`}
                href={`/admin/orders/${row.id}`}
                className="admin-hover-subtle rounded-2xl border border-black/10 bg-white p-4 transition-[background-color,border-color,color] duration-200 ease-out"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-black/85">{row.id}</p>
                  <OrderStatusPill status={row.status} label={row.statusLabel} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <p className="text-black/55">{row.customer}</p>
                  <p className="tabular-nums text-right font-semibold text-black/85">{currency(row.total)}</p>
                  <p className="col-span-2 text-right tabular-nums text-xs text-black/55">{formatDate(row.createdAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="admin-surface h-fit p-6 md:p-7 xl:col-span-6">
          <h2 className="text-[14px] font-medium text-black/55">{t("오늘 처리할 일", "Today's To-do")}</h2>
          <p className="mt-2 text-sm text-black/55">{t("운영 우선순위를 바로 확인하고 해당 페이지로 이동하세요.", "Check operational priorities and jump to the related page.")}</p>
          <div className="mt-5 grid gap-2">
            {todoItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="admin-hover-subtle flex items-center justify-between rounded-[14px] border border-black/10 bg-white px-3 py-2.5 transition-[background-color,border-color,color] duration-200 ease-out"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-black/75">
                  <span className={item.count > 0 ? "h-2 w-2 rounded-full bg-[color:var(--admin-accent)]" : "h-2 w-2 rounded-full bg-transparent"} />
                  {item.label}
                </span>
                <span
                  className={cn(
                    "inline-flex min-w-9 items-center justify-center rounded-full border px-2 py-1 text-xs tabular-nums",
                    item.count > 0
                      ? "border-[rgba(232,46,92,0.25)] bg-[rgba(232,46,92,0.04)] font-semibold text-[color:var(--admin-accent)]"
                      : "border-black/10 bg-black/[0.02] text-black/55",
                  )}
                >
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
          <p className="mt-4 text-xs text-black/50">
            {t("누적 결제완료 매출", "Lifetime paid revenue")}: <span className="tabular-nums font-semibold text-black/80">{currency(totalRevenue)}</span>
          </p>
          <p className="mt-1 text-xs text-black/50">
            {t("누적 객단가", "Lifetime AOV")}: <span className="tabular-nums font-semibold text-black/80">{currency(averageOrderValue)}</span>
          </p>
        </article>
      </section>
    </div>
  );
}

type DashboardKpi = {
  key: string;
  label: string;
  mobileLabel: string;
  value: string;
  delta: KpiDeltaState;
  href: string;
  sparkline: SparklineValue[];
  sparklineType: "line" | "bar";
  icon: "trending_up" | "receipt_long" | "inventory_2" | "toll";
};

type SparklineValue = number | string | null | undefined;

type KpiDeltaState =
  | { kind: "percent"; value: number }
  | { kind: "up" }
  | { kind: "flat" }
  | { kind: "none" };

type TrendPoint = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
  units: number;
};

type RichListItem = {
  key: string;
  href: string;
  productSlug: string;
  image: string;
  name: string;
  secondary: string;
  valueLabel: string;
  value: string;
};

type DashboardOrderRow = {
  id: string;
  customer: string;
  status: Order["status"];
  statusLabel: string;
  total: number;
  createdAt: string;
};

type OrdersTableLabels = {
  orderNumber: string;
  customer: string;
  status: string;
  amount: string;
  createdAt: string;
  action: string;
  view: string;
  empty: string;
};

function toNumericValue(value: SparklineValue): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string") {
    const normalized = value.replace(/[^0-9.-]/g, "");
    if (!normalized || normalized === "-" || normalized === "." || normalized === "-.") {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function countValidValues(series: SparklineValue[]): number {
  return series.reduce((count, value) => (toNumericValue(value) === null ? count : count + 1), 0);
}

function hasEnoughData(series: SparklineValue[]): boolean {
  if (series.length < 2) {
    return false;
  }
  return countValidValues(series) >= 2;
}

function fillSeriesWithLocf(series: SparklineValue[]): SparklineValue[] {
  const numericSeries = series.map((value) => toNumericValue(value));
  const firstValid = numericSeries.find((value) => value !== null);
  if (firstValid === undefined) {
    return series;
  }

  let lastValid: number | null = null;
  return numericSeries.map((value) => {
    if (value !== null) {
      lastValid = value;
      return value;
    }
    if (lastValid !== null) {
      return lastValid;
    }
    return firstValid;
  });
}

function buildDisplayAovSparkline(
  recentSeries: SparklineValue[],
  expandedSeries: SparklineValue[],
  minLength: number,
): SparklineValue[] {
  const recentValidCount = countValidValues(recentSeries);
  const expandedValidCount = countValidValues(expandedSeries);

  if (recentValidCount >= 2) {
    return fillSeriesWithLocf(recentSeries);
  }

  if (recentValidCount === 1) {
    if (expandedValidCount >= 2) {
      const expandedFilled = fillSeriesWithLocf(expandedSeries);
      const targetLength = Math.max(minLength, recentSeries.length, 7);
      return expandedFilled.slice(-targetLength);
    }
    return fillSeriesWithLocf(recentSeries);
  }

  if (expandedValidCount > 0) {
    const expandedFilled = fillSeriesWithLocf(expandedSeries);
    const targetLength = Math.max(minLength, recentSeries.length, 7);
    return expandedFilled.slice(-targetLength);
  }

  return recentSeries;
}

function DashboardKpiCard({
  className,
  compact = false,
  label,
  value,
  delta,
  href,
  sparkline,
  sparklineType,
  icon,
  noBaselineLabel,
  upLabel,
  deltaSuffix,
}: {
  className?: string;
  compact?: boolean;
  label: string;
  value: string;
  delta: KpiDeltaState;
  href: string;
  sparkline: SparklineValue[];
  sparklineType: "line" | "bar";
  icon: "trending_up" | "receipt_long" | "inventory_2" | "toll";
  noBaselineLabel: string;
  upLabel: string;
  deltaSuffix: string;
}) {
  const deltaText =
    delta.kind === "percent"
      ? `${delta.value >= 0 ? "▲" : "▼"} ${Math.abs(delta.value).toFixed(1)}% ${deltaSuffix}`
      : delta.kind === "up"
        ? upLabel
        : delta.kind === "flat"
          ? `0.0% ${deltaSuffix}`
          : noBaselineLabel;
  const trendDirection: "up" | "down" | "flat" =
    delta.kind === "percent" ? (delta.value > 0 ? "up" : delta.value < 0 ? "down" : "flat") : delta.kind === "up" ? "up" : "flat";
  const trendGlyph = trendDirection === "up" ? "↗" : trendDirection === "down" ? "↘" : "—";
  const compactDeltaValue =
    delta.kind === "percent"
      ? Math.abs(delta.value) < 0.05
        ? "0%"
        : `${delta.value > 0 ? "+" : "-"}${Math.abs(delta.value).toFixed(1)}%`
      : delta.kind === "up"
        ? upLabel
        : delta.kind === "flat"
          ? "0%"
          : noBaselineLabel;

  if (compact) {
    return (
      <Link
        href={href}
        className={cn(
          "admin-surface admin-hover-subtle group flex h-full flex-col justify-between p-4 transition-[background-color,border-color,color] duration-200 ease-out",
          className,
        )}
      >
        <p className="flex items-center gap-1.5 text-[11px] font-medium leading-none text-black/58">
          <span className="material-symbols-outlined text-[13px] text-black/45 transition-colors duration-200 ease-out group-hover:text-[color:var(--admin-accent)]">{icon}</span>
          <span className="whitespace-nowrap">{label}</span>
        </p>
        <p className="tabular-nums whitespace-nowrap text-[clamp(1.38rem,6vw,1.62rem)] font-semibold leading-none tracking-tight text-black/88">{value}</p>
        <div className="flex items-end justify-between gap-2">
          <p className="min-w-0 whitespace-nowrap text-[10px] font-medium text-black/50">
            {delta.kind === "none" ? (
              <span>{compactDeltaValue}</span>
            ) : (
              <>
                <span>{deltaSuffix} </span>
                <span className={cn("tabular-nums font-semibold", trendDirection === "up" || trendDirection === "down" ? "text-[color:var(--admin-accent)]" : "text-black/58")}>
                  {compactDeltaValue}
                </span>
              </>
            )}
          </p>
          <span className={cn("text-[13px] font-semibold leading-none", trendDirection === "up" || trendDirection === "down" ? "text-[color:var(--admin-accent)]" : "text-black/35")}>
            {trendGlyph}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "admin-surface admin-hover-subtle group flex h-full justify-between transition-[background-color,border-color,color] duration-200 ease-out",
        "items-end gap-3 p-5",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-[13px] font-medium text-black/55">
          <span className="material-symbols-outlined text-[14px] text-black/45 transition-colors duration-200 ease-out group-hover:text-[color:var(--admin-accent)]">
            {icon}
          </span>
          <span>{label}</span>
        </p>
        <p className="mt-2 tabular-nums text-[clamp(1.65rem,3vw,2.35rem)] font-semibold leading-none tracking-tight text-black/88">{value}</p>
        <p
          className={cn(
            "mt-3 text-[12px] font-medium",
            trendDirection === "up" ? "text-[color:var(--admin-accent)]" : trendDirection === "down" ? "text-black/60" : "text-black/45",
          )}
        >
          {deltaText}
        </p>
      </div>
      <div className="flex shrink-0 items-end gap-1">
        <MiniSparkline values={sparkline} type={sparklineType} />
        <span
          className={cn(
            "mb-0.5 text-[14px] font-semibold leading-none transition-colors duration-200 ease-out",
            trendDirection === "flat" ? "text-black/35" : "text-black/45 group-hover:text-[color:var(--admin-accent)]",
          )}
        >
          {trendGlyph}
        </span>
      </div>
    </Link>
  );
}

function MiniSparkline({
  values,
  type,
  compact = false,
}: {
  values: SparklineValue[];
  type: "line" | "bar";
  compact?: boolean;
}) {
  if (values.length === 0) {
    return null;
  }
  const compactWidth = type === "bar" ? 72 : 84;
  const compactHeight = type === "bar" ? 18 : 20;
  const width = compact ? compactWidth : 108;
  const height = compact ? compactHeight : 38;
  const padding = compact ? 3.5 : 4;
  const sparklineClass = compact
    ? type === "bar"
      ? "h-[18px] w-[72px] shrink-0"
      : "h-5 w-[84px] shrink-0"
    : "h-10 w-28 shrink-0";

  const parsedValues = values.map((value) => toNumericValue(value));
  const validEntries = parsedValues
    .map((value, index) => (value === null ? null : { index, value }))
    .filter((entry): entry is { index: number; value: number } => entry !== null);

  if (validEntries.length === 0) {
    return (
      <div className={cn("flex items-center justify-center gap-1.5", sparklineClass)}>
        <span className="h-[3px] w-[3px] rounded-full bg-black/35" />
        <span className="h-[3px] w-[3px] rounded-full bg-black/35" />
        <span className="h-[3px] w-[3px] rounded-full bg-black/35" />
      </div>
    );
  }
  const xForIndex = (index: number): number =>
    parsedValues.length <= 1 ? width / 2 : padding + (index * (width - padding * 2)) / Math.max(1, parsedValues.length - 1);
  const lastValidIndex = validEntries[validEntries.length - 1].index;

  if (validEntries.length === 1) {
    const singleX = xForIndex(lastValidIndex);
    const singleY = height / 2;
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className={sparklineClass} role="img" aria-hidden>
        <circle cx={singleX} cy={singleY} r={compact ? 2.2 : 2.8} fill="var(--admin-accent)" />
      </svg>
    );
  }

  if (!hasEnoughData(values)) {
    return (
      <div className={cn("flex items-center justify-center gap-1.5", sparklineClass)}>
        <span className="h-[3px] w-[3px] rounded-full bg-black/35" />
        <span className="h-[3px] w-[3px] rounded-full bg-black/35" />
        <span className="h-[3px] w-[3px] rounded-full bg-black/35" />
      </div>
    );
  }

  const validNumbers = validEntries.map((entry) => entry.value);
  const minValue = Math.min(...validNumbers);
  const maxValue = Math.max(...validNumbers);
  const range = maxValue - minValue;
  const epsilon = 0.0001;
  const isNearlyFlat = range < epsilon;
  const normalize = (value: number): number => (isNearlyFlat ? 0.5 : (value - minValue) / range);
  const yForValue = (value: number): number => height - padding - normalize(value) * (height - padding * 2);
  const points = validEntries.map((entry) => ({
    x: xForIndex(entry.index),
    y: yForValue(entry.value),
  }));

  if (type === "bar") {
    const slotWidth = width / Math.max(1, parsedValues.length);
    const barWidth = compact ? Math.max(2.6, Math.min(4.6, slotWidth - 1.4)) : Math.max(3.5, Math.min(6, slotWidth - 2));
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className={sparklineClass} role="img" aria-hidden>
        {parsedValues.map((value, index) => {
          if (value === null) {
            return null;
          }
          const barHeight = Math.max(2.2, normalize(value) * (height - padding * 2));
          const x = index * slotWidth + (slotWidth - barWidth) / 2;
          const y = height - padding - barHeight;
          return (
            <rect
              key={`kpi-bar-${index}`}
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              rx={1.5}
              fill={index === lastValidIndex ? "var(--admin-accent)" : "rgba(15,23,42,0.2)"}
            />
          );
        })}
      </svg>
    );
  }

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" ");
  const areaPath = `M ${points[0].x.toFixed(2)} ${(height - padding).toFixed(2)} L ${points.map((point) => `${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(" L ")} L ${points[points.length - 1].x.toFixed(2)} ${(height - padding).toFixed(2)} Z`;
  const previousPoint = points.length > 1 ? points[points.length - 2] : null;
  const lastPoint = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={sparklineClass} role="img" aria-hidden>
      <path d={areaPath} fill="rgba(15,23,42,0.08)" />
      <path d={path} fill="none" stroke="rgba(15,23,42,0.45)" strokeWidth={compact ? "1.45" : "1.75"} strokeLinecap="round" />
      {previousPoint && <circle cx={previousPoint.x} cy={previousPoint.y} r={compact ? 1.95 : 2.45} fill="white" stroke="rgba(15,23,42,0.35)" strokeWidth={compact ? "1.05" : "1.2"} />}
      <circle cx={lastPoint.x} cy={lastPoint.y} r={compact ? 2.2 : 2.8} fill="var(--admin-accent)" />
    </svg>
  );
}
function SegmentedControl({
  value,
  onChange,
  options,
}: {
  value: "7d" | "30d" | "90d";
  onChange: (next: "7d" | "30d" | "90d") => void;
  options: Array<{ label: string; value: "7d" | "30d" | "90d" }>;
}) {
  return (
    <div className="inline-flex rounded-2xl border border-black/10 bg-white p-1">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "relative h-9 rounded-xl px-4 text-xs font-semibold transition-[background-color,color] duration-200 ease-out",
              isActive ? "bg-[color:var(--admin-subtle-bg)] text-black/88" : "text-black/55 hover:bg-[color:var(--admin-subtle-bg)]",
            )}
          >
            {option.label}
            <span className={cn("absolute bottom-1 left-3 right-3 h-[2px] rounded-full", isActive ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
          </button>
        );
      })}
    </div>
  );
}

function RevenueOrdersTrendChart({
  data,
  revenueLegend,
  ordersLegend,
  unitsLabel,
  aovLabel,
  emptyLabel,
  compact = false,
  allowHorizontalScroll = true,
}: {
  data: TrendPoint[];
  revenueLegend: string;
  ordersLegend: string;
  unitsLabel: string;
  aovLabel: string;
  emptyLabel: string;
  compact?: boolean;
  allowHorizontalScroll?: boolean;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/55">{emptyLabel}</p>;
  }

  const formatCompactCurrency = (value: number): string => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
    }
    if (value >= 100) {
      return `$${value.toFixed(0)}`;
    }
    if (value >= 10) {
      return `$${value.toFixed(1)}`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatTooltipDate = (key: string): string => {
    const date = new Date(`${key}T00:00:00`);
    if (!Number.isFinite(date.getTime())) {
      return key;
    }
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // Keep dashboard layout stable across 7D/30D/90D by fixing the viewport width in non-scroll mode.
  const width = allowHorizontalScroll ? Math.max(620, data.length * 24) : compact ? 360 : 960;
  const height = 236;
  const leftPadding = 52;
  const rightPadding = 12;
  const topPadding = 14;
  const bottomPadding = 24;
  const chartBottom = height - bottomPadding;
  const chartHeight = chartBottom - topPadding;
  const plotWidth = width - leftPadding - rightPadding;
  const slotWidth = plotWidth / Math.max(1, data.length);
  const orderBarMaxHeight = chartHeight * 0.34;
  const maxRevenue = Math.max(0, ...data.map((entry) => entry.revenue));
  const revenueTickStep = 100;
  const revenueAxisMax = Math.max(revenueTickStep, Math.ceil(maxRevenue / revenueTickStep) * revenueTickStep);
  const revenueTickValues = Array.from(
    { length: Math.floor(revenueAxisMax / revenueTickStep) + 1 },
    (_, index) => revenueAxisMax - index * revenueTickStep,
  );
  const maxOrders = Math.max(1, ...data.map((entry) => entry.orders));

  const points = data.map((entry, index) => {
    const x = leftPadding + slotWidth * index + slotWidth / 2;
    const revenueY = chartBottom - (entry.revenue / revenueAxisMax) * chartHeight;
    const orderBarHeight = (entry.orders / maxOrders) * orderBarMaxHeight;
    const hasEvent = entry.revenue > 0 || entry.orders > 0;
    const aov = entry.orders > 0 ? entry.revenue / entry.orders : null;
    return { ...entry, x, revenueY, orderBarHeight, hasEvent, aov };
  });

  const lastIndex = points.length - 1;
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.revenueY.toFixed(2)}`).join(" ");
  const areaPath = `M ${points[0].x.toFixed(2)} ${chartBottom.toFixed(2)} L ${points.map((point) => `${point.x.toFixed(2)} ${point.revenueY.toFixed(2)}`).join(" L ")} L ${points[points.length - 1].x.toFixed(2)} ${chartBottom.toFixed(2)} Z`;

  const safeHoveredIndex = hoveredIndex === null ? null : Math.max(0, Math.min(points.length - 1, hoveredIndex));
  const hoveredPoint = safeHoveredIndex === null ? null : points[safeHoveredIndex];
  const tooltipLeft = hoveredPoint ? Math.max(90, Math.min(width - 90, hoveredPoint.x)) : 0;

  return (
    <div className={allowHorizontalScroll ? "overflow-x-auto" : "overflow-x-hidden"}>
      <div className={cn("relative mx-auto", allowHorizontalScroll ? "min-w-[620px]" : "w-full")} style={allowHorizontalScroll ? { width } : undefined}>
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-[3] -translate-x-1/2 rounded-[13px] border border-black/10 bg-white px-3 py-2 text-xs text-black/75"
            style={{ left: tooltipLeft, top: 8 }}
          >
            <p className="mb-1 tabular-nums text-[11px] text-black/55">{formatTooltipDate(hoveredPoint.key)}</p>
            <p className="tabular-nums font-semibold text-black/88">{revenueLegend}: {currency(hoveredPoint.revenue)}</p>
            <p className="mt-0.5 tabular-nums">{ordersLegend}: {hoveredPoint.orders.toLocaleString()}</p>
            <p className="mt-0.5 tabular-nums">{unitsLabel}: {hoveredPoint.units.toLocaleString()}</p>
            {hoveredPoint.aov !== null && <p className="mt-0.5 tabular-nums">{aovLabel}: {currency(hoveredPoint.aov)}</p>}
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className={cn("w-full", compact ? "h-[170px]" : "h-[180px] md:h-[220px] xl:h-[260px]")} role="img" aria-hidden>
          {revenueTickValues.map((tickValue) => {
            const y = chartBottom - (tickValue / revenueAxisMax) * chartHeight;
            return (
              <g key={`grid-${tickValue}`}>
                <line x1={leftPadding} x2={width - rightPadding} y1={y} y2={y} stroke="rgba(15,23,42,0.08)" strokeWidth="1" />
                <text x={leftPadding - 8} y={y + 3} textAnchor="end" fontSize="10" fill="rgba(0,0,0,0.45)">
                  {formatCompactCurrency(tickValue)}
                </text>
              </g>
            );
          })}

          {points.map((point) => (
            <rect
              key={`orders-bar-${point.key}`}
              x={point.x - 1.6}
              y={chartBottom - Math.max(1.5, point.orderBarHeight)}
              width={3.2}
              height={Math.max(1.5, point.orderBarHeight)}
              rx={1}
              fill="rgba(15,23,42,0.18)"
            />
          ))}

          <path d={areaPath} fill="rgba(15,23,42,0.08)" />
          <path d={linePath} fill="none" stroke="rgba(15,23,42,0.58)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((point, index) => {
            if (index === lastIndex) {
              return (
                <g key={`point-${point.key}`}>
                  <circle cx={point.x} cy={point.revenueY} r="5.1" fill="none" stroke="rgba(15,23,42,0.22)" strokeWidth="1" />
                  <circle cx={point.x} cy={point.revenueY} r="3.7" fill="var(--admin-accent)" stroke="#fff" strokeWidth="1.4" />
                </g>
              );
            }
            if (!point.hasEvent) {
              return null;
            }
            return (
              <g key={`point-${point.key}`}>
                <circle cx={point.x} cy={point.revenueY} r="4.4" fill="none" stroke="rgba(15,23,42,0.16)" strokeWidth="1" />
                <circle cx={point.x} cy={point.revenueY} r="2.5" fill="#fff" stroke="rgba(15,23,42,0.45)" strokeWidth="1.1" />
              </g>
            );
          })}

          {points.map((point) =>
            point.label ? (
              <text key={`label-${point.key}`} x={point.x} y={height - 6} textAnchor="middle" fontSize="10" fill="rgba(0,0,0,0.45)">
                {point.label}
              </text>
            ) : null,
          )}

          {points.map((point, index) => (
            <rect
              key={`hover-hit-${point.key}`}
              x={leftPadding + slotWidth * index}
              y={topPadding}
              width={slotWidth}
              height={chartHeight + bottomPadding}
              fill="transparent"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseMove={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>
      </div>

      <div className="mt-1.5 flex items-center gap-5 text-xs text-black/55">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-3 rounded-[4px] bg-black/12" />
          {revenueLegend}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-[3px] rounded-full bg-black/20" />
          {ordersLegend}
        </span>
      </div>
    </div>
  );
}
function ProductRichList({ title, emptyLabel, items }: { title: string; emptyLabel: string; items: RichListItem[] }) {
  return (
    <article className="admin-surface p-5">
        <h3 className="text-[14px] font-medium text-black/55">{title}</h3>
      <div className="mt-4 grid gap-2">
        {items.length === 0 && <p className="rounded-[14px] border border-black/10 bg-white p-3 text-sm text-black/55">{emptyLabel}</p>}
        {items.map((item) => (
          <article
            key={item.key}
            className="admin-hover-subtle group relative flex items-center gap-3 rounded-[14px] border border-black/10 bg-white px-3 py-2.5 transition-[background-color,border-color,color,opacity] duration-200 ease-out"
          >
            <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-[color:var(--admin-accent)] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
            <Link href={item.href} className="flex min-w-0 flex-1 items-center gap-3">
              <img src={item.image} alt={item.name} className="h-11 w-11 rounded-[13px] border border-black/10 object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-black/85">{item.name}</p>
                <p className="mt-1 truncate text-xs text-black/55">{item.secondary}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-black/45">{item.valueLabel}</p>
                <p className="tabular-nums text-sm font-semibold text-black/85">{item.value}</p>
              </div>
            </Link>
            <div className="ml-2 hidden items-center gap-1 opacity-0 transition-opacity duration-200 ease-out sm:flex group-hover:opacity-100">
              <Link
                href={`/product/${item.productSlug}`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-[color:var(--admin-accent)]"
                aria-label={`view-product-${item.productSlug}`}
              >
                <span className="material-symbols-outlined text-[14px]">visibility</span>
              </Link>
              <Link
                href={`/admin/products/edit/${item.productSlug}`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-black/10 text-[color:var(--admin-accent)]"
                aria-label={`edit-product-${item.productSlug}`}
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </article>
  );
}

function OrderStatusPill({ status, label }: { status: Order["status"]; label: string }) {
  const isCritical = status === "pending" || status === "processing" || status === "cancelled";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
        isCritical
          ? "border-[rgba(232,46,92,0.25)] bg-[rgba(232,46,92,0.04)] text-[color:var(--admin-accent)]"
          : "border-black/10 bg-black/[0.02] text-black/60",
      )}
    >
      {label}
    </span>
  );
}

function OrdersTable({ rows, labels }: { rows: DashboardOrderRow[]; labels: OrdersTableLabels }) {
  if (rows.length === 0) {
    return <p className="hidden rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/55 md:block">{labels.empty}</p>;
  }

  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-black/10 md:block">
      <table className="min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-[1] bg-white">
          <tr className="border-b border-black/10 text-xs uppercase tracking-[0.12em] text-black/45">
            <th className="px-4 py-3 text-left font-medium">{labels.orderNumber}</th>
            <th className="px-4 py-3 text-left font-medium">{labels.customer}</th>
            <th className="px-4 py-3 text-left font-medium">{labels.status}</th>
            <th className="px-4 py-3 text-right font-medium">{labels.amount}</th>
            <th className="px-4 py-3 text-right font-medium">{labels.createdAt}</th>
            <th className="px-4 py-3 text-right font-medium">{labels.action}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="admin-hover-subtle border-b border-black/5 transition-[background-color,border-color] duration-200 ease-out last:border-b-0">
              <td className="px-4 py-3">
                <Link href={`/admin/orders/${row.id}`} className="font-semibold text-black/85 transition-colors duration-200 ease-out hover:text-[color:var(--admin-accent)]">
                  {row.id}
                </Link>
              </td>
              <td className="px-4 py-3 text-black/70">{row.customer}</td>
              <td className="px-4 py-3">
                <OrderStatusPill status={row.status} label={row.statusLabel} />
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold text-black/85">{currency(row.total)}</td>
              <td className="px-4 py-3 text-right tabular-nums text-black/55">{formatDate(row.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/admin/orders/${row.id}`} className="inline-flex items-center justify-end text-xs font-semibold text-[color:var(--admin-accent)] transition-colors duration-200 ease-out hover:text-black/80">
                  {labels.view}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type AnalyticsRange = "7d" | "30d" | "90d" | "ytd" | "custom" | "180d" | "all";
type SalesInterval = "daily" | "weekly" | "monthly";
type SalesSeriesPoint = {
  key: string;
  label: string;
  revenue: number;
  orders: number;
  units: number;
};

function AdminAnalyticsView() {
  const { db, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [range, setRange] = useState<AnalyticsRange>("30d");
  const [salesInterval, setSalesInterval] = useState<SalesInterval>("daily");
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [mobileProductTab, setMobileProductTab] = useState<"revenue" | "views">("revenue");
  const [analysisNow] = useState<number>(() => Date.now());
  const toTimestamp = (value: string): number => {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  };
  const toInputDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const [customDateRange, setCustomDateRange] = useState(() => {
    const end = new Date(analysisNow);
    end.setHours(0, 0, 0, 0);
    const start = new Date(end.getTime() - 29 * 24 * 60 * 60 * 1000);
    return {
      start: toInputDate(start.getTime()),
      end: toInputDate(end.getTime()),
    };
  });

  const DAY_MS = 24 * 60 * 60 * 1000;
  const startOfToday = new Date(analysisNow);
  startOfToday.setHours(0, 0, 0, 0);
  const todayStart = startOfToday.getTime();
  const ytdStart = new Date(startOfToday.getFullYear(), 0, 1).getTime();
  const customStartInput = toTimestamp(`${customDateRange.start}T00:00:00`);
  const customEndInput = toTimestamp(`${customDateRange.end}T23:59:59.999`);
  const customStart = customStartInput > 0 ? customStartInput : todayStart - 29 * DAY_MS;
  const customEnd = customEndInput > 0 ? customEndInput : todayStart + DAY_MS - 1;
  const customRangeStart = Math.min(customStart, customEnd);
  const customRangeEnd = Math.max(customStart, customEnd);
  const customRangeDays = Math.max(1, Math.floor((customRangeEnd - customRangeStart) / DAY_MS) + 1);
  const rangeDays =
    range === "all"
      ? 180
      : range === "ytd"
        ? Math.max(1, Math.floor((todayStart - ytdStart) / DAY_MS) + 1)
        : range === "custom"
          ? customRangeDays
        : Number(range.replace("d", ""));
  const rangeStart =
    range === "all"
      ? null
      : range === "ytd"
        ? ytdStart
        : range === "custom"
          ? customRangeStart
        : todayStart - (Math.max(1, rangeDays) - 1) * DAY_MS;
  const rangeEnd = range === "custom" ? customRangeEnd : null;
  const previousRange = compareEnabled && rangeStart !== null
    ? { start: rangeStart - rangeDays * DAY_MS, end: rangeStart }
    : null;
  const isInRange = useCallback((value: string): boolean => {
    const timestamp = toTimestamp(value);
    if (timestamp <= 0) {
      return false;
    }
    const isAfterStart = rangeStart === null || timestamp >= rangeStart;
    const isBeforeEnd = rangeEnd === null || timestamp <= rangeEnd;
    return isAfterStart && isBeforeEnd;
  }, [rangeEnd, rangeStart]);

  const ordersInRange = db.orders.filter((order) => isInRange(order.createdAt));
  const paidOrders = ordersInRange.filter((order) => order.paymentStatus === "paid" && order.status !== "cancelled");
  const cancelledOrders = ordersInRange.filter((order) => order.status === "cancelled");
  const refundRequestedOrders = ordersInRange.filter((order) => order.refundRequested);
  const unpaidOrders = ordersInRange.filter((order) => order.paymentStatus !== "paid");

  const grossSales = paidOrders.reduce((sum, order) => sum + order.subtotal, 0);
  const discountTotal = paidOrders.reduce((sum, order) => sum + order.discount, 0);
  const netSales = paidOrders.reduce((sum, order) => sum + (order.subtotal - order.discount), 0);
  const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
  const paidOrderCount = paidOrders.length;
  const aov = paidOrderCount > 0 ? totalRevenue / paidOrderCount : 0;
  const totalUnitsSold = paidOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + Math.max(1, item.quantity), 0),
    0,
  );
  const unitsPerOrder = paidOrderCount > 0 ? totalUnitsSold / paidOrderCount : 0;

  const totalProductViews = Object.values(db.analytics.productViewsBySlug).reduce(
    (sum, count) => sum + count,
    0,
  );
  const orderConversionRate = totalProductViews > 0 ? (paidOrderCount / totalProductViews) * 100 : 0;
  const unitConversionRate = totalProductViews > 0 ? (totalUnitsSold / totalProductViews) * 100 : 0;

  const cancellationRate = ordersInRange.length > 0 ? (cancelledOrders.length / ordersInRange.length) * 100 : 0;
  const refundRequestRate = ordersInRange.length > 0 ? (refundRequestedOrders.length / ordersInRange.length) * 100 : 0;

  const newCustomers = db.users.filter((user) => user.role === "user" && isInRange(user.createdAt)).length;
  const paidOrderCountByUser = new Map<string, number>();
  paidOrders.forEach((order) => {
    paidOrderCountByUser.set(order.userId, (paidOrderCountByUser.get(order.userId) ?? 0) + 1);
  });
  const activeCustomers = paidOrderCountByUser.size;
  const repeatCustomers = [...paidOrderCountByUser.values()].filter((count) => count >= 2).length;
  const repeatCustomerRate = activeCustomers > 0 ? (repeatCustomers / activeCustomers) * 100 : 0;
  const pendingReviews = db.reviews.filter((review) => !review.approved).length;
  const openInquiries = db.inquiries.filter((inquiry) => inquiry.status !== "resolved").length;
  const activeCoupons = db.coupons.filter((coupon) => coupon.active).length;

  const previousOrdersInRange = previousRange
    ? db.orders.filter((order) => {
        const timestamp = toTimestamp(order.createdAt);
        return timestamp > 0 && timestamp >= previousRange.start && timestamp < previousRange.end;
      })
    : [];
  const previousPaidOrders = previousOrdersInRange.filter((order) => order.paymentStatus === "paid" && order.status !== "cancelled");
  const previousTotalRevenue = previousPaidOrders.reduce((sum, order) => sum + order.total, 0);
  const previousPaidOrderCount = previousPaidOrders.length;
  const previousAov = previousPaidOrderCount > 0 ? previousTotalRevenue / previousPaidOrderCount : 0;
  const previousOrderConversionRate = totalProductViews > 0 ? (previousPaidOrderCount / totalProductViews) * 100 : 0;

  const buildDeltaState = (current: number, previous: number | null): KpiDeltaState => {
    if (!compareEnabled || previous === null || !Number.isFinite(current) || !Number.isFinite(previous)) {
      return { kind: "none" };
    }
    if (previous === 0) {
      if (current > 0) {
        return { kind: "up" };
      }
      return { kind: "flat" };
    }
    return { kind: "percent", value: ((current - previous) / previous) * 100 };
  };
  const riskItems = [
    { key: "risk-unpaid", label: t("미결제 주문", "Unpaid Orders"), count: unpaidOrders.length, href: "/admin/orders" },
    { key: "risk-cancelled", label: t("취소 주문", "Cancelled Orders"), count: cancelledOrders.length, href: "/admin/orders" },
    { key: "risk-refund", label: t("환불 요청", "Refund Requests"), count: refundRequestedOrders.length, href: "/admin/orders" },
    { key: "risk-reviews", label: t("검수 대기 리뷰", "Pending Reviews"), count: pendingReviews, href: "/admin/reviews" },
    { key: "risk-inquiries", label: t("미해결 문의", "Open Inquiries"), count: openInquiries, href: "/admin/inquiries" },
    { key: "risk-coupons", label: t("활성 쿠폰", "Active Coupons"), count: activeCoupons, href: "/admin/coupons" },
  ];

  const productBySlug = new Map(db.products.map((product) => [product.slug, product]));
  const productStatsMap = new Map(
    db.products.map((product) => [
      product.slug,
      {
        slug: product.slug,
        name: resolveText(product.name, locale),
        views: db.analytics.productViewsBySlug[product.slug] ?? 0,
        unitsSold: 0,
        revenue: 0,
        orderCount: 0,
      },
    ]),
  );

  paidOrders.forEach((order) => {
    const countedProducts = new Set<string>();
    order.items.forEach((item) => {
      const product = productBySlug.get(item.productSlug);
      const stats = productStatsMap.get(item.productSlug);
      if (!product || !stats) {
        return;
      }

      const quantity = Math.max(1, item.quantity);
      const unitPrice = getProductPriceBySize(product, item.sizeKey);

      stats.unitsSold += quantity;
      stats.revenue += unitPrice * quantity;
      if (!countedProducts.has(item.productSlug)) {
        stats.orderCount += 1;
        countedProducts.add(item.productSlug);
      }
    });
  });

  const productStats = [...productStatsMap.values()].map((entry) => ({
    ...entry,
    unitConversionRate: entry.views > 0 ? (entry.unitsSold / entry.views) * 100 : 0,
  }));

  const topRevenueProducts = [...productStats]
    .filter((entry) => entry.revenue > 0 || entry.unitsSold > 0)
    .sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold)
    .slice(0, 8);
  const topViewedProducts = [...productStats]
    .filter((entry) => entry.views > 0 || entry.unitsSold > 0)
    .sort((a, b) => b.views - a.views || b.revenue - a.revenue)
    .slice(0, 8);
  const lowConversionProducts = [...productStats]
    .filter((entry) => entry.views >= 10)
    .sort((a, b) => a.unitConversionRate - b.unitConversionRate || b.views - a.views)
    .slice(0, 5);

  const topRevenueItems = topRevenueProducts.map((entry) => ({
    key: `analytics-revenue-${entry.slug}`,
    slug: entry.slug,
    name: entry.name,
    image: productBySlug.get(entry.slug)?.images[0] ?? null,
    secondary: `${t("조회", "Views")} ${entry.views.toLocaleString()} | ${t("주문", "Orders")} ${entry.orderCount.toLocaleString()}`,
    valueLabel: t("매출", "Revenue"),
    value: currency(entry.revenue),
  }));
  const topViewedItems = topViewedProducts.map((entry) => ({
    key: `analytics-view-${entry.slug}`,
    slug: entry.slug,
    name: entry.name,
    image: productBySlug.get(entry.slug)?.images[0] ?? null,
    secondary: `${t("전환", "Conversion")} ${entry.unitConversionRate.toFixed(1)}% | ${t("주문", "Orders")} ${entry.orderCount.toLocaleString()}`,
    valueLabel: t("조회수", "Views"),
    value: entry.views.toLocaleString(),
  }));
  const mobileTopProductItems = (mobileProductTab === "revenue" ? topRevenueItems : topViewedItems).slice(0, 5);

  const collectionStats = db.collections
    .map((collection) => {
      const slugs = db.products
        .filter((product) => product.collectionSlugs.includes(collection.slug))
        .map((product) => product.slug);

      const metrics = slugs.reduce(
        (acc, slug) => {
          const stats = productStatsMap.get(slug);
          if (!stats) {
            return acc;
          }
          return {
            views: acc.views + stats.views,
            unitsSold: acc.unitsSold + stats.unitsSold,
            revenue: acc.revenue + stats.revenue,
            orderCount: acc.orderCount + stats.orderCount,
          };
        },
        { views: 0, unitsSold: 0, revenue: 0, orderCount: 0 },
      );

      return {
        slug: collection.slug,
        name: resolveText(collection.name, locale),
        ...metrics,
        unitConversionRate: metrics.views > 0 ? (metrics.unitsSold / metrics.views) * 100 : 0,
      };
    })
    .sort((a, b) => b.revenue - a.revenue || b.unitsSold - a.unitsSold);

  const trendLength = range === "all" ? 30 : Math.max(7, rangeDays ?? 30);
  const dayKeys = Array.from({ length: trendLength }, (_, index) => {
    const day = new Date(analysisNow);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - (trendLength - 1 - index));
    return day.toISOString().slice(0, 10);
  });
  const dailyRevenueMap: Record<string, number> = Object.fromEntries(dayKeys.map((key) => [key, 0]));
  const dailyOrdersMap: Record<string, number> = Object.fromEntries(dayKeys.map((key) => [key, 0]));

  paidOrders.forEach((order) => {
    const key = order.createdAt.slice(0, 10);
    if (!(key in dailyRevenueMap)) {
      return;
    }
    dailyRevenueMap[key] += order.total;
    dailyOrdersMap[key] += 1;
  });

  const trendData = dayKeys.map((key) => ({
    key,
    label: key.slice(5),
    revenue: dailyRevenueMap[key],
    orders: dailyOrdersMap[key],
  }));
  const maxTrendRevenue = Math.max(1, ...trendData.map((entry) => entry.revenue));
  const sparklineSlice = trendData.slice(-Math.min(14, trendData.length));
  const topKpis = [
    {
      key: "analytics-kpi-revenue",
      label: t("총매출", "Total Revenue"),
      value: currency(totalRevenue),
      delta: buildDeltaState(totalRevenue, previousTotalRevenue),
      sparkline: sparklineSlice.map((point) => point.revenue),
      sparklineType: "line" as const,
    },
    {
      key: "analytics-kpi-orders",
      label: t("주문수", "Orders"),
      value: paidOrderCount.toLocaleString(),
      delta: buildDeltaState(paidOrderCount, previousPaidOrderCount),
      sparkline: sparklineSlice.map((point) => point.orders),
      sparklineType: "bar" as const,
    },
    {
      key: "analytics-kpi-aov",
      label: t("객단가(AOV)", "AOV"),
      value: currency(aov),
      delta: buildDeltaState(aov, previousAov),
      sparkline: sparklineSlice.map((point) => (point.orders > 0 ? point.revenue / point.orders : null)),
      sparklineType: "line" as const,
    },
    {
      key: "analytics-kpi-conversion",
      label: t("전환율", "Conversion"),
      value: `${orderConversionRate.toFixed(1)}%`,
      delta: buildDeltaState(orderConversionRate, previousOrderConversionRate),
      sparkline: totalProductViews > 0 ? sparklineSlice.map((point) => (point.orders / totalProductViews) * 100) : sparklineSlice.map(() => 0),
      sparklineType: "line" as const,
    },
  ];

  const rangeLabel =
    range === "7d"
      ? t("최근 7일", "Last 7 days")
      : range === "30d"
        ? t("최근 30일", "Last 30 days")
        : range === "90d"
          ? t("최근 90일", "Last 90 days")
          : range === "ytd"
            ? t("연초 이후", "Year to date")
            : range === "custom"
              ? `${customDateRange.start} ~ ${customDateRange.end}`
            : range === "180d"
              ? t("최근 180일", "Last 180 days")
              : t("전체 기간", "All time");
  const customRangeValue: "none" | "custom" | "180d" | "all" =
    range === "custom" || range === "180d" || range === "all" ? range : "none";
  const mobileMoreRangeValue: "more" | "ytd" | "custom" | "180d" | "all" =
    range === "7d" || range === "30d" || range === "90d"
      ? "more"
      : range === "ytd" || range === "custom" || range === "180d" || range === "all"
        ? range
        : "more";

  const salesIntervalData = useMemo<Record<SalesInterval, SalesSeriesPoint[]>>(() => {
    const DAY_MS = 24 * 60 * 60 * 1000;
    const now = new Date(analysisNow);
    const paidOrdersForSeries = db.orders.filter(
      (order) => order.paymentStatus === "paid" && order.status !== "cancelled" && isInRange(order.createdAt),
    );
    const formatDateKey = (timestamp: number): string => {
      const date = new Date(timestamp);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const day = String(date.getUTCDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const formatMonthKey = (timestamp: number): string => {
      const date = new Date(timestamp);
      const year = date.getUTCFullYear();
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    };
    const getUtcDayStart = (timestamp: number): number => {
      const date = new Date(timestamp);
      return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    };
    const getUtcWeekStart = (timestamp: number): number => {
      const dayStart = getUtcDayStart(timestamp);
      const date = new Date(dayStart);
      const weekday = (date.getUTCDay() + 6) % 7;
      return dayStart - weekday * DAY_MS;
    };
    const shortDateLabel = (timestamp: number): string =>
      new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
        month: "numeric",
        day: "numeric",
      }).format(new Date(timestamp));
    const monthLabel = (timestamp: number): string => {
      const date = new Date(timestamp);
      if (locale === "ko") {
        return `${date.getUTCMonth() + 1}월`;
      }
      return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
    };
    const createMetricsMap = (
      keys: string[],
    ): Map<string, { revenue: number; orders: number; units: number }> =>
      new Map(keys.map((key) => [key, { revenue: 0, orders: 0, units: 0 }]));
    const addOrderToBucket = (
      map: Map<string, { revenue: number; orders: number; units: number }>,
      key: string,
      revenue: number,
      units: number,
    ) => {
      const metrics = map.get(key);
      if (!metrics) {
        return;
      }
      metrics.revenue += revenue;
      metrics.orders += 1;
      metrics.units += units;
    };
    const toSeries = (
      buckets: Array<{ key: string; label: string }>,
      map: Map<string, { revenue: number; orders: number; units: number }>,
    ): SalesSeriesPoint[] =>
      buckets.map((bucket) => {
        const metrics = map.get(bucket.key);
        return {
          key: bucket.key,
          label: bucket.label,
          revenue: metrics?.revenue ?? 0,
          orders: metrics?.orders ?? 0,
          units: metrics?.units ?? 0,
        };
      });

    const todayStart = getUtcDayStart(analysisNow);
    const dailyBuckets = Array.from({ length: 14 }, (_, index) => {
      const bucketStart = todayStart - (13 - index) * DAY_MS;
      return {
        key: formatDateKey(bucketStart),
        label: shortDateLabel(bucketStart),
      };
    });
    const currentWeekStart = getUtcWeekStart(analysisNow);
    const weeklyBuckets = Array.from({ length: 12 }, (_, index) => {
      const bucketStart = currentWeekStart - (11 - index) * 7 * DAY_MS;
      return {
        key: formatDateKey(bucketStart),
        label: shortDateLabel(bucketStart),
      };
    });
    const monthlyBuckets = Array.from({ length: 12 }, (_, index) => {
      const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (11 - index), 1));
      const bucketStart = date.getTime();
      return {
        key: formatMonthKey(bucketStart),
        label: monthLabel(bucketStart),
      };
    });
    const dailyMap = createMetricsMap(dailyBuckets.map((bucket) => bucket.key));
    const weeklyMap = createMetricsMap(weeklyBuckets.map((bucket) => bucket.key));
    const monthlyMap = createMetricsMap(monthlyBuckets.map((bucket) => bucket.key));

    paidOrdersForSeries.forEach((order) => {
      const createdAt = new Date(order.createdAt).getTime();
      if (!Number.isFinite(createdAt) || createdAt <= 0) {
        return;
      }
      const units = order.items.reduce((sum, item) => sum + Math.max(1, item.quantity), 0);
      const dayKey = formatDateKey(createdAt);
      const weekKey = formatDateKey(getUtcWeekStart(createdAt));
      const monthKey = formatMonthKey(createdAt);

      addOrderToBucket(dailyMap, dayKey, order.total, units);
      addOrderToBucket(weeklyMap, weekKey, order.total, units);
      addOrderToBucket(monthlyMap, monthKey, order.total, units);
    });

    return {
      daily: toSeries(dailyBuckets, dailyMap),
      weekly: toSeries(weeklyBuckets, weeklyMap),
      monthly: toSeries(monthlyBuckets, monthlyMap),
    };
  }, [analysisNow, db.orders, isInRange, locale]);

  const activeSalesSeries = salesIntervalData[salesInterval];
  const salesSeriesTotalRevenue = activeSalesSeries.reduce((sum, entry) => sum + entry.revenue, 0);
  const salesSeriesTotalOrders = activeSalesSeries.reduce((sum, entry) => sum + entry.orders, 0);
  const salesSeriesTotalUnits = activeSalesSeries.reduce((sum, entry) => sum + entry.units, 0);
  const salesSeriesAverageRevenue = activeSalesSeries.length > 0 ? salesSeriesTotalRevenue / activeSalesSeries.length : 0;
  const salesSeriesPeak = activeSalesSeries.reduce<SalesSeriesPoint | null>((best, entry) => {
    if (!best || entry.revenue > best.revenue) {
      return entry;
    }
    return best;
  }, null);
  const salesIntervalLabel =
    salesInterval === "daily"
      ? t("일간", "Daily")
      : salesInterval === "weekly"
        ? t("주간", "Weekly")
        : t("월간", "Monthly");
  const salesSeriesWindowLabel =
    salesInterval === "daily"
      ? t("최근 14일", "Last 14 days")
      : salesInterval === "weekly"
        ? t("최근 12주", "Last 12 weeks")
        : t("최근 12개월", "Last 12 months");

  return (
    <div className="mx-auto grid w-full max-w-[1200px] gap-6">
      <header className="admin-surface sticky top-[4.5rem] z-30 p-4 sm:p-5">
        <div className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-[28px] font-semibold tracking-tight text-black/88">{t("통계", "Analytics")}</h1>
              <p className="mt-1 text-sm text-black/55">{t("매출, 주문, 전환 지표를 동일 톤으로 스캔합니다.", "Scan revenue, orders, and conversion in a consistent layout.")}</p>
            </div>
            <button
              type="button"
              onClick={() => setCompareEnabled((prev) => !prev)}
              className={cn(
                "admin-ghost-button inline-flex h-10 items-center gap-2 px-3 text-xs font-semibold",
                compareEnabled && "border-[rgba(232,46,92,0.28)] text-[color:var(--admin-accent)]",
              )}
            >
              <span className={cn("inline-flex h-2.5 w-2.5 rounded-full border", compareEnabled ? "border-[color:var(--admin-accent)] bg-[color:var(--admin-accent)]" : "border-black/20")} />
              {t("전기간 대비", "Compare previous")}
            </button>
          </div>

          <div className="grid gap-2 md:flex md:flex-wrap md:items-center md:justify-end">
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-black/10 bg-white p-1 md:hidden">
              {(["7d", "30d", "90d"] as AnalyticsRange[]).map((option) => {
                const active = range === option;
                return (
                  <button
                    key={`analytics-mobile-range-${option}`}
                    type="button"
                    onClick={() => setRange(option)}
                    className={cn(
                      "relative h-9 rounded-xl px-3 text-xs font-semibold transition-[background-color,color] duration-200 ease-out",
                      active ? "bg-[color:var(--admin-subtle-bg)] text-black/88" : "text-black/55 hover:bg-[color:var(--admin-subtle-bg)]",
                    )}
                  >
                    {option.toUpperCase()}
                    <span className={cn("absolute bottom-1 left-2 right-2 h-[2px] rounded-full", active ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
                  </button>
                );
              })}
            </div>

            <div className="hidden rounded-2xl border border-black/10 bg-white p-1 md:inline-flex">
              {([
                { label: "7D", value: "7d" },
                { label: "30D", value: "30d" },
                { label: "90D", value: "90d" },
                { label: "YTD", value: "ytd" },
              ] as Array<{ label: string; value: AnalyticsRange }>).map((option) => {
                const active = range === option.value;
                return (
                  <button
                    key={`analytics-range-${option.value}`}
                    type="button"
                    onClick={() => setRange(option.value)}
                    className={cn(
                      "relative h-9 rounded-xl px-4 text-xs font-semibold transition-[background-color,color] duration-200 ease-out",
                      active ? "bg-[color:var(--admin-subtle-bg)] text-black/88" : "text-black/55 hover:bg-[color:var(--admin-subtle-bg)]",
                    )}
                  >
                    {option.label}
                    <span className={cn("absolute bottom-1 left-3 right-3 h-[2px] rounded-full", active ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
                  </button>
                );
              })}
            </div>

            <select
              className="admin-input h-10 rounded-2xl px-3 text-sm text-black/75 md:hidden"
              value={mobileMoreRangeValue}
              onChange={(event) => {
                const next = event.target.value as AnalyticsRange | "custom" | "more";
                if (next === "more") {
                  return;
                }
                if (next === "custom") {
                  setRange("custom");
                  return;
                }
                setRange(next);
              }}
            >
              <option value="more">{t("더보기", "More")}</option>
              <option value="ytd">YTD</option>
              <option value="custom">{t("커스텀", "Custom")}</option>
              <option value="180d">180D</option>
              <option value="all">{t("전체 기간", "All time")}</option>
            </select>

            <select
              className="admin-input hidden h-10 rounded-2xl px-3 text-sm text-black/75 md:block"
              value={customRangeValue}
              onChange={(event) => {
                const next = event.target.value as AnalyticsRange | "custom" | "none";
                if (next === "none") {
                  return;
                }
                if (next === "custom") {
                  setRange("custom");
                  return;
                }
                setRange(next);
              }}
            >
              <option value="none">{t("추가 기간", "More ranges")}</option>
              <option value="custom">{t("커스텀", "Custom")}</option>
              <option value="180d">180D</option>
              <option value="all">{t("전체 기간", "All time")}</option>
            </select>
          </div>
        </div>
        {range === "custom" && (
          <div className="mt-4 flex flex-wrap items-end gap-2 sm:justify-end">
            <label className="grid gap-1">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/45">{t("시작일", "Start")}</span>
              <input
                type="date"
                className="admin-input h-10 rounded-2xl px-3 text-sm text-black/78"
                value={customDateRange.start}
                onChange={(event) => setCustomDateRange((prev) => ({ ...prev, start: event.target.value }))}
                max={customDateRange.end || undefined}
              />
            </label>
            <label className="grid gap-1">
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-black/45">{t("종료일", "End")}</span>
              <input
                type="date"
                className="admin-input h-10 rounded-2xl px-3 text-sm text-black/78"
                value={customDateRange.end}
                onChange={(event) => setCustomDateRange((prev) => ({ ...prev, end: event.target.value }))}
                min={customDateRange.start || undefined}
              />
            </label>
          </div>
        )}
      </header>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-12">
        {topKpis.map((kpi) => (
          <div key={kpi.key} className="col-span-1 xl:col-span-3">
            <AnalyticsTopKpiCard
              label={kpi.label}
              value={kpi.value}
              delta={kpi.delta}
              sparkline={kpi.sparkline}
              sparklineType={kpi.sparklineType}
              deltaSuffix={t("전기간 대비", "vs previous")}
            />
          </div>
        ))}
      </section>

      <section className="admin-surface p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-[14px] font-medium text-black/55">{t("보조 지표", "Secondary KPI")}</h2>
          <p className="text-xs text-black/45">{rangeLabel}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12">
          {[
            { key: "gross", group: t("매출", "Revenue"), label: t("할인 전 총매출", "Gross Sales"), value: currency(grossSales) },
            { key: "net", group: t("매출", "Revenue"), label: t("순매출", "Net Sales"), value: currency(netSales) },
            { key: "discount", group: t("매출", "Revenue"), label: t("할인 금액", "Discount"), value: currency(discountTotal) },
            { key: "units", group: t("주문", "Orders"), label: t("판매수량", "Units Sold"), value: totalUnitsSold.toLocaleString() },
            { key: "upo", group: t("주문", "Orders"), label: t("주문당 수량", "Units / Order"), value: unitsPerOrder.toFixed(2) },
            { key: "cancel", group: t("주문", "Orders"), label: t("취소율", "Cancellation"), value: `${cancellationRate.toFixed(1)}%` },
            { key: "refund-rate", group: t("주문", "Orders"), label: t("환불 요청률", "Refund Request Rate"), value: `${refundRequestRate.toFixed(1)}%` },
            { key: "views", group: t("트래픽", "Traffic"), label: t("상품 조회수", "Product Views"), value: totalProductViews.toLocaleString() },
            { key: "upv", group: t("트래픽", "Traffic"), label: t("조회당 판매율", "Units / View"), value: `${unitConversionRate.toFixed(1)}%` },
            { key: "new-customer", group: t("트래픽", "Traffic"), label: t("신규 고객", "New Customers"), value: newCustomers.toLocaleString() },
            { key: "active-customer", group: t("트래픽", "Traffic"), label: t("결제 고객 수", "Paying Customers"), value: activeCustomers.toLocaleString() },
            { key: "repeat", group: t("트래픽", "Traffic"), label: t("재구매율", "Repeat Rate"), value: `${repeatCustomerRate.toFixed(1)}%` },
          ].map((metric) => (
            <article key={metric.key} className="admin-surface p-4 xl:col-span-3">
              <p className="text-[11px] font-medium text-black/45">{metric.group}</p>
              <p className="mt-2 text-[13px] font-medium text-black/60">{metric.label}</p>
              <p className="mt-1.5 tabular-nums text-lg font-semibold text-black/86">{metric.value}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="admin-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[14px] font-medium text-black/55">{t("판매 주기 분석", "Sales Cycle Analysis")}</h2>
            <p className="text-sm text-black/55 mt-1">
              {t("선택된 기간 필터 기준으로 일간/주간/월간 흐름을 확인합니다.", "Review daily, weekly, and monthly flow within the selected range.")}
            </p>
          </div>
          <div className="inline-flex items-center gap-1 rounded-2xl border border-black/10 bg-white p-1">
            {([
              { value: "daily", label: t("일간", "Daily") },
              { value: "weekly", label: t("주간", "Weekly") },
              { value: "monthly", label: t("월간", "Monthly") },
            ] as Array<{ value: SalesInterval; label: string }>).map((option) => (
              <button
                key={`sales-period-${option.value}`}
                type="button"
                className={cn(
                  "relative h-9 rounded-xl px-4 text-xs font-semibold transition-[background-color,color] duration-200 ease-out",
                  salesInterval === option.value ? "bg-[color:var(--admin-subtle-bg)] text-black/88" : "text-black/55 hover:bg-[color:var(--admin-subtle-bg)]",
                )}
                onClick={() => setSalesInterval(option.value)}
              >
                {option.label}
                <span className={cn("absolute bottom-1 left-3 right-3 h-[2px] rounded-full", salesInterval === option.value ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 hidden gap-3 md:grid md:grid-cols-3">
          <AnalyticsCard
            label={t("선택 구간 총매출", "Window Revenue")}
            value={currency(salesSeriesTotalRevenue)}
            hint={`${salesIntervalLabel} · ${salesSeriesWindowLabel}`}
          />
          <AnalyticsCard
            label={t("구간당 평균 매출", "Avg Revenue per Bucket")}
            value={currency(salesSeriesAverageRevenue)}
            hint={t("선택 구간 평균", "Average in selected window")}
          />
          <AnalyticsCard
            label={t("최고 매출 구간", "Peak Sales Bucket")}
            value={salesSeriesPeak ? `${salesSeriesPeak.label} · ${currency(salesSeriesPeak.revenue)}` : "-"}
            hint={
              salesSeriesPeak
                ? `${salesSeriesPeak.orders.toLocaleString()} ${t("주문", "orders")} · ${salesSeriesPeak.units.toLocaleString()} ${t("개", "units")}`
                : t("데이터 없음", "No data")
            }
          />
        </div>

        <div className="mt-6">
          <AnalyticsSalesCycleBarChart
            data={activeSalesSeries}
            revenueLegend={t("매출", "Revenue")}
            ordersLegend={t("주문", "Orders")}
            unitsLegend={t("판매수량", "Units")}
            aovLegend={t("객단가", "AOV")}
            emptyLabel={t("차트 데이터가 없습니다.", "No chart data")}
          />
        </div>

        <div className="mt-3 hidden flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 md:flex">
          <span>{t("총 주문", "Total Orders")}: {salesSeriesTotalOrders.toLocaleString()}</span>
          <span>{t("총 판매 수량", "Units Sold")}: {salesSeriesTotalUnits.toLocaleString()}</span>
          <span>{t("집계 기간", "Window")}: {salesSeriesWindowLabel}</span>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-12 items-start">
        <section className="hidden lg:block admin-surface p-6 xl:col-span-7">
          <h2 className="text-[14px] font-medium text-black/55">{t("매출 추이", "Revenue Trend")}</h2>
          <div className="mt-5 grid gap-3">
            {trendData.map((entry) => (
              <div key={entry.key} className="grid grid-cols-[58px_minmax(0,1fr)_138px] items-center gap-3">
                <p className="text-xs font-semibold text-black/52">{entry.label}</p>
                <div className="h-2 rounded-full bg-black/[0.06] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-black/20"
                    style={{
                      width: `${entry.revenue > 0 ? Math.max(2, (entry.revenue / maxTrendRevenue) * 100) : 0}%`,
                    }}
                  />
                </div>
                <div className="text-right">
                  <p className="tabular-nums text-xs font-semibold text-black/82">{currency(entry.revenue)}</p>
                  <p className="text-[11px] text-black/50">
                    {entry.orders} {t("주문", "orders")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="admin-surface p-6 self-start h-fit xl:col-span-5">
          <h2 className="text-[14px] font-medium text-black/55">{t("운영 리스크", "Operational Risks")}</h2>
          <p className="mt-2 text-sm text-black/55">{t("0이 아닌 항목을 우선 처리하세요.", "Prioritize items with non-zero counts.")}</p>
          <div className="mt-5 grid gap-2.5">
            {riskItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="admin-hover-subtle flex items-center justify-between rounded-[14px] border border-black/10 bg-white px-3 py-2.5 transition-[background-color,border-color,color] duration-200 ease-out"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-black/74">
                  <span className={cn("h-2 w-2 rounded-full", item.count > 0 ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
                  {item.label}
                </span>
                <span
                  className={cn(
                    "inline-flex min-w-9 items-center justify-center rounded-full border px-2 py-1 text-xs tabular-nums",
                    item.count > 0
                      ? "border-[rgba(232,46,92,0.25)] bg-[rgba(232,46,92,0.04)] font-semibold text-[color:var(--admin-accent)]"
                      : "border-black/10 bg-black/[0.02] text-black/55",
                  )}
                >
                  {item.count}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="admin-surface p-4 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex rounded-2xl border border-black/10 bg-white p-1">
            <button
              type="button"
              onClick={() => setMobileProductTab("revenue")}
              className={cn(
                "relative h-9 rounded-xl px-4 text-xs font-semibold transition-[background-color,color] duration-200 ease-out",
                mobileProductTab === "revenue" ? "bg-[color:var(--admin-subtle-bg)] text-black/88" : "text-black/55",
              )}
            >
              {t("매출 상위", "Top Revenue")}
              <span className={cn("absolute bottom-1 left-3 right-3 h-[2px] rounded-full", mobileProductTab === "revenue" ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
            </button>
            <button
              type="button"
              onClick={() => setMobileProductTab("views")}
              className={cn(
                "relative h-9 rounded-xl px-4 text-xs font-semibold transition-[background-color,color] duration-200 ease-out",
                mobileProductTab === "views" ? "bg-[color:var(--admin-subtle-bg)] text-black/88" : "text-black/55",
              )}
            >
              {t("조회 상위", "Top Views")}
              <span className={cn("absolute bottom-1 left-3 right-3 h-[2px] rounded-full", mobileProductTab === "views" ? "bg-[color:var(--admin-accent)]" : "bg-transparent")} />
            </button>
          </div>
          <Link href="/admin/products" className="text-xs font-semibold text-[color:var(--admin-accent)]">
            {t("전체보기", "View all")}
          </Link>
        </div>
        <div className="mt-3 grid gap-2">
          {mobileTopProductItems.length === 0 && (
            <p className="rounded-[14px] border border-black/10 bg-white p-3 text-sm text-black/55">
              {mobileProductTab === "revenue" ? t("선택 기간의 매출 데이터가 없습니다.", "No sales data for this range.") : t("조회 데이터가 아직 없습니다.", "No view data yet.")}
            </p>
          )}
          {mobileTopProductItems.map((item) => (
            <Link
              key={`analytics-mobile-top-${item.key}`}
              href={`/product/${item.slug}`}
              className="admin-hover-subtle flex items-center gap-3 rounded-[14px] border border-black/10 bg-white px-3 py-2.5 transition-[background-color,border-color,color] duration-200 ease-out"
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-[12px] border border-black/10 object-cover" loading="lazy" />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-[12px] border border-black/10 bg-black/[0.03] text-black/35">
                  <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-black/85">{item.name}</p>
                <p className="mt-1 truncate text-xs text-black/55">{item.secondary}</p>
              </div>
              <p className="tabular-nums text-xs font-semibold text-black/82">{item.value}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="hidden gap-6 lg:grid xl:grid-cols-12">
        <AnalyticsProductList
          className="xl:col-span-6"
          title={t("매출 상위 상품", "Top Revenue Products")}
          emptyLabel={t("선택 기간의 매출 데이터가 없습니다.", "No sales data for this range.")}
          viewLabel={t("보기", "View")}
          items={topRevenueItems}
        />
        <AnalyticsProductList
          className="xl:col-span-6"
          title={t("조회수 상위 상품", "Top Viewed Products")}
          emptyLabel={t("조회 데이터가 아직 없습니다.", "No view data yet.")}
          viewLabel={t("보기", "View")}
          items={topViewedItems}
        />
      </div>

      <section className="admin-surface p-4 lg:hidden">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[14px] font-medium text-black/55">{t("컬렉션 성과", "Collection Performance")}</h2>
          <Link href="/admin/collections" className="text-xs font-semibold text-[color:var(--admin-accent)]">
            {t("전체보기", "View all")}
          </Link>
        </div>
        <div className="mt-3 grid gap-2.5">
          {collectionStats.slice(0, 3).map((entry) => (
            <article key={`analytics-collection-mobile-${entry.slug}`} className="rounded-2xl border border-black/10 bg-white p-3.5">
              <div className="flex items-start justify-between gap-2">
                <p className="line-clamp-1 text-sm font-semibold text-black/84">{entry.name}</p>
                <p className="tabular-nums text-xs font-semibold text-black/82">{currency(entry.revenue)}</p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-black/55">
                <span>{t("조회수", "Views")}: <span className="tabular-nums">{entry.views.toLocaleString()}</span></span>
                <span>{t("주문", "Orders")}: <span className="tabular-nums">{entry.orderCount.toLocaleString()}</span></span>
                <span>{t("전환율", "Conversion")}: <span className="tabular-nums">{entry.unitConversionRate.toFixed(1)}%</span></span>
              </div>
            </article>
          ))}
          {collectionStats.length === 0 && (
            <p className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/55">
              {t("컬렉션 통계 데이터가 없습니다.", "No collection analytics available.")}
            </p>
          )}
        </div>
      </section>

      <section className="hidden lg:block admin-surface p-6">
        <h2 className="text-[14px] font-medium text-black/55">{t("컬렉션 성과", "Collection Performance")}</h2>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-black/10">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="sticky top-0 z-[1] bg-white">
              <tr className="border-b border-black/10 text-xs uppercase tracking-[0.12em] text-black/45">
                <th className="px-4 py-3 text-left font-medium">{t("컬렉션", "Collection")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("조회수", "Views")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("수량", "Units")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("주문", "Orders")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("매출", "Revenue")}</th>
                <th className="px-4 py-3 text-right font-medium">{t("전환율", "Conversion")}</th>
              </tr>
            </thead>
            <tbody>
              {collectionStats.map((entry) => (
                <tr key={`analytics-collection-${entry.slug}`} className="admin-hover-subtle border-b border-black/5 transition-[background-color,border-color] duration-200 ease-out last:border-b-0">
                  <td className="px-4 py-3 font-semibold text-black/84">{entry.name}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-black/62">{entry.views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-black/62">{entry.unitsSold.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-black/62">{entry.orderCount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold text-black/84">{currency(entry.revenue)}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-black/62">{entry.unitConversionRate.toFixed(1)}%</td>
                </tr>
              ))}
              {collectionStats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-black/52">
                    {t("컬렉션 통계 데이터가 없습니다.", "No collection analytics available.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-surface p-6">
        <h2 className="text-[14px] font-medium text-black/55">{t("개인화 인사이트", "Personalized Insights")}</h2>
        <p className="text-sm text-black/55 mt-1">
          {t("조회는 높지만 전환이 낮은 상품을 추려 개선 우선순위를 제안합니다.", "Highlights products with high views but low conversion for optimization.")}
        </p>
        <div className="mt-4 grid gap-3">
          {lowConversionProducts.length === 0 && (
            <div className="rounded-2xl border border-black/10 bg-white p-4">
              <p className="text-sm text-black/55">{t("현재 개선이 필요한 상품이 없습니다.", "No products need immediate optimization.")}</p>
              <Link href="/admin/products" className="mt-3 inline-flex h-9 items-center rounded-xl border border-black/10 px-3 text-xs font-semibold text-[color:var(--admin-accent)] transition-colors duration-200 ease-out hover:text-black/80">
                {t("상품 보러가기", "Go to products")}
              </Link>
            </div>
          )}
          {lowConversionProducts.map((entry) => (
            <article key={`analytics-low-conv-${entry.slug}`} className="rounded-2xl border border-black/10 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-black/84 line-clamp-1">{entry.name}</p>
                <p className="text-xs tabular-nums font-semibold text-[color:var(--admin-accent)]">{entry.unitConversionRate.toFixed(1)}%</p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-black/55">
                <span>{t("조회수", "Views")}: {entry.views}</span>
                <span>{t("수량", "Units")}: {entry.unitsSold}</span>
                <span>{t("매출", "Revenue")}: {currency(entry.revenue)}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminProductsView({ editSlug }: { editSlug?: string | null }) {
  const { db, upsertProduct, deleteProduct, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const buildEmptyForm = () => ({
    slug: "",
    name: "",
    shortDescription: "",
    price: "0",
    freeShipping: false,
    category: "serum",
    image: "",
    collectionSlugs: "",
  });
  const toProductForm = (product: Product) => ({
    slug: product.slug,
    name: resolveText(product.name, locale),
    shortDescription: resolveText(product.shortDescription, locale),
    price: String(product.price),
    freeShipping: Boolean(product.freeShipping),
    category: product.category,
    image: product.images[0] ?? "",
    collectionSlugs: product.collectionSlugs.join(","),
  });
  const initialEditProduct = editSlug ? db.products.find((entry) => entry.slug === editSlug) ?? null : null;
  const [editingSlug, setEditingSlug] = useState<string | null>(initialEditProduct?.slug ?? null);
  const [form, setForm] = useState(() => (initialEditProduct ? toProductForm(initialEditProduct) : buildEmptyForm()));

  const reset = () => {
    setEditingSlug(null);
    setForm(buildEmptyForm());
  };

  const save = () => {
    const existing = db.products.find((product) => product.slug === form.slug);
    const now = new Date().toISOString();
    const product: Product = {
      ...(existing ?? {
        id: uid("prod"),
        description: form.shortDescription,
        skinTypes: ["normal"],
        concerns: ["hydration"],
        compareAtPrice: undefined,
        badge: undefined,
        images: [],
        ingredients: [],
        howToUse: [],
        routineTip: "",
        isFeatured: false,
        rating: 4.5,
        reviewCount: 0,
      }),
      slug: form.slug,
      name: form.name,
      shortDescription: form.shortDescription,
      description: existing?.description ?? form.shortDescription,
      price: Number(form.price),
      freeShipping: form.freeShipping,
      category: form.category as Product["category"],
      images: [form.image || existing?.images[0] || ""].filter(Boolean),
      collectionSlugs: form.collectionSlugs
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      createdAt: existing?.createdAt ?? now,
    };
    upsertProduct(product);
    reset();
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("제품", "Products")}</h1>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{editingSlug ? t("제품 수정", "Edit Product") : t("신규 제품", "New Product")}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("슬러그", "Slug")} value={form.slug} onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))} />
          <InputField label={t("제품명", "Name")} value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
        </div>
        <InputField
          label={t("짧은 설명", "Short Description")}
          value={form.shortDescription}
          onChange={(value) => setForm((prev) => ({ ...prev, shortDescription: value }))}
        />
        <div className="grid sm:grid-cols-3 gap-3">
          <InputField label={t("가격", "Price")} value={form.price} onChange={(value) => setForm((prev) => ({ ...prev, price: value }))} />
          <div>
            <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("카테고리", "Category")}</label>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm mt-2"
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value }))}
            >
              <option value="cleanser">{t("클렌저", "Cleanser")}</option>
              <option value="serum">{t("세럼", "Serum")}</option>
              <option value="moisturizer">{t("모이스처라이저", "Moisturizer")}</option>
              <option value="sunscreen">{t("선스크린", "Sunscreen")}</option>
              <option value="mask">{t("마스크", "Mask")}</option>
              <option value="tool">{t("툴", "Tool")}</option>
            </select>
          </div>
          <InputField
            label={t("컬렉션 (csv)", "Collections (csv)")}
            value={form.collectionSlugs}
            onChange={(value) => setForm((prev) => ({ ...prev, collectionSlugs: value }))}
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-[#e82e5c] focus:ring-[#e82e5c]"
            checked={form.freeShipping}
            onChange={(event) => setForm((prev) => ({ ...prev, freeShipping: event.target.checked }))}
          />
          {t("무료배송 상품", "Free Shipping Product")}
        </label>
        <InputField label={t("이미지 URL", "Image URL")} value={form.image} onChange={(value) => setForm((prev) => ({ ...prev, image: value }))} />
        <div className="flex gap-2">
          <button type="button" className="h-11 px-6 rounded-xl bg-[#e82e5c] text-white text-sm" onClick={save}>
            {editingSlug ? t("저장", "Update") : t("생성", "Create")}
          </button>
          {editingSlug && (
            <button type="button" className="h-11 px-6 rounded-xl border border-slate-300 text-sm" onClick={reset}>
              {t("취소", "Cancel")}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900">{t("전체 제품", "All Products")}</h2>
        <div className="mt-4 grid gap-3">
          {db.products.map((product) => (
            <article key={product.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold">{resolveText(product.name, locale)}</p>
                <p className="text-sm text-slate-500">
                  {product.slug} - {currency(product.price)}
                </p>
                {product.freeShipping && (
                  <p className="text-xs font-medium text-[#e82e5c] mt-1">{t("무료배송 적용", "Free shipping enabled")}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none"
                  onClick={() => {
                    setEditingSlug(product.slug);
                    setForm(toProductForm(product));
                  }}
                >
                  {t("수정", "Edit")}
                </button>
                <button type="button" className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none" onClick={() => deleteProduct(product.slug)}>
                  {t("삭제", "Delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
function AdminCollectionsView() {
  const { db, upsertCollection, deleteCollection, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    description: "",
    heroImage: "",
    productSlugs: "",
    sortOrder: "1",
  });

  const save = () => {
    const existing = db.collections.find((collection) => collection.slug === form.slug);
    const collection: Collection = {
      id: existing?.id ?? uid("col"),
      slug: form.slug,
      name: form.name,
      description: form.description,
      heroImage: form.heroImage,
      productSlugs: form.productSlugs
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      sortOrder: Number(form.sortOrder) || 1,
    };
    upsertCollection(collection);
    setEditingSlug(null);
    setForm({ slug: "", name: "", description: "", heroImage: "", productSlugs: "", sortOrder: "1" });
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("컬렉션", "Collections")}</h1>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{editingSlug ? t("컬렉션 수정", "Edit Collection") : t("신규 컬렉션", "New Collection")}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("슬러그", "Slug")} value={form.slug} onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))} />
          <InputField label={t("제품명", "Name")} value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
        </div>
        <InputField
          label={t("설명", "Description")}
          value={form.description}
          onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
        />
        <InputField label={t("히어로 이미지 URL", "Hero Image URL")} value={form.heroImage} onChange={(value) => setForm((prev) => ({ ...prev, heroImage: value }))} />
        <InputField
          label={t("제품 슬러그 (csv)", "Product Slugs (csv)")}
          value={form.productSlugs}
          onChange={(value) => setForm((prev) => ({ ...prev, productSlugs: value }))}
        />
        <InputField label={t("정렬 순서", "Sort Order")} value={form.sortOrder} onChange={(value) => setForm((prev) => ({ ...prev, sortOrder: value }))} />
        <button type="button" className="h-11 px-6 rounded-xl bg-[#e82e5c] text-white text-sm w-fit" onClick={save}>
          {editingSlug ? t("저장", "Update") : t("생성", "Create")}
        </button>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-xl font-semibold text-slate-900">{t("전체 컬렉션", "All Collections")}</h2>
        <div className="mt-4 grid gap-3">
          {db.collections.map((collection) => (
            <article key={collection.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-semibold">{resolveText(collection.name, locale)}</p>
                <p className="text-sm text-slate-500">{collection.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none"
                  onClick={() => {
                    setEditingSlug(collection.slug);
                    setForm({
                      slug: collection.slug,
                      name: resolveText(collection.name, locale),
                      description: resolveText(collection.description, locale),
                      heroImage: collection.heroImage,
                      productSlugs: collection.productSlugs.join(","),
                      sortOrder: String(collection.sortOrder),
                    });
                  }}
                >
                  {t("수정", "Edit")}
                </button>
                <button type="button" className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none" onClick={() => deleteCollection(collection.slug)}>
                  {t("삭제", "Delete")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function AdminOrdersView() {
  const router = useRouter();
  const { db, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const statusLabelMap: Record<Order["status"], { ko: string; en: string }> = {
    pending: { ko: "대기", en: "Pending" },
    processing: { ko: "처리 중", en: "Processing" },
    shipped: { ko: "배송 중", en: "Shipped" },
    delivered: { ko: "배송 완료", en: "Delivered" },
    cancelled: { ko: "취소", en: "Cancelled" },
  };
  const paymentLabelMap: Record<Order["paymentStatus"], { ko: string; en: string }> = {
    pending: { ko: "대기", en: "Pending" },
    paid: { ko: "완료", en: "Paid" },
  };
  const orderStatusLabel = (status: Order["status"]) => statusLabelMap[status][locale];
  const paymentStatusLabel = (status: Order["paymentStatus"]) => paymentLabelMap[status][locale];
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Order["status"]>("all");
  const [dateFilter, setDateFilter] = useState<"all" | "30d" | "7d">("all");
  const [page, setPage] = useState(1);
  const usersById = useMemo(() => new Map(db.users.map((user) => [user.id, user])), [db.users]);

  const sortedOrders = useMemo(
    () => [...db.orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
    [db.orders],
  );

  const filteredOrders = useMemo(() => {
    const baseline = sortedOrders.length > 0 ? +new Date(sortedOrders[0].createdAt) : 0;
    return sortedOrders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      const createdAt = +new Date(order.createdAt);
      if (dateFilter === "7d" && createdAt < baseline - 7 * 24 * 60 * 60 * 1000) {
        return false;
      }
      if (dateFilter === "30d" && createdAt < baseline - 30 * 24 * 60 * 60 * 1000) {
        return false;
      }

      if (!query.trim()) {
        return true;
      }

      const customer = usersById.get(order.userId);
      const haystack = `${order.id} ${customer?.name ?? ""} ${customer?.email ?? ""}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [sortedOrders, statusFilter, dateFilter, query, usersById]);

  if (db.orders.length === 0) {
    return <EmptyState title={t("주문이 없습니다", "No orders")} body={t("결제가 완료되면 주문이 이곳에 표시됩니다.", "Orders will appear here after checkout.")} />;
  }

  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * pageSize;
  const pagedOrders = filteredOrders.slice(start, start + pageSize);

  const exportCsv = () => {
    const header = "order_id,created_at,status,payment,total,tracking,refund_requested\n";
    const rows = filteredOrders
      .map((order) =>
        [
          order.id,
          order.createdAt,
          order.status,
          order.paymentStatus,
          order.total.toFixed(2),
          order.trackingNumber ?? "",
          order.refundRequested ? "true" : "false",
        ]
          .map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = locale === "ko" ? "orders-ko.csv" : "orders.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const paymentPillClass = (status: Order["paymentStatus"]) =>
    status === "pending"
      ? "border-[rgba(232,46,92,0.25)] bg-[rgba(232,46,92,0.04)] text-[color:var(--admin-accent)]"
      : "border-black/10 bg-black/[0.02] text-black/60";

  return (
    <>
      <div className="mb-6 grid gap-2.5 md:mb-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="relative w-full lg:max-w-sm">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-black/42">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            className="admin-input admin-menu-search-input h-11 w-full pl-10 pr-3 text-sm text-black/82 placeholder:text-black/45"
            placeholder={t("주문 검색", "Search orders")}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 lg:flex lg:flex-wrap lg:items-center lg:justify-end">
          <select
            className="admin-input h-11 w-full min-w-[124px] px-3 text-sm text-black/76"
            aria-label={t("기간 필터", "Date filter")}
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value as typeof dateFilter);
              setPage(1);
            }}
          >
            <option value="30d">{t("최근 30일", "Last 30 Days")}</option>
            <option value="7d">{t("최근 7일", "Last 7 Days")}</option>
            <option value="all">{t("전체 기간", "All time")}</option>
          </select>
          <select
            className="admin-input h-11 w-full min-w-[124px] px-3 text-sm text-black/76"
            aria-label={t("주문 상태 필터", "Order status filter")}
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as typeof statusFilter);
              setPage(1);
            }}
          >
            <option value="all">{t("상태: 전체", "Status: All")}</option>
            <option value="pending">{orderStatusLabel("pending")}</option>
            <option value="processing">{orderStatusLabel("processing")}</option>
            <option value="shipped">{orderStatusLabel("shipped")}</option>
            <option value="delivered">{orderStatusLabel("delivered")}</option>
            <option value="cancelled">{orderStatusLabel("cancelled")}</option>
          </select>
          <button
            className="admin-ghost-button inline-flex h-11 items-center justify-center gap-1.5 px-3 text-xs font-semibold text-black/72"
            onClick={exportCsv}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span>{t("CSV 내보내기", "Export CSV")}</span>
          </button>
          <button className="admin-solid-button inline-flex h-11 items-center justify-center gap-1.5 px-3 text-xs font-semibold" type="button">
            <span className="material-symbols-outlined text-[16px]">add</span>
            {t("주문 생성", "Create Order")}
          </button>
        </div>
      </div>

      <div className="admin-surface overflow-hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-black/10 bg-black/[0.015] text-[11px] uppercase tracking-[0.12em] text-black/45">
                <th className="px-5 py-4 font-medium">{t("주문 번호", "Order ID")}</th>
                <th className="px-5 py-4 font-medium">{t("주문일", "Date")}</th>
                <th className="px-5 py-4 font-medium">{t("고객", "Customer")}</th>
                <th className="px-5 py-4 font-medium">{t("상태", "Status")}</th>
                <th className="px-5 py-4 text-right font-medium">{t("합계", "Total")}</th>
                <th className="px-5 py-4 text-center font-medium">{t("결제", "Payment")}</th>
                <th className="px-5 py-4 text-right font-medium">{t("보기", "View")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-sm">
              {pagedOrders.map((order) => {
                const customer = usersById.get(order.userId);
                const customerName = customer?.name ?? t("비회원", "Guest");
                const customerEmail = customer?.email ?? "guest@example.com";
                const initials = customerName
                  .split(" ")
                  .map((part) => part[0] ?? "")
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const timeLabel = new Date(order.createdAt).toLocaleTimeString(locale === "ko" ? "ko-KR" : "en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const paymentIcon = order.refundRequested
                  ? "replay"
                  : order.paymentStatus === "paid"
                    ? "check"
                    : "hourglass_empty";

                return (
                  <tr key={order.id} className="admin-hover-subtle group">
                    <td className="px-5 py-4 whitespace-nowrap text-black/86">
                      <Link
                        className="font-semibold transition-colors duration-200 ease-out hover:text-[color:var(--admin-accent)]"
                        href={`/admin/orders/${order.id}`}
                      >
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-black/58">
                      {formatDate(order.createdAt)} <br />
                      <span className="text-[11px] tabular-nums text-black/42">{timeLabel}</span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-black/80">
                          <span className="text-xs font-semibold">{initials || "NA"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-black/84">{customerName}</span>
                          <span className="max-w-[220px] truncate text-xs text-black/52">{customerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <OrderStatusPill status={order.status} label={orderStatusLabel(order.status)} />
                    </td>
                    <td
                      className={`px-5 py-4 whitespace-nowrap text-right tabular-nums text-base font-semibold ${
                        order.status === "cancelled"
                          ? "text-black/52 line-through decoration-black/20"
                          : "text-black/86"
                      }`}
                    >
                      {currency(order.total)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <span
                          className={cn(
                            "inline-flex min-w-5 items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                            paymentPillClass(order.paymentStatus),
                          )}
                        >
                          <span className="material-symbols-outlined text-[15px]">{paymentIcon}</span>
                          <span className="ml-1">{paymentStatusLabel(order.paymentStatus)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        className="inline-flex h-8 items-center rounded-full border border-black/10 px-3 text-xs font-semibold text-[color:var(--admin-accent)] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                        type="button"
                        aria-label={t(`주문 ${order.id} 보기`, `View order ${order.id}`)}
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        {t("보기", "View")}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-black/10 md:hidden">
          {pagedOrders.map((order) => {
            const customer = usersById.get(order.userId);
            const customerName = customer?.name ?? t("비회원", "Guest");
            const customerEmail = customer?.email ?? "guest@example.com";
            const timeLabel = new Date(order.createdAt).toLocaleTimeString(locale === "ko" ? "ko-KR" : "en-US", {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <article key={`mobile-${order.id}`} className="admin-hover-subtle p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/admin/orders/${order.id}`} className="block break-all text-sm font-semibold text-black/85">
                      #{order.id}
                    </Link>
                    <p className="mt-1 tabular-nums text-xs text-black/52">
                      {formatDate(order.createdAt)} · {timeLabel}
                    </p>
                  </div>
                  <p
                    className={cn(
                      "tabular-nums text-right text-sm font-semibold",
                      order.status === "cancelled" ? "text-black/52 line-through decoration-black/20" : "text-black/86",
                    )}
                  >
                    {currency(order.total)}
                  </p>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium text-black/84">{customerName}</p>
                  <p className="mt-0.5 truncate text-xs text-black/52">{customerEmail}</p>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <OrderStatusPill status={order.status} label={orderStatusLabel(order.status)} />
                  <span
                    className={cn(
                      "inline-flex min-w-5 items-center justify-center rounded-full border px-2.5 py-1 text-[11px] font-medium",
                      paymentPillClass(order.paymentStatus),
                    )}
                  >
                    {paymentStatusLabel(order.paymentStatus)}
                  </span>
                  {order.refundRequested && (
                    <span className="inline-flex items-center rounded-full border border-[rgba(232,46,92,0.25)] bg-[rgba(232,46,92,0.04)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--admin-accent)]">
                      {t("환불 요청", "Refund")}
                    </span>
                  )}
                  <button
                    className="admin-ghost-button ml-auto inline-flex h-8 items-center px-3 text-xs font-semibold text-[color:var(--admin-accent)]"
                    type="button"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    {t("보기", "View")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {pagedOrders.length === 0 && <p className="text-sm text-[#64748B] mt-6">{t("필터 조건에 맞는 주문이 없습니다.", "No orders match this filter.")}</p>}

      <div className="flex items-center justify-between pb-4 pt-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            className="admin-ghost-button relative inline-flex items-center px-4 py-2 text-sm font-medium text-black/84 disabled:opacity-40"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            type="button"
          >
            {t("이전", "Previous")}
          </button>
          <button
            className="admin-ghost-button relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-black/84 disabled:opacity-40"
            onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
            disabled={currentPage === pageCount}
            type="button"
          >
            {t("다음", "Next")}
          </button>
        </div>

        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-[#64748B] uppercase tracking-wide">
              {t("총", "Showing")}{" "}
              <span className="font-medium text-[#0F172A]">{filteredOrders.length === 0 ? 0 : start + 1}</span>{" "}
              {t("부터", "to")}{" "}
              <span className="font-medium text-[#0F172A]">{Math.min(start + pageSize, filteredOrders.length)}</span>{" "}
              {t("표시 / 전체", "of")}{" "}
              <span className="font-medium text-[#0F172A]">{filteredOrders.length}</span>{" "}
              {t("건", "results")}
            </p>
          </div>
          <div>
            <nav aria-label={t("페이지네이션", "Pagination")} className="isolate inline-flex -space-x-px">
              <button
                className="relative inline-flex items-center px-2 py-2 text-[#64748B] hover:text-[#0F172A] focus:z-20 focus:outline-offset-0 disabled:opacity-40"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                type="button"
              >
                <span className="sr-only">{t("이전", "Previous")}</span>
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="relative z-10 inline-flex items-center px-4 py-2 text-sm font-semibold text-[#0F172A] underline underline-offset-4 decoration-1 decoration-[#0F172A]">
                {currentPage}
              </span>
              <button
                className="relative inline-flex items-center px-2 py-2 text-[#64748B] hover:text-[#0F172A] focus:z-20 focus:outline-offset-0 disabled:opacity-40"
                onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
                disabled={currentPage === pageCount}
                type="button"
              >
                <span className="sr-only">{t("다음", "Next")}</span>
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}

function AdminOrderDetailView({ id }: { id: string }) {
  const { db, updateOrderAdmin, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const statusLabelMap: Record<Order["status"], { ko: string; en: string }> = {
    pending: { ko: "대기", en: "Pending" },
    processing: { ko: "처리 중", en: "Processing" },
    shipped: { ko: "배송 중", en: "Shipped" },
    delivered: { ko: "배송 완료", en: "Delivered" },
    cancelled: { ko: "취소", en: "Cancelled" },
  };
  const paymentLabelMap: Record<Order["paymentStatus"], { ko: string; en: string }> = {
    pending: { ko: "결제 대기", en: "Pending" },
    paid: { ko: "결제 완료", en: "Paid" },
  };
  const categoryLabelMap: Record<Product["category"], string> = {
    cleanser: "클렌저",
    serum: "세럼",
    moisturizer: "모이스처라이저",
    sunscreen: "선스크린",
    mask: "마스크",
    tool: "도구",
  };
  const orderStatusLabel = (status: Order["status"]) => statusLabelMap[status][locale];
  const paymentStatusLabel = (status: Order["paymentStatus"]) => paymentLabelMap[status][locale];
  const productCategoryLabel = (category: Product["category"]) => (locale === "ko" ? categoryLabelMap[category] ?? category : category);
  const [noteInput, setNoteInput] = useState("");
  const [notes, setNotes] = useState<Array<{ id: string; text: string; createdAt: string }>>([]);
  const [showFullHistory, setShowFullHistory] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const order = db.orders.find((entry) => entry.id === id);

  if (!order) {
    return <EmptyState title={t("주문을 찾을 수 없습니다", "Order not found")} body={t("요청하신 주문 정보가 존재하지 않습니다.", "This order does not exist.")} ctaHref="/admin/orders" ctaLabel={t("주문 목록으로", "Back to Orders")} />;
  }

  const customer = db.users.find((entry) => entry.id === order.userId);
  const lines = order.items
    .map((item) => {
      const product = db.products.find((product) => product.slug === item.productSlug);
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
        entry,
      ): entry is {
        item: (typeof order.items)[number];
        product: (typeof db.products)[number];
        unitPrice: number;
      } => Boolean(entry),
    );

  const statusTone: Record<Order["status"], string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    processing: "bg-amber-100 text-amber-700 border-amber-200",
    shipped: "bg-sky-100 text-sky-700 border-sky-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const subtotal = lines.reduce((sum, line) => sum + line.unitPrice * line.item.quantity, 0);
  const shippingAndTax = Math.max(0, order.total - (subtotal - order.discount));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link className="hover:text-[#e82e5c] transition-colors" href="/admin/orders">
                {t("주문", "Orders")}
              </Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-slate-900 font-medium">
                {t("주문", "Order")} #{order.id}
              </span>
            </nav>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {t("주문", "Order")} #{order.id}
              </h1>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${statusTone[order.status]}`}>
                <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                {orderStatusLabel(order.status)}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {t("접수일", "Placed on")} {formatDate(order.createdAt, locale)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
              type="button"
              onClick={() => window.print()}
            >
              <span className="material-symbols-outlined mr-2 text-lg">print</span>
              {t("송장 출력", "Print Invoice")}
            </button>
            <div className="relative">
              <button
                className="inline-flex items-center justify-center rounded-lg bg-[#e82e5c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#e82e5c]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e82e5c] focus:ring-offset-2"
                onClick={() => setStatusMenuOpen((prev) => !prev)}
                type="button"
              >
                {t("상태 변경", "Update Status")}
                <span className="material-symbols-outlined ml-2 text-lg">keyboard_arrow_down</span>
              </button>
              {statusMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] min-w-40 rounded-lg border border-slate-200 bg-white shadow-lg z-20 overflow-hidden">
                  {(["pending", "processing", "shipped", "delivered", "cancelled"] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 capitalize"
                      onClick={() => {
                        updateOrderAdmin(order.id, { status });
                        setStatusMenuOpen(false);
                      }}
                    >
                      {orderStatusLabel(status)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 px-6 py-4 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-900">{t("주문 품목", "Order Items")}</h3>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                {locale === "ko" ? `${lines.length}개 항목` : `${lines.length} Items`}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {lines.map((line) => (
                <div
                  key={`${line.product.id}:${line.item.sizeKey ?? "default"}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-6 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                    <img
                      alt={resolveText(line.product.name, locale)}
                      className="h-full w-full object-cover"
                      src={line.product.images[0]}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{resolveText(line.product.name, locale)}</h4>
                    <p className="text-sm text-slate-500 capitalize">{productCategoryLabel(line.product.category)}</p>
                    {hasMultipleProductSizes(line.product) && (
                      <p className="text-xs text-slate-500 mt-1">
                        {t("용량", "Size")}: {getProductSizeLabel(line.product, locale, line.item.sizeKey)}
                      </p>
                    )}
                    <p className="text-xs font-mono text-slate-400 mt-1">SKU: {line.product.slug.toUpperCase()}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-x-6 sm:gap-1 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-sm text-slate-500">
                      <span className="sm:hidden">{t("수량: ", "Qty: ")}</span>
                      {line.item.quantity} x {currency(line.unitPrice)}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{currency(line.unitPrice * line.item.quantity)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-slate-50 px-6 py-6 border-t border-slate-200">
              <div className="flex flex-col gap-3 max-w-xs ml-auto">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{t("상품 합계", "Subtotal")}</span>
                  <span className="font-medium">{currency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{t("배송비 + 세금", "Shipping + Tax")}</span>
                  <span className="font-medium">{currency(shippingAndTax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>{t("할인", "Discount")}</span>
                    <span className="font-medium">-{currency(order.discount)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 my-1" />
                <div className="flex justify-between items-center text-base">
                  <span className="font-semibold text-slate-900">{t("합계", "Total")}</span>
                  <span className="text-xl font-bold text-[#e82e5c]">{currency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">{t("내부 메모", "Internal Notes")}</h3>
            <div className="relative">
              <textarea
                className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 text-sm focus:border-[#e82e5c] focus:ring-[#e82e5c] placeholder:text-slate-400"
                placeholder={t("이 주문에 대한 운영 메모를 남겨주세요.", "Add an internal note for this order.")}
                rows={3}
                value={noteInput}
                onChange={(event) => setNoteInput(event.target.value)}
              />
              <button
                className="absolute bottom-2 right-2 p-1.5 bg-white rounded-md text-slate-400 hover:text-[#e82e5c] shadow-sm border border-slate-100 transition-colors"
                onClick={() => {
                  if (!noteInput.trim()) {
                    return;
                  }
                  setNotes((prev) => [{ id: uid("note"), text: noteInput.trim(), createdAt: new Date().toISOString() }, ...prev]);
                  setNoteInput("");
                }}
                type="button"
              >
                <span className="material-symbols-outlined text-lg">send</span>
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {notes.length === 0 ? (
                <p className="text-sm text-slate-500">{t("아직 등록된 내부 메모가 없습니다.", "No internal notes yet.")}</p>
              ) : (
                notes.map((note) => (
                  <div key={note.id} className="flex gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-slate-200 flex-shrink-0" />
                    <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900 text-xs">{t("스태프 메모", "Staff Note")}</span>
                        <span className="text-xs text-slate-400">{formatDate(note.createdAt, locale)}</span>
                      </div>
                      <p className="text-slate-600">{note.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">{t("고객 정보", "Customer Details")}</h3>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#e82e5c]/10 flex items-center justify-center text-[#e82e5c] flex-shrink-0">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{customer?.name ?? t("비회원 고객", "Guest Customer")}</h4>
                  <a className="text-sm text-[#e82e5c] hover:underline block mt-0.5" href={`mailto:${customer?.email ?? "guest@example.com"}`}>
                    {customer?.email ?? "guest@example.com"}
                  </a>
                  <p className="text-sm text-slate-500 mt-0.5">{order.shippingAddress.phone || "+1 (555) 000-0000"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{t("배송지", "Shipping Address")}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {order.shippingAddress.line1}
                    {order.shippingAddress.line2 && (
                      <>
                        <br />
                        {order.shippingAddress.line2}
                      </>
                    )}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{t("청구지", "Billing Address")}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{t("배송지와 동일", "Same as shipping address")}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">{t("결제 수단", "Payment Method")}</p>
                  <div className="flex items-center gap-2">
                    <div className="bg-slate-100 rounded px-2 py-1">
                      <span className="font-bold text-slate-700 text-xs tracking-wider">CARD</span>
                    </div>
                    <span className="text-sm text-slate-700">
                      {paymentStatusLabel(order.paymentStatus)} - {order.couponCode ? `${t("쿠폰", "Coupon")} ${order.couponCode}` : t("쿠폰 없음", "No coupon")}
                    </span>
                  </div>
                </div>
                <div className="grid gap-3 pt-2">
                  <input
                    className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
                    placeholder={t("운송장 번호", "Tracking number")}
                    value={order.trackingNumber ?? ""}
                    onChange={(event) => updateOrderAdmin(order.id, { trackingNumber: event.target.value })}
                  />
                  <label className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={order.refundRequested}
                      onChange={(event) => updateOrderAdmin(order.id, { refundRequested: event.target.checked })}
                    />
                    {t("환불 요청 접수", "Refund requested")}
                  </label>
                  <label className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={order.paymentStatus === "paid"}
                      onChange={(event) =>
                        updateOrderAdmin(order.id, { paymentStatus: event.target.checked ? "paid" : "pending" })
                      }
                    />
                    {t("결제 완료 처리", "Mark as paid")}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-base font-semibold text-slate-900">{t("주문 타임라인", "Order Timeline")}</h3>
            </div>
            <div className="p-6">
              <div className="relative pl-4 border-l-2 border-slate-200 space-y-8">
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-amber-500 ring-2 ring-amber-100" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">{orderStatusLabel(order.status)}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{t("현재 주문 상태", "Current order state")}</span>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#e82e5c]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">{t("결제", "Payment")} {order.paymentStatus === "paid" ? t("확인됨", "Verified") : t("대기", "Pending")}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt, locale)}</span>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#e82e5c]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">{t("주문 접수", "Order Placed")}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt, locale)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-xl">
              <button
                className="w-full text-center text-sm font-medium text-[#e82e5c] hover:text-[#e82e5c]/80 transition-colors"
                onClick={() => setShowFullHistory((prev) => !prev)}
                type="button"
              >
                {showFullHistory ? t("전체 이력 숨기기", "Hide Full History") : t("전체 이력 보기", "View Full History")}
              </button>
              {showFullHistory && (
                <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-3 text-xs text-slate-500 uppercase tracking-[0.12em]">
                  {t("운송장", "Tracking")}: {order.trackingNumber || t("대기", "Pending")} | {t("환불", "Refund")}: {order.refundRequested ? t("요청됨", "Requested") : t("없음", "No")}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminCustomersView() {
  const { db, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const users = db.users.filter((user) => user.role === "user");

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("고객", "Customers")}</h1>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
        <div className="grid gap-3">
          {users.map((user) => (
            <article key={user.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-slate-500">{user.email}</p>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>
                  {t("주문", "Orders")}: {db.orders.filter((order) => order.userId === user.id).length}
                </p>
                <p>
                  {t("가입일", "Joined")}: {formatDate(user.createdAt, locale)}
                </p>
              </div>
            </article>
          ))}
          {users.length === 0 && <p className="text-sm text-slate-500">{t("등록된 고객이 없습니다.", "No customers found.")}</p>}
        </div>
      </section>
    </div>
  );
}

function AdminReviewsView() {
  const { db, approveReview, deleteReview, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("리뷰", "Reviews")}</h1>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        {db.reviews.map((review) => (
          <article key={review.id} className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <p className="font-semibold">{resolveText(review.title, locale)}</p>
              <p className="text-xs uppercase tracking-[0.12em] text-slate-500">{review.approved ? t("승인", "Approved") : t("대기", "Pending")}</p>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              {review.userName} - {review.productSlug}
            </p>
            <p className="text-sm mt-3">{resolveText(review.body, locale)}</p>
            <div className="mt-4 flex gap-2">
              {!review.approved && (
                <button type="button" className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none" onClick={() => approveReview(review.id)}>
                  {t("승인", "Approve")}
                </button>
              )}
              <button type="button" className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none" onClick={() => deleteReview(review.id)}>
                {t("삭제", "Delete")}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
function AdminJournalView() {
  const { db, upsertArticle, deleteArticle, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    excerpt: "",
    category: "Guides",
    coverImage: "",
    content: "",
    relatedProductSlugs: "",
  });

  const save = () => {
    const existing = db.articles.find((article) => article.slug === form.slug);
    const article: Article = {
      id: existing?.id ?? uid("art"),
      slug: form.slug,
      title: form.title,
      excerpt: form.excerpt,
      category: form.category,
      coverImage: form.coverImage,
      content: form.content,
      relatedProductSlugs: form.relatedProductSlugs
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean),
      publishedAt: existing?.publishedAt ?? new Date().toISOString(),
    };
    upsertArticle(article);
    setForm({ slug: "", title: "", excerpt: "", category: "Guides", coverImage: "", content: "", relatedProductSlugs: "" });
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("저널", "Journal")}</h1>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        <h2 className="text-xl font-semibold text-slate-900">{t("아티클 작성", "Write Article")}</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("슬러그", "Slug")} value={form.slug} onChange={(value) => setForm((prev) => ({ ...prev, slug: value }))} />
          <InputField label={t("제목", "Title")} value={form.title} onChange={(value) => setForm((prev) => ({ ...prev, title: value }))} />
        </div>
        <InputField label={t("요약", "Excerpt")} value={form.excerpt} onChange={(value) => setForm((prev) => ({ ...prev, excerpt: value }))} />
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("카테고리", "Category")} value={form.category} onChange={(value) => setForm((prev) => ({ ...prev, category: value }))} />
          <InputField label={t("커버 이미지 URL", "Cover Image URL")} value={form.coverImage} onChange={(value) => setForm((prev) => ({ ...prev, coverImage: value }))} />
        </div>
        <InputField
          label={t("연관 제품 슬러그 (csv)", "Related Product Slugs (csv)")}
          value={form.relatedProductSlugs}
          onChange={(value) => setForm((prev) => ({ ...prev, relatedProductSlugs: value }))}
        />
        <div>
          <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("HTML 본문", "HTML Content")}</label>
          <textarea
            className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm mt-2"
            value={form.content}
            onChange={(event) => setForm((prev) => ({ ...prev, content: event.target.value }))}
          />
        </div>
        <button type="button" className="h-11 px-6 rounded-xl bg-[#e82e5c] text-white text-sm w-fit" onClick={save}>
          {t("아티클 저장", "Save Article")}
        </button>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        {db.articles.map((article) => (
          <article key={article.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{resolveText(article.title, locale)}</p>
              <p className="text-sm text-slate-500">{article.slug}</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none"
                onClick={() =>
                  setForm({
                    slug: article.slug,
                    title: resolveText(article.title, locale),
                    excerpt: resolveText(article.excerpt, locale),
                    category: article.category,
                    coverImage: article.coverImage,
                    content: resolveText(article.content, locale),
                    relatedProductSlugs: article.relatedProductSlugs.join(","),
                  })
                }
              >
                {t("수정", "Edit")}
              </button>
              <button type="button" className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none" onClick={() => deleteArticle(article.slug)}>
                {t("삭제", "Delete")}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}

function AdminBannersView() {
  const { db, upsertBanner, deleteBanner, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [form, setForm] = useState({
    id: "",
    key: "hero",
    type: "image",
    url: "",
    headline: "",
    subheadline: "",
    ctaText: "",
    ctaHref: "/shop",
    active: true,
  });

  const save = () => {
    const banner: Banner = {
      id: form.id || uid("bn"),
      key: form.key as Banner["key"],
      type: form.type as Banner["type"],
      url: form.url,
      headline: form.headline,
      subheadline: form.subheadline,
      ctaText: form.ctaText,
      ctaHref: form.ctaHref,
      active: form.active,
    };
    upsertBanner(banner);
    setForm({ id: "", key: "hero", type: "image", url: "", headline: "", subheadline: "", ctaText: "", ctaHref: "/shop", active: true });
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("배너", "Banners")}</h1>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("ID (선택)", "ID (optional)")} value={form.id} onChange={(value) => setForm((prev) => ({ ...prev, id: value }))} />
          <div>
            <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("키", "Key")}</label>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm mt-2" value={form.key} onChange={(event) => setForm((prev) => ({ ...prev, key: event.target.value }))}>
              <option value="hero">{t("메인", "Hero")}</option>
              <option value="secondary">{t("서브", "Secondary")}</option>
            </select>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("유형", "Type")}</label>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm mt-2" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}>
              <option value="image">{t("이미지", "Image")}</option>
              <option value="video">{t("영상", "Video")}</option>
            </select>
          </div>
          <label className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm flex items-center gap-2 mt-6">
            <input type="checkbox" checked={form.active} onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))} />
            {t("활성화", "Active")}
          </label>
        </div>
        <InputField label={t("URL", "URL")} value={form.url} onChange={(value) => setForm((prev) => ({ ...prev, url: value }))} />
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("헤드라인", "Headline")} value={form.headline} onChange={(value) => setForm((prev) => ({ ...prev, headline: value }))} />
          <InputField label={t("서브카피", "Subheadline")} value={form.subheadline} onChange={(value) => setForm((prev) => ({ ...prev, subheadline: value }))} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("CTA 문구", "CTA Text")} value={form.ctaText} onChange={(value) => setForm((prev) => ({ ...prev, ctaText: value }))} />
          <InputField label={t("CTA 경로", "CTA Href")} value={form.ctaHref} onChange={(value) => setForm((prev) => ({ ...prev, ctaHref: value }))} />
        </div>
        <button type="button" className="h-11 px-6 rounded-xl bg-[#e82e5c] text-white text-sm w-fit" onClick={save}>
          {t("배너 저장", "Save Banner")}
        </button>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        {db.banners.map((banner) => (
          <article key={banner.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">
                {(banner.key === "hero" ? t("메인", "Hero") : t("서브", "Secondary"))} - {banner.type === "image" ? t("이미지", "Image") : t("영상", "Video")}
              </p>
              <p className="text-sm text-slate-500">{banner.headline}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none" onClick={() => setForm({ ...banner, id: banner.id })}>
                {t("수정", "Edit")}
              </button>
              <button type="button" className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none" onClick={() => deleteBanner(banner.id)}>
                {t("삭제", "Delete")}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
function AdminCouponsView() {
  const { db, upsertCoupon, deleteCoupon, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [form, setForm] = useState({
    id: "",
    code: "",
    type: "percent",
    value: "10",
    minSubtotal: "0",
    expiresAt: "2027-01-01",
    active: true,
  });

  const save = () => {
    const coupon: Coupon = {
      id: form.id || uid("cp"),
      code: form.code.toUpperCase(),
      type: form.type as Coupon["type"],
      value: Number(form.value),
      minSubtotal: Number(form.minSubtotal),
      active: form.active,
      expiresAt: new Date(form.expiresAt).toISOString(),
    };
    upsertCoupon(coupon);
    setForm({ id: "", code: "", type: "percent", value: "10", minSubtotal: "0", expiresAt: "2027-01-01", active: true });
  };

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("쿠폰", "Coupons")}</h1>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <InputField label={t("ID (선택)", "ID (optional)")} value={form.id} onChange={(value) => setForm((prev) => ({ ...prev, id: value }))} />
          <InputField label={t("코드", "Code")} value={form.code} onChange={(value) => setForm((prev) => ({ ...prev, code: value }))} />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("유형", "Type")}</label>
            <select className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm mt-2" value={form.type} onChange={(event) => setForm((prev) => ({ ...prev, type: event.target.value }))}>
              <option value="percent">{t("정률", "Percent")}</option>
              <option value="fixed">{t("정액", "Fixed")}</option>
            </select>
          </div>
          <InputField label={t("할인값", "Value")} value={form.value} onChange={(value) => setForm((prev) => ({ ...prev, value }))} />
          <InputField label={t("최소 주문금액", "Min Subtotal")} value={form.minSubtotal} onChange={(value) => setForm((prev) => ({ ...prev, minSubtotal: value }))} />
          <div>
            <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("만료일", "Expires")}</label>
            <input
              type="date"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm mt-2"
              value={form.expiresAt}
              onChange={(event) => setForm((prev) => ({ ...prev, expiresAt: event.target.value }))}
            />
          </div>
        </div>
        <label className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm flex items-center gap-2 w-fit">
          <input type="checkbox" checked={form.active} onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))} />
          {t("활성화", "Active")}
        </label>
        <button type="button" className="h-11 px-6 rounded-xl bg-[#e82e5c] text-white text-sm w-fit" onClick={save}>
          {t("쿠폰 저장", "Save Coupon")}
        </button>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        {db.coupons.map((coupon) => (
          <article key={coupon.id} className="rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{coupon.code}</p>
              <p className="text-sm text-slate-500">
                {(coupon.type === "percent" ? t("정률", "Percent") : t("정액", "Fixed"))} {coupon.value} - {t("최소", "min")} {currency(coupon.minSubtotal)}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none" onClick={() => setForm({
                id: coupon.id,
                code: coupon.code,
                type: coupon.type,
                value: String(coupon.value),
                minSubtotal: String(coupon.minSubtotal),
                expiresAt: coupon.expiresAt.slice(0, 10),
                active: coupon.active,
              })}>
                {t("수정", "Edit")}
              </button>
              <button type="button" className="inline-flex h-10 min-w-[72px] shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-slate-300 px-4 text-sm leading-none" onClick={() => deleteCoupon(coupon.id)}>
                {t("삭제", "Delete")}
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}


type InquiryFilter = "all" | SupportInquiry["status"];

function AdminInquiriesView() {
  const { db, updateSupportInquiryAdmin, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [filter, setFilter] = useState<InquiryFilter>("all");
  const [query, setQuery] = useState("");

  const topicLabel = (topic: SupportInquiry["topic"]) => {
    if (topic === "product") {
      return t("\uC81C\uD488", "Product");
    }
    if (topic === "shipping") {
      return t("\uBC30\uC1A1/\uC8FC\uBB38", "Shipping/Order");
    }
    if (topic === "membership") {
      return t("\uBA64\uBC84\uC2ED", "Membership");
    }
    return t("\uAE30\uD0C0", "Other");
  };

  const statusLabel = (status: SupportInquiry["status"]) => {
    if (status === "new") {
      return t("\uC2E0\uADDC", "New");
    }
    if (status === "in_progress") {
      return t("\uCC98\uB9AC \uC911", "In Progress");
    }
    return t("\uD574\uACB0", "Resolved");
  };

  const statusTone = (status: SupportInquiry["status"]) => {
    if (status === "new") {
      return "bg-rose-100 text-rose-700";
    }
    if (status === "in_progress") {
      return "bg-amber-100 text-amber-700";
    }
    return "bg-emerald-100 text-emerald-700";
  };

  const filteredInquiries = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return [...(db.inquiries ?? [])]
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
      .filter((inquiry) => {
        if (filter !== "all" && inquiry.status !== filter) {
          return false;
        }

        if (!normalizedQuery) {
          return true;
        }

        const searchable = `${inquiry.id} ${inquiry.userName} ${inquiry.userEmail} ${inquiry.message}`.toLowerCase();
        return searchable.includes(normalizedQuery);
      });
  }, [db.inquiries, filter, query]);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("\uACE0\uAC1D \uBB38\uC758", "Customer Inquiries")}</h1>
        <p className="text-sm text-slate-500">
          {t("\uC804\uCCB4", "Total")} {db.inquiries.length}
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        <div className="grid md:grid-cols-[minmax(0,1fr)_220px] gap-3">
          <div>
            <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("\uAC80\uC0C9", "Search")}</label>
            <input
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm mt-2"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("\uC774\uB984, \uC774\uBA54\uC77C, \uBB38\uC758 \uB0B4\uC6A9", "Name, email, message")}
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("\uC0C1\uD0DC", "Status")}</label>
            <select
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm mt-2"
              value={filter}
              onChange={(event) => setFilter(event.target.value as InquiryFilter)}
            >
              <option value="all">{t("\uC804\uCCB4", "All")}</option>
              <option value="new">{t("\uC2E0\uADDC", "New")}</option>
              <option value="in_progress">{t("\uCC98\uB9AC \uC911", "In Progress")}</option>
              <option value="resolved">{t("\uD574\uACB0", "Resolved")}</option>
            </select>
          </div>
        </div>
      </section>

      {filteredInquiries.length === 0 ? (
        <EmptyState
          title={t("\uBB38\uC758\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.", "No inquiries found.")}
          body={t("\uAC80\uC0C9\uC5B4 \uB610\uB294 \uC0C1\uD0DC \uD544\uD130\uB97C \uC870\uC815\uD574\uBCF4\uC138\uC694.", "Try adjusting search or filters.")}
        />
      ) : (
        <section className="grid gap-4">
          {filteredInquiries.map((inquiry) => (
            <article key={inquiry.id} className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-500">
                    {inquiry.id} - {formatDate(inquiry.createdAt)}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 mt-1">{inquiry.userName}</h2>
                  <p className="text-sm text-slate-500">{inquiry.userEmail}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{topicLabel(inquiry.topic)}</span>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusTone(inquiry.status)}`}>{statusLabel(inquiry.status)}</span>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">
                {inquiry.message}
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("\uC0C1\uD0DC \uBCC0\uACBD", "Update Status")}</label>
                  <select
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm mt-2"
                    value={inquiry.status}
                    onChange={(event) =>
                      updateSupportInquiryAdmin(inquiry.id, {
                        status: event.target.value as SupportInquiry["status"],
                      })
                    }
                  >
                    <option value="new">{t("\uC2E0\uADDC", "New")}</option>
                    <option value="in_progress">{t("\uCC98\uB9AC \uC911", "In Progress")}</option>
                    <option value="resolved">{t("\uD574\uACB0", "Resolved")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.15em] font-semibold text-slate-500">{t("\uAD00\uB9AC\uC790 \uBA54\uBAA8", "Admin Note")}</label>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-[#e82e5c] focus:outline-none"
                    rows={3}
                    value={inquiry.adminNote}
                    onChange={(event) =>
                      updateSupportInquiryAdmin(inquiry.id, {
                        adminNote: event.target.value,
                      })
                    }
                    placeholder={t("\uC751\uB300 \uB0B4\uC6A9\uACFC \uCC98\uB9AC \uBA54\uBAA8\uB97C \uB0A8\uACA8\uC8FC\uC138\uC694.", "Write handling notes and response memo.")}
                  />
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

function AdminSettingsView() {
  const { db, upsertSettings, resetAllData, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [form, setForm] = useState({
    storeName: db.settings.storeName,
    supportEmail: db.settings.supportEmail,
    shippingFlat: String(db.settings.shippingFlat),
    freeShippingThreshold: String(db.settings.freeShippingThreshold),
    taxRate: String(db.settings.taxRate),
  });
  const [message, setMessage] = useState("");

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("설정", "Settings")}</h1>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6 grid gap-3">
        <InputField label={t("스토어명", "Store Name")} value={form.storeName} onChange={(value) => setForm((prev) => ({ ...prev, storeName: value }))} />
        <InputField label={t("고객지원 이메일", "Support Email")} value={form.supportEmail} onChange={(value) => setForm((prev) => ({ ...prev, supportEmail: value }))} />
        <div className="grid sm:grid-cols-3 gap-3">
          <InputField label={t("기본 배송비", "Shipping Flat")} value={form.shippingFlat} onChange={(value) => setForm((prev) => ({ ...prev, shippingFlat: value }))} />
          <InputField
            label={t("무료배송 기준", "Free Shipping Threshold")}
            value={form.freeShippingThreshold}
            onChange={(value) => setForm((prev) => ({ ...prev, freeShippingThreshold: value }))}
          />
          <InputField label={t("세율 (0-1)", "Tax Rate (0-1)")} value={form.taxRate} onChange={(value) => setForm((prev) => ({ ...prev, taxRate: value }))} />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            className="h-11 px-6 rounded-xl bg-[#e82e5c] text-white text-sm"
            onClick={() => {
              upsertSettings({
                ...db.settings,
                storeName: form.storeName,
                supportEmail: form.supportEmail,
                shippingFlat: Number(form.shippingFlat),
                freeShippingThreshold: Number(form.freeShippingThreshold),
                taxRate: Number(form.taxRate),
              });
              setMessage(t("설정이 저장되었습니다.", "Settings saved."));
            }}
          >
            {t("설정 저장", "Save Settings")}
          </button>
          <button
            type="button"
            className="h-11 px-6 rounded-xl border border-slate-300 text-sm"
            onClick={() => {
              resetAllData();
              setMessage(t("초기 시드 데이터로 재설정했습니다.", "Data reset to seed."));
            }}
          >
            {t("시드 데이터 초기화", "Reset Seed Data")}
          </button>
        </div>
        {message && <p className="text-sm text-slate-500">{message}</p>}
      </section>
    </div>
  );
}

function AnalyticsTopKpiCard({
  label,
  value,
  delta,
  sparkline,
  sparklineType,
  deltaSuffix,
}: {
  label: string;
  value: string;
  delta: KpiDeltaState;
  sparkline: SparklineValue[];
  sparklineType: "line" | "bar";
  deltaSuffix: string;
}) {
  const deltaPercentText =
    delta.kind === "percent"
      ? `${delta.value >= 0 ? "+" : "-"}${Math.abs(delta.value).toFixed(1)}%`
      : delta.kind === "up"
        ? "+100%"
        : "0%";
  const direction: "up" | "down" | "flat" =
    delta.kind === "percent"
      ? delta.value > 0
        ? "up"
        : delta.value < 0
          ? "down"
          : "flat"
      : delta.kind === "up"
        ? "up"
        : "flat";
  const trendGlyph = direction === "up" ? "↗" : direction === "down" ? "↘" : "—";

  return (
    <article className="admin-surface admin-hover-subtle flex h-[104px] flex-col justify-between p-4 xl:h-full xl:flex-row xl:items-end xl:gap-3 xl:p-5">
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-black/55">{label}</p>
        <p className="mt-1.5 tabular-nums text-[clamp(1.38rem,5.5vw,1.62rem)] font-semibold leading-none tracking-tight text-black/88 xl:text-[clamp(1.75rem,2.8vw,2.2rem)]">{value}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="whitespace-nowrap text-[11px] font-medium text-black/52">
            {deltaSuffix}{" "}
            <span className={cn("tabular-nums font-semibold", direction === "up" || direction === "down" ? "text-[color:var(--admin-accent)]" : "text-black/58")}>
              {deltaPercentText}
            </span>
          </p>
          <span className={cn("text-[13px] font-semibold leading-none xl:hidden", direction === "up" || direction === "down" ? "text-[color:var(--admin-accent)]" : "text-black/35")}>
            {trendGlyph}
          </span>
        </div>
      </div>
      <div className="hidden shrink-0 items-end gap-1 xl:flex">
        <MiniSparkline values={sparkline} type={sparklineType} />
        <span
          className={cn(
            "mb-0.5 text-[14px] font-semibold leading-none",
            direction === "up" ? "text-[color:var(--admin-accent)]" : direction === "down" ? "text-black/55" : "text-black/35",
          )}
        >
          {trendGlyph}
        </span>
      </div>
    </article>
  );
}

function AnalyticsSalesCycleBarChart({
  data,
  revenueLegend,
  ordersLegend,
  unitsLegend,
  aovLegend,
  emptyLabel,
}: {
  data: SalesSeriesPoint[];
  revenueLegend: string;
  ordersLegend: string;
  unitsLegend: string;
  aovLegend: string;
  emptyLabel: string;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const updateWidth = () => {
      setContainerWidth(node.clientWidth);
    };

    updateWidth();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => updateWidth());
      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  if (data.length === 0) {
    return <p className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/55">{emptyLabel}</p>;
  }

  const formatCompactCurrency = (value: number): string => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`;
    }
    return `$${value.toFixed(0)}`;
  };

  const width = containerWidth > 0 ? Math.max(340, Math.min(1200, containerWidth)) : 640;
  const height = 250;
  const leftPadding = 56;
  const rightPadding = 16;
  const topPadding = 14;
  const bottomPadding = 28;
  const chartBottom = height - bottomPadding;
  const chartHeight = chartBottom - topPadding;
  const plotWidth = width - leftPadding - rightPadding;
  const slotWidth = plotWidth / Math.max(1, data.length);
  const barWidth = Math.max(9, Math.min(28, slotWidth - 8));

  const maxRevenue = Math.max(0, ...data.map((entry) => entry.revenue));
  const tickStep = Math.max(100, Math.ceil(maxRevenue / 3 / 100) * 100);
  const axisMax = Math.max(tickStep * 3, Math.ceil(maxRevenue / tickStep) * tickStep, 100);
  const tickValues = [axisMax, Math.max(axisMax - tickStep, 0), Math.max(axisMax - tickStep * 2, 0), 0];

  const topIndices = new Set(
    [...data]
      .map((entry, index) => ({ index, revenue: entry.revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 2)
      .filter((entry) => entry.revenue > 0)
      .map((entry) => entry.index),
  );

  const points = data.map((entry, index) => {
    const barHeight = Math.max(entry.revenue > 0 ? 3 : 1.5, (entry.revenue / axisMax) * chartHeight);
    const x = leftPadding + slotWidth * index + (slotWidth - barWidth) / 2;
    const y = chartBottom - barHeight;
    const aov = entry.orders > 0 ? entry.revenue / entry.orders : null;
    return {
      ...entry,
      x,
      y,
      barHeight,
      centerX: x + barWidth / 2,
      aov,
    };
  });

  const maxVisibleLabels = width < 420 ? 4 : width < 640 ? 6 : 8;
  const labelStep = Math.max(1, Math.ceil(data.length / maxVisibleLabels));
  const safeHoveredIndex = hoveredIndex === null ? null : Math.max(0, Math.min(points.length - 1, hoveredIndex));
  const hovered = safeHoveredIndex === null ? null : points[safeHoveredIndex];
  const tooltipLeft = hovered ? Math.max(120, Math.min(width - 120, hovered.centerX)) : 0;

  return (
    <div className="relative overflow-x-hidden">
      <div ref={containerRef} className="relative w-full">
        {hovered && (
          <div
            className="pointer-events-none absolute z-[3] -translate-x-1/2 rounded-[14px] border border-black/10 bg-white px-3 py-2 text-xs text-black/75"
            style={{ left: tooltipLeft, top: 8 }}
          >
            <p className="mb-1 tabular-nums text-[11px] text-black/55">{hovered.label}</p>
            <p className="tabular-nums font-semibold text-black/88">{revenueLegend}: {currency(hovered.revenue)}</p>
            <p className="mt-0.5 tabular-nums">{ordersLegend}: {hovered.orders.toLocaleString()}</p>
            <p className="mt-0.5 tabular-nums">{unitsLegend}: {hovered.units.toLocaleString()}</p>
            {hovered.aov !== null && <p className="mt-0.5 tabular-nums">{aovLegend}: {currency(hovered.aov)}</p>}
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="h-[190px] w-full sm:h-[240px] xl:h-[260px]" role="img" aria-hidden>
          {tickValues.map((tick) => {
            const y = chartBottom - (tick / axisMax) * chartHeight;
            return (
              <g key={`tick-${tick}`}>
                <line x1={leftPadding} y1={y} x2={width - rightPadding} y2={y} stroke="rgba(15,23,42,0.08)" strokeWidth="1" />
                <text x={leftPadding - 8} y={y + 3} textAnchor="end" fontSize="10" fill="rgba(0,0,0,0.45)">
                  {formatCompactCurrency(tick)}
                </text>
              </g>
            );
          })}

          {points.map((point, index) => (
            <rect
              key={`series-${point.key}`}
              x={point.x}
              y={point.y}
              width={barWidth}
              height={point.barHeight}
              rx={3}
              fill={topIndices.has(index) ? "var(--admin-accent)" : "rgba(15,23,42,0.2)"}
            />
          ))}

          {points.map((point, index) =>
            index % labelStep === 0 || index === points.length - 1 ? (
              <text key={`label-${point.key}`} x={point.centerX} y={height - 7} textAnchor="middle" fontSize={width < 420 ? "11" : "10"} fill="rgba(0,0,0,0.58)">
                {point.label}
              </text>
            ) : null,
          )}

          {points.map((point, index) => (
            <rect
              key={`hover-${point.key}`}
              x={leftPadding + slotWidth * index}
              y={topPadding}
              width={slotWidth}
              height={chartHeight + bottomPadding}
              fill="transparent"
              onClick={() => setHoveredIndex(index)}
              onTouchStart={() => setHoveredIndex(index)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseMove={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
}

function AnalyticsProductList({
  className,
  title,
  emptyLabel,
  viewLabel,
  items,
}: {
  className?: string;
  title: string;
  emptyLabel: string;
  viewLabel: string;
  items: Array<{
    key: string;
    slug: string;
    name: string;
    image: string | null;
    secondary: string;
    valueLabel: string;
    value: string;
  }>;
}) {
  return (
    <article className={cn("admin-surface p-5", className)}>
      <h3 className="text-[14px] font-medium text-black/55">{title}</h3>
      <div className="mt-4 grid gap-2">
        {items.length === 0 && <p className="rounded-[14px] border border-black/10 bg-white p-3 text-sm text-black/55">{emptyLabel}</p>}
        {items.map((item) => (
          <article
            key={item.key}
            className="admin-hover-subtle group relative flex items-center gap-3 rounded-[14px] border border-black/10 bg-white px-3 py-2.5 transition-[background-color,border-color,color,opacity] duration-200 ease-out"
          >
            <span className="absolute bottom-2 left-0 top-2 w-[2px] rounded-full bg-[color:var(--admin-accent)] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100" />
            <div className="flex min-w-0 flex-1 items-center gap-3">
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-10 w-10 rounded-[12px] border border-black/10 object-cover" loading="lazy" />
              ) : (
                <div className="grid h-10 w-10 place-items-center rounded-[12px] border border-black/10 bg-black/[0.03] text-black/35">
                  <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-black/85">{item.name}</p>
                <p className="mt-1 truncate text-xs text-black/55">{item.secondary}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] text-black/45">{item.valueLabel}</p>
                <p className="tabular-nums text-sm font-semibold text-black/85">{item.value}</p>
              </div>
            </div>
            <Link
              href={`/product/${item.slug}`}
              className="ml-2 inline-flex h-7 items-center justify-center rounded-full border border-black/10 px-2 text-[11px] font-semibold text-[color:var(--admin-accent)] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
            >
              {viewLabel}
            </Link>
          </article>
        ))}
      </div>
    </article>
  );
}

function AnalyticsCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <article className="admin-surface px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.12em] font-semibold text-black/55">{label}</p>
      <p className="mt-2 tabular-nums text-2xl font-semibold tracking-tight text-black/88">{value}</p>
      {hint && <p className="mt-2 text-xs text-black/50">{hint}</p>}
    </article>
  );
}








