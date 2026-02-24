export const cn = (...classes: Array<string | false | null | undefined>): string => {
  return classes.filter(Boolean).join(" ");
};

export const currency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (value: string, locale: "ko" | "en" = "en"): string => {
  return new Intl.DateTimeFormat(locale === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
};

export const uid = (prefix: string): string => {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
};
