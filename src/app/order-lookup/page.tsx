import { systemPageMetadata } from '@/lib/seo';
import OrderLookupClient from '@/components/OrderLookupClient';
export const generateMetadata = () =>
    systemPageMetadata('orderLookup', {
        title: 'Order Lookup',
        description: 'Look up your SMMExpertService order securely.',
        path: '/order-lookup',
        noindex: true,
    });
export default function OrderLookupPage() {
    return (
        <main className="min-h-[70vh] bg-site-bg">
            <OrderLookupClient />
        </main>
    );
}
