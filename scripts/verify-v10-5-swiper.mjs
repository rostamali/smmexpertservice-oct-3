import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const check = (label, ok) => { checks.push([label, Boolean(ok)]); console.log(`${ok ? '✓' : '✗'} ${label}`); };

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
const layout = read('src/app/layout.tsx');
const page = read('src/app/page.tsx');
const hero = read('src/components/HeroSlider.tsx');
const heroSource = read('src/components/home/Hero.tsx');
const products = read('src/components/home/HomeProductCarousel.tsx');

const homePage = read('src/app/page.tsx');
const shopPage = read('src/app/shop/page.tsx');
const blogPage = read('src/app/blog/page.tsx');
const cartPage = read('src/app/cart/page.tsx');

check('Swiper is an explicit npm dependency', pkg.dependencies?.swiper === '12.2.0' && lock.packages?.['node_modules/swiper']?.version === '12.2.0');
check('Swiper global package styles are loaded', layout.includes("import 'swiper/css'") && layout.includes("import 'swiper/css/navigation'") && layout.includes("import 'swiper/css/pagination'"));
check('Hero uses Swiper rather than custom scroll/pointer carousel', hero.includes("from 'swiper/react'") && hero.includes('Autoplay') && hero.includes('Navigation') && hero.includes('Pagination') && !hero.includes('scrollTo(') && !hero.includes('onPointerMove'));
check('Hero autoplay loops and survives user interaction', hero.includes('delay: 5000') && hero.includes('disableOnInteraction: false') && hero.includes('loop={interactive}'));
check('Hero slides support clickable internal or external links', hero.includes('image.href') && hero.includes('href={image.href}') && hero.includes("target={externalLink(image.href) ? '_blank'"));
check('Homepage prefers custom hero slides and keeps product fallback', heroSource.includes('customImages.length ? customImages : fallbackImages') && page.includes('settings?.heroSlides'));
check('Product carousel uses Swiper package', products.includes("from 'swiper/react'") && products.includes('Autoplay') && products.includes('Navigation'));
check('Product carousel autoplays and pauses on hover', products.includes('delay: 3500') && products.includes('pauseOnMouseEnter: true') && products.includes('disableOnInteraction: false'));
check('Product carousel keeps responsive 2/2/4 layout', products.includes('0: { slidesPerView: 2') && products.includes('640: { slidesPerView: 2') && products.includes('1024: { slidesPerView: 4'));
check('Central-backed public pages do not require the backend during next build', [homePage, shopPage, blogPage, cartPage].every((source) => source.includes("export const dynamic = 'force-dynamic';")));

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) { console.error(`\nV10.5 Swiper verification failed (${checks.length - failed.length}/${checks.length}).`); process.exit(1); }
console.log(`\nV10.5 Swiper verification passed (${checks.length}/${checks.length}).`);
