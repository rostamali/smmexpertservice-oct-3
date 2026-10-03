import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const checks = [];
const check = (label, ok) => { checks.push([label, Boolean(ok)]); console.log(`${ok ? '✓' : '✗'} ${label}`); };

const checkout = read('src/components/checkout/CheckoutClient.tsx');
const config = read('src/components/product/ProductPurchaseProvider.tsx');
const productTypes = read('src/components/product/types.ts');
const product = read('src/app/product/[slug]/page.tsx');
const cache = read('src/lib/storefront-cache.ts');

check('Payment gateway discount notice includes percentage Off', checkout.includes('% Off'));
check('Payment gateway discount notice includes minimum spend', checkout.includes('Minimum ${money(gateway.discountMinimumSpend'));
check('Selected gateway discount notice renders on cart checkout', checkout.includes('selectedGateway?.discountEnabled'));
check('Product configurator accepts default variation selections', productTypes.includes('defaultVariantSelections: Record<string, string>'));
check('Product configurator converts default values to selection IDs', config.includes('defaultSelectionIds('));
check('Default selections validate against available variations', config.includes('variantMatchesSelection(variant, axisAttributes, trial)'));
check('Product page forwards default selections to configurator', product.includes('defaultVariantSelections,'));
check('Product API cache key bumped for new product shape', cache.includes('nexa-api-product-v4'));

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\nV32.2 storefront verification failed (${checks.length - failed.length}/${checks.length}).`);
  process.exit(1);
}
console.log(`\nV32.2 storefront verification passed (${checks.length}/${checks.length}).`);
