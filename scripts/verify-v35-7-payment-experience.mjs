import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const check = (label, ok) => {
    checks.push([label, Boolean(ok)]);
    console.log(`${ok ? '✓' : '✗'} ${label}`);
};
const checkout = read('src/components/checkout/CheckoutClient.tsx');
const selector = read('src/components/checkout/PaymentMethodSelector.tsx');
const payment = read('src/components/payment/PaymentPageClient.tsx');
const combo = read('src/components/payment/ShadcnPaymentCombobox.tsx');
const now = read('src/components/payment/NowPaymentsPanel.tsx');
const paygate = read('src/components/payment/PayGatePanel.tsx');
const types = read('src/components/payment/types.ts');
const page = read('src/app/pay/[orderNumber]/page.tsx');
const seo = read('src/lib/seo.ts');
const cache = read('src/lib/storefront-cache.ts');
const global404 = read('src/app/global-not-found.tsx');
const llms = read('src/app/llms.txt/route.ts');
const robots = read('src/app/robots.txt/route.ts');
const sitemap = read('src/app/sitemap.ts');
check(
    'Checkout is split into checkout feature folder',
    checkout.includes('PaymentMethodSelector') &&
        page.includes('@/components/payment/PaymentPageClient'),
);
check(
    'Gateway card shows configurable storefront image',
    selector.includes('gateway.imageUrl') && selector.includes('gateway.checkoutTitle'),
);
check(
    'Gateway help image opens in a modal',
    selector.includes('helpGateway') &&
        selector.includes('role="dialog"') &&
        selector.includes('helpImageUrl'),
);
check(
    'Payment page uses customer-facing gateway label',
    [now, paygate].every((source) => source.includes('data.gatewayLabel')) &&
        ![now, paygate].some((source) => source.includes('data.gatewayKey')),
);
check(
    'Payment page is split into maintainable components',
    ['NowPaymentsPanel', 'PayGatePanel', 'PaymentStatusScreen'].every((name) =>
        payment.includes(name),
    ),
);
check(
    'NOWPayments currencies support metadata and images',
    types.includes('logoUrl: string | null') &&
        now.includes('currency.logoUrl') &&
        now.includes('currency.name'),
);
check(
    'NOWPayments selector uses the shared Shadcn-style combobox and ticker/network layout',
    now.includes('ShadcnPaymentCombobox') &&
        combo.includes('role="combobox"') &&
        now.includes('currency.ticker') &&
        now.includes('[{currency.network}]'),
);
check(
    'NOWPayments client requires payment and payout availability flags',
    types.includes('availableForPayment: boolean') &&
        types.includes('availableForPayout: boolean') &&
        payment.includes('item.availableForPayment && item.availableForPayout'),
);
check(
    'NOWPayments generated QR can return to currency selection',
    now.includes('Change currency') &&
        payment.includes('choosingNowCurrency') &&
        payment.includes('replaceExisting'),
);
check(
    'NOWPayments starts with Select Cryptocurrency instead of auto-selecting the first coin',
    now.includes('placeholder="Select Cryptocurrency"') &&
        payment.includes("initial.externalId ? initial.payCurrency || '' : ''") &&
        !payment.includes("list[0]?.code || ''") &&
        !payment.includes("currencies[0]?.code || ''"),
);
check(
    'PayGate providers support custom titles, images and converted checkout quote',
    types.includes('displayName?: string') &&
        types.includes('checkoutCurrency') &&
        paygate.includes('provider.displayName') &&
        paygate.includes('provider.imageUrl') &&
        paygate.includes('provider.checkoutAmount'),
);
check(
    'PayGate provider creation has an explicit spinner',
    paygate.includes('Loader2') &&
        paygate.includes('animate-spin') &&
        paygate.includes('Creating secure payment'),
);
check(
    'PayGate provider is selected before an explicit Pay Now action',
    paygate.includes('ShadcnPaymentCombobox') &&
        paygate.includes('selectedProviderId') &&
        paygate.includes("'Pay Now'") &&
        paygate.includes('onStart(selectedProvider)'),
);
check(
    'Payment method metadata is gateway-specific and noindex',
    page.includes('payment.paymentSeoTitle') &&
        page.includes('payment.paymentSeoDescription') &&
        page.includes('index: false'),
);
check(
    'System page metadata helper covers 404 and transactional pages',
    seo.includes('systemPageMetadata') &&
        seo.includes("| 'notFound'") &&
        global404.includes("systemPageMetadata('notFound'"),
);
check(
    'Global SEO settings are runtime-safe when central SEO data is unavailable',
    cache.includes('fallbackSeoSettings') &&
        cache.includes('export const getCachedSeoSettings') &&
        cache.includes('try {') &&
        cache.includes('return fallbackSeoSettings()'),
);
check(
    'System page metadata is build-safe when central SEO data is unavailable',
    seo.includes('getSystemMetadataSettings') &&
        seo.includes('systemMetadataFallbackSettings') &&
        seo.includes('try {') &&
        seo.includes('return systemMetadataFallbackSettings()'),
);
check(
    'Checkout coupon success icon is imported',
    checkout.includes('Check,') && checkout.includes('<Check size={15} />'),
);
check(
    'LLMs and robots routes are build-safe without central SEO data',
    [llms, robots].every(
        (source) =>
            source.includes("dynamic = 'force-dynamic'") &&
            source.includes('try {') &&
            source.includes('catch {'),
    ),
);
check(
    'Sitemap is build-safe without central database data',
    sitemap.includes("dynamic = 'force-dynamic'") &&
        sitemap.includes('try {') &&
        sitemap.includes('catch {') &&
        sitemap.includes('return baseEntries(base)'),
);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
    console.error(
        `\nPayment experience verification failed (${checks.length - failed.length}/${checks.length}).`,
    );
    process.exit(1);
}
console.log(`\nPayment experience verification passed (${checks.length}/${checks.length}).`);
