import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PaymentClient from '@/components/payment/PaymentPageClient';
import type { InitialPayment as PayData } from '@/components/payment/types';
import { centralApiFetch } from '@/lib/api-client';
import { applyTitlePattern, robotsFromFlags } from '@/lib/seo';
import { getCachedSeoSettings } from '@/lib/storefront-cache';

export const dynamic = 'force-dynamic';

const paymentData = (orderNumber: string) =>
    centralApiFetch<PayData>(`/api/store/pay/${encodeURIComponent(orderNumber)}`, {
        cache: 'no-store',
    });

export async function generateMetadata({
    params,
}: {
    params: Promise<{ orderNumber: string }>;
}): Promise<Metadata> {
    const { orderNumber } = await params;
    try {
        const [payment, settings] = await Promise.all([
            paymentData(orderNumber),
            getCachedSeoSettings(),
        ]);
        const replaceTokens = (value: string) =>
            value
                .replaceAll('%gateway%', payment.gatewayLabel)
                .replaceAll('%order%', payment.orderNumber)
                .replaceAll('%sitename%', settings.siteName);
        const configuredTitle = String(payment.paymentSeoTitle || '').trim();
        const baseTitle = configuredTitle
            ? replaceTokens(configuredTitle)
            : `Pay with ${payment.gatewayLabel}`;
        const title =
            configuredTitle &&
            (configuredTitle.includes('%sitename%') ||
                baseTitle.toLowerCase().includes(settings.siteName.toLowerCase()))
                ? baseTitle
                : applyTitlePattern(baseTitle, settings.siteName, settings.defaultTitlePattern);
        const description = replaceTokens(
            String(
                payment.paymentSeoDescription ||
                    `Securely complete order ${payment.orderNumber} with ${payment.gatewayLabel}.`,
            ),
        );
        const image =
            payment.paymentSeoImageUrl ||
            payment.gatewayImageUrl ||
            settings.defaultOgImage ||
            undefined;
        return {
            title,
            description,
            robots: robotsFromFlags({ index: false, follow: true }),
            openGraph: {
                title,
                description,
                type: 'website',
                images: image ? [{ url: image }] : undefined,
            },
            twitter: {
                card: settings.twitterCard === 'summary' ? 'summary' : 'summary_large_image',
                title,
                description,
                images: image ? [image] : undefined,
            },
        };
    } catch {
        return {
            title: 'Secure Payment | SMMExpertService',
            description: 'Complete your SMMExpertService payment securely.',
            robots: robotsFromFlags({ index: false, follow: true }),
        };
    }
}

export default async function PayPage({ params }: { params: Promise<{ orderNumber: string }> }) {
    const { orderNumber } = await params;
    let initial: PayData;
    try {
        initial = await paymentData(orderNumber);
    } catch {
        notFound();
    }

    const settings = await getCachedSeoSettings();

    return (
        <main className="min-h-[70vh]">
            <PaymentClient initial={initial!} siteName={settings.siteName} />
        </main>
    );
}
