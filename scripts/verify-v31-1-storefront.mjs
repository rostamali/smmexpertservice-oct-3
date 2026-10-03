import fs from 'node:fs';
import path from 'node:path';
const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const checks = [];
const check = (label, ok) => checks.push([label, Boolean(ok)]);
const home = read('src/app/page.tsx');
const header = read('src/components/Header.tsx');
const chrome = read('src/components/SiteChrome.tsx');
const routeLoader = read('src/components/RouteLoadingBar.tsx');
const loading = read('src/app/loading.tsx');
const css = read('src/app/globals.css');
check('Hero has masked dot field', home.includes("radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)") && home.includes("backgroundSize: '28px 28px'") && home.includes('maskImage'));
check('Hero has aurora and beam motion', home.includes('hero-aurora-breathe_45s') && home.includes('hero-beam-shift_55s') && css.includes('@keyframes hero-aurora-breathe') && css.includes('@keyframes hero-beam-shift'));
check('Hero has subtle noise texture', home.includes('feTurbulence') && home.includes("backgroundSize: '180px 180px'"));
check('Patterned sections use line grid and radial glow', home.includes('linear-gradient(rgba(255,255,255,0.025) 1px') && home.includes('backgroundSize: \'60px 60px\'') && home.includes('radial-gradient(circle,rgba(5,95,252,0.12)'));
check('Header animates transparent to glass on scroll', header.includes('window.scrollY > 24') && header.includes("scrolled ? 'max-w-[1180px]' : 'max-w-7xl'") && header.includes('bg-[#0b1424]/90') && header.includes('transition-[background-color,box-shadow,padding,border-color]'));
check('Header remains fixed and mobile menu remains top drawer', header.includes('fixed left-0 right-0 top-0 z-[999]') && header.includes('side="top"'));
check('Cart header feedback has no spinner', !header.includes('Loader2') && !header.includes('animate-spin'));
check('Route loading is top progress bar', routeLoader.includes('fixed inset-x-0 top-0') && routeLoader.includes('route-progress_1.1s') && !routeLoader.includes('className="route-loading"'));
check('Next loading fallback is top progress bar, not spinner', loading.includes('role="progressbar"') && loading.includes('route-progress_1.1s') && !loading.includes('loader-ring') && !loading.includes('animate-spin'));
check('Shared storefront background carries subtle dots', chrome.includes("radial-gradient(rgba(255,255,255,.65) 1px, transparent 1px)") && chrome.includes("backgroundSize: '30px 30px'"));
let failed = 0;
for (const [label, ok] of checks) { console.log(`${ok ? '✓' : '✗'} ${label}`); if (!ok) failed += 1; }
if (failed) { console.error(`V31.1 storefront verification failed (${failed}/${checks.length}).`); process.exit(1); }
console.log(`V31.1 storefront verification passed (${checks.length}/${checks.length}).`);
