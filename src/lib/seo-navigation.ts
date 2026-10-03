import { headers } from 'next/headers';
import { notFound, permanentRedirect, redirect } from 'next/navigation';
import { centralApiFetch } from '@/lib/api-client';

export const redirectOr404 = async (path: string): Promise<never> => {
  const h = await headers();
  const result = await centralApiFetch<{ redirect: string | null; statusCode?: number }>('/api/store/navigation', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    cache: 'no-store',
    body: JSON.stringify({
      path,
      referrer: h.get('referer'),
      userAgent: h.get('user-agent'),
      ip: h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip'),
    }),
  });
  if (result.redirect) {
    if (result.statusCode === 301 || result.statusCode === 308) permanentRedirect(result.redirect);
    redirect(result.redirect);
  }
  notFound();
};
