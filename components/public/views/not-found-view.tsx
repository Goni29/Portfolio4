"use client";

import { EmptyState } from "@/components/public/shared/ui";
import { useStore } from "@/components/providers/store-provider";

export function NotFoundView() {
  const { locale } = useStore();
  return (
    <section className="container-edge py-20">
      <EmptyState
        title={locale === "ko" ? "페이지를 찾을 수 없습니다" : "Page not found"}
        body={locale === "ko" ? "요청하신 페이지가 존재하지 않습니다." : "The requested page does not exist."}
        ctaHref="/"
        ctaLabel={locale === "ko" ? "홈으로 돌아가기" : "Back Home"}
      />
    </section>
  );
}
