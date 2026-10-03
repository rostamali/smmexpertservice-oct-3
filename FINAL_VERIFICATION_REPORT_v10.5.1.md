# SMMExpertService Storefront v10.5.1 Verification

## Fix

The storefront build no longer requires the central Admin/API to be running while Next.js prerenders central-data-backed public pages.

The following routes are runtime dynamic:

- `/`
- `/shop`
- `/blog`
- `/cart`

They still use the existing `unstable_cache` storefront data layer at runtime.

## Regression verification

- V32.2 storefront: 8/8 PASS
- V32.2.4 default variation: 7/7 PASS
- V35 SMMExpertService: 19/19 PASS
- Coupon regression: 9/9 PASS
- Product sticky purchase: 14/14 PASS
- Storefront integration: 21/21 PASS
- Payment experience: 17/17 PASS
- V10.4 storefront: 17/17 PASS
- V10.5 Swiper/build safety: 10/10 PASS
- TypeScript/TSX parser audit: 96 files, 0 parse errors
- Local import audit: 0 missing local imports

## Reported failure fixed

Before this fix, `next build` could prerender `/cart` and execute `getCachedSiteChromeSettings()` while the central backend was offline, causing `fetch failed / ECONNREFUSED`.

`/cart` is transactional and is now rendered at request time. Home, Shop and Blog are also central-data-backed and have been made runtime dynamic to prevent the same sequential build failure.

No database migration is required.
