import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const check = (label, ok) => {
    checks.push([label, Boolean(ok)]);
    console.log(`${ok ? '✓' : '✗'} ${label}`);
};

const page = read('src/app/product/[slug]/page.tsx');
const provider = read('src/components/product/ProductPurchaseProvider.tsx');
const configurator = read('src/components/product/ProductConfigurator.tsx');
const summary = read('src/components/product/ProductPurchaseSummary.tsx');

check(
    'Single product wraps purchase UI in shared provider',
    page.includes('<ProductPurchaseProvider') && page.includes('product={purchaseProduct}'),
);
check(
    'Desktop purchase card is sticky',
    page.includes('lg:sticky lg:top-28') && page.includes('<ProductPurchaseSummary />'),
);

check(
    'Configurator no longer owns duplicated purchase summary',
    !configurator.includes('Add to Cart') && !configurator.includes('Secure checkout'),
);
check(
    'Summary contains requested live fields',
    ['Selected', 'Unit price', 'Availability', 'Total'].every((text) => summary.includes(text)),
);
check(
    'Partial variation selections render immediately in compact slash summary',
    summary.includes("const selectedText = resolvedVariantLabel || ''") &&
        summary.includes('value={selectedText || selectedFallback}'),
);
check(
    'Package is shown separately below Availability',
    summary.indexOf('label="Availability"') <
        summary.indexOf("label={cleanSelectionLabel(packageFieldLabel || 'Quantity')}") &&
        summary.includes('selectedPackage.quantity'),
);
check(
    'Package is not merged into Selected text',
    !summary.includes('selectedRows.push') && !summary.includes('package-${selectedPackage.id}'),
);
check(
    'Configurator prefixes every variation heading with Select',
    configurator.includes('Select {attributeFieldLabel}') &&
        configurator.includes("attribute.name.replace(/^select\\s+/i, '')"),
);
check(
    'Summary contains both purchase actions',
    summary.includes('Add to Cart') && summary.includes('Buy Now'),
);
check(
    'Summary contains secure checkout message',
    summary.includes('Secure checkout · 100% safe & encrypted'),
);
check(
    'Provider owns cart and buy-now actions',
    provider.includes('const addToCart') &&
        provider.includes('const buyNow') &&
        provider.includes("router.push('/cart')"),
);
check(
    'Provider preserves wildcard/default variation logic',
    provider.includes('variantMatchesSelection') &&
        provider.includes('canonicalIds?.[attribute.slug]'),
);

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
    console.error(
        `\nSticky purchase verification failed (${checks.length - failed.length}/${checks.length}).`,
    );
    process.exit(1);
}
console.log(`\nSticky purchase verification passed (${checks.length}/${checks.length}).`);
