# SMMExpertService Storefront v10.5.1

## Build-time backend independence fix

- `/cart` is now runtime-dynamic, so `next build` no longer tries to fetch central site settings while prerendering the cart page.
- `/`, `/shop`, and `/blog` are also runtime-dynamic because they depend on central storefront data. This prevents sequential `ECONNREFUSED` prerender failures when the central Admin/API is intentionally not running during a storefront build.
- Existing `unstable_cache` data caches remain in place, so runtime central API calls still use the configured cache/revalidation policy.
- V10.5 verification now guards this build-safety contract.

No database migration is required.
