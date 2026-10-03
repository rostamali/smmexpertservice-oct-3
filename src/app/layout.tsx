import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import '@/app/globals.css';
import SiteChrome from '@/components/SiteChrome';
import { Toaster } from 'sonner';
import {
    getCachedHomeCatalog,
    getCachedSeoSettings,
    getCachedSiteChromeSettings,
} from '@/lib/storefront-cache';
import AttributionTracker from '@/components/AttributionTracker';
import HeaderCode from '@/components/HeaderCode';
import NumberInputGuard from '@/components/NumberInputGuard';
import { getCurrentSiteBaseUrl } from '@/lib/site';
import { storefrontFont } from '@/lib/storefront-font';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const settings = await getCachedSeoSettings();
        const title = 'SMMExpertService';
        const description = settings.defaultDescription || `${title} online store.`;
        return {
            title,
            description,
            icons: {
                icon: '/favicon.ico',
                shortcut: '/favicon.ico',
                apple: '/favicon.ico',
            },
            openGraph: {
                title,
                description,
                type: 'website',
                images: settings.defaultOgImage ? [{ url: settings.defaultOgImage }] : undefined,
            },
            twitter: {
                card: settings.twitterCard === 'summary' ? 'summary' : 'summary_large_image',
                title,
                description,
                images: settings.defaultOgImage ? [settings.defaultOgImage] : undefined,
            },
        };
    } catch {
        return { title: 'SMMExpertService', description: 'SMMExpertService online store.' };
    }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    const [siteSettings, seoSettings, homeCatalog] = await Promise.all([
        getCachedSiteChromeSettings().catch(() => null),
        getCachedSeoSettings().catch(() => null),
        getCachedHomeCatalog().catch(() => ({ products: [], categories: [] })),
    ]);

    const siteName = 'SMMExpertService';
    const siteUrl =
        seoSettings?.localBusinessUrl || (await getCurrentSiteBaseUrl().catch(() => undefined));
    const organizationSchema = {
        '@type': 'Organization',
        name: seoSettings?.localBusinessName || seoSettings?.organizationName || siteName,
        logo:
            seoSettings?.localBusinessLogo ||
            seoSettings?.organizationLogo ||
            siteSettings?.logoUrl ||
            seoSettings?.defaultOgImage ||
            undefined,
        url: siteUrl,
        description:
            seoSettings?.localBusinessDescription || seoSettings?.defaultDescription || undefined,
    };
    const localBusinessSchema = seoSettings?.localBusinessName
        ? {
              '@type': seoSettings.localBusinessType || 'LocalBusiness',
              name: seoSettings.localBusinessName,
              description: seoSettings.localBusinessDescription || undefined,
              image: seoSettings.localBusinessLogo || seoSettings.defaultOgImage || undefined,
              url: siteUrl,
              telephone: seoSettings.localBusinessTelephone || undefined,
              priceRange: seoSettings.localBusinessPriceRange || undefined,
              address:
                  seoSettings.localBusinessStreetAddress ||
                  seoSettings.localBusinessAddressLocality ||
                  seoSettings.localBusinessAddressCountry
                      ? {
                            '@type': 'PostalAddress',
                            streetAddress: seoSettings.localBusinessStreetAddress || undefined,
                            addressLocality: seoSettings.localBusinessAddressLocality || undefined,
                            addressRegion: seoSettings.localBusinessAddressRegion || undefined,
                            postalCode: seoSettings.localBusinessPostalCode || undefined,
                            addressCountry: seoSettings.localBusinessAddressCountry || undefined,
                        }
                      : undefined,
          }
        : null;
    const siteSchema = {
        '@context': 'https://schema.org',
        '@graph': [organizationSchema, ...(localBusinessSchema ? [localBusinessSchema] : [])],
    };

    const themeStyle = {
        '--brand': '#3B82F6',
        '--brand-soft': '#EFF6FF',
        '--accent': '#2563EB',
        '--body': '#FFFFFF',
        '--body-dark': '#F8FAFC',
        '--theme-dark': '#172554',
        '--theme-light': '#F8FAFC',
        '--dark': '#101828',
        '--light': '#667085',
        '--text-default': '#667085',
        '--border-light': '#EAECF0',
        '--border-dark': '#D0D5DD',
    } as CSSProperties;

    return (
        <html lang="en" className="scroll-smooth">
            <head>
                <HeaderCode code={seoSettings?.headerCode} />
            </head>
            <body
                suppressHydrationWarning
                className={`${storefrontFont.variable} ${storefrontFont.className} min-h-screen text-site-muted antialiased selection:bg-blue-500 selection:text-white`}
                style={themeStyle}
            >
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(siteSchema).replace(/</g, '\\u003c'),
                    }}
                />
                <Toaster richColors position="top-right" />
                <NumberInputGuard />
                <Suspense fallback={null}>
                    <AttributionTracker />
                </Suspense>
                <SiteChrome
                    loading={{
                        admin: siteSettings?.adminLoadingEnabled ?? true,
                        frontend: siteSettings?.frontendLoadingEnabled ?? true,
                    }}
                    categories={homeCatalog.categories || []}
                    products={homeCatalog.navigationProducts || homeCatalog.products || []}
                    branding={{
                        siteName,
                        logoUrl: siteSettings?.logoUrl,
                        footerText: siteSettings?.footerText,
                        contactEmail: siteSettings?.contactEmail,
                        currency: siteSettings?.currency || 'USD',
                    }}
                >
                    {children}
                </SiteChrome>
            </body>
        </html>
    );
}
