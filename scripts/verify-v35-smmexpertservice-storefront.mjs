import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const read = (file) => {
    const full = path.join(root, file);

    if (!fs.existsSync(full)) {
        console.error(`Missing required file: ${file}`);
        process.exit(1);
    }

    return fs.readFileSync(full, 'utf8');
};

const checks = [];

const check = (label, ok) => {
    const passed = Boolean(ok);

    checks.push([label, passed]);

    console.log(`${passed ? '✓' : '✗'} ${label}`);
};

const globalsFile = read('src/app/globals.css');

const globals = globalsFile.toLowerCase();

const home = read('src/app/page.tsx');
const hero = read('src/components/home/Hero.tsx');
const heroSlider = read('src/components/HeroSlider.tsx');
const homeCarousel = read('src/components/home/HomeProductCarousel.tsx');

const header = read('src/components/shared/Header.tsx');
const footer = read('src/components/shared/Footer.tsx');

const siteChrome = read('src/components/SiteChrome.tsx');
const layout = read('src/app/layout.tsx');

const blog = read('src/app/blog/page.tsx');
const contact = read('src/app/contact/page.tsx');

const form = read('src/components/ContactForm.tsx');

const productCard = read('src/components/shared/ProductCard.tsx');

const shop = read('src/app/shop/page.tsx');

const pkg = JSON.parse(read('package.json'));

// Branding

check(
    'SMMExpertService display branding',
    siteChrome.includes("DISPLAY_SITE_NAME = 'SMMExpertService'") &&
        layout.includes('SMMExpertService') &&
        home.includes('SMMExpertService'),
);

// Colors

check(
    'Selected Blue 500 is primary',
    globals.includes('--color-site-primary: #2563eb') &&
        globals.includes('--color-site-secondary: #3b82f6'),
);

check(
    'Complete selected blue palette is available',
    ['#2563eb', '#3b82f6', '#f5f5f5', '#eaedee', '#1a1a1a', '#848e9c'].every((color) =>
        globals.includes(color),
    ),
);

// Hero slider

check(
    'Homepage hero is an image-only responsive slider',
    home.includes('<HomeHero') &&
        home.includes('slides=') &&
        hero.includes('<HeroSlider') &&
        heroSlider.includes('<Swiper') &&
        heroSlider.includes('image.src'),
);

// Product carousel

check(
    'Homepage product cards moved to a responsive carousel',
    home.includes('<HomeProductCarousel') &&
        homeCarousel.includes('<Swiper') &&
        homeCarousel.includes('Previous products') &&
        homeCarousel.includes('Next products'),
);

// Live data

check(
    'Home uses live product and review data',
    home.includes('getCachedHomeCatalog') &&
        home.includes('getCachedSiteReviews') &&
        home.includes('catalog?.products'),
);

// Product cards

check(
    'Product cards use light Untitled-style treatment',
    productCard.includes('product__card') &&
        globalsFile.includes('.product__card') &&
        globalsFile.includes('bg-white'),
);

// Top bar

check(
    'Dismissible top offer bar retained',
    header.includes('TOP_BAR_HIDE_MS') && header.includes('dismissTopBar'),
);

// Blog

check(
    'Blog matches recent/all-post reference structure',
    blog.includes('Recent blog posts') && blog.includes('All blog posts'),
);

// Contact

check(
    'Contact page exposes three support channels',
    contact.includes('contactData.map') && contact.includes('lg:grid-cols-3'),
);

// Contact form

check(
    'Contact form uses light field styling and captcha flow',
    form.includes('border-slate-300 bg-white') &&
        form.includes('ContactCaptcha') &&
        form.includes("fetch('/api/contact/submit'"),
);

// Footer

check(
    'Footer supports brand home and dark content-page variants',
    footer.includes("variant?: 'brand' | 'dark'") && siteChrome.includes('footerVariant'),
);

// Product URL

check('Product URLs remain singular', productCard.includes('href={`/product/${product.slug}`'));

// Dependencies

check(
    'No shadcn dependency added',
    !Object.keys(pkg.dependencies || {}).some(
        (name) => name.includes('radix') || name.includes('shadcn'),
    ),
);

// Package

check('Package is branded for SMMExpertService', pkg.name === 'smmexpertservice-storefront');

const failed = checks.filter(([, ok]) => !ok);

if (failed.length) {
    console.error(
        `\nV35 SMMExpertService storefront verification failed (${checks.length - failed.length}/${checks.length}).`,
    );

    process.exit(1);
}

console.log(
    `\nV35 SMMExpertService storefront verification passed (${checks.length}/${checks.length}).`,
);
