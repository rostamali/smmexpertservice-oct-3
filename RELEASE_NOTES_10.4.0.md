# SMMExpertService v10.4.0 Release Notes

## Admin
- Removed the System Pages SEO dashboard control; admin metadata remains noindex.
- Restored/kept Recovery Email Templates list and visual builder.
- Simplified manual recovery sending to Template → Real Preview → Confirm → Send.
- Removed per-send subject/heading/message/button overrides.
- Added preview integrity protection so the sent template/data must match the preview.
- Added mobile-navigation-only category accordion title using existing category JSON storage.
- Changed storefront product ordering to rating-count descending.
- Enforced NOWPayments payment windows at exactly 20 minutes on the backend.

## Storefront
- Added category-based mobile product accordions with dynamic site-scoped data.
- Added custom mobile accordion-title fallback behavior.
- Added rating-count-first sorting consistently to catalog-driven product lists.
- Added responsive homepage product carousel with previous/next and touch scrolling.
- Replaced the hero with an image-only draggable/swipeable carousel using live product images.
- Synchronized NOWPayments countdown to server time and the sealed backend expiration.
- Preserved change-currency support for generated crypto payments.

## Compatibility
- No new category database column is required for the mobile title.
- No System Pages SEO database field is required.
- Existing payment, cart, coupon, review, sticky purchase, and multisite/siteId behavior is preserved by regression checks.
