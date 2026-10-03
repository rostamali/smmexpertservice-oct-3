import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowRight,
    BadgeCheck,
    CheckCircle2,
    CircleHelp,
    Clock3,
    Globe2,
    Headset,
    LockKeyhole,
    PackageCheck,
    ShieldCheck,
    Sparkles,
    Zap,
} from 'lucide-react';
import ProductConfigurator from '@/components/product/ProductConfigurator';
import ProductPurchaseProvider from '@/components/product/ProductPurchaseProvider';
import ProductPurchaseSummary from '@/components/product/ProductPurchaseSummary';
import type { ProductPurchaseProduct } from '@/components/product/types';
import ProductRating from '@/components/ProductRating';
import ProductReviews from '@/components/ProductReviews';
import ScrollReveal from '@/components/ScrollReveal';
import { money } from '@/lib/money';
import { applyTitlePattern, getSeoSettings, robotsFromFlags } from '@/lib/seo';
import { getCurrentSiteBaseUrl } from '@/lib/site';
import { redirectOr404 } from '@/lib/seo-navigation';
import {
    getCachedHomeCatalog,
    getCachedProductBySlug,
    getCachedSiteChromeSettings,
} from '@/lib/storefront-cache';
import { stripHtml } from '@/lib/rich-html';
import { getProductPriceRange, getProductPriceValues } from '@/lib/product-pricing';
import { scopedCss } from '@/lib/scoped-css';
import ProductCard from '@/components/shared/ProductCard';
import { singleProductFeatureCards } from '@/config/single-product';

export const revalidate = 60;

type ProductAttributeValue = { id: number; label: string; value: string };
type ProductAttribute = {
    id: number;
    name: string;
    slug: string;
    required: boolean;
    isVariantAxis: boolean;
    visible: boolean;
    values: ProductAttributeValue[];
};
type ProductVariantValue = { attributeValueId: number };
type ProductPackage = {
    id: number;
    quantity: number;
    price: number;
    badge: string | null;
    isDefault: boolean;
    isPopular: boolean;
};
type ProductVariant = {
    id: number;
    label: string;
    price: number;
    compareAtPrice: number | null;
    stock: number;
    manageStock: boolean;
    values: ProductVariantValue[];
    packages: ProductPackage[];
};
type ProductInputField = {
    id: number;
    label: string;
    fieldKey: string;
    type: 'TEXT' | 'EMAIL' | 'URL' | 'NUMBER' | 'TEXTAREA' | 'SELECT';
    required: boolean;
    placeholder: string | null;
    helpText: string | null;
    options: unknown;
};
type ProductReview = {
    id: number;
    reviewerName: string;
    rating: number;
    comment: string;
    reviewDate: string;
    variant: { id: number; label: string } | null;
};

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const product = await getCachedProductBySlug(slug);
    if (!product || product.status !== 'ACTIVE') return {};
    const settings = await getSeoSettings();
    const title =
        product.seoTitle ||
        applyTitlePattern(product.name, settings.siteName, settings.defaultTitlePattern);
    const description =
        product.seoDescription ||
        (product.shortDescription ? stripHtml(product.shortDescription) : '') ||
        settings.defaultDescription ||
        '';
    const canonical =
        product.canonicalUrl || `${await getCurrentSiteBaseUrl()}/product/${product.slug}`;
    const image = product.ogImageUrl || product.imageUrl || settings.defaultOgImage || undefined;
    return {
        title,
        description,
        alternates: { canonical },
        robots: robotsFromFlags({
            index: product.robotsIndex,
            follow: product.robotsFollow,
            noArchive: product.robotsNoArchive,
            noImageIndex: product.robotsNoImageIndex,
            noSnippet: product.robotsNoSnippet,
        }),
        openGraph: {
            title: product.ogTitle || title,
            description: product.ogDescription || description,
            url: canonical,
            type: 'website',
            images: image ? [{ url: image }] : undefined,
        },
        twitter: {
            card: settings.twitterCard === 'summary' ? 'summary' : 'summary_large_image',
            title: product.twitterTitle || product.ogTitle || title,
            description: product.twitterDescription || product.ogDescription || description,
            images:
                product.twitterImageUrl || image ? [product.twitterImageUrl || image!] : undefined,
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const [product, siteSettings, homeCatalog] = await Promise.all([
        getCachedProductBySlug(slug),
        getCachedSiteChromeSettings(),
        getCachedHomeCatalog().catch(() => ({ products: [], categories: [] })),
    ]);
    if (!product) return redirectOr404(`/product/${slug}`);
    if (product.status !== 'ACTIVE') notFound();

    const quantities = Array.isArray(product.allowedQuantities)
        ? product.allowedQuantities.map(Number)
        : [1];
    const includedItems: string[] = Array.isArray(product.includedItems)
        ? product.includedItems.map((item: unknown) => String(item)).filter(Boolean)
        : [];
    const faqItems: Array<{ title: string; content: string }> = Array.isArray(product.faqItems)
        ? product.faqItems
              .flatMap((item: unknown) =>
                  item && typeof item === 'object' && !Array.isArray(item)
                      ? [
                            {
                                title: String((item as Record<string, unknown>).title || ''),
                                content: String((item as Record<string, unknown>).content || ''),
                            },
                        ]
                      : [],
              )
              .filter((item: { title: string }) => item.title)
        : [];
    const customScope = `product-custom-content-${product.id}`;
    const customStyle = scopedCss(product.customCss, customScope);
    const priceValues = getProductPriceValues(product);
    const priceRange = getProductPriceRange(product);
    const starting = priceRange?.min ?? null;
    const relatedProducts = homeCatalog.products
        .filter((item: { slug: string }) => item.slug !== product.slug)
        .slice(0, 4);
    const configurableAttributes = product.attributes.filter(
        (attribute: ProductAttribute) => attribute.visible || attribute.isVariantAxis,
    );
    const defaultVariantSelections =
        product.defaultVariantSelections &&
        typeof product.defaultVariantSelections === 'object' &&
        !Array.isArray(product.defaultVariantSelections)
            ? Object.fromEntries(
                  Object.entries(product.defaultVariantSelections as Record<string, unknown>)
                      .filter(([, value]) => typeof value === 'string')
                      .map(([key, value]) => [key, String(value)]),
              )
            : {};
    const defaultVariantSelectionIds =
        product.defaultVariantSelectionIds &&
        typeof product.defaultVariantSelectionIds === 'object' &&
        !Array.isArray(product.defaultVariantSelectionIds)
            ? Object.fromEntries(
                  Object.entries(
                      product.defaultVariantSelectionIds as Record<string, unknown>,
                  ).flatMap(([key, value]) => {
                      const numeric = Number(value);
                      return Number.isInteger(numeric) && numeric > 0
                          ? [[key, numeric] as const]
                          : [];
                  }),
              )
            : {};
    const aggregateRating =
        product.starRating != null && product.ratingCount > 0
            ? {
                  '@type': 'AggregateRating',
                  ratingValue: Number(product.starRating),
                  ratingCount: product.ratingCount,
                  bestRating: 5,
                  worstRating: 0,
              }
            : null;
    const generatedSchema = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: product.shortDescription ? stripHtml(product.shortDescription) : undefined,
        image: product.imageUrl || undefined,
        sku: product.sku || product.variants[0]?.sku || undefined,
        offers: priceRange
            ? priceValues.length > 1
                ? {
                      '@type': 'AggregateOffer',
                      priceCurrency: siteSettings.currency,
                      lowPrice: priceRange.min,
                      highPrice: priceRange.max,
                      offerCount: priceValues.length,
                  }
                : {
                      '@type': 'Offer',
                      priceCurrency: siteSettings.currency,
                      price: priceRange.min,
                      availability:
                          product.stockStatus === 'OUT_OF_STOCK'
                              ? 'https://schema.org/OutOfStock'
                              : 'https://schema.org/InStock',
                  }
            : undefined,
    };
    const customSchema =
        product.schemaJson &&
        typeof product.schemaJson === 'object' &&
        !Array.isArray(product.schemaJson)
            ? (product.schemaJson as Record<string, unknown>)
            : null;
    const schema = {
        ...(customSchema || generatedSchema),
        ...(aggregateRating ? { aggregateRating } : {}),
    };

    const valueSummary = configurableAttributes.length || 1;

    const purchaseProduct: ProductPurchaseProduct = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.imageUrl,
        productType: product.productType,
        manageStock: product.manageStock,
        stock: product.stock,
        stockStatus: product.stockStatus,
        packageLabel: product.packageLabel,
        packageUnitLabel: product.packageUnitLabel,
        allowedQuantities: quantities,
        defaultVariantSelections,
        defaultVariantSelectionIds,
        attributes: configurableAttributes.map((attribute: ProductAttribute) => ({
            id: attribute.id,
            name: attribute.name,
            slug: attribute.slug,
            required: attribute.required,
            isVariantAxis: attribute.isVariantAxis,
            values: attribute.values.map((value: ProductAttributeValue) => ({
                id: value.id,
                label: value.label,
                value: value.value,
            })),
        })),
        variants: product.variants.map((variant: ProductVariant) => ({
            id: variant.id,
            label: variant.label,
            price: variant.price,
            compareAtPrice: variant.compareAtPrice,
            stock: variant.stock,
            manageStock: variant.manageStock,
            valueIds: variant.values.map((value: ProductVariantValue) => value.attributeValueId),
            packages: variant.packages.map((pkg: ProductPackage) => ({
                id: pkg.id,
                quantity: pkg.quantity,
                price: pkg.price,
                badge: pkg.badge,
                isDefault: pkg.isDefault,
                isPopular: pkg.isPopular,
            })),
        })),
        inputFields: product.inputFields.map((field: ProductInputField) => ({
            id: field.id,
            label: field.label,
            fieldKey: field.fieldKey,
            type: field.type,
            required: field.required,
            placeholder: field.placeholder,
            helpText: field.helpText,
            options: Array.isArray(field.options) ? field.options.map(String) : [],
        })),
    };

    return (
        <main>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(schema).replace(/</g, '\\u003c'),
                }}
            />
            {customStyle ? <style dangerouslySetInnerHTML={{ __html: customStyle }} /> : null}

            {/* Single Product Data */}
            <div className="single__product-data">
                <div className="container">
                    <div className="px-[20px] xl:px-0 pt-[40px]">
                        <ProductPurchaseProvider
                            product={purchaseProduct}
                            currency={siteSettings.currency}
                        >
                            <div className="grid lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start gap-[30px]">
                                <div className="min-w-0">
                                    {/* Breadcrumb */}
                                    <nav className="page__breadcrumb" aria-label="Breadcrumb">
                                        <Link className="page__breadcrumb-link" href="/">
                                            Home
                                        </Link>
                                        <span>/</span>
                                        <Link className="page__breadcrumb-link" href="/shop">
                                            Shop
                                        </Link>
                                        <span>/</span>
                                        <span className="max-w-[45ch] truncate page__breadcrumb-link text-site-heading-font">
                                            {product.name}
                                        </span>
                                    </nav>

                                    {/* Product Meta */}
                                    <ScrollReveal>
                                        <section>
                                            <div>
                                                {/* Badges */}
                                                <div className="flex flex-wrap gap-2 mt-4">
                                                    <span className="single__product-badge text-[#22c55e] bg-[#f0fdf4] border-[#22c55e]/40">
                                                        <BadgeCheck size={14} /> Popular Service
                                                    </span>
                                                    <span className="single__product-badge bg-[#eff6ff] text-site-primary border-site-primary/30">
                                                        <Zap size={14} /> Instant Delivery
                                                    </span>
                                                </div>
                                                <h1 className="mt-4 single__product-title">
                                                    {product.name}
                                                </h1>
                                                {product.shortDescription ? (
                                                    <div
                                                        className="rich-copy mt-4 single__product-short-description"
                                                        dangerouslySetInnerHTML={{
                                                            __html: product.shortDescription,
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="mt-5 flex flex-wrap items-center gap-5 text-sm text-slate-600">
                                                    <ProductRating
                                                        rating={
                                                            product.starRating == null
                                                                ? null
                                                                : Number(product.starRating)
                                                        }
                                                        count={product.ratingCount}
                                                    />
                                                    <span className="inline-flex items-center gap-2 font-semibold text-[#15803D]">
                                                        <CheckCircle2 size={15} />{' '}
                                                        {product.stockStatus === 'OUT_OF_STOCK'
                                                            ? 'Currently unavailable'
                                                            : 'Ready to order'}
                                                    </span>
                                                </div>
                                                <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium text-site-heading-font">
                                                    <span className="inline-flex items-center gap-2">
                                                        <ShieldCheck
                                                            size={15}
                                                            className="text-site-primary"
                                                        />{' '}
                                                        High Quality
                                                    </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <LockKeyhole
                                                            size={15}
                                                            className="text-site-primary"
                                                        />{' '}
                                                        100% Safe & Secure
                                                    </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <Headset
                                                            size={15}
                                                            className="text-site-primary"
                                                        />{' '}
                                                        24/7 Support
                                                    </span>
                                                </div>
                                            </div>
                                        </section>
                                    </ScrollReveal>

                                    {/* Product Variations */}
                                    <ScrollReveal className="mt-[30px]" delay={80}>
                                        <section
                                            id="configure"
                                            className="single__product-variation-configuration single__product-box"
                                        >
                                            <div className="flex flex-col gap-4 border-b border-site-light-border pb-6 lg:flex-row lg:items-start lg:justify-between">
                                                <div>
                                                    <h2 className="text-[24px] font-semibold tracking-[-0.04em] text-site-heading-font">
                                                        Choose your variation
                                                    </h2>
                                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-site-body-font">
                                                        Customize your service with the options
                                                        below and get the best result for your
                                                        goals.
                                                    </p>
                                                </div>
                                                <div className="rounded-[15px] border border-site-light-border bg-blue-500/[.08] px-4 py-3 text-sm text-site-primary">
                                                    <div className="inline-flex items-center gap-2 font-semibold">
                                                        <CircleHelp size={15} /> Need help?
                                                    </div>
                                                    <div className="mt-1 text-xs">
                                                        Check our guide or contact support.
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-6">
                                                <ProductConfigurator />
                                            </div>
                                        </section>
                                    </ScrollReveal>

                                    {/* Mobile Action Area */}
                                    <div className="flex lg:hidden mt-7">
                                        <div className="single__product-box w-full">
                                            <h2 className="text-[22px] font-semibold text-site-heading-font">
                                                Order information
                                            </h2>
                                            <div className="pt-[30px]">
                                                <ProductPurchaseSummary />
                                            </div>
                                        </div>
                                    </div>

                                    {/* What's Included */}
                                    {includedItems.length ? (
                                        <ScrollReveal className="mt-[30px]" delay={80}>
                                            <section className="single__product-box">
                                                <div className="flex items-start gap-3">
                                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg__gradient-primary text-white">
                                                        <PackageCheck className="size-[19px]" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-site-heading-font">
                                                            What's Included
                                                        </h2>
                                                        <p className="mt-1 text-sm text-site-body-font">
                                                            Everything provided with this product
                                                            configuration.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                    {includedItems.map(
                                                        (item: string, index: number) => (
                                                            <div
                                                                key={`${index}-${item}`}
                                                                className="flex items-start gap-3"
                                                            >
                                                                <span className="mt-[1px] grid h-6 w-6 shrink-0 place-items-center rounded-[7px] bg-[#DFF4E6] text-[#1DA65A]">
                                                                    <CheckCircle2 className="size-[14px]" />
                                                                </span>
                                                                <span className="text-sm font-medium leading-6 text-site-heading-font">
                                                                    {item}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            </section>
                                        </ScrollReveal>
                                    ) : null}

                                    {/* Featured Card */}
                                    <ScrollReveal className="mt-7" delay={60}>
                                        <div className="grid gap-[15px] md:grid-cols-2 xl:grid-cols-3">
                                            {singleProductFeatureCards.map((card) => {
                                                const Icon = card.icon;
                                                return (
                                                    <div
                                                        key={card.title}
                                                        className="rounded-[16px] border border-site-light-border bg-white p-5 shadow-[0_14px_40px_rgba(10,22,94,.06)]"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="grid h-11 w-11 place-items-center rounded-[12px] bg__gradient-primary text-blue-500 text-white">
                                                                <Icon className="size-[20px]" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <strong className="block text-sm font-bold text-site-heading-font">
                                                                    {card.title}
                                                                </strong>
                                                                <span className="mt-1 block text-xs leading-5 text-site-body-font">
                                                                    {card.copy}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </ScrollReveal>

                                    {/* Product Content */}
                                    {product.description ? (
                                        <ScrollReveal className="mt-8" delay={120}>
                                            <section className="single__product-box">
                                                <div className="mb-5">
                                                    <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-site-primary">
                                                        Product details
                                                    </div>
                                                </div>
                                                <div
                                                    className={`rich-copy product-description ${customScope} text-sm leading-7 text-slate-600 sm:text-base`}
                                                    dangerouslySetInnerHTML={{
                                                        __html: product.description,
                                                    }}
                                                />
                                            </section>
                                        </ScrollReveal>
                                    ) : null}

                                    {/* FAQs Items */}
                                    {faqItems.length ? (
                                        <ScrollReveal className="mt-8" delay={125}>
                                            <section className="rounded-[14px] border border-slate-200 bg-white p-5 shadow-[inset_0_-14px_50px_rgba(116,176,253,.05),inset_0_.5px_.5px_rgba(212,232,255,.10)] sm:p-8">
                                                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-blue-500">
                                                    Questions & answers
                                                </div>
                                                <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.03em] text-slate-950">
                                                    Frequently Asked Questions
                                                </h2>
                                                <div className="mt-5 divide-y divide-slate-200 rounded-[11px] border border-slate-200">
                                                    {faqItems.map((faq, index) => (
                                                        <details
                                                            key={`${index}-${faq.title}`}
                                                            className="group p-5"
                                                        >
                                                            <summary className="cursor-pointer list-none text-sm font-bold text-slate-950">
                                                                {faq.title}
                                                            </summary>
                                                            <div
                                                                className={`rich-copy ${customScope} mt-3 text-sm leading-7 text-slate-600`}
                                                                dangerouslySetInnerHTML={{
                                                                    __html: faq.content,
                                                                }}
                                                            />
                                                        </details>
                                                    ))}
                                                </div>
                                            </section>
                                        </ScrollReveal>
                                    ) : null}

                                    {/* Reviews */}
                                    {product.reviewsEnabled || product.reviews.length > 0 ? (
                                        <ScrollReveal className="mt-12">
                                            <ProductReviews
                                                reviews={product.reviews.map(
                                                    (review: ProductReview) => ({
                                                        id: review.id,
                                                        reviewerName: review.reviewerName,
                                                        rating: review.rating,
                                                        comment: review.comment,
                                                        reviewDate: review.reviewDate,
                                                        variant: review.variant,
                                                    }),
                                                )}
                                                showEmpty={product.reviewsEnabled}
                                            />
                                        </ScrollReveal>
                                    ) : null}
                                </div>

                                {/* Sidebar */}
                                <aside className="lg:block lg:sticky lg:top-28">
                                    <div className="single__product-box hidden lg:block">
                                        <h2 className="text-[22px] font-semibold text-site-heading-font">
                                            Order information
                                        </h2>
                                        <div className="pt-[30px]">
                                            <ProductPurchaseSummary />
                                        </div>
                                    </div>
                                </aside>
                            </div>
                        </ProductPurchaseProvider>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            <div className="single__product-related-products">
                <div className="container">
                    <div className="px-[20px] xl:px-0 pt-[55px] xl:pt-[80px] pb-[80px]">
                        {relatedProducts.length ? (
                            <ScrollReveal>
                                <div className="mb-8 flex items-end justify-between gap-4">
                                    <div>
                                        <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-slate-950">
                                            You may also like
                                        </h2>
                                        <p className="mt-1 text-sm text-slate-600">
                                            Explore more services to take your digital presence
                                            further.
                                        </p>
                                    </div>
                                    <Link
                                        className="inline-flex items-center gap-1 text-sm font-semibold text-blue-500"
                                        href="/shop"
                                    >
                                        View all services <ArrowRight size={14} />
                                    </Link>
                                </div>
                                <div className="grid grid-cols-2 gap-[10px] sm:gap-[20px] md:grid-cols-3 xl:grid-cols-4">
                                    {relatedProducts.map(
                                        (item: Parameters<typeof ProductCard>[0]['product']) => (
                                            <ProductCard
                                                key={item.slug}
                                                product={item}
                                                currency={siteSettings.currency}
                                            />
                                        ),
                                    )}
                                </div>
                            </ScrollReveal>
                        ) : null}
                    </div>
                </div>
            </div>
        </main>
    );
}
