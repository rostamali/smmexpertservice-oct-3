import type { MetadataRoute } from 'next';
import { centralApiFetch } from '@/lib/api-client';
import { getCurrentSiteBaseUrl } from '@/lib/site';

type SitemapData = {
  enabled: boolean;
  products: Array<{ slug: string; updatedAt: string }>;
  posts: Array<{ slug: string; updatedAt: string }>;
  pages: Array<{ slug: string; updatedAt: string }>;
};

export const dynamic = 'force-dynamic';
export const revalidate = 300;

const baseEntries = (base: string): MetadataRoute.Sitemap => [
  { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  { url: `${base}/shop`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.7 },
  { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getCurrentSiteBaseUrl();

  try {
    const data = await centralApiFetch<SitemapData>('/api/store/sitemap', {
      next: { revalidate: 300 } as any,
    });
    if (!data.enabled) return [];

    const output = baseEntries(base);
    output.push(
      ...data.products.map((p) => ({
        url: `${base}/product/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      })),
    );
    output.push(
      ...data.posts.map((p) => ({
        url: `${base}/blog/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
    );
    output.push(
      ...data.pages.map((p) => ({
        url: `${base}/${p.slug}`,
        lastModified: new Date(p.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    );
    return output;
  } catch {
    // A storefront build must not depend on a live central DB. Return the
    // stable public routes and let runtime requests repopulate dynamic entries.
    return baseEntries(base);
  }
}
