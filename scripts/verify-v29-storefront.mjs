import fs from 'node:fs';
const read = (file) => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const card = read('src/components/ProductCard.tsx');
const home = read('src/app/page.tsx');
const header = read('src/components/Header.tsx');
const footer = read('src/components/Footer.tsx');
const checks = [
  ['Product card accepts optional className', card.includes('className?: string | null')],
  ['Product card appends custom className to article', card.includes('product.className') && card.includes('<article className={cn(')],
  ['Reference-inspired retail homepage sections', home.includes('All New Arrivals') && home.includes('Shop By Category') && home.includes('Featured Products') && home.includes('Shop By Collection') && home.includes('Best Sellers')],
  ['Product-first desktop mega menu', header.includes('Shop featured products') && header.includes('featuredProducts.map')],
  ['Product-first mobile menu', header.includes('View All Products') && header.includes('mobileProductsOpen')],
  ['Reference-inspired utility header', header.includes('Fast digital delivery') && header.includes('Search for products')],
  ['Reference-inspired footer', footer.includes('Join Our Mailing List')],
];
let failed=0;
for (const [label,ok] of checks) { console.log(`${ok?'✓':'✗'} ${label}`); if(!ok) failed++; }
if(failed){ console.error(`V29 storefront verification failed (${failed}/${checks.length}).`); process.exit(1); }
console.log(`V29 storefront verification passed (${checks.length}/${checks.length}).`);
