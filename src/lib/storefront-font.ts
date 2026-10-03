import { Mona_Sans } from 'next/font/google';

export const storefrontFont = Mona_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
    variable: '--font-storefront',
});
