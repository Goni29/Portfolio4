"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loadDb, loadLocale, loadSession, resetToSeed, saveDb, saveLocale, saveSession } from "@/lib/storage";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import { stripLocalePrefix } from "@/lib/locale-routing";
import {
  getProductPriceBySize,
  getProductSizeOption,
} from "@/lib/product-pricing";
import { createSeedDb, createSeedSession } from "@/lib/storage/seed";
import type {
  Address,
  Article,
  Banner,
  CartItem,
  CheckoutPayload,
  Collection,
  Coupon,
  Order,
  Product,
  Review,
  Locale,
  LocalizedText,
  LocalizedValue,
  Role,
  SessionState,
  SupportInquiry,
  SupportInquiryStatus,
  SupportInquiryTopic,
  StoreDB,
  User,
} from "@/lib/types";
import { uid } from "@/lib/utils";

interface LoginResult {
  ok: boolean;
  error?: string;
  role?: Role;
}

interface CartLine {
  item: CartItem;
  product: Product;
  unitPrice: number;
  lineTotal: number;
}

interface StoreContextValue {
  ready: boolean;
  locale: Locale;
  db: StoreDB;
  currentUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  cartItems: CartItem[];
  cartLines: CartLine[];
  cartCoupon: Coupon | null;
  cartSubtotal: number;
  cartDiscount: number;
  cartShipping: number;
  cartFreeShippingReason: "product" | "threshold" | null;
  cartTotal: number;
  login: (email: string, password: string) => LoginResult;
  register: (name: string, email: string, password: string) => LoginResult;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  logout: () => void;
  addToCart: (productSlug: string, quantity?: number, sizeKey?: string) => void;
  updateCartQuantity: (productSlug: string, quantity: number, sizeKey?: string) => void;
  updateCartItemSize: (productSlug: string, nextSizeKey: string, currentSizeKey?: string) => void;
  removeFromCart: (productSlug: string, sizeKey?: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { ok: boolean; message: string };
  clearCoupon: () => void;
  toggleWishlist: (productSlug: string) => void;
  addReview: (input: { productSlug: string; rating: number; title: string; body: string }) => boolean;
  createSupportInquiry: (input: { topic: SupportInquiryTopic; message: string }) => string | null;
  updateSupportInquiryAdmin: (inquiryId: string, patch: { status?: SupportInquiryStatus; adminNote?: string }) => void;
  createOrder: (payload: CheckoutPayload) => Order | null;
  upsertAddress: (address: Address) => void;
  deleteAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (slug: string) => void;
  upsertCollection: (collection: Collection) => void;
  deleteCollection: (slug: string) => void;
  upsertArticle: (article: Article) => void;
  deleteArticle: (slug: string) => void;
  upsertCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  upsertBanner: (banner: Banner) => void;
  deleteBanner: (id: string) => void;
  upsertSettings: (settings: StoreDB["settings"]) => void;
  updateOrderAdmin: (orderId: string, patch: Partial<Order>) => void;
  approveReview: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;
  resetAllData: () => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

const isCouponValid = (coupon: Coupon): boolean => {
  return coupon.active && new Date(coupon.expiresAt).getTime() >= Date.now();
};

type FreeShippingReason = "product" | "threshold" | null;

const resolveFreeShippingReason = (
  subtotal: number,
  freeShippingThreshold: number,
  hasFreeShippingProduct: boolean,
): FreeShippingReason => {
  if (hasFreeShippingProduct) {
    return "product";
  }
  if (subtotal >= freeShippingThreshold) {
    return "threshold";
  }
  return null;
};

const getShippingCharge = (settings: StoreDB["settings"], freeShippingReason: FreeShippingReason): number => {
  if (freeShippingReason) {
    return 0;
  }
  return Math.max(0, settings.shippingFlat);
};

const buildCartItemKey = (productSlug: string, sizeKey: string): string => {
  return `${productSlug}::${sizeKey}`;
};

const normalizeCartByUser = (
  cartByUser: StoreDB["cartByUser"] | undefined,
  products: Product[],
): StoreDB["cartByUser"] => {
  if (!cartByUser) {
    return {};
  }

  const productBySlug = new Map(products.map((product) => [product.slug, product]));
  const normalizedEntries = Object.entries(cartByUser).map(([userId, items]) => {
    const merged = new Map<string, CartItem>();

    (items ?? []).forEach((item) => {
      const product = productBySlug.get(item.productSlug);
      if (!product) {
        return;
      }

      const resolvedSizeKey = getProductSizeOption(product, item.sizeKey).key;
      const key = buildCartItemKey(item.productSlug, resolvedSizeKey);
      const existing = merged.get(key);
      const normalizedQuantity = Number.isFinite(item.quantity) ? Math.max(1, item.quantity) : 1;
      const nextQuantity = Math.max(1, Math.min((existing?.quantity ?? 0) + normalizedQuantity, 99));

      merged.set(key, {
        productSlug: item.productSlug,
        sizeKey: resolvedSizeKey,
        quantity: nextQuantity,
      });
    });

    return [userId, [...merged.values()]];
  });

  return Object.fromEntries(normalizedEntries);
};

const withFallback = (db: StoreDB): StoreDB => {
  return {
    ...db,
    cartByUser: normalizeCartByUser(db.cartByUser, db.products),
    couponByUser: db.couponByUser ?? {},
    inquiries: db.inquiries ?? [],
  };
};

const hasHangul = (value: string): boolean => /[가-힣]/.test(value);

const isLocalizedTextValue = (value: unknown): value is LocalizedText => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const target = value as { ko?: unknown; en?: unknown };
  return typeof target.ko === "string" && typeof target.en === "string";
};

const mergeLocalizedText = (
  nextValue: LocalizedValue,
  locale: Locale,
  previousValue?: LocalizedValue,
  seedValue?: LocalizedValue,
): LocalizedText => {
  if (isLocalizedTextValue(nextValue)) {
    return nextValue;
  }

  const nextText = typeof nextValue === "string" ? nextValue : "";
  const previousLocalized = isLocalizedTextValue(previousValue) ? previousValue : undefined;
  const seedLocalized = isLocalizedTextValue(seedValue) ? seedValue : undefined;

  if (previousLocalized) {
    if (locale === "ko") {
      return {
        ko: nextText,
        en: previousLocalized.en || seedLocalized?.en || nextText,
      };
    }

    return {
      ko: previousLocalized.ko || seedLocalized?.ko || nextText,
      en: nextText,
    };
  }

  if (typeof previousValue === "string") {
    const previousLooksKo = hasHangul(previousValue);

    if (locale === "ko") {
      return {
        ko: nextText,
        en: previousLooksKo ? seedLocalized?.en || previousValue : previousValue,
      };
    }

    return {
      ko: previousLooksKo ? previousValue : seedLocalized?.ko || previousValue,
      en: nextText,
    };
  }

  if (seedLocalized) {
    if (locale === "ko") {
      return { ko: nextText, en: seedLocalized.en };
    }

    return { ko: seedLocalized.ko, en: nextText };
  }

  return {
    ko: nextText,
    en: nextText,
  };
};

const SEED_DB = createSeedDb();
const SEED_PRODUCT_BY_SLUG = new Map(SEED_DB.products.map((product) => [product.slug, product]));
const SEED_COLLECTION_BY_SLUG = new Map(SEED_DB.collections.map((collection) => [collection.slug, collection]));
const SEED_ARTICLE_BY_SLUG = new Map(SEED_DB.articles.map((article) => [article.slug, article]));

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);
  const [db, setDb] = useState<StoreDB>(() => withFallback(createSeedDb()));
  const [session, setSession] = useState<SessionState>(() => createSeedSession());

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const pathLocale = stripLocalePrefix(window.location.pathname).locale;
      setDb(withFallback(loadDb()));
      setSession(loadSession());
      setLocaleState(pathLocale ?? loadLocale());
      setReady(true);
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (!ready || !db) {
      return;
    }

    saveDb(db);
  }, [db, ready]);

  useEffect(() => {
    if (!ready || !db) {
      return;
    }

    saveSession(session);
  }, [session, db, ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    saveLocale(locale);
  }, [locale, ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    document.documentElement.lang = locale;
  }, [locale, ready]);

  const mutateDb = useCallback((updater: (prev: StoreDB) => StoreDB) => {
    setDb((prev) => updater(prev));
  }, []);

  const currentUser = useMemo(() => {
    if (!db || !session.userId) {
      return null;
    }

    return db.users.find((user) => user.id === session.userId) ?? null;
  }, [db, session.userId]);

  const cartOwnerId = currentUser?.id ?? "guest";

  const cartItems = useMemo(() => {
    if (!db) {
      return [];
    }

    return db.cartByUser[cartOwnerId] ?? [];
  }, [db, cartOwnerId]);

  const cartCoupon = useMemo(() => {
    if (!db) {
      return null;
    }

    const code = db.couponByUser[cartOwnerId];
    if (!code) {
      return null;
    }

    const matched = db.coupons.find((coupon) => coupon.code.toLowerCase() === code.toLowerCase());
    if (!matched || !isCouponValid(matched)) {
      return null;
    }

    return matched;
  }, [db, cartOwnerId]);

  const cartLines = useMemo(() => {
    if (!db) {
      return [];
    }

    return cartItems
      .map((item) => {
        const product = db.products.find((entry) => entry.slug === item.productSlug);
        if (!product) {
          return null;
        }

        const unitPrice = getProductPriceBySize(product, item.sizeKey);
        return {
          item,
          product,
          unitPrice,
          lineTotal: unitPrice * item.quantity,
        };
      })
      .filter((line): line is CartLine => Boolean(line));
  }, [db, cartItems]);

  const cartSubtotal = useMemo(() => {
    return cartLines.reduce((sum, line) => sum + line.lineTotal, 0);
  }, [cartLines]);

  const cartDiscount = useMemo(() => {
    if (!cartCoupon) {
      return 0;
    }

    if (cartSubtotal < cartCoupon.minSubtotal) {
      return 0;
    }

    if (cartCoupon.type === "percent") {
      return Math.round(cartSubtotal * (cartCoupon.value / 100) * 100) / 100;
    }

    return Math.min(cartCoupon.value, cartSubtotal);
  }, [cartCoupon, cartSubtotal]);

  const cartFreeShippingReason = useMemo<FreeShippingReason>(() => {
    const hasFreeShippingProduct = cartLines.some((line) => Boolean(line.product.freeShipping));
    return resolveFreeShippingReason(cartSubtotal, db.settings.freeShippingThreshold, hasFreeShippingProduct);
  }, [cartLines, cartSubtotal, db.settings.freeShippingThreshold]);

  const cartShipping = useMemo(() => {
    return getShippingCharge(db.settings, cartFreeShippingReason);
  }, [db.settings, cartFreeShippingReason]);

  const cartTotal = useMemo(() => {
    const total = cartSubtotal - cartDiscount;
    return total > 0 ? total : 0;
  }, [cartSubtotal, cartDiscount]);

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale === "en" ? "en" : "ko");
  }, []);

  const toggleLocale = useCallback(() => {
    setLocaleState((prev) => (prev === "ko" ? "en" : "ko"));
  }, []);

  const login = useCallback(
    (email: string, password: string): LoginResult => {
      if (!db) {
        return {
          ok: false,
          error: locale === "ko" ? "서비스 준비 중입니다. 잠시 후 다시 시도해 주세요." : "Storage is not ready.",
        };
      }

      const user = db.users.find(
        (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
      );

      if (!user) {
        return {
          ok: false,
          error: locale === "ko" ? "이메일 또는 비밀번호를 다시 확인해 주세요." : "Invalid credentials.",
        };
      }

      mutateDb((prev) => {
        const guestCart = prev.cartByUser.guest ?? [];
        const userCart = prev.cartByUser[user.id] ?? [];
        const productBySlug = new Map(prev.products.map((product) => [product.slug, product]));
        const mergedMap = new Map<string, CartItem>();

        [...userCart, ...guestCart].forEach((line) => {
          const product = productBySlug.get(line.productSlug);
          if (!product) {
            return;
          }

          const resolvedSizeKey = getProductSizeOption(product, line.sizeKey).key;
          const key = buildCartItemKey(line.productSlug, resolvedSizeKey);
          const existing = mergedMap.get(key);
          const normalizedQuantity = Number.isFinite(line.quantity) ? Math.max(1, line.quantity) : 1;
          const nextQuantity = Math.max(1, Math.min((existing?.quantity ?? 0) + normalizedQuantity, 99));

          mergedMap.set(key, {
            productSlug: line.productSlug,
            sizeKey: resolvedSizeKey,
            quantity: nextQuantity,
          });
        });

        return {
          ...prev,
          cartByUser: {
            ...prev.cartByUser,
            guest: [],
            [user.id]: [...mergedMap.values()],
          },
        };
      });

      setSession({ userId: user.id });
      return { ok: true, role: user.role };
    },
    [db, locale, mutateDb],
  );

  const register = useCallback(
    (name: string, email: string, password: string): LoginResult => {
      if (!db) {
        return {
          ok: false,
          error: locale === "ko" ? "서비스 준비 중입니다. 잠시 후 다시 시도해 주세요." : "Storage is not ready.",
        };
      }

      const exists = db.users.some((entry) => entry.email.toLowerCase() === email.toLowerCase());
      if (exists) {
        return {
          ok: false,
          error: locale === "ko" ? "이미 가입된 이메일입니다. 로그인해 주세요." : "Email already registered.",
        };
      }

      const user: User = {
        id: uid("usr"),
        name,
        email,
        password,
        role: "user",
        wishlist: [],
        addresses: [],
        createdAt: new Date().toISOString(),
      };

      mutateDb((prev) => ({
        ...prev,
        users: [user, ...prev.users],
      }));

      setSession({ userId: user.id });
      return { ok: true, role: "user" };
    },
    [db, locale, mutateDb],
  );

  const logout = useCallback(() => {
    setSession({ userId: null });
  }, []);

  const addToCart = useCallback(
    (productSlug: string, quantity = 1, sizeKey?: string) => {
      mutateDb((prev) => {
        const product = prev.products.find((entry) => entry.slug === productSlug);
        if (!product) {
          return prev;
        }

        const resolvedSizeKey = getProductSizeOption(product, sizeKey).key;
        const normalizedQuantity = Math.max(1, Math.min(quantity, 99));
        const target = prev.cartByUser[cartOwnerId] ?? [];
        const found = target.find((line) => {
          if (line.productSlug !== productSlug) {
            return false;
          }

          return getProductSizeOption(product, line.sizeKey).key === resolvedSizeKey;
        });

        const next = found
          ? target.map((line) =>
              line.productSlug === productSlug &&
              getProductSizeOption(product, line.sizeKey).key === resolvedSizeKey
                ? {
                    ...line,
                    sizeKey: resolvedSizeKey,
                    quantity: Math.min(line.quantity + normalizedQuantity, 99),
                  }
                : line,
            )
          : [...target, { productSlug, sizeKey: resolvedSizeKey, quantity: normalizedQuantity }];

        return {
          ...prev,
          cartByUser: {
            ...prev.cartByUser,
            [cartOwnerId]: next,
          },
        };
      });
    },
    [cartOwnerId, mutateDb],
  );

  const updateCartQuantity = useCallback(
    (productSlug: string, quantity: number, sizeKey?: string) => {
      mutateDb((prev) => {
        const product = prev.products.find((entry) => entry.slug === productSlug);
        if (!product) {
          return prev;
        }

        const resolvedSizeKey = getProductSizeOption(product, sizeKey).key;
        const target = prev.cartByUser[cartOwnerId] ?? [];
        const clamped = Math.max(1, Math.min(quantity, 99));

        return {
          ...prev,
          cartByUser: {
            ...prev.cartByUser,
            [cartOwnerId]: target.map((line) =>
              line.productSlug === productSlug &&
              getProductSizeOption(product, line.sizeKey).key === resolvedSizeKey
                ? { ...line, sizeKey: resolvedSizeKey, quantity: clamped }
                : line,
            ),
          },
        };
      });
    },
    [cartOwnerId, mutateDb],
  );

  const updateCartItemSize = useCallback(
    (productSlug: string, nextSizeKey: string, currentSizeKey?: string) => {
      mutateDb((prev) => {
        const product = prev.products.find((entry) => entry.slug === productSlug);
        if (!product) {
          return prev;
        }

        const resolvedCurrentSizeKey = getProductSizeOption(product, currentSizeKey).key;
        const resolvedNextSizeKey = getProductSizeOption(product, nextSizeKey).key;
        if (resolvedCurrentSizeKey === resolvedNextSizeKey) {
          return prev;
        }

        const target = prev.cartByUser[cartOwnerId] ?? [];
        let movingQuantity = 0;

        const withoutCurrent = target.filter((line) => {
          if (line.productSlug !== productSlug) {
            return true;
          }

          const lineSizeKey = getProductSizeOption(product, line.sizeKey).key;
          if (lineSizeKey !== resolvedCurrentSizeKey) {
            return true;
          }

          movingQuantity = Math.min(99, movingQuantity + Math.max(1, Math.min(line.quantity, 99)));
          return false;
        });

        if (movingQuantity === 0) {
          return prev;
        }

        const hasTargetLine = withoutCurrent.some((line) => {
          if (line.productSlug !== productSlug) {
            return false;
          }

          return getProductSizeOption(product, line.sizeKey).key === resolvedNextSizeKey;
        });

        const next = hasTargetLine
          ? withoutCurrent.map((line) =>
              line.productSlug === productSlug &&
              getProductSizeOption(product, line.sizeKey).key === resolvedNextSizeKey
                ? {
                    ...line,
                    sizeKey: resolvedNextSizeKey,
                    quantity: Math.min(line.quantity + movingQuantity, 99),
                  }
                : line,
            )
          : [...withoutCurrent, { productSlug, sizeKey: resolvedNextSizeKey, quantity: movingQuantity }];

        return {
          ...prev,
          cartByUser: {
            ...prev.cartByUser,
            [cartOwnerId]: next,
          },
        };
      });
    },
    [cartOwnerId, mutateDb],
  );

  const removeFromCart = useCallback(
    (productSlug: string, sizeKey?: string) => {
      mutateDb((prev) => {
        const product = prev.products.find((entry) => entry.slug === productSlug);
        if (!product) {
          return prev;
        }

        const resolvedSizeKey = getProductSizeOption(product, sizeKey).key;
        return {
          ...prev,
          cartByUser: {
            ...prev.cartByUser,
            [cartOwnerId]: (prev.cartByUser[cartOwnerId] ?? []).filter((line) => {
              if (line.productSlug !== productSlug) {
                return true;
              }

              return getProductSizeOption(product, line.sizeKey).key !== resolvedSizeKey;
            }),
          },
        };
      });
    },
    [cartOwnerId, mutateDb],
  );

  const clearCart = useCallback(() => {
    mutateDb((prev) => ({
      ...prev,
      cartByUser: {
        ...prev.cartByUser,
        [cartOwnerId]: [],
      },
      couponByUser: {
        ...prev.couponByUser,
        [cartOwnerId]: undefined,
      },
    }));
  }, [cartOwnerId, mutateDb]);

  const applyCoupon = useCallback(
    (code: string): { ok: boolean; message: string } => {
      if (!db) {
        return {
          ok: false,
          message: locale === "ko" ? "서비스 준비 중입니다. 잠시 후 다시 시도해 주세요." : "Storage is not ready.",
        };
      }

      const coupon = db.coupons.find((entry) => entry.code.toLowerCase() === code.toLowerCase().trim());
      if (!coupon) {
        return {
          ok: false,
          message: locale === "ko" ? "입력하신 쿠폰 코드를 찾을 수 없습니다." : "Coupon not found.",
        };
      }

      if (!isCouponValid(coupon)) {
        return {
          ok: false,
          message: locale === "ko" ? "사용할 수 없는 쿠폰입니다. 유효기간을 확인해 주세요." : "Coupon expired or inactive.",
        };
      }

      if (cartSubtotal < coupon.minSubtotal) {
        return {
          ok: false,
          message:
            locale === "ko"
              ? `쿠폰 사용 최소 주문 금액은 $${coupon.minSubtotal.toFixed(2)}입니다.`
              : `Minimum subtotal is $${coupon.minSubtotal.toFixed(2)}.`,
        };
      }

      mutateDb((prev) => ({
        ...prev,
        couponByUser: {
          ...prev.couponByUser,
          [cartOwnerId]: coupon.code,
        },
      }));

      return {
        ok: true,
        message:
          locale === "ko"
            ? `${coupon.code} 쿠폰이 적용되었습니다.`
            : `Coupon ${coupon.code} applied.`,
      };
    },
    [db, locale, cartOwnerId, cartSubtotal, mutateDb],
  );

  const clearCoupon = useCallback(() => {
    mutateDb((prev) => ({
      ...prev,
      couponByUser: {
        ...prev.couponByUser,
        [cartOwnerId]: undefined,
      },
    }));
  }, [cartOwnerId, mutateDb]);

  const toggleWishlist = useCallback(
    (productSlug: string) => {
      if (!currentUser) {
        return;
      }

      mutateDb((prev) => ({
        ...prev,
        users: prev.users.map((user) => {
          if (user.id !== currentUser.id) {
            return user;
          }

          const exists = user.wishlist.includes(productSlug);
          return {
            ...user,
            wishlist: exists
              ? user.wishlist.filter((slug) => slug !== productSlug)
              : [productSlug, ...user.wishlist],
          };
        }),
      }));
    },
    [currentUser, mutateDb],
  );

  const addReview = useCallback(
    (input: { productSlug: string; rating: number; title: string; body: string }) => {
      if (!currentUser) {
        return false;
      }

      const nextReview: Review = {
        id: uid("rev"),
        productSlug: input.productSlug,
        userId: currentUser.id,
        userName: currentUser.name,
        rating: input.rating,
        title: { ko: input.title, en: input.title },
        body: { ko: input.body, en: input.body },
        approved: false,
        createdAt: new Date().toISOString(),
      };

      mutateDb((prev) => ({
        ...prev,
        reviews: [nextReview, ...prev.reviews],
      }));

      return true;
    },
    [currentUser, mutateDb],
  );

  const createSupportInquiry = useCallback(
    (input: { topic: SupportInquiryTopic; message: string }): string | null => {
      if (!currentUser) {
        return null;
      }

      const trimmedMessage = input.message.trim();
      if (!trimmedMessage) {
        return null;
      }

      const now = new Date().toISOString();
      const inquiry: SupportInquiry = {
        id: uid("inq"),
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        topic: input.topic,
        message: trimmedMessage,
        status: "new",
        adminNote: "",
        createdAt: now,
        updatedAt: now,
      };

      mutateDb((prev) => ({
        ...prev,
        inquiries: [inquiry, ...(prev.inquiries ?? [])],
      }));

      return inquiry.id;
    },
    [currentUser, mutateDb],
  );

  const updateSupportInquiryAdmin = useCallback(
    (inquiryId: string, patch: { status?: SupportInquiryStatus; adminNote?: string }) => {
      mutateDb((prev) => ({
        ...prev,
        inquiries: (prev.inquiries ?? []).map((entry) =>
          entry.id === inquiryId
            ? {
                ...entry,
                ...patch,
                updatedAt: new Date().toISOString(),
              }
            : entry,
        ),
      }));
    },
    [mutateDb],
  );

  const upsertAddress = useCallback(
    (address: Address) => {
      if (!currentUser) {
        return;
      }

      mutateDb((prev) => ({
        ...prev,
        users: prev.users.map((user) => {
          if (user.id !== currentUser.id) {
            return user;
          }

          const exists = user.addresses.some((entry) => entry.id === address.id);
          const nextAddresses = exists
            ? user.addresses.map((entry) => (entry.id === address.id ? address : entry))
            : [address, ...user.addresses];

          if (!nextAddresses.some((entry) => entry.isDefault) && nextAddresses.length > 0) {
            nextAddresses[0] = { ...nextAddresses[0], isDefault: true };
          }

          return {
            ...user,
            addresses: nextAddresses,
          };
        }),
      }));
    },
    [currentUser, mutateDb],
  );

  const deleteAddress = useCallback(
    (addressId: string) => {
      if (!currentUser) {
        return;
      }

      mutateDb((prev) => ({
        ...prev,
        users: prev.users.map((user) => {
          if (user.id !== currentUser.id) {
            return user;
          }

          const nextAddresses = user.addresses.filter((entry) => entry.id !== addressId);
          if (nextAddresses.length > 0 && !nextAddresses.some((entry) => entry.isDefault)) {
            nextAddresses[0] = { ...nextAddresses[0], isDefault: true };
          }

          return {
            ...user,
            addresses: nextAddresses,
          };
        }),
      }));
    },
    [currentUser, mutateDb],
  );

  const setDefaultAddress = useCallback(
    (addressId: string) => {
      if (!currentUser) {
        return;
      }

      mutateDb((prev) => ({
        ...prev,
        users: prev.users.map((user) => {
          if (user.id !== currentUser.id) {
            return user;
          }

          return {
            ...user,
            addresses: user.addresses.map((entry) => ({
              ...entry,
              isDefault: entry.id === addressId,
            })),
          };
        }),
      }));
    },
    [currentUser, mutateDb],
  );

  const createOrder = useCallback(
    (payload: CheckoutPayload): Order | null => {
      if (!currentUser || !db || cartLines.length === 0) {
        return null;
      }

      const couponCode = payload.couponCode ?? db.couponByUser[currentUser.id] ?? undefined;
      const coupon = couponCode
        ? db.coupons.find((entry) => entry.code.toLowerCase() === couponCode.toLowerCase())
        : undefined;

      const validCoupon = coupon && isCouponValid(coupon) ? coupon : undefined;
      const subtotal = cartLines.reduce((sum, line) => sum + line.lineTotal, 0);
      let discount = 0;

      if (validCoupon && subtotal >= validCoupon.minSubtotal) {
        discount =
          validCoupon.type === "percent"
            ? Math.round(subtotal * (validCoupon.value / 100) * 100) / 100
            : Math.min(validCoupon.value, subtotal);
      }

      const hasFreeShippingProduct = cartLines.some((line) => Boolean(line.product.freeShipping));
      const freeShippingReason = resolveFreeShippingReason(
        subtotal,
        db.settings.freeShippingThreshold,
        hasFreeShippingProduct,
      );
      const shipping = getShippingCharge(db.settings, freeShippingReason);
      const taxable = subtotal - discount;
      const tax = Math.round(taxable * db.settings.taxRate * 100) / 100;
      const total = Math.max(0, taxable + shipping + tax);

      const order: Order = {
        id: uid("ord"),
        userId: currentUser.id,
        items: cartItems.map((item) => {
          const product = db.products.find((entry) => entry.slug === item.productSlug);
          if (!product) {
            return item;
          }

          return {
            ...item,
            sizeKey: getProductSizeOption(product, item.sizeKey).key,
          };
        }),
        couponCode: validCoupon?.code,
        subtotal,
        discount,
        total,
        paymentStatus: "paid",
        status: "pending",
        trackingNumber: "",
        refundRequested: false,
        shippingAddress: payload.address,
        createdAt: new Date().toISOString(),
      };

      mutateDb((prev) => ({
        ...prev,
        orders: [order, ...prev.orders],
        cartByUser: {
          ...prev.cartByUser,
          [currentUser.id]: [],
        },
        couponByUser: {
          ...prev.couponByUser,
          [currentUser.id]: undefined,
        },
        users: prev.users.map((user) => {
          if (user.id !== currentUser.id) {
            return user;
          }

          const hasAddress = user.addresses.some((entry) => entry.id === payload.address.id);
          const nextAddresses = hasAddress
            ? user.addresses
            : [
                { ...payload.address, isDefault: user.addresses.length === 0 },
                ...user.addresses,
              ];

          return {
            ...user,
            addresses: nextAddresses,
          };
        }),
      }));

      return order;
    },
    [cartItems, cartLines, currentUser, db, mutateDb],
  );

  const upsertProduct = useCallback(
    (product: Product) => {
      mutateDb((prev) => {
        const existing = prev.products.find((entry) => entry.slug === product.slug);
        const seedProduct = SEED_PRODUCT_BY_SLUG.get(product.slug);
        const nextProduct: Product = {
          ...product,
          name: mergeLocalizedText(product.name, locale, existing?.name, seedProduct?.name),
          shortDescription: mergeLocalizedText(
            product.shortDescription,
            locale,
            existing?.shortDescription,
            seedProduct?.shortDescription,
          ),
          description: mergeLocalizedText(
            product.description,
            locale,
            existing?.description,
            seedProduct?.description,
          ),
          routineTip: mergeLocalizedText(
            product.routineTip,
            locale,
            existing?.routineTip,
            seedProduct?.routineTip,
          ),
          ingredients: product.ingredients.map((ingredient, index) => ({
            ...ingredient,
            name: mergeLocalizedText(
              ingredient.name,
              locale,
              existing?.ingredients[index]?.name,
              seedProduct?.ingredients[index]?.name,
            ),
            benefit: mergeLocalizedText(
              ingredient.benefit,
              locale,
              existing?.ingredients[index]?.benefit,
              seedProduct?.ingredients[index]?.benefit,
            ),
          })),
        };

        const exists = Boolean(existing);
        return {
          ...prev,
          products: exists
            ? prev.products.map((entry) => (entry.slug === product.slug ? nextProduct : entry))
            : [nextProduct, ...prev.products],
        };
      });
    },
    [locale, mutateDb],
  );

  const deleteProduct = useCallback(
    (slug: string) => {
      mutateDb((prev) => ({
        ...prev,
        products: prev.products.filter((entry) => entry.slug !== slug),
        reviews: prev.reviews.filter((entry) => entry.productSlug !== slug),
        cartByUser: Object.fromEntries(
          Object.entries(prev.cartByUser).map(([userId, items]) => [
            userId,
            items.filter((item) => item.productSlug !== slug),
          ]),
        ),
      }));
    },
    [mutateDb],
  );

  const upsertCollection = useCallback(
    (collection: Collection) => {
      mutateDb((prev) => {
        const existing = prev.collections.find((entry) => entry.slug === collection.slug);
        const seedCollection = SEED_COLLECTION_BY_SLUG.get(collection.slug);
        const nextCollection: Collection = {
          ...collection,
          name: mergeLocalizedText(collection.name, locale, existing?.name, seedCollection?.name),
          description: mergeLocalizedText(
            collection.description,
            locale,
            existing?.description,
            seedCollection?.description,
          ),
        };

        const exists = Boolean(existing);
        return {
          ...prev,
          collections: exists
            ? prev.collections.map((entry) => (entry.slug === collection.slug ? nextCollection : entry))
            : [nextCollection, ...prev.collections],
        };
      });
    },
    [locale, mutateDb],
  );

  const deleteCollection = useCallback(
    (slug: string) => {
      mutateDb((prev) => ({
        ...prev,
        collections: prev.collections.filter((entry) => entry.slug !== slug),
        products: prev.products.map((product) => ({
          ...product,
          collectionSlugs: product.collectionSlugs.filter((entry) => entry !== slug),
        })),
      }));
    },
    [mutateDb],
  );

  const upsertArticle = useCallback(
    (article: Article) => {
      mutateDb((prev) => {
        const existing = prev.articles.find((entry) => entry.slug === article.slug);
        const seedArticle = SEED_ARTICLE_BY_SLUG.get(article.slug);
        const nextArticle: Article = {
          ...article,
          title: mergeLocalizedText(article.title, locale, existing?.title, seedArticle?.title),
          excerpt: mergeLocalizedText(
            article.excerpt,
            locale,
            existing?.excerpt,
            seedArticle?.excerpt,
          ),
          content: mergeLocalizedText(
            article.content,
            locale,
            existing?.content,
            seedArticle?.content,
          ),
        };

        const exists = Boolean(existing);
        return {
          ...prev,
          articles: exists
            ? prev.articles.map((entry) => (entry.slug === article.slug ? nextArticle : entry))
            : [nextArticle, ...prev.articles],
        };
      });
    },
    [locale, mutateDb],
  );

  const deleteArticle = useCallback(
    (slug: string) => {
      mutateDb((prev) => ({
        ...prev,
        articles: prev.articles.filter((entry) => entry.slug !== slug),
      }));
    },
    [mutateDb],
  );

  const upsertCoupon = useCallback(
    (coupon: Coupon) => {
      mutateDb((prev) => {
        const exists = prev.coupons.some((entry) => entry.id === coupon.id);
        return {
          ...prev,
          coupons: exists
            ? prev.coupons.map((entry) => (entry.id === coupon.id ? coupon : entry))
            : [coupon, ...prev.coupons],
        };
      });
    },
    [mutateDb],
  );

  const deleteCoupon = useCallback(
    (id: string) => {
      mutateDb((prev) => ({
        ...prev,
        coupons: prev.coupons.filter((entry) => entry.id !== id),
      }));
    },
    [mutateDb],
  );

  const upsertBanner = useCallback(
    (banner: Banner) => {
      mutateDb((prev) => {
        const exists = prev.banners.some((entry) => entry.id === banner.id);
        return {
          ...prev,
          banners: exists
            ? prev.banners.map((entry) => (entry.id === banner.id ? banner : entry))
            : [banner, ...prev.banners],
        };
      });
    },
    [mutateDb],
  );

  const deleteBanner = useCallback(
    (id: string) => {
      mutateDb((prev) => ({
        ...prev,
        banners: prev.banners.filter((entry) => entry.id !== id),
      }));
    },
    [mutateDb],
  );

  const upsertSettings = useCallback(
    (settings: StoreDB["settings"]) => {
      mutateDb((prev) => ({
        ...prev,
        settings,
      }));
    },
    [mutateDb],
  );

  const updateOrderAdmin = useCallback(
    (orderId: string, patch: Partial<Order>) => {
      mutateDb((prev) => ({
        ...prev,
        orders: prev.orders.map((entry) => (entry.id === orderId ? { ...entry, ...patch } : entry)),
      }));
    },
    [mutateDb],
  );

  const approveReview = useCallback(
    (reviewId: string) => {
      mutateDb((prev) => ({
        ...prev,
        reviews: prev.reviews.map((entry) =>
          entry.id === reviewId ? { ...entry, approved: true } : entry,
        ),
      }));
    },
    [mutateDb],
  );

  const deleteReview = useCallback(
    (reviewId: string) => {
      mutateDb((prev) => ({
        ...prev,
        reviews: prev.reviews.filter((entry) => entry.id !== reviewId),
      }));
    },
    [mutateDb],
  );

  const resetAllData = useCallback(() => {
    const nextDb = withFallback(resetToSeed());
    setDb(nextDb);
    setSession({ userId: null });
  }, []);

  const value = useMemo<StoreContextValue>(() => {
    return {
      ready,
      locale,
      db,
      currentUser,
      isAuthenticated: Boolean(currentUser),
      isAdmin: currentUser?.role === "admin",
      cartItems,
      cartLines,
      cartCoupon,
      cartSubtotal,
      cartDiscount,
      cartShipping,
      cartFreeShippingReason,
      cartTotal,
      login,
      register,
      setLocale,
      toggleLocale,
      logout,
      addToCart,
      updateCartQuantity,
      updateCartItemSize,
      removeFromCart,
      clearCart,
      applyCoupon,
      clearCoupon,
      toggleWishlist,
      addReview,
      createSupportInquiry,
      updateSupportInquiryAdmin,
      createOrder,
      upsertAddress,
      deleteAddress,
      setDefaultAddress,
      upsertProduct,
      deleteProduct,
      upsertCollection,
      deleteCollection,
      upsertArticle,
      deleteArticle,
      upsertCoupon,
      deleteCoupon,
      upsertBanner,
      deleteBanner,
      upsertSettings,
      updateOrderAdmin,
      approveReview,
      deleteReview,
      resetAllData,
    };
  }, [
    ready,
    locale,
    db,
    currentUser,
    cartItems,
    cartLines,
    cartCoupon,
    cartSubtotal,
    cartDiscount,
    cartShipping,
    cartFreeShippingReason,
    cartTotal,
    login,
    register,
    setLocale,
    toggleLocale,
    logout,
    addToCart,
    updateCartQuantity,
    updateCartItemSize,
    removeFromCart,
    clearCart,
    applyCoupon,
    clearCoupon,
    toggleWishlist,
    addReview,
    createSupportInquiry,
    updateSupportInquiryAdmin,
    createOrder,
    upsertAddress,
    deleteAddress,
    setDefaultAddress,
    upsertProduct,
    deleteProduct,
    upsertCollection,
    deleteCollection,
    upsertArticle,
    deleteArticle,
    upsertCoupon,
    deleteCoupon,
    upsertBanner,
    deleteBanner,
    upsertSettings,
    updateOrderAdmin,
    approveReview,
    deleteReview,
    resetAllData,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = (): StoreContextValue => {
  const context = useContext(StoreContext);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
};
