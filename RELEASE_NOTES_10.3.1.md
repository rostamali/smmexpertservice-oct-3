# SMMExpertService Storefront 10.3.1

## Build-safe system page metadata

- System page metadata (including `/404`) now gracefully falls back to branded SMMExpertService metadata when the central backend/SEO schema is temporarily unavailable during `next build`.
- Admin-configured metadata is still used normally whenever the central backend responds successfully.
- This prevents a pending `SeoSettings.systemPageMetadata` database upgrade from crashing the storefront production build.
- The Admin database upgrade is still required to persist/use custom system-page metadata: `npm run db:upgrade-system-page-seo`.
- Added a regression verifier for build-safe metadata fallback.
