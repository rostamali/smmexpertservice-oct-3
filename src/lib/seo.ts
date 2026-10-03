import type { Metadata } from 'next';
import { getCurrentSiteBaseUrl } from '@/lib/site';
import { getCachedSeoSettings } from '@/lib/storefront-cache';

export const applyTitlePattern = (title: string, siteName: string, pattern: string) =>
  pattern.replaceAll('%title%', title).replaceAll('%sitename%', siteName);

export const robotsFromFlags = (flags: {
  index: boolean;
  follow: boolean;
  noArchive?: boolean;
  noImageIndex?: boolean;
  noSnippet?: boolean;
}): Metadata['robots'] => ({
  index: flags.index,
  follow: flags.follow,
  noarchive: flags.noArchive || undefined,
  googleBot: {
    index: flags.index,
    follow: flags.follow,
    noarchive: flags.noArchive || undefined,
    noimageindex: flags.noImageIndex || undefined,
    nosnippet: flags.noSnippet || undefined,
  },
});

export const getSeoSettings = getCachedSeoSettings;

export const contentMetadata = async (
  entry: {
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    featuredImageUrl: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    robotsIndex: boolean;
    robotsFollow: boolean;
    robotsNoArchive: boolean;
    robotsNoImageIndex: boolean;
    robotsNoSnippet: boolean;
    ogTitle: string | null;
    ogDescription: string | null;
    ogImageUrl: string | null;
    twitterTitle: string | null;
    twitterDescription: string | null;
    twitterImageUrl: string | null;
  },
  kind: 'post' | 'page',
): Promise<Metadata> => {
  const settings = await getSeoSettings();
  const baseTitle =
    entry.seoTitle ||
    applyTitlePattern(entry.title, settings.siteName, settings.defaultTitlePattern);
  const description =
    entry.seoDescription ||
    entry.excerpt ||
    settings.defaultDescription ||
    entry.content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  const baseUrl = await getCurrentSiteBaseUrl();
  const url = entry.canonicalUrl || `${baseUrl}${kind === 'post' ? '/blog/' : '/'}${entry.slug}`;
  const image = entry.ogImageUrl || entry.featuredImageUrl || settings.defaultOgImage || undefined;

  return {
    title: baseTitle,
    description,
    alternates: { canonical: url },
    robots: robotsFromFlags({
      index: entry.robotsIndex,
      follow: entry.robotsFollow,
      noArchive: entry.robotsNoArchive,
      noImageIndex: entry.robotsNoImageIndex,
      noSnippet: entry.robotsNoSnippet,
    }),
    openGraph: {
      title: entry.ogTitle || baseTitle,
      description: entry.ogDescription || description,
      url,
      type: kind === 'post' ? 'article' : 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: settings.twitterCard === 'summary' ? 'summary' : 'summary_large_image',
      title: entry.twitterTitle || entry.ogTitle || baseTitle,
      description: entry.twitterDescription || entry.ogDescription || description,
      images: entry.twitterImageUrl || image ? [entry.twitterImageUrl || image!] : undefined,
    },
  };
};

export type SystemPageSeoKey =
  | 'home'
  | 'shop'
  | 'blog'
  | 'contact'
  | 'cart'
  | 'checkout'
  | 'orderLookup'
  | 'order'
  | 'checkoutVerify'
  | 'recoverCart'
  | 'recoverOrder'
  | 'notFound';

const replaceSystemTokens = (value: string, values: { siteName: string; title: string }) =>
  value.replaceAll('%sitename%', values.siteName).replaceAll('%title%', values.title);

const systemMetadataFallbackSettings = () => ({
  siteName: process.env.NEXT_PUBLIC_SITE_NAME?.trim() || 'SMMExpertService',
  defaultTitlePattern: '%title% | %sitename%',
  defaultDescription: null as string | null,
  defaultOgImage: null as string | null,
  twitterCard: 'summary_large_image',
});

/**
 * System/transactional pages are rendered during `next build` too (notably /404).
 * Metadata customization must never make a production build depend on a live
 * central database. When the backend is temporarily unavailable or its schema
 * upgrade is still pending, use safe branded fallbacks and retry normally at
 * runtime on the next request.
 */
const getSystemMetadataSettings = async () => {
  try {
    return await getSeoSettings();
  } catch {
    return systemMetadataFallbackSettings();
  }
};

export async function systemPageMetadata(
  key: SystemPageSeoKey,
  fallback: { title: string; description: string; path?: string; noindex?: boolean },
): Promise<Metadata> {
  const settings = await getSystemMetadataSettings();
  const rawTitle = String(fallback.title || settings.siteName).trim();
  const tokenTitle = replaceSystemTokens(rawTitle, { siteName: settings.siteName, title: fallback.title });
  const title = rawTitle.includes('%sitename%') || rawTitle.includes('%title%') || tokenTitle.toLowerCase().includes(settings.siteName.toLowerCase())
    ? tokenTitle
    : rawTitle === settings.siteName
      ? rawTitle
      : applyTitlePattern(rawTitle, settings.siteName, settings.defaultTitlePattern);
  const description = String(fallback.description || settings.defaultDescription || '').trim();
  const image = String(settings.defaultOgImage || '').trim() || undefined;
  const noindex = Boolean(fallback.noindex);
  const baseUrl = await getCurrentSiteBaseUrl();
  const url = fallback.path ? `${baseUrl}${fallback.path === '/' ? '' : fallback.path}` : undefined;

  return {
    title,
    description,
    alternates: !noindex && url ? { canonical: url } : undefined,
    robots: noindex ? robotsFromFlags({ index: false, follow: true }) : robotsFromFlags({ index: true, follow: true }),
    openGraph: {
      title,
      description,
      url: !noindex ? url : undefined,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: settings.twitterCard === 'summary' ? 'summary' : 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
