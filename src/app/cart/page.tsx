import { systemPageMetadata } from '@/lib/seo';
import CheckoutClient from '@/components/checkout/CheckoutClient';
import { getCachedSiteChromeSettings } from '@/lib/storefront-cache';

export const dynamic = 'force-dynamic';

export const generateMetadata = () =>
    systemPageMetadata('cart', {
        title: 'Shopping Cart',
        description:
            'Review your selected SMMExpertService products, discounts and payment options.',
        path: '/cart',
        noindex: true,
    });

export default async function CartPage() {
    const settings = await getCachedSiteChromeSettings();
    return (
        <main>
            <div className="bg-site-gray-bg pt-[30px] pb-[80px] min-h-[70vh]">
                <CheckoutClient currency={settings.currency} />
            </div>
        </main>
    );
}
