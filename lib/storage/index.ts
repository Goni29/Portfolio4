import { readLocal, writeLocal } from "@/lib/storage/base";
import { createSeedDb, createSeedSession } from "@/lib/storage/seed";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import type { Locale, LocalizedText, LocalizedValue, SessionState, StoreDB } from "@/lib/types";

const DB_KEY = "db";
const SESSION_KEY = "session";
const LOCALE_KEY = "locale";
const DAILY_DEFENSE_HERO_IMAGE = "/collection3.png";
const LEGACY_DAILY_DEFENSE_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuB8rFCb4eSLAWGesmzQsJof9VGrcq6ERudpGqWqeBUNVHSR4Iu9f3n06QyE_jp4I0qE3RmqwlHwIDRR8GCsS-CUZ6rOaJAomYRDtbgkDNu9jhLM34hg-VtVEYXkD1NH9wcEjFvW9hjrcBZBZaKAkRq8NWN0pV9Kee4p8HWkdC2kw8ZVWEjP-VOjB732bogXlQx8KukHn0faV14PzbCBlETcA-Klm2PgTbVkD7BhvZ5L6NqyKFWGZbQYvE73W7bpKBZILGqfIjAr5To";
const PRODUCT_DETAIL_IMAGE_PATCHES: Record<string, { thumbnail: string; mainImage?: string }> = {
  "bio-cellulose-mask": { mainImage: "/mask.png", thumbnail: "/mask1.png" },
  "velvet-cloud-cream": { mainImage: "/cream.png", thumbnail: "/cream1.png" },
  "clarity-gel-cream": { thumbnail: "/cream2.png" },
  "midnight-recovery-oil": { thumbnail: "/oil1.png" },
  "luminous-silk-serum": { thumbnail: "/serum1.png" },
  "rose-quartz-roller": { thumbnail: "/roller.png" },
  "mineral-veil-spf50": { mainImage: "/suncream.png", thumbnail: "/suncream1.png" },
  "enzyme-polish-cleanser": { mainImage: "/form.png", thumbnail: "/form1.png" },
};
const ROSE_QUARTZ_ROLLER_SLUG = "rose-quartz-roller";

const hasHangul = (value: string): boolean => /[가-힣]/.test(value);
const hasNonAscii = (value: string): boolean => /[^\u0000-\u007f]/.test(value);

const isLikelyBrokenKorean = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.includes("\uFFFD")) {
    return true;
  }

  return hasNonAscii(trimmed) && !hasHangul(trimmed);
};

const isLocalizedText = (value: unknown): value is LocalizedText => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const target = value as { ko?: unknown; en?: unknown };
  return typeof target.ko === "string" && typeof target.en === "string";
};

const normalizeLocalizedObject = (
  value: LocalizedText,
  seedLocalized?: LocalizedText,
): LocalizedText => {
  if (!seedLocalized) {
    return value;
  }

  return {
    ko:
      value.ko.trim() === "" || isLikelyBrokenKorean(value.ko)
        ? seedLocalized.ko
        : value.ko,
    en: value.en.trim() === "" ? seedLocalized.en : value.en,
  };
};

const toLocalizedText = (
  value: LocalizedValue | undefined,
  seedValue?: LocalizedValue,
): LocalizedText => {
  const seedLocalized = isLocalizedText(seedValue) ? seedValue : undefined;

  if (isLocalizedText(value)) {
    return normalizeLocalizedObject(value, seedLocalized);
  }

  if (typeof value === "string") {
    if (seedLocalized) {
      if (isLikelyBrokenKorean(value)) {
        return seedLocalized;
      }

      if (hasHangul(value)) {
        return { ko: value, en: seedLocalized.en };
      }
      return { ko: seedLocalized.ko, en: value };
    }

    return { ko: value, en: value };
  }

  if (seedLocalized) {
    return seedLocalized;
  }

  return { ko: "", en: "" };
};

const normalizeDbLocalizedFields = (db: StoreDB, seed: StoreDB): StoreDB => {
  const seedProductBySlug = new Map(seed.products.map((product) => [product.slug, product]));
  const seedCollectionBySlug = new Map(seed.collections.map((collection) => [collection.slug, collection]));
  const seedArticleBySlug = new Map(seed.articles.map((article) => [article.slug, article]));
  const seedReviewById = new Map(seed.reviews.map((review) => [review.id, review]));

  return {
    ...db,
    products: db.products.map((product) => {
      const seedProduct = seedProductBySlug.get(product.slug);
      return {
        ...product,
        name: toLocalizedText(product.name, seedProduct?.name),
        shortDescription: toLocalizedText(product.shortDescription, seedProduct?.shortDescription),
        description: toLocalizedText(product.description, seedProduct?.description),
        routineTip: toLocalizedText(product.routineTip, seedProduct?.routineTip),
        ingredients: product.ingredients.map((ingredient, index) => ({
          ...ingredient,
          name: toLocalizedText(ingredient.name, seedProduct?.ingredients[index]?.name),
          benefit: toLocalizedText(ingredient.benefit, seedProduct?.ingredients[index]?.benefit),
        })),
      };
    }),
    collections: db.collections.map((collection) => {
      const seedCollection = seedCollectionBySlug.get(collection.slug);
      return {
        ...collection,
        name: toLocalizedText(collection.name, seedCollection?.name),
        description: toLocalizedText(collection.description, seedCollection?.description),
      };
    }),
    articles: db.articles.map((article) => {
      const seedArticle = seedArticleBySlug.get(article.slug);
      return {
        ...article,
        title: toLocalizedText(article.title, seedArticle?.title),
        excerpt: toLocalizedText(article.excerpt, seedArticle?.excerpt),
        content: toLocalizedText(article.content, seedArticle?.content),
      };
    }),
    reviews: db.reviews.map((review) => {
      const seedReview = seedReviewById.get(review.id);
      return {
        ...review,
        title: toLocalizedText(review.title, seedReview?.title),
        body: toLocalizedText(review.body, seedReview?.body),
      };
    }),
  };
};

const migrateLegacyAccountEmailDomain = (db: StoreDB): StoreDB => {
  return {
    ...db,
    users: db.users.map((user) => {
      if (!user.email.endsWith("@portfolio4.com")) {
        return user;
      }

      if (user.id !== "usr_admin" && user.id !== "usr_1" && user.id !== "usr_2") {
        return user;
      }

      return {
        ...user,
        email: user.email.replace("@portfolio4.com", "@portfolio.com"),
      };
    }),
  };
};

const migrateDailyDefenseHeroImage = (db: StoreDB): StoreDB => {
  return {
    ...db,
    collections: db.collections.map((collection) => {
      if (collection.slug !== "daily-defense") {
        return collection;
      }

      if (
        collection.heroImage === LEGACY_DAILY_DEFENSE_HERO_IMAGE ||
        collection.heroImage.trim() === ""
      ) {
        return {
          ...collection,
          heroImage: DAILY_DEFENSE_HERO_IMAGE,
        };
      }

      return collection;
    }),
  };
};

const migrateProductDetailImages = (db: StoreDB, seed: StoreDB): StoreDB => {
  const seedProductBySlug = new Map(seed.products.map((product) => [product.slug, product]));

  return {
    ...db,
    products: db.products.map((product) => {
      const patch = PRODUCT_DETAIL_IMAGE_PATCHES[product.slug];
      if (!patch) {
        return product;
      }

      const mainImage = patch.mainImage ?? product.images[0] ?? seedProductBySlug.get(product.slug)?.images[0] ?? "";
      if (mainImage.trim() === "") {
        return product;
      }

      return {
        ...product,
        images: [mainImage, patch.thumbnail],
      };
    }),
  };
};

const migrateProductFreeShipping = (db: StoreDB, seed: StoreDB): StoreDB => {
  const seedProductBySlug = new Map(seed.products.map((product) => [product.slug, product]));

  return {
    ...db,
    products: db.products.map((product) => {
      if (typeof product.freeShipping === "boolean") {
        return product;
      }

      const seedProduct = seedProductBySlug.get(product.slug);
      if (typeof seedProduct?.freeShipping !== "boolean") {
        return product;
      }

      return {
        ...product,
        freeShipping: seedProduct.freeShipping,
      };
    }),
  };
};

const migrateRoseQuartzRollerFreeShipping = (db: StoreDB): StoreDB => {
  return {
    ...db,
    products: db.products.map((product) => {
      if (product.slug !== ROSE_QUARTZ_ROLLER_SLUG) {
        return product;
      }

      if (!product.freeShipping) {
        return product;
      }

      return {
        ...product,
        freeShipping: false,
      };
    }),
  };
};

const migrateAnalytics = (db: StoreDB): StoreDB => {
  const rawViews = db.analytics?.productViewsBySlug;
  const normalizedViews: Record<string, number> = {};

  if (rawViews && typeof rawViews === "object") {
    Object.entries(rawViews).forEach(([slug, value]) => {
      if (typeof slug !== "string" || slug.trim() === "") {
        return;
      }

      const parsed = Math.floor(Number(value));
      if (!Number.isFinite(parsed) || parsed <= 0) {
        return;
      }

      normalizedViews[slug] = parsed;
    });
  }

  return {
    ...db,
    analytics: {
      productViewsBySlug: normalizedViews,
    },
  };
};

export const loadDb = (): StoreDB => {
  const seed = createSeedDb();
  const saved = readLocal<StoreDB>(DB_KEY, seed);

  if (saved.schemaVersion !== 1) {
    writeLocal(DB_KEY, seed);
    return seed;
  }

  const normalized = migrateAnalytics(
    migrateRoseQuartzRollerFreeShipping(
      migrateProductFreeShipping(
        migrateProductDetailImages(
          migrateDailyDefenseHeroImage(
            migrateLegacyAccountEmailDomain(normalizeDbLocalizedFields(saved, seed)),
          ),
          seed,
        ),
        seed,
      ),
    ),
  );
  writeLocal(DB_KEY, normalized);
  return normalized;
};

export const saveDb = (db: StoreDB): void => {
  writeLocal(DB_KEY, db);
};

export const loadSession = (): SessionState => {
  return readLocal<SessionState>(SESSION_KEY, createSeedSession());
};

export const saveSession = (session: SessionState): void => {
  writeLocal(SESSION_KEY, session);
};

export const loadLocale = (): Locale => {
  const stored = readLocal<Locale>(LOCALE_KEY, DEFAULT_LOCALE);
  return stored === "en" ? "en" : "ko";
};

export const saveLocale = (locale: Locale): void => {
  writeLocal(LOCALE_KEY, locale);
};

export const resetToSeed = (): StoreDB => {
  const seed = createSeedDb();
  writeLocal(DB_KEY, seed);
  writeLocal(SESSION_KEY, createSeedSession());
  return seed;
};
