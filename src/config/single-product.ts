import { Headset, ShieldCheck, Zap } from 'lucide-react';

export const singleProductFeatureCards = [
    {
        icon: Zap,
        title: 'Instant Delivery',
        copy: 'Get started quickly with fast digital fulfillment.',
    },
    {
        icon: ShieldCheck,
        title: 'Safe & Secure',
        copy: 'Your order and account data stay protected.',
    },
    {
        icon: Headset,
        title: '24/7 Support',
        copy: 'Our team is available when you need help.',
    },
] as const;

export type SingleProductFeatures = (typeof singleProductFeatureCards)[number];
