import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const checks = [];
const check = (label, ok) => checks.push([label, Boolean(ok)]);

const header = read('src/components/Header.tsx');
const font = read('src/lib/storefront-font.ts');
const fakeOrder = read('src/components/RecentPurchaseNotice.tsx');
const fakeConfig = read('src/config/fake-orders.ts');
const blog = read('src/app/blog/page.tsx');
const blogSingle = read('src/app/blog/[slug]/page.tsx');

check('Google Manrope storefront font', font.includes("import { Manrope }") && font.includes('Manrope({'));
check('Custom local fonts folder', exists('public/fonts/README.txt'));
check('Custom local images folder', exists('public/images/README.txt'));
check('Fake order configuration file', fakeConfig.includes('FAKE_ORDER_NAMES') && fakeConfig.includes("buyerMask: '****'"));
check('Fake order requested display format', fakeOrder.includes('maskedBuyer') && fakeOrder.includes('current.accountName') && fakeOrder.includes('current.productName'));
check('Large unique fake name pool', (fakeConfig.match(/'/g) || []).length > 100);
check('Desktop header is product-first', header.includes('featuredProducts.map') && header.includes('Shop featured products'));
check('Mobile header is product-first', header.includes('products.slice(0, 8)') && header.includes('View All Products'));
check('Blog navigation available', header.includes('href="/blog"'));
check('Blog listing page available', blog.includes('getCachedBlogPosts') && blog.includes('/blog/${featured.slug}'));
check('Single blog page available', blogSingle.includes("getCachedContentBySlug('POST', slug)") && blogSingle.includes('contentMetadata(entry, \'post\')'));
check('Blog custom CSS remains scoped', blogSingle.includes('scopedCss(entry.customCss'));
check('Blog SEO schema available', blogSingle.includes("'BlogPosting'"));

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`${ok ? '✓' : '✗'} ${label}`);
if (failed.length) {
  console.error(`\nV28.4 storefront verification failed (${failed.length}/${checks.length}).`);
  process.exit(1);
}
console.log(`\nV28.4 storefront verification passed (${checks.length}/${checks.length}).`);
