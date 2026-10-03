# SMMExpertService Storefront

This is **Application 2** of the final architecture. It is the public frontend extracted from the original project.

It is intentionally database-free. It does not include Prisma, `DATABASE_URL`, payment secrets, SMTP credentials or Admin functionality.

## Deployment model

Use this **same ZIP/codebase** for every public website:

```text
Deployment A → site-a.com → NEXA_SITE_HOST=site-a.com
Deployment B → site-b.com → NEXA_SITE_HOST=site-b.com
Deployment C → site-c.com → NEXA_SITE_HOST=site-c.com
```

All deployments connect to the same Central Admin + Backend:

```text
Storefront → Central Admin/Backend API → Central Database / Payments
```

## What is loaded dynamically

Products, simple/variable/package pricing, categories, reviews, pages/posts, SEO, logo, favicon, colors, fonts, footer content, currency, payment methods, coupons, order data and other storefront business data come from the Central Backend for the registered site.

## Setup

```bash
cp .env.example .env.local
npm install
npm run verify
npm run dev
```

Set at minimum:

```env
APP_URL=https://site-a.com
NEXT_PUBLIC_SITE_URL=https://site-a.com
NEXA_SITE_HOST=site-a.com
CENTRAL_BACKEND_URL=https://admin.example.com
STOREFRONT_REVALIDATE_SECRET=the-same-secret-configured-in-central-admin
```

`NEXA_SITE_HOST` must match a domain registered in **Central Admin → Websites**.

## API behavior

Server-rendered pages call the central backend directly with the site host. Browser-side checkout/cart/payment requests go through a small local proxy that adds the same trusted site-host identity before forwarding to the Central Backend. `/api/admin/*` is never proxied.

## Preserved storefront behavior

The existing storefront design and core behavior are retained, including product configurator, simple/variable/package products, correct starting prices, cart/checkout, occupied-package-tier skipping, coupons, order lookup/delivery, reviews with variation display, content/blog/SEO and the number-input protections.
