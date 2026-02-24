export type Role = "user" | "admin";
export type Locale = "ko" | "en";

export interface LocalizedText {
  ko: string;
  en: string;
}

export interface LocalizedTextList {
  ko: string[];
  en: string[];
}

export type LocalizedValue = string | LocalizedText;
export type LocalizedListValue = string[] | LocalizedTextList;

export type SkinType = "dry" | "oily" | "combination" | "normal" | "sensitive";

export type Concern =
  | "hydration"
  | "acne"
  | "aging"
  | "dullness"
  | "redness"
  | "texture"
  | "pores"
  | "puffiness";

export type ProductCategory =
  | "cleanser"
  | "serum"
  | "moisturizer"
  | "sunscreen"
  | "mask"
  | "tool";

export interface ProductIngredient {
  name: LocalizedValue;
  benefit: LocalizedValue;
}

export interface Product {
  id: string;
  slug: string;
  name: LocalizedValue;
  shortDescription: LocalizedValue;
  description: LocalizedValue;
  category: ProductCategory;
  skinTypes: SkinType[];
  concerns: Concern[];
  price: number;
  compareAtPrice?: number;
  badge?: "new" | "best";
  images: string[];
  ingredients: ProductIngredient[];
  howToUse: LocalizedListValue;
  routineTip: LocalizedValue;
  collectionSlugs: string[];
  isFeatured: boolean;
  createdAt: string;
  rating: number;
  reviewCount: number;
}

export interface Collection {
  id: string;
  slug: string;
  name: LocalizedValue;
  description: LocalizedValue;
  heroImage: string;
  productSlugs: string[];
  sortOrder: number;
}

export interface Article {
  id: string;
  slug: string;
  title: LocalizedValue;
  excerpt: LocalizedValue;
  content: LocalizedValue;
  coverImage: string;
  category: string;
  relatedProductSlugs: string[];
  publishedAt: string;
}

export interface Address {
  id: string;
  label: string;
  recipient: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  wishlist: string[];
  addresses: Address[];
  createdAt: string;
}

export interface Review {
  id: string;
  productSlug: string;
  userId: string;
  userName: string;
  rating: number;
  title: LocalizedValue;
  body: LocalizedValue;
  approved: boolean;
  createdAt: string;
}

export interface CartItem {
  productSlug: string;
  quantity: number;
}

export type SupportInquiryTopic = "product" | "shipping" | "membership" | "other";
export type SupportInquiryStatus = "new" | "in_progress" | "resolved";

export interface SupportInquiry {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  topic: SupportInquiryTopic;
  message: string;
  status: SupportInquiryStatus;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  couponCode?: string;
  subtotal: number;
  discount: number;
  total: number;
  paymentStatus: "pending" | "paid";
  status: OrderStatus;
  trackingNumber?: string;
  refundRequested: boolean;
  shippingAddress: Address;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  active: boolean;
  expiresAt: string;
}

export interface Banner {
  id: string;
  key: "hero" | "secondary";
  type: "image" | "video";
  url: string;
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaHref: string;
  active: boolean;
}

export interface Settings {
  storeName: string;
  supportEmail: string;
  currency: "USD";
  shippingFlat: number;
  freeShippingThreshold: number;
  taxRate: number;
}

export interface StoreDB {
  schemaVersion: 1;
  products: Product[];
  collections: Collection[];
  articles: Article[];
  users: User[];
  reviews: Review[];
  inquiries: SupportInquiry[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  settings: Settings;
  cartByUser: Record<string, CartItem[]>;
  couponByUser: Record<string, string | undefined>;
}

export interface SessionState {
  userId: string | null;
}

export interface CheckoutPayload {
  address: Address;
  couponCode?: string;
}

export interface ProductFilters {
  category: string;
  skinType: string;
  concern: string;
  minPrice: number;
  maxPrice: number;
}
