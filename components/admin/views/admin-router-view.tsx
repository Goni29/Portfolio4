"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useStore } from "@/components/providers/store-provider";
import { EmptyState, InputField, Row } from "@/components/public/shared/ui";
import { resolveText } from "@/lib/i18n";
import type { Article, Banner, Collection, Coupon, Order, Product, SupportInquiry } from "@/lib/types";
import { currency, formatDate, uid } from "@/lib/utils";

export function AdminRouterView({ segments }: { segments: string[] }) {
  if (segments[0] === "login") {
    return <AdminLoginView />;
  }

  if (segments[0] === "products") {
    return <AdminProductsView />;
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
          <p className="text-xs uppercase tracking-[0.2em] text-[#e6194c] font-bold">{t("관리자", "Admin")}</p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 mt-2">{t("로그인", "Sign In")}</h1>
        </div>
        <InputField label={t("이메일", "Email")} value={email} onChange={setEmail} />
        <InputField label={t("비밀번호", "Password")} value={password} onChange={setPassword} />
        <button type="submit" className="h-12 rounded-xl bg-[#e6194c] text-white text-sm font-semibold uppercase tracking-[0.12em]">
          {t("로그인", "Sign In")}
        </button>
        {message && <p className="text-sm text-slate-500">{message}</p>}
      </form>
    </section>
  );
}

function AdminDashboardView() {
  const { db, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const statusLabelMap: Record<Order["status"], { ko: string; en: string }> = {
    pending: { ko: "대기", en: "Pending" },
    processing: { ko: "처리 중", en: "Processing" },
    shipped: { ko: "배송 중", en: "Shipped" },
    delivered: { ko: "배송 완료", en: "Delivered" },
    cancelled: { ko: "취소", en: "Cancelled" },
  };
  const orderStatusLabel = (status: Order["status"]) => statusLabelMap[status][locale];
  const users = db.users.filter((user) => user.role === "user");
  const pendingReviews = db.reviews.filter((review) => !review.approved);
  const unpaidOrders = db.orders.filter((order) => order.paymentStatus !== "paid");
  const openInquiries = db.inquiries.filter((inquiry) => inquiry.status !== "resolved");

  return (
    <div className="grid gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("대시보드", "Dashboard")}</h1>
      <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <SummaryCard label={t("제품", "Products")} value={String(db.products.length)} href="/admin/products" />
        <SummaryCard label={t("주문", "Orders")} value={String(db.orders.length)} href="/admin/orders" />
        <SummaryCard label={t("고객", "Customers")} value={String(users.length)} href="/admin/customers" />
        <SummaryCard label={t("검수 대기 리뷰", "Pending Reviews")} value={String(pendingReviews.length)} href="/admin/reviews" />
        <SummaryCard label={t("\uBB38\uC758", "Inquiries")} value={String(db.inquiries.length)} href="/admin/inquiries" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900">{t("최근 주문", "Recent Orders")}</h2>
          <div className="mt-4 grid gap-3">
            {db.orders.slice(0, 5).map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="rounded-xl border border-slate-200 p-4 hover:border-[#e6194c]">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold">{order.id}</p>
                  <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                </div>
                <p className="text-sm text-slate-500 mt-2">{orderStatusLabel(order.status)}</p>
              </Link>
            ))}
            {db.orders.length === 0 && <p className="text-sm text-slate-500">{t("주문 데이터가 없습니다.", "No orders yet.")}</p>}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-xl font-semibold text-slate-900">{t("운영 지표", "Operational Flags")}</h2>
          <div className="mt-5 grid gap-3">
            <Row label={t("미결제 주문", "Unpaid Orders")} value={String(unpaidOrders.length)} />
            <Row label={t("환불 요청", "Refund Requests")} value={String(db.orders.filter((order) => order.refundRequested).length)} />
            <Row label={t("검수 대기 리뷰", "Draft Reviews")} value={String(pendingReviews.length)} />
            <Row label={t("\uBBF8\uD574\uACB0 \uBB38\uC758", "Open Inquiries")} value={String(openInquiries.length)} />
            <Row label={t("활성 쿠폰", "Active Coupons")} value={String(db.coupons.filter((coupon) => coupon.active).length)} />
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminProductsView() {
  const { db, upsertProduct, deleteProduct, locale } = useStore();
  const t = (ko: string, en: string) => (locale === "ko" ? ko : en);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState({
    slug: "",
    name: "",
    shortDescription: "",
    price: "0",
    category: "serum",
    image: "",
    collectionSlugs: "",
  });

  const reset = () => {
    setEditingSlug(null);
    setForm({
      slug: "",
      name: "",
      shortDescription: "",
      price: "0",
      category: "serum",
      image: "",
      collectionSlugs: "",
    });
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
              <option value="moisturizer">{t("크림", "Moisturizer")}</option>
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
        <InputField label={t("이미지 URL", "Image URL")} value={form.image} onChange={(value) => setForm((prev) => ({ ...prev, image: value }))} />
        <div className="flex gap-2">
          <button type="button" className="h-11 px-6 rounded-xl bg-[#e6194c] text-white text-sm" onClick={save}>
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
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="h-10 px-4 rounded-full border border-slate-300 text-sm"
                  onClick={() => {
                    setEditingSlug(product.slug);
                    setForm({
                      slug: product.slug,
                      name: resolveText(product.name, locale),
                      shortDescription: resolveText(product.shortDescription, locale),
                      price: String(product.price),
                      category: product.category,
                      image: product.images[0] ?? "",
                      collectionSlugs: product.collectionSlugs.join(","),
                    });
                  }}
                >
                  {t("수정", "Edit")}
                </button>
                <button type="button" className="h-10 px-4 rounded-full border border-slate-300 text-sm" onClick={() => deleteProduct(product.slug)}>
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
          <InputField label={t("이름", "Name")} value={form.name} onChange={(value) => setForm((prev) => ({ ...prev, name: value }))} />
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
        <button type="button" className="h-11 px-6 rounded-xl bg-[#e6194c] text-white text-sm w-fit" onClick={save}>
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
                  className="h-10 px-4 rounded-full border border-slate-300 text-sm"
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
                <button type="button" className="h-10 px-4 rounded-full border border-slate-300 text-sm" onClick={() => deleteCollection(collection.slug)}>
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

      const customer = db.users.find((user) => user.id === order.userId);
      const haystack = `${order.id} ${customer?.name ?? ""} ${customer?.email ?? ""}`.toLowerCase();
      return haystack.includes(query.trim().toLowerCase());
    });
  }, [sortedOrders, statusFilter, dateFilter, query, db.users]);

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

  const dateLabel =
    dateFilter === "all"
      ? t("최근 30일", "Last 30 Days")
      : dateFilter === "30d"
        ? t("최근 30일", "Last 30 Days")
        : t("최근 7일", "Last 7 Days");
  const statusLabel = statusFilter === "all" ? t("상태: 전체", "Status: All") : `${t("상태", "Status")}: ${orderStatusLabel(statusFilter)}`;

  const statusClassMap: Record<Order["status"], string> = {
    shipped: "bg-[#E3F2FD] text-[#1976D2]",
    processing: "bg-[#FFF3E0] text-[#F57C00]",
    delivered: "bg-[#E8F5E9] text-[#388E3C]",
    cancelled: "bg-[#F5F5F5] text-[#757575]",
    pending: "bg-[#FFF3E0] text-[#F57C00]",
  };

  return (
    <>
      <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#64748B]">
            <span className="material-symbols-outlined text-[20px] font-light">search</span>
          </div>
          <input
            className="block w-full border-0 border-b border-[#E2E8F0] bg-transparent py-3 pl-10 pr-3 text-sm text-[#0F172A] placeholder-[#64748B] focus:border-[#0F172A] focus:ring-0 transition-all font-light"
            placeholder={t("주문 검색", "Search orders")}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="group flex items-center gap-2 border-b border-transparent hover:border-[#E2E8F0] px-2 py-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-all">
              <span className="font-medium">{dateLabel}</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <select
              className="absolute inset-0 opacity-0 cursor-pointer"
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
          </div>

          <div className="relative">
            <button className="group flex items-center gap-2 border-b border-transparent hover:border-[#E2E8F0] px-2 py-2 text-sm text-[#64748B] hover:text-[#0F172A] transition-all">
              <span className="font-medium">{statusLabel}</span>
              <span className="material-symbols-outlined text-[18px]">expand_more</span>
            </button>
            <select
              className="absolute inset-0 opacity-0 cursor-pointer"
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
          </div>

          <button
            className="group flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-white transition-all ml-4"
            onClick={exportCsv}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            <span className="uppercase text-xs tracking-wider">{t("CSV 내보내기", "Export CSV")}</span>
          </button>
          <button className="flex items-center gap-2 border border-[#0F172A] bg-transparent px-6 py-2.5 text-xs uppercase tracking-widest font-medium text-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all duration-300">
            <span className="material-symbols-outlined text-[16px]">add</span>
            {t("주문 생성", "Create Order")}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E8F0] text-[11px] uppercase tracking-widest text-[#64748B] font-medium bg-[#F8FAFC]/30">
                <th className="px-8 py-5 font-medium w-32">{t("주문 번호", "Order ID")}</th>
                <th className="px-8 py-5 font-medium w-40">{t("주문일", "Date")}</th>
                <th className="px-8 py-5 font-medium">{t("고객", "Customer")}</th>
                <th className="px-8 py-5 font-medium w-40">{t("상태", "Status")}</th>
                <th className="px-8 py-5 font-medium w-32 text-right">{t("합계", "Total")}</th>
                <th className="px-8 py-5 font-medium w-32 text-center">{t("결제", "Payment")}</th>
                <th className="px-8 py-5 font-medium w-16 text-center" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]/50 text-sm font-light">
              {pagedOrders.map((order) => {
                const customer = db.users.find((entry) => entry.id === order.userId);
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
                  <tr key={order.id} className="group hover:bg-[#F8FAFC] transition-colors duration-200">
                    <td className="px-8 py-6 whitespace-nowrap text-[#0F172A]">
                      <Link
                        className="hover:underline underline-offset-4 decoration-[#E2E8F0]"
                        href={`/admin/orders/${order.id}`}
                      >
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-[#64748B]">
                      {formatDate(order.createdAt)} <br />
                      <span className="text-[11px] text-[#64748B]/60 tracking-wider uppercase">{timeLabel}</span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-9 w-9 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#0F172A] border border-[#E2E8F0]/50">
                          <span className="text-xs font-semibold">{initials || "NA"}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[#0F172A] font-medium">{customerName}</span>
                          <span className="text-xs text-[#64748B]/80">{customerEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 text-[11px] uppercase tracking-wider font-medium ${statusClassMap[order.status]}`}
                      >
                        {orderStatusLabel(order.status)}
                      </span>
                    </td>
                    <td
                      className={`px-8 py-6 whitespace-nowrap text-right text-base ${
                        order.status === "cancelled"
                          ? "text-[#64748B] line-through decoration-[#64748B]/30"
                          : "text-[#0F172A]"
                      }`}
                    >
                      {currency(order.total)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <span className="inline-flex min-w-5 items-center justify-center px-2 text-[#64748B]/70 text-xs font-medium">
                          <span className="material-symbols-outlined text-[18px]">{paymentIcon}</span>
                          <span className="ml-1">{paymentStatusLabel(order.paymentStatus)}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-center">
                      <button
                        className="rounded p-1 text-[#64748B] hover:text-[#0F172A] transition-colors opacity-0 group-hover:opacity-100"
                        type="button"
                        aria-label={t(`주문 ${order.id} 작업 열기`, `Open actions for ${order.id}`)}
                        onClick={() => router.push(`/admin/orders/${order.id}`)}
                      >
                        <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {pagedOrders.length === 0 && <p className="text-sm text-[#64748B] mt-6">{t("필터 조건에 맞는 주문이 없습니다.", "No orders match this filter.")}</p>}

      <div className="flex items-center justify-between pt-8 pb-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            className="relative inline-flex items-center border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-40"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            type="button"
          >
            {t("이전", "Previous")}
          </button>
          <button
            className="relative ml-3 inline-flex items-center border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-medium text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-40"
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
              {locale === "ko" ? (
                <>
                  총 <span className="font-medium text-[#0F172A]">{filteredOrders.length}</span>건 중{" "}
                  <span className="font-medium text-[#0F172A]">{filteredOrders.length === 0 ? 0 : start + 1}</span>-
                  <span className="font-medium text-[#0F172A]">{Math.min(start + pageSize, filteredOrders.length)}</span> 표시
                </>
              ) : (
                <>
                  Showing <span className="font-medium text-[#0F172A]">{filteredOrders.length === 0 ? 0 : start + 1}</span>{" "}
                  to{" "}
                  <span className="font-medium text-[#0F172A]">{Math.min(start + pageSize, filteredOrders.length)}</span>{" "}
                  of <span className="font-medium text-[#0F172A]">{filteredOrders.length}</span> results
                </>
              )}
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
    pending: { ko: "대기", en: "Pending" },
    paid: { ko: "완료", en: "Paid" },
  };
  const categoryLabelMap: Record<Product["category"], string> = {
    cleanser: "클렌저",
    serum: "세럼",
    moisturizer: "크림",
    sunscreen: "선스크린",
    mask: "마스크",
    tool: "툴",
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
      return { item, product };
    })
    .filter((entry): entry is { item: (typeof order.items)[number]; product: (typeof db.products)[number] } => Boolean(entry));

  const statusTone: Record<Order["status"], string> = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    processing: "bg-amber-100 text-amber-700 border-amber-200",
    shipped: "bg-sky-100 text-sky-700 border-sky-200",
    delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
    cancelled: "bg-slate-100 text-slate-600 border-slate-200",
  };

  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0);
  const shippingAndTax = Math.max(0, order.total - (subtotal - order.discount));

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <nav className="flex items-center gap-2 text-sm text-slate-500 mb-2">
              <Link className="hover:text-[#e6194c] transition-colors" href="/admin/orders">
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
                className="inline-flex items-center justify-center rounded-lg bg-[#e6194c] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#e6194c]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#e6194c] focus:ring-offset-2"
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
                {locale === "ko" ? `${lines.length}개 품목` : `${lines.length} Items`}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {lines.map((line) => (
                <div
                  key={line.product.id}
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
                    <p className="text-xs font-mono text-slate-400 mt-1">SKU: {line.product.slug.toUpperCase()}</p>
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-x-6 sm:gap-1 mt-2 sm:mt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-sm text-slate-500">
                      <span className="sm:hidden">{t("수량: ", "Qty: ")}</span>
                      {line.item.quantity} x {currency(line.product.price)}
                    </div>
                    <div className="text-sm font-bold text-slate-900">{currency(line.product.price * line.item.quantity)}</div>
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
                  <span className="font-semibold text-slate-900">{t("총액", "Total")}</span>
                  <span className="text-xl font-bold text-[#e6194c]">{currency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">{t("내부 메모", "Internal Notes")}</h3>
            <div className="relative">
              <textarea
                className="w-full rounded-lg border-slate-200 bg-slate-50 text-slate-900 text-sm focus:border-[#e6194c] focus:ring-[#e6194c] placeholder:text-slate-400"
                placeholder={t("이 주문에 대한 운영 메모를 남겨주세요.", "Add an internal note for this order.")}
                rows={3}
                value={noteInput}
                onChange={(event) => setNoteInput(event.target.value)}
              />
              <button
                className="absolute bottom-2 right-2 p-1.5 bg-white rounded-md text-slate-400 hover:text-[#e6194c] shadow-sm border border-slate-100 transition-colors"
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
                <div className="h-12 w-12 rounded-full bg-[#e6194c]/10 flex items-center justify-center text-[#e6194c] flex-shrink-0">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{customer?.name ?? t("비회원 고객", "Guest Customer")}</h4>
                  <a className="text-sm text-[#e6194c] hover:underline block mt-0.5" href={`mailto:${customer?.email ?? "guest@example.com"}`}>
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
                  <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#e6194c]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">{t("결제 상태", "Payment")} {order.paymentStatus === "paid" ? t("확인됨", "Verified") : t("대기", "Pending")}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt, locale)}</span>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute -left-[21px] top-1 h-3.5 w-3.5 rounded-full border-[3px] border-white bg-[#e6194c]" />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-900">{t("주문 접수", "Order Placed")}</span>
                    <span className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt, locale)}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 rounded-b-xl">
              <button
                className="w-full text-center text-sm font-medium text-[#e6194c] hover:text-[#e6194c]/80 transition-colors"
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
                <button type="button" className="h-10 px-4 rounded-full border border-slate-300 text-sm" onClick={() => approveReview(review.id)}>
                  {t("승인", "Approve")}
                </button>
              )}
              <button type="button" className="h-10 px-4 rounded-full border border-slate-300 text-sm" onClick={() => deleteReview(review.id)}>
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
        <button type="button" className="h-11 px-6 rounded-xl bg-[#e6194c] text-white text-sm w-fit" onClick={save}>
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
                className="h-10 px-4 rounded-full border border-slate-300 text-sm"
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
              <button type="button" className="h-10 px-4 rounded-full border border-slate-300 text-sm" onClick={() => deleteArticle(article.slug)}>
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
        <button type="button" className="h-11 px-6 rounded-xl bg-[#e6194c] text-white text-sm w-fit" onClick={save}>
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
              <button type="button" className="h-10 px-4 rounded-full border border-slate-300 text-sm" onClick={() => setForm({ ...banner, id: banner.id })}>
                {t("수정", "Edit")}
              </button>
              <button type="button" className="h-10 px-4 rounded-full border border-slate-300 text-sm" onClick={() => deleteBanner(banner.id)}>
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
        <button type="button" className="h-11 px-6 rounded-xl bg-[#e6194c] text-white text-sm w-fit" onClick={save}>
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
              <button type="button" className="h-10 px-4 rounded-full border border-slate-300 text-sm" onClick={() => setForm({
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
              <button type="button" className="h-10 px-4 rounded-full border border-slate-300 text-sm" onClick={() => deleteCoupon(coupon.id)}>
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
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-[#e6194c] focus:outline-none"
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
            className="h-11 px-6 rounded-xl bg-[#e6194c] text-white text-sm"
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

function SummaryCard({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <Link href={href} className="rounded-xl border border-slate-200 bg-white shadow-sm p-5 hover:border-[#e6194c] transition">
      <p className="text-xs uppercase tracking-[0.14em] text-slate-500 font-semibold">{label}</p>
      <p className="text-4xl font-semibold tracking-tight text-slate-900 mt-2">{value}</p>
    </Link>
  );
}


