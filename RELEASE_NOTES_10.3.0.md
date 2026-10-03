# SMMExpertService Storefront v10.3.0

## Payment page
- Redesigned the payment experience into maintainable feature components.
- Gateway cards and payment pages use the configured customer-facing payment label instead of machine keys such as `PAYGATE` or `NOWPAYMENTS`.
- Per-gateway payment page metadata is supported and remains `noindex`.

## NOWPayments
- Currency picker supports coin name, network, and image metadata supplied by the central backend.
- After a QR/address is generated, the customer can choose **Change currency**, return to the currency selector, and generate a new tracked NOWPayments payment safely.

## PayGate
- Redesigned provider selection with provider title/image overrides, converted checkout amount/currency, minimum messages, and a professional secure-payment summary.
- Added an explicit loading spinner and disabled-state while the selected provider payment link is being created.
- Converted provider quotes returned by the backend are shown directly in the provider card.

## Metadata
- Added configurable metadata support for Home, Shop, Blog, Contact, Cart, Checkout, Order Lookup, transactional/recovery pages, and 404.
- Added `global-not-found.tsx` so unmatched URLs can use the configured 404 presentation metadata while remaining `noindex`.

## Structure
- Checkout components live under `src/components/checkout/`.
- Payment components live under `src/components/payment/`.
- Product purchase components live under `src/components/product/`.
- Compatibility re-exports are retained where required so existing imports continue to work.
