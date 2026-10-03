# SMMExpertService Full Stack v10.3.0 — Verification Report

Date: 2026-09-29

## Release versions
- Nexa Admin / Central Backend: 10.2.0
- SMMExpertService Storefront: 10.3.0

## Admin / Central Backend
- Dashboard UI source verification: PASS
- Platform integration: 54/54 PASS
- Client/server boundary: PASS (74 client entries, 0 server-only leaks)
- V28 completion: 33/33 PASS
- V29 completion: 7/7 PASS
- V32.2 admin: 16/16 PASS
- V32.2.3 transaction: 8/8 PASS
- Payment / recovery / SEO regression: 19/19 PASS
- TypeScript/TSX syntax parse: 389 files, 0 syntax errors
- Local source import audit: 0 missing imports

## Storefront
- V32.2 storefront: 8/8 PASS
- V32.2.4 default variation: 7/7 PASS
- V35 SMMExpertService: 19/19 PASS
- Coupon regression: 9/9 PASS
- Sticky/mobile product purchase: 14/14 PASS
- Storefront integration: 21/21 PASS
- Payment experience: 12/12 PASS
- TypeScript/TSX syntax parse: 97 files, 0 syntax errors
- Local source import audit: 0 missing imports

## PayGate FX runtime test
Mocked PayGate official converter rates were used to exercise the actual `quotePayGateProvider` implementation:
- USD 60 -> iDEAL EUR 50: available
- USD 50 -> iDEAL EUR 41.67: unavailable below EUR 46 minimum
- USD 20 -> Klarna SEK 200: available
- USD 10 -> Klarna SEK 100: unavailable below SEK 125 minimum
Result: PASS

## Important database upgrade
This release adds `SeoSettings.systemPageMetadata`.

For an existing database run from the Admin project:

```bash
npm ci
npm run prisma:generate
npm run db:upgrade-system-page-seo
npm run verify
```

For a fresh database, use the normal schema push + seed flow instead.

## PayGate settlement tolerance
Converted PayGate payments store an expected USD settlement value. Callback confirmation remotely verifies the payment and rejects materially underpaid settlements. The default allowed shortfall is 3% (minimum USD 0.50), configurable with:

```env
PAYGATE_AMOUNT_TOLERANCE_PERCENT=3
```

The configured percent is clamped to 0–20.

## Full dependency build limitation in this workspace
A fresh npm dependency install could not be completed because this execution environment cannot resolve `registry.npmjs.org` (`EAI_AGAIN`). Therefore the final dependency-backed `tsc --noEmit` + `next build` stages could not be executed here.

The source/regression/static checks above all pass. Run the normal verification commands in the deployment environment where npm registry access is available.
