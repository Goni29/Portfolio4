import type { LocalizedText } from "@/lib/types";

export type JournalCategoryKey =
  | "all"
  | "skincare"
  | "science"
  | "guides"
  | "lifestyle"
  | "wellness"
  | "interviews"
  | "events";
type ResolvedJournalCategoryKey = Exclude<JournalCategoryKey, "all">;

type CategoryDefinition = {
  key: ResolvedJournalCategoryKey;
  label: LocalizedText;
  aliases: string[];
};

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    key: "skincare",
    label: { ko: "\uC2A4\uD0A8\uCF00\uC5B4", en: "Skincare" },
    aliases: ["skincare", "skin", "ritual", "rituals"],
  },
  {
    key: "science",
    label: { ko: "\uC0AC\uC774\uC5B8\uC2A4", en: "Science" },
    aliases: ["science", "ingredient", "ingredients"],
  },
  {
    key: "guides",
    label: { ko: "\uAC00\uC774\uB4DC", en: "Guides" },
    aliases: ["guide", "guides", "education"],
  },
  {
    key: "lifestyle",
    label: { ko: "\uB77C\uC774\uD504\uC2A4\uD0C0\uC77C", en: "Lifestyle" },
    aliases: ["lifestyle"],
  },
  {
    key: "wellness",
    label: { ko: "\uC6F0\uB2C8\uC2A4", en: "Wellness" },
    aliases: ["wellness"],
  },
  {
    key: "interviews",
    label: { ko: "\uC778\uD130\uBDF0", en: "Interviews" },
    aliases: ["interview", "interviews"],
  },
  {
    key: "events",
    label: { ko: "\uC774\uBCA4\uD2B8", en: "Events" },
    aliases: ["event", "events", "dispatch"],
  },
];

export const JOURNAL_CATEGORY_ORDER: ResolvedJournalCategoryKey[] = [
  "skincare",
  "science",
  "guides",
  "lifestyle",
  "wellness",
  "interviews",
  "events",
];

const normalizeCategory = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

const DEFAULT_CATEGORY = CATEGORY_DEFINITIONS[0];

export function resolveJournalCategory(rawCategory: string) {
  const normalizedCategory = normalizeCategory(rawCategory || "");

  if (!normalizedCategory) {
    return DEFAULT_CATEGORY;
  }

  for (const category of CATEGORY_DEFINITIONS) {
    if (
      category.aliases.some((alias) => {
        const normalizedAlias = normalizeCategory(alias);
        return normalizedCategory === normalizedAlias || normalizedCategory.includes(normalizedAlias);
      })
    ) {
      return category;
    }
  }

  return DEFAULT_CATEGORY;
}

export function getJournalCategoryKey(rawCategory: string): ResolvedJournalCategoryKey {
  return resolveJournalCategory(rawCategory).key;
}

export function getJournalCategoryLabelByKey(key: ResolvedJournalCategoryKey, locale: "ko" | "en") {
  return CATEGORY_DEFINITIONS.find((category) => category.key === key)?.label[locale] ?? key;
}

export function getJournalCategoryLabel(rawCategory: string, locale: "ko" | "en") {
  return resolveJournalCategory(rawCategory).label[locale];
}
