import type { Locale, Product, ProductSizeOption } from "@/lib/types";

const DEFAULT_SIZE_KEY = "default";
const DEFAULT_SIZE_LABEL = "Default";
const BASE_SIZE_KEY = "50ml";
const LARGE_SIZE_KEY = "100ml";
const LARGE_SIZE_MULTIPLIER = 1.8;

const supportsAutoSizeVariants = (product: Product): boolean => {
  return product.category !== "tool";
};

const normalizeSizeOptions = (options: ProductSizeOption[], fallbackPrice: number): ProductSizeOption[] => {
  const seen = new Set<string>();
  const normalized: ProductSizeOption[] = [];

  options.forEach((option) => {
    const key = option.key?.trim();
    if (!key || seen.has(key)) {
      return;
    }

    seen.add(key);
    normalized.push({
      key,
      label: option.label?.trim() || key,
      price: Number.isFinite(option.price) ? option.price : fallbackPrice,
    });
  });

  return normalized;
};

const buildAutoSizeOptions = (product: Product): ProductSizeOption[] => {
  if (!supportsAutoSizeVariants(product)) {
    return [
      {
        key: DEFAULT_SIZE_KEY,
        label: DEFAULT_SIZE_LABEL,
        price: product.price,
      },
    ];
  }

  const basePrice = product.price;
  const largePrice = Math.round(basePrice * LARGE_SIZE_MULTIPLIER * 100) / 100;

  return [
    {
      key: BASE_SIZE_KEY,
      label: BASE_SIZE_KEY,
      price: basePrice,
    },
    {
      key: LARGE_SIZE_KEY,
      label: LARGE_SIZE_KEY,
      price: largePrice,
    },
  ];
};

export const getProductSizeOptions = (product: Product): ProductSizeOption[] => {
  if (Array.isArray(product.sizeOptions) && product.sizeOptions.length > 0) {
    const normalized = normalizeSizeOptions(product.sizeOptions, product.price);
    if (normalized.length > 0) {
      return normalized;
    }
  }

  return buildAutoSizeOptions(product);
};

export const hasMultipleProductSizes = (product: Product): boolean => {
  return getProductSizeOptions(product).length > 1;
};

export const getDefaultProductSizeKey = (product: Product): string => {
  return getProductSizeOptions(product)[0]?.key ?? DEFAULT_SIZE_KEY;
};

export const getProductSizeOption = (product: Product, sizeKey?: string): ProductSizeOption => {
  const options = getProductSizeOptions(product);
  const matched = sizeKey ? options.find((option) => option.key === sizeKey) : undefined;
  return (
    matched ??
    options[0] ?? {
      key: DEFAULT_SIZE_KEY,
      label: DEFAULT_SIZE_LABEL,
      price: product.price,
    }
  );
};

export const getProductPriceBySize = (product: Product, sizeKey?: string): number => {
  return getProductSizeOption(product, sizeKey).price;
};

export const getProductSizeLabel = (product: Product, locale: Locale, sizeKey?: string): string => {
  const label = getProductSizeOption(product, sizeKey).label;
  if (locale === "ko" && label.trim().toLowerCase() === "default") {
    return "기본";
  }
  return label;
};
