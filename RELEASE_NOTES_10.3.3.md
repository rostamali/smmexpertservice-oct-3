# SMMExpertService Storefront v10.3.3

- Centralized SEO fallback in `getCachedSeoSettings()` so product/content/payment/layout metadata cannot crash when the central SEO API is temporarily unavailable or the `systemPageMetadata` database upgrade is pending.
- Preserves Admin-configured metadata automatically once the backend/database is healthy.
- Adds a regression verifier for global SEO runtime safety.

Database note: run `npm run db:upgrade-system-page-seo` in the Admin project to enable persisted System Page Metadata. The storefront fallback is a resilience layer, not a replacement for the migration.
