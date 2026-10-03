'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Header, {
    type StorefrontNavCategory,
    type StorefrontNavProduct,
} from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import RouteLoadingBar from '@/components/RouteLoadingBar';
import RecentPurchaseNotice from '@/components/RecentPurchaseNotice';
import PageTransition from '@/components/PageTransition';

const DISPLAY_SITE_NAME = 'SMMExpertService';

type SiteChromeProps = {
    children: React.ReactNode;
    loading?: { admin: boolean; frontend: boolean };
    categories?: StorefrontNavCategory[];
    products?: StorefrontNavProduct[];
    branding: {
        siteName: string;
        logoUrl?: string | null;
        footerText?: string | null;
        contactEmail?: string | null;
        currency: string;
    };
};

export default function SiteChrome({
    children,
    loading,
    categories = [],
    products = [],
    branding,
}: SiteChromeProps) {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');
    // Minimal utility pages: no storefront chrome.
    // Add future no-chrome routes here when a page needs a standalone experience.
    const isStandalonePage =
        pathname.startsWith('/checkout/verify') ||
        pathname.startsWith('/pay/') ||
        pathname.startsWith('/order/');
    const footerVariant = pathname === '/' ? 'brand' : 'dark';

    return (
        <>
            <Suspense fallback={null}>
                <RouteLoadingBar
                    enabled={isAdmin ? (loading?.admin ?? true) : (loading?.frontend ?? true)}
                />
            </Suspense>
            {isAdmin ? (
                children
            ) : isStandalonePage ? (
                <PageTransition>{children}</PageTransition>
            ) : (
                <>
                    <Header
                        siteName={DISPLAY_SITE_NAME}
                        logoUrl={branding.logoUrl}
                        contactEmail={branding.contactEmail}
                        categories={categories}
                        products={products}
                        currency={branding.currency}
                    />
                    <PageTransition>{children}</PageTransition>
                    <Footer
                        siteName={DISPLAY_SITE_NAME}
                        footerText={branding.footerText}
                        variant={footerVariant}
                    />
                    <RecentPurchaseNotice
                        fallbackProducts={products.map((product) => ({
                            name: product.name,
                            accountName: product.category?.name || null,
                        }))}
                    />
                </>
            )}
        </>
    );
}
