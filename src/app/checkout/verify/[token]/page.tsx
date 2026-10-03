import { systemPageMetadata } from '@/lib/seo';
import CheckoutVerifyClient from '@/components/checkout/CheckoutVerifyClient';
import { getCachedSiteChromeSettings } from '@/lib/storefront-cache';
export const generateMetadata = () =>
    systemPageMetadata('checkoutVerify', {
        title: 'Verify Checkout',
        description: 'Securely verify your SMMExpertService checkout.',
        noindex: true,
    });
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
    const [{ token }, settings] = await Promise.all([params, getCachedSiteChromeSettings()]);
    return <CheckoutVerifyClient token={token} currency={settings.currency} />;
}
