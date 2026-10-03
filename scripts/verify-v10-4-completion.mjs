import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const nextConfig = read('next.config.ts');
const storeImage = read('src/components/StoreImage.tsx');
const checks = [];
const check = (label, ok) => {
    checks.push([label, Boolean(ok)]);
    console.log(`${ok ? '✓' : '✗'} ${label}`);
};

const header = read('src/components/shared/Header.tsx');
const layout = read('src/app/layout.tsx');
const home = read('src/app/page.tsx');
const productCarousel = read('src/components/home/HomeProductCarousel.tsx');
const hero = read('src/components/HeroSlider.tsx');
const payment = read('src/components/payment/PaymentPageClient.tsx');
const nowPanel = read('src/components/payment/NowPaymentsPanel.tsx');
const paymentTypes = read('src/components/payment/types.ts');
const seo = read('src/lib/seo.ts');

check(
    'Mobile navigation groups products dynamically by category',
    header.includes('productsByCategory') &&
        header.includes('categoryProducts') &&
        header.includes('categories.map'),
);
check(
    'Mobile accordion product rows show image, title, rating, review count and starting price',
    header.includes('product.imageUrl') &&
        header.includes('product.name') &&
        header.includes('product.starRating') &&
        header.includes('product.ratingCount') &&
        header.includes('product.startingPrice'),
);
check(
    'Mobile product rows link to the correct singular product URL',
    header.includes('href={`/product/${product.slug}`}'),
);
check(
    'Header receives complete site-scoped navigation product data',
    layout.includes('homeCatalog.navigationProducts || homeCatalog.products || []'),
);
check(
    'Homepage product carousel renders dynamic product cards',
    home.includes('<HomeProductCarousel>') &&
        home.includes('products.map') &&
        home.includes('<ProductCard'),
);
check(
    'Homepage carousel shows 2/2/4 products by responsive widths',
    productCarousel.includes('slidesPerView: 2') &&
        productCarousel.includes('1024: { slidesPerView: 4'),
);
check(
    'Homepage product carousel has previous/next controls and package swipe support',
    productCarousel.includes('Previous products') &&
        productCarousel.includes('Next products') &&
        productCarousel.includes('<Swiper') &&
        productCarousel.includes('Navigation'),
);
check(
    'Hero carousel is images only without marketing overlays',
    hero.includes('images.map') &&
        hero.includes('<StoreImage') &&
        !hero.includes('description') &&
        !hero.includes('CTA'),
);

check(
    'NOWPayments countdown uses server-synchronized time',
    paymentTypes.includes('serverNow: string') &&
        payment.includes('serverOffsetMs') &&
        payment.includes('syncServerClock') &&
        nowPanel.includes('expiresAt'),
);
check(
    'NOWPayments generated payment can change currency',
    nowPanel.includes('Change currency') && payment.includes('replaceExisting'),
);
check(
    'Storefront page metadata is defined locally rather than admin System Pages controls',
    seo.includes('systemPageMetadata') && !seo.includes('settings.systemPageMetadata'),
);

const componentEntries = fs.readdirSync(path.join(root, 'src/components'), { withFileTypes: true });
const componentNames = componentEntries.map((entry) => entry.name.toLowerCase());
check(
    'Component folders have no case-only collisions',
    new Set(componentNames).size === componentNames.length,
);

check(
    'Uploaded media is proxied through the central backend',
    nextConfig.includes("source: '/uploads/:path*'") &&
        nextConfig.includes('destination: `${backendBase}/uploads/:path*`'),
);


const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
    console.error(
        `\nV10.4 storefront verification failed (${checks.length - failed.length}/${checks.length}).`,
    );
    process.exit(1);
}
console.log(`\nV10.4 storefront verification passed (${checks.length}/${checks.length}).`);
