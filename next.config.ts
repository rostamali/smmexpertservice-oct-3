import type { NextConfig } from 'next';

const backendBase = (
    process.env.CENTRAL_BACKEND_INTERNAL_URL ||
    process.env.CENTRAL_BACKEND_URL ||
    process.env.CENTRAL_API_INTERNAL_URL ||
    process.env.CENTRAL_API_URL ||
    'http://127.0.0.1:3001'
).replace(/\/$/, '');

const nextConfig: NextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    output: 'standalone',
    experimental: {
        globalNotFound: true,
    },

    async rewrites() {
        return [
            // Media selected in Central Admin is stored under /uploads. Proxy relative
            // media URLs through the storefront so category/product images work on
            // separate storefront domains as well as local development.
            { source: '/uploads/:path*', destination: `${backendBase}/uploads/:path*` },
        ];
    },
};

export default nextConfig;
