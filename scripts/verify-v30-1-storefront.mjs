import fs from 'node:fs';
const read=(file)=>fs.readFileSync(new URL(`../${file}`,import.meta.url),'utf8');
const exists=(file)=>fs.existsSync(new URL(`../${file}`,import.meta.url));
const slider=read('src/config/home-slider.ts');
const hero=read('src/components/HeroSlider.tsx');
const drawer=read('src/components/ui/drawer.tsx');
const reviews=read('src/components/TestimonialsMarquee.tsx');
const card=read('src/components/ProductCard.tsx');
const globals=read('src/app/globals.css');
const checks=[
  ['Static slider config exists', slider.includes('export const slideData') && slider.includes('banner-fc27-coins-promo.webp') && slider.includes('banner-video.webp') && slider.includes('discord.webp')],
  ['Public image URLs omit /public', !slider.includes("'/public/images/") && slider.includes("'/images/slide/")],
  ['Hero autoplay remains enabled', hero.includes('window.setInterval') && hero.includes('AUTOPLAY_MS')],
  ['Hero uses shadcn Card and Button', hero.includes("@/components/ui/card") && hero.includes("@/components/ui/button")],
  ['Product card uses shadcn Card', card.includes("@/components/ui/card") && card.includes('<Card')],
  ['Testimonials use shadcn Card', reviews.includes("@/components/ui/card") && reviews.includes('<Card')],
  ['Testimonials animation avoids global CSS', reviews.includes('.animate(') && !globals.includes('.testimonial-track')],
  ['Drawer styling is Tailwind-first', drawer.includes('transition-[transform,opacity]') && !globals.includes('.store-drawer-root')],
  ['Slider image folder exists', exists('public/images/slide/README.txt')],
];
let failed=0;
for(const [label,ok] of checks){console.log(`${ok?'✓':'✗'} ${label}`);if(!ok)failed++;}
if(failed){console.error(`V30.1 storefront verification failed (${failed}/${checks.length}).`);process.exit(1);}
console.log(`V30.1 storefront verification passed (${checks.length}/${checks.length}).`);
