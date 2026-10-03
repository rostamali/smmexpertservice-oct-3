import fs from 'node:fs';
const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const checks = [];
const check = (label, ok) => { checks.push([label, Boolean(ok)]); console.log(`${ok ? '✓' : '✗'} ${label}`); };
const config = read('src/components/product/ProductPurchaseProvider.tsx');
const productTypes = read('src/components/product/types.ts');
const page = read('src/app/product/[slug]/page.tsx');
const cache = read('src/lib/storefront-cache.ts');
check('Product API cache key forces fresh default-selection payload', cache.includes('nexa-api-product-v4'));
check('Configurator accepts canonical default attribute value IDs', productTypes.includes('defaultVariantSelectionIds: Record<string, number>'));
check('Canonical IDs are preferred during initial selection', config.includes('canonicalIds?.[attribute.slug]'));
check('Configured string defaults remain backward-compatible', config.includes('item.label.trim().toLowerCase() === normalized'));
check('Default selections reset when product/default config changes', config.includes('[defaultSelectionKey]'));
check('Variation axes remain configurable even when not marked visible', page.includes('attribute.visible || attribute.isVariantAxis'));
check('Product page forwards canonical selection IDs', page.includes('defaultVariantSelectionIds,'));
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) { console.error(`\nV32.2.4 storefront verification failed (${checks.length - failed.length}/${checks.length}).`); process.exit(1); }
console.log(`\nV32.2.4 storefront verification passed (${checks.length}/${checks.length}).`);
