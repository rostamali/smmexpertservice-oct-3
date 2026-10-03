import { headers } from 'next/headers';

/** Canonical URL for the separately deployed storefront. No database access. */
export const getCurrentSiteBaseUrl = async (): Promise<string> => {
  const configured = process.env.NEXT_PUBLIC_SITE_URL || process.env.APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  try {
    const h = await headers();
    const host = h.get('x-forwarded-host') || h.get('host');
    const proto = h.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    if (host) return `${proto}://${host}`.replace(/\/$/, '');
  } catch {}
  return 'http://localhost:3000';
};
