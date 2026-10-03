import { systemPageMetadata } from '@/lib/seo';
import OrderDeliveryClient from '@/components/order-delivery/OrderDeliveryClient';
import { getCachedSeoSettings } from '@/lib/storefront-cache';
export const generateMetadata = () =>
    systemPageMetadata('order', {
        title: 'Order Details',
        description: 'View your SMMExpertService order details and delivery information.',
        noindex: true,
    });
export const dynamic = 'force-dynamic';
export default async function Page({
    params,
    searchParams,
}: {
    params: Promise<{ token: string }>;
    searchParams: Promise<{ email?: string }>;
}) {
    const [{ token }, query] = await Promise.all([params, searchParams]);
    const settings = await getCachedSeoSettings();

    return (
        <main className="min-h-[70vh]">
            <OrderDeliveryClient
                token={token}
                initialEmail={query.email || ''}
                siteName={settings.siteName}
            />
        </main>
    );
}
