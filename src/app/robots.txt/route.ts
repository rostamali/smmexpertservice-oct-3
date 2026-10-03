import { getCurrentSiteBaseUrl } from '@/lib/site';
import { getCachedSeoSettings } from '@/lib/storefront-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = await getCurrentSiteBaseUrl();
  const fallback = `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\n\nSitemap: ${baseUrl}/sitemap.xml\n`;

  try {
    const settings = await getCachedSeoSettings();
    return new Response(settings.robotsText?.trim() || fallback, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch {
    return new Response(fallback, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    });
  }
}
