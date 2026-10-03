import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const walk = (dir) => {
  const base = path.join(root, dir);
  if (!fs.existsSync(base)) return [];
  const out = [];
  for (const entry of fs.readdirSync(base, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(rel));
    else out.push(rel);
  }
  return out;
};
const sourceFiles = [...walk('src/app'), ...walk('src/components'), ...walk('src/lib'), ...walk('src/config')].filter((file) => /\.(?:ts|tsx|css)$/.test(file));
const sourceText = sourceFiles.map(read).join('\n');
const checks = [];
const expect = (name, ok) => checks.push({ name, ok: Boolean(ok) });

const pkg = JSON.parse(read('package.json'));
const font = read('src/lib/storefront-font.ts');
const header = read('src/components/Header.tsx');
const home = read('src/app/page.tsx');
const cart = read('src/components/CheckoutClient.tsx');
const productCard = read('src/components/ProductCard.tsx');
const productPage = read('src/app/product/[slug]/page.tsx');
const legacyProduct = read('src/app/products/[slug]/page.tsx');
const siteChrome = read('src/components/SiteChrome.tsx');
const blog = read('src/app/blog/page.tsx');
const blogSingle = read('src/app/blog/[slug]/page.tsx');
const contact = read('src/app/contact/page.tsx');
const contactForm = read('src/components/ContactForm.tsx');
const captcha = read('src/components/ContactCaptcha.tsx');
const sitemap = read('src/app/sitemap.ts');

expect('Google Sora storefront font', font.includes("import { Sora } from 'next/font/google'") && font.includes('Sora({'));
expect('1200px design container', [header, home, blog, contact, productPage].every((value) => value.includes('max-w-[1200px]')));
expect('Techlo palette and light/dark section system', home.includes('#040D43') && home.includes('#F5F6F7') && home.includes('#2B4DFF') && home.includes('#E3FF04'));
expect('Tailwind-only global stylesheet', read('src/app/globals.css').trim() === '@import "tailwindcss";');
expect('No shadcn or Radix source dependency', !sourceText.includes('@/components/ui/') && !sourceText.includes('@radix-ui/') && !Object.keys(pkg.dependencies || {}).some((key) => key.startsWith('@radix-ui/')) && !exists('src/components/ui'));
expect('No cart drawer', !exists('src/components/CartDrawer.tsx') && !siteChrome.includes('CartDrawer') && !header.includes('nexa:open-cart'));
expect('Header cart links to combined cart checkout', header.includes('href="/cart"') && !header.includes('cartDrawerAutoOpen'));
expect('Cart page is checkout surface', read('src/app/cart/page.tsx').includes('CheckoutClient'));
expect('Cart supports quantity and removal', cart.includes('stepCartItem') && cart.includes('REMOVE_FROM_CART') && cart.includes('Trash2'));
expect('Cart supports coupon apply and remove', cart.includes('writeCartCoupon') && cart.includes('applyCoupon') && cart.includes('removeCoupon'));
expect('Cart supports email, payment selector and quote', cart.includes('/api/store/payment-gateways') && cart.includes('/api/store/quote') && cart.includes('SELECT_PAYMENT_METHOD') && cart.includes('type="email"'));
expect('Cart has Confirm Order flow', cart.includes('Confirm Order') && cart.includes('/api/checkout/draft') && cart.includes('/checkout/verify/'));
expect('Legacy checkout redirects to cart', read('src/app/checkout/page.tsx').includes("redirect('/cart')"));
expect('Singular product route exists', exists('src/app/product/[slug]/page.tsx') && productCard.includes('`/product/${product.slug}`'));
expect('Legacy plural product route redirects', legacyProduct.includes('redirect(`/product/${slug}`)'));
expect('Sitemap emits singular product URLs', sitemap.includes('`${base}/product/${p.slug}`') && !sitemap.includes('`${base}/products/${p.slug}`'));
expect('404 page and Next not-found exist', exists('src/app/404/page.tsx') && exists('src/app/not-found.tsx') && exists('src/components/NotFoundView.tsx'));
expect('Techlo-style blog list and single post', blog.includes('bg-[#F5F6F7]') && blog.includes('grid gap-x-6 gap-y-10') && blogSingle.includes('BlogPosting') && blogSingle.includes('scopedCss'));
expect('Techlo-style contact keeps captcha', contact.includes('lg:grid-cols-2') && contactForm.includes('ContactCaptcha') && captcha.includes('/api/contact/captcha') && exists('src/app/api/contact/captcha/route.ts') && exists('src/app/api/contact/submit/route.ts'));
expect('Admin-managed site reviews remain connected', home.includes('getCachedSiteReviews') && read('src/components/TestimonialsMarquee.tsx').includes('SiteReview'));
expect('Static hero slider config remains', read('src/config/home-slider.ts').includes('/images/slide/banner-fc27-coins-promo.webp') && read('src/components/HeroSlider.tsx').includes('slideData'));
expect('Top route progress bar retained', read('src/components/RouteLoadingBar.tsx').includes('fixed inset-x-0 top-0') && !read('src/app/loading.tsx').toLowerCase().includes('spinner'));

const failed = checks.filter((item) => !item.ok);
for (const item of checks) console.log(`${item.ok ? '✓' : '✗'} ${item.name}`);
if (failed.length) {
  console.error(`\nV32 Techlo storefront verification failed (${failed.length}/${checks.length}).`);
  process.exit(1);
}
console.log(`\nV32 Techlo storefront verification passed (${checks.length}/${checks.length}).`);
