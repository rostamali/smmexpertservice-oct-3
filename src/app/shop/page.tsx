import { systemPageMetadata } from '@/lib/seo';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Boxes } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { getCachedShopProducts, getCachedSiteChromeSettings } from '@/lib/storefront-cache';
import ProductCard from '@/components/shared/ProductCard';
import EmptyProduct from '@/components/Shop/EmptyProduct';
export const dynamic = 'force-dynamic';

export const generateMetadata = () =>
    systemPageMetadata('shop', {
        title: 'Shop',
        description: 'Browse social media marketing services and products from SMMExpertService.',
        path: '/shop',
    });
export const revalidate = 60;
export default async function ShopPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; category?: string }>;
}) {
    const params = await searchParams;
    const page = Math.max(1, Number(params.page || 1) || 1);
    const category = params.category?.trim() || '';
    const settings = await getCachedSiteChromeSettings();
    const result = await getCachedShopProducts(page, settings.frontendPageSize, category);
    const href = (nextPage: number) => {
        const query = new URLSearchParams();
        if (category) query.set('category', category);
        if (nextPage > 1) query.set('page', String(nextPage));
        const qs = query.toString();
        return `/shop${qs ? `?${qs}` : ''}`;
    };
    return (
        <main>
            <section>
                <div className="container">
                    <div className="px-[20px] xl:px-0 pt-[30px] xl:pt-[60px]">
                        <ScrollReveal>
                            <div className="text-center">
                                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-site-primary">
                                    Product catalog
                                </span>
                            </div>
                            <h1 className="mt-3 max-w-2xl mx-auto page__title text-center">
                                Find the right product for your next order.
                            </h1>
                            <p className="mt-4 text-center text-[14px] text-site-body-font">
                                Browse live products, ratings, pricing, and configurable options.
                            </p>
                        </ScrollReveal>
                    </div>
                </div>
            </section>
            <section>
                <div className="container">
                    <div className="px-[20px] xl:px-0 pt-[40px] sm:pt-[60px] pb-[80px]">
                        {result.products.length ? (
                            <div className="grid grid-cols-2 gap-[10px] sm:gap-[20px] md:grid-cols-3 xl:grid-cols-4">
                                {result.products.map(
                                    (
                                        product: Parameters<typeof ProductCard>[0]['product'],
                                        index: number,
                                    ) => (
                                        <ScrollReveal
                                            key={product.slug}
                                            delay={Math.min(index * 45, 225)}
                                        >
                                            <ProductCard
                                                product={product}
                                                currency={settings.currency}
                                            />
                                        </ScrollReveal>
                                    ),
                                )}
                            </div>
                        ) : (
                            <EmptyProduct />
                        )}
                        {result.pageCount > 1 ? (
                            <nav className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
                                <Link
                                    className={`inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-4 text-[10px] font-medium text-slate-700 ${result.page <= 1 ? 'pointer-events-none opacity-35' : 'hover:border-blue-300 hover:text-blue-600'}`}
                                    href={result.page <= 1 ? href(1) : href(result.page - 1)}
                                >
                                    <ArrowLeft size={12} />
                                    Previous
                                </Link>
                                <span className="text-[9px] text-slate-500">
                                    Page {result.page} of {result.pageCount}
                                </span>
                                <Link
                                    className={`inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 px-4 text-[10px] font-medium text-slate-700 ${result.page >= result.pageCount ? 'pointer-events-none opacity-35' : 'hover:border-blue-300 hover:text-blue-600'}`}
                                    href={
                                        result.page >= result.pageCount
                                            ? href(result.pageCount)
                                            : href(result.page + 1)
                                    }
                                >
                                    Next <ArrowRight size={12} />
                                </Link>
                            </nav>
                        ) : null}
                    </div>
                </div>
            </section>
        </main>
    );
}
