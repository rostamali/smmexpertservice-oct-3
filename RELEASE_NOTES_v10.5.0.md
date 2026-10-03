# SMMExpertService v10.5.0 — Swiper Slider/Carousel Update

## Storefront
- Replaced the custom/native-scroll homepage hero slider with the Swiper npm package.
- Replaced the custom/native-scroll homepage product carousel with the Swiper npm package.
- Hero autoplay: 5 seconds, loop enabled when multiple slides exist, navigation + clickable pagination, drag/swipe enabled.
- Hero slides support an optional clickable internal path or external URL.
- Product carousel autoplay: 3.5 seconds, resumes after interaction and pauses on mouse hover.
- Product responsive layout remains 2 cards on mobile/tablet and 4 on desktop/laptop.
- Product cards continue using live site-scoped catalog/rating/price data.
- Swiper pinned to 12.2.0 in package.json and package-lock.json.

## Admin
- Site Logo / Site Branding page now includes a Homepage hero slider editor.
- Up to 8 slides can be selected from the Media Library.
- Each slide supports image, click URL, alt text, ordering and removal.
- No Prisma/database schema migration is required. Hero configuration is stored site-scoped in a hidden marker inside the existing SeoSettings.headerCode LongText field and is stripped before storefront header HTML is rendered.
- Editing Header Code preserves the hero slider configuration.

## Backward compatibility
- If no custom hero slide is configured, the homepage keeps the existing live product-image fallback.
- Existing payment, coupon, product sticky, recovery, media proxy and mobile navigation behavior is preserved.
