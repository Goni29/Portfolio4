const APP_KEY = "portfolio4";
const SCHEMA_VERSION = "v1";

export const storageKey = (key: string): string => `${APP_KEY}:${SCHEMA_VERSION}:${key}`;

export const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const readLocal = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const raw = window.localStorage.getItem(storageKey(key));
  return safeParse<T>(raw, fallback);
};

export const writeLocal = <T>(key: string, value: T): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(storageKey(key), JSON.stringify(value));
};
