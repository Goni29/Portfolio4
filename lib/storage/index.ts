import { readLocal, writeLocal } from "@/lib/storage/base";
import { createSeedDb, createSeedSession } from "@/lib/storage/seed";
import { DEFAULT_LOCALE } from "@/lib/i18n";
import type { Locale, LocalizedText, LocalizedValue, SessionState, StoreDB } from "@/lib/types";

const DB_KEY = "db";
const SESSION_KEY = "session";
const LOCALE_KEY = "locale";

const hasHangul = (value: string): boolean => /[가-힣]/.test(value);
const hasNonAscii = (value: string): boolean => /[^\u0000-\u007f]/.test(value);

const isLikelyBrokenKorean = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) {
    return false;
  }

  if (trimmed.includes("�")) {
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

export const loadDb = (): StoreDB => {
  const seed = createSeedDb();
  const saved = readLocal<StoreDB>(DB_KEY, seed);

  if (saved.schemaVersion !== 1) {
    writeLocal(DB_KEY, seed);
    return seed;
  }

  const normalized = migrateLegacyAccountEmailDomain(normalizeDbLocalizedFields(saved, seed));
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
