import { headers } from 'next/headers';

export const getRequestIp = async (): Promise<string> => {
    const h = await headers();
    return (
        h.get('cf-connecting-ip') ||
        h.get('x-real-ip') ||
        h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        'unknown'
    );
};

/**
 * Best-effort ISO-3166 country detection from trusted reverse-proxy/CDN headers.
 * This deliberately avoids browser geolocation permission prompts and third-party
 * geo-IP API calls. Cloudflare and Vercel populate these automatically; a VPS
 * proxy can set `x-country-code` when GeoIP is available.
 */
export const getRequestCountry = async (): Promise<string | null> => {
    const h = await headers();
    const raw =
        h.get('cf-ipcountry') ||
        h.get('x-vercel-ip-country') ||
        h.get('x-country-code') ||
        h.get('x-geo-country') ||
        '';
    const country = raw.trim().toUpperCase();
    return /^[A-Z]{2}$/.test(country) && country !== 'XX' ? country : null;
};
