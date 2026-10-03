import { systemPageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ArrowUpRight, Check, Sparkles, Star, Zap } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import StoreImage from '@/components/StoreImage';
import {
    getCachedHomeCatalog,
    getCachedSiteChromeSettings,
    getCachedSiteReviews,
} from '@/lib/storefront-cache';
import HomeHero from '@/components/home/Hero';
import ProductCard from '@/components/shared/ProductCard';
import HomeProductCarousel from '@/components/home/HomeProductCarousel';
import { heroSlideData } from '@/config/hero-slides';

export const dynamic = 'force-dynamic';

export const generateMetadata = () =>
    systemPageMetadata('home', {
        title: 'Home',
        description: 'Professional social media marketing services from SMMExpertService.',
        path: '/',
    });

export const revalidate = 60;

type HomeProduct = Parameters<typeof ProductCard>[0]['product'];
type SiteReview = {
    reviewerName?: string;
    rating?: number;
    comment?: string;
    product?: { name?: string } | null;
};

export default async function HomePage() {
    const [catalog, settings, reviewResult] = await Promise.all([
        getCachedHomeCatalog(),
        getCachedSiteChromeSettings(),
        getCachedSiteReviews(20).catch(() => ({ reviews: [] })),
    ]);

    const products = (Array.isArray(catalog?.products) ? catalog.products : []) as HomeProduct[];
    const reviews = (
        Array.isArray(reviewResult?.reviews) ? reviewResult.reviews : []
    ) as SiteReview[];
    const currency = settings?.currency || 'USD';

    return (
        <main>
            <HomeHero slides={heroSlideData} />
            <section className="pt-[40px] pb-[40px] sm:pt-[50px] sm:pb-[40px]">
                <div className="container px-[20px] xl:px-0">
                    <HomeProductCarousel>
                        {products.map((product) => (
                            <ProductCard key={product.slug} product={product} currency={currency} />
                        ))}
                    </HomeProductCarousel>
                </div>
            </section>
        </main>
    );
}
