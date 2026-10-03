import { getCurrentSiteBaseUrl } from '@/lib/site';
import { getCachedSeoSettings } from '@/lib/storefront-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

const fallbackSiteName = () => process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'SMMExpertService';

export async function GET() {
  const baseUrl = await getCurrentSiteBaseUrl();
  const fallback = `# ${fallbackSiteName()}\n\n- Store: ${baseUrl}\n- Products: ${baseUrl}/shop\n- Blog: ${baseUrl}/blog\n`;

  try {
    const settings = await getCachedSeoSettings();
    const brandedFallback = `# ${settings.siteName || fallbackSiteName()}\n\n- Store: ${baseUrl}\n- Products: ${baseUrl}/shop\n- Blog: ${baseUrl}/blog\n`;
    return new Response(settings.llmsText?.trim() || brandedFallback, {
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
