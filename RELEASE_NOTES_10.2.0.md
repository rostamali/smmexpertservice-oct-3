# SMMExpertService Storefront v10.2.0 — Payment Experience

## Checkout payment methods
- Uses the admin-defined customer-facing gateway label and image.
- Optional Help action opens the admin-defined help image in a modal.
- Existing gateway discount/tax/coupon behavior is preserved.

## Payment page
- Rebuilt into `src/components/payment/` feature components.
- Professional payment hero, status views, crypto selector and PayGate provider selector.
- NOWPayments enabled currencies render name, network and official metadata logo when available.
- PayGate provider custom titles/images from admin are rendered on the storefront.
- Customer-facing UI uses gateway labels; machine keys remain internal routing identifiers only.

## Checkout folder structure
- Checkout implementation moved to `src/components/checkout/`.
- Compatibility re-export files remain at the old component paths.
- Payment implementation lives under `src/components/payment/`.

## Product mobile regression
- Restored the mobile fixed bottom purchase summary and safe content bottom spacing.
