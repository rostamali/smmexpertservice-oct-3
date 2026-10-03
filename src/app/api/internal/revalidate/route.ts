import { revalidatePath, revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { STORE_CACHE_TAGS } from '@/lib/storefront-cache';
import { centralApiFetch } from '@/lib/api-client';

const schema = z.object({
  kind: z.enum(['catalog', 'content', 'settings', 'seo', 'gateways', 'coupons', 'stock']),
  values: z.array(z.string()).max(100).default([]),
});

const verifySecret = async (supplied: string) => {
  // Backward compatibility for a dedicated one-site storefront deployment.
  const configured = process.env.STOREFRONT_REVALIDATE_SECRET?.trim();
  if (configured && supplied === configured) return true;

  // Multi-site deployments verify the unique per-site secret against the
  // central backend using the current storefront host. The secret is never
  // returned by the verification endpoint.
  try {
    const result = await centralApiFetch<{ valid: boolean }>('/api/store/revalidate/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: supplied }),
      cache: 'no-store',
    });
    return result.valid === true;
  } catch {
    return false;
  }
};

export async function POST(request: Request) {
  const supplied = request.headers.get('x-nexa-revalidate-secret') || '';
  if (!supplied || !(await verifySecret(supplied))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { kind, values } = schema.parse(await request.json());
  if (kind === 'catalog' || kind === 'stock') revalidateTag(STORE_CACHE_TAGS.products, 'max');
  if (kind === 'catalog') {
    revalidateTag(STORE_CACHE_TAGS.categories, 'max');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/sitemap.xml');
    values.filter(Boolean).forEach((slug) => revalidatePath(`/product/${slug}`));
  }
  if (kind === 'content') {
    revalidateTag(STORE_CACHE_TAGS.content, 'max');
    revalidatePath('/blog');
    revalidatePath('/sitemap.xml');
    values.filter(Boolean).forEach((path) => revalidatePath(path));
  }
  if (kind === 'settings') {
    revalidateTag(STORE_CACHE_TAGS.settings, 'max');
    revalidatePath('/', 'layout');
  }
  if (kind === 'seo') {
    revalidateTag(STORE_CACHE_TAGS.seo, 'max');
    revalidatePath('/', 'layout');
    revalidatePath('/robots.txt');
    revalidatePath('/llms.txt');
    revalidatePath('/sitemap.xml');
  }
  if (kind === 'gateways') {
    revalidateTag(STORE_CACHE_TAGS.gateways, 'max');
    revalidatePath('/checkout');
    revalidatePath('/cart');
  }
  if (kind === 'coupons') {
    revalidateTag(STORE_CACHE_TAGS.coupons, 'max');
    revalidatePath('/cart');
    revalidatePath('/checkout');
    revalidatePath('/cart');
  }
  return NextResponse.json({ ok: true });
}
