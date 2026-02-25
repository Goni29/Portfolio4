"use client";

import { AboutView } from "@/components/public/views/about-view";
import { ArticleView } from "@/components/public/views/article-view";
import { CheckoutCompleteView } from "@/components/public/views/checkout-complete-view";
import { CheckoutView } from "@/components/public/views/checkout-view";
import { CollectionView } from "@/components/public/views/collection-view";
import { CollectionsView } from "@/components/public/views/collections-view";
import { ContactView } from "@/components/public/views/contact-view";
import { HomeView } from "@/components/public/views/home-view";
import { JournalView } from "@/components/public/views/journal-view";
import { NotFoundView } from "@/components/public/views/not-found-view";
import { ProductView } from "@/components/public/views/product-view";
import { RoutineView } from "@/components/public/views/routine-view";
import { ShopView } from "@/components/public/views/shop-view";

export function PublicRouterView({ segments }: { segments: string[] }) {
  if (segments.length === 0) {
    return <HomeView />;
  }

  if (segments[0] === "shop" && segments.length === 1) {
    return <ShopView />;
  }

  if (segments[0] === "collections" && segments.length === 1) {
    return <CollectionsView />;
  }

  if (segments[0] === "collections" && segments[1]) {
    return <CollectionView slug={segments[1]} />;
  }

  if (segments[0] === "product" && segments[1]) {
    return <ProductView slug={segments[1]} />;
  }

  if (segments[0] === "journal" && segments.length === 1) {
    return <JournalView />;
  }

  if (segments[0] === "journal" && segments[1]) {
    return <ArticleView slug={segments[1]} />;
  }

  if (segments[0] === "about" && segments.length === 1) {
    return <AboutView />;
  }

  if (segments[0] === "contact" && segments.length === 1) {
    return <ContactView />;
  }

  if (segments[0] === "concierge" && segments.length === 1) {
    return <ContactView />;
  }

  if (segments[0] === "routine" && segments.length === 1) {
    return <RoutineView />;
  }

  if (segments[0] === "cart" && segments.length === 1) {
    return <ShopView />;
  }

  if (segments[0] === "checkout" && segments.length === 1) {
    return <CheckoutView />;
  }

  if (segments[0] === "checkout" && segments[1] === "complete") {
    return <CheckoutCompleteView />;
  }

  return <NotFoundView />;
}
