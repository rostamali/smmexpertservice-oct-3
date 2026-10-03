export type PriceLike = number | string | { toString(): string };

export type PriceableProduct = {
  productType: 'SIMPLE' | 'VARIABLE' | 'VARIABLE_PACKAGE';
  regularPrice?: PriceLike | null;
  salePrice?: PriceLike | null;
  variants?: Array<{
    price: PriceLike;
    packages?: Array<{ price: PriceLike }>;
  }>;
};

const toPrice = (value: PriceLike | null | undefined): number | null => {
  if (value == null) return null;
  const price = Number(value);
  return Number.isFinite(price) ? price : null;
};

export const getProductPriceValues = (product: PriceableProduct): number[] => {
  if (product.productType === 'SIMPLE') {
    const price = toPrice(product.salePrice ?? product.regularPrice);
    return price == null ? [] : [price];
  }

  const variants = product.variants ?? [];

  if (product.productType === 'VARIABLE_PACKAGE') {
    return variants
      .flatMap((variant) => variant.packages ?? [])
      .map((pkg) => toPrice(pkg.price))
      .filter((price): price is number => price != null);
  }

  return variants
    .map((variant) => toPrice(variant.price))
    .filter((price): price is number => price != null);
};

export const getProductPriceRange = (product: PriceableProduct): { min: number; max: number } | null => {
  const prices = getProductPriceValues(product);
  if (!prices.length) return null;
  return { min: Math.min(...prices), max: Math.max(...prices) };
};

export const getProductStartingPrice = (product: PriceableProduct): number | null =>
  getProductPriceRange(product)?.min ?? null;
