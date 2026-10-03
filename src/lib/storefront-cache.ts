import { unstable_cache } from 'next/cache';
import { centralApiFetch, getStorefrontHost } from '@/lib/api-client';

export const STORE_CACHE_TAGS = {
    settings: 'store-settings',
    seo: 'store-seo',
    products: 'store-products',
    categories: 'store-categories',
    content: 'store-content',
    gateways: 'store-payment-gateways',
    coupons: 'store-coupons',
    reviews: 'store-reviews',
} as const;

export type PublicSeoSettings = {
    siteName: string;
    defaultTitlePattern: string;
    defaultDescription: string | null;
    defaultOgImage: string | null;
    twitterCard: string;
    webmasterGoogle: string | null;
    webmasterBing: string | null;
    webmasterPinterest: string | null;
    organizationName: string | null;
    organizationLogo: string | null;
    headerCode: string | null;
    localBusinessName: string | null;
    localBusinessLogo: string | null;
    localBusinessDescription: string | null;
    localBusinessType: string | null;
    localBusinessUrl: string | null;
    localBusinessTelephone: string | null;
    localBusinessPriceRange: string | null;
    localBusinessStreetAddress: string | null;
    localBusinessAddressLocality: string | null;
    localBusinessAddressRegion: string | null;
    localBusinessPostalCode: string | null;
    localBusinessAddressCountry: string | null;
    robotsText: string | null;
    llmsText: string | null;
};

const resource = async (host: string, query: string) =>
    centralApiFetch<any>(`/api/store/data?${query}`, {
        headers: { 'x-nexa-site-host': host },
        next: { revalidate: 60 } as any,
    });

const cachedSiteSettings = unstable_cache(
    (host: string) => resource(host, 'resource=site-settings'),
    ['nexa-api-site-settings-v2'],
    { revalidate: 300, tags: [STORE_CACHE_TAGS.settings] },
);
const cachedSeo = unstable_cache(
    (host: string) => resource(host, 'resource=seo'),
    ['nexa-api-seo-v1'],
    { revalidate: 600, tags: [STORE_CACHE_TAGS.seo] },
);
const cachedGateways = unstable_cache(
    (host: string) => resource(host, 'resource=payment-methods'),
    ['nexa-api-gateways-v2'],
    { revalidate: 60, tags: [STORE_CACHE_TAGS.gateways] },
);
const cachedCoupons = unstable_cache(
    (host: string) => resource(host, 'resource=promoted-coupons'),
    ['nexa-api-coupons-v1'],
    { revalidate: 120, tags: [STORE_CACHE_TAGS.coupons] },
);
const cachedHome = unstable_cache(
    (host: string) => resource(host, 'resource=home'),
    ['nexa-api-home-v6-navigation-rating'],
    { revalidate: 60, tags: [STORE_CACHE_TAGS.products, STORE_CACHE_TAGS.categories] },
);
const cachedShop = unstable_cache(
    (host: string, page: number, pageSize: number, category: string) =>
        resource(
            host,
            `resource=shop&page=${page}&pageSize=${pageSize}&category=${encodeURIComponent(category)}`,
        ),
    ['nexa-api-shop-v4-rating-count'],
    { revalidate: 60, tags: [STORE_CACHE_TAGS.products, STORE_CACHE_TAGS.categories] },
);
const cachedProduct = unstable_cache(
    (host: string, slug: string) =>
        resource(host, `resource=product&slug=${encodeURIComponent(slug)}`),
    ['nexa-api-product-v4'],
    { revalidate: 60, tags: [STORE_CACHE_TAGS.products] },
);
const cachedContent = unstable_cache(
    (host: string, type: 'POST' | 'PAGE', slug: string) =>
        resource(host, `resource=content&type=${type}&slug=${encodeURIComponent(slug)}`),
    ['nexa-api-content-v1'],
    { revalidate: 120, tags: [STORE_CACHE_TAGS.content] },
);
const cachedBlog = unstable_cache(
    (host: string, page: number, pageSize: number) =>
        resource(host, `resource=blog&page=${page}&pageSize=${pageSize}`),
    ['nexa-api-blog-v1'],
    { revalidate: 120, tags: [STORE_CACHE_TAGS.content] },
);
const cachedSiteReviews = unstable_cache(
    (host: string, limit: number) => resource(host, `resource=site-reviews&limit=${limit}`),
    ['nexa-api-site-reviews-v1'],
    { revalidate: 120, tags: [STORE_CACHE_TAGS.reviews] },
);

export const getCachedSiteChromeSettings = async () =>
    cachedSiteSettings(await getStorefrontHost());

const fallbackSeoSettings = (): PublicSeoSettings => ({
    siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'SMMExpertService',
    defaultTitlePattern: '%title% | %sitename%',
    defaultDescription: 'SMMExpertService online store.',
    defaultOgImage: null,
    twitterCard: 'summary_large_image',
    webmasterGoogle: null,
    webmasterBing: null,
    webmasterPinterest: null,
    organizationName: null,
    organizationLogo: null,
    headerCode: null,
    localBusinessName: null,
    localBusinessLogo: null,
    localBusinessDescription: null,
    localBusinessType: null,
    localBusinessUrl: null,
    localBusinessTelephone: null,
    localBusinessPriceRange: null,
    localBusinessStreetAddress: null,
    localBusinessAddressLocality: null,
    localBusinessAddressRegion: null,
    localBusinessPostalCode: null,
    localBusinessAddressCountry: null,
    robotsText: null,
    llmsText: null,
});

/**
 * SEO metadata must never take the storefront down when the central backend is
 * temporarily unavailable or when an admin schema migration is still pending.
 * The next request retries the cached backend call normally; this fallback only
 * supplies safe branded defaults for the current render.
 */
export const getCachedSeoSettings = async (): Promise<PublicSeoSettings> => {
    try {
        return await cachedSeo(await getStorefrontHost());
    } catch {
        return fallbackSeoSettings();
    }
};
export const getCachedPublicPaymentGateways = async () => cachedGateways(await getStorefrontHost());
export const getCachedPromotedCoupons = async () => cachedCoupons(await getStorefrontHost());
export const getCachedHomeCatalog = async () => cachedHome(await getStorefrontHost());
export const getCachedShopProducts = async (page = 1, pageSize = 12, categorySlug = '') =>
    cachedShop(await getStorefrontHost(), page, pageSize, categorySlug);
export const getCachedProductBySlug = async (slug: string) =>
    cachedProduct(await getStorefrontHost(), slug);
export const getCachedContentBySlug = async (type: 'POST' | 'PAGE', slug: string) =>
    cachedContent(await getStorefrontHost(), type, slug);
export const getCachedBlogPosts = async (page = 1, pageSize = 12) =>
    cachedBlog(await getStorefrontHost(), page, pageSize);
export const getCachedSiteReviews = async (limit = 24) =>
    cachedSiteReviews(await getStorefrontHost(), limit);
