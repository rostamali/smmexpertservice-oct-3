import { NextRequest } from 'next/server';
import { centralBackendBase } from '@/lib/api-client';

const ALLOWED = new Set(['store', 'checkout', 'orders', 'payments']);

const storefrontHost = (request: NextRequest) => (
  process.env.NEXA_SITE_HOST ||
  request.headers.get('x-forwarded-host') ||
  request.headers.get('host') ||
  ''
).split(',')[0].trim().split(':')[0].toLowerCase();

const proxy = async (request: NextRequest, context: { params: Promise<{ path: string[] }> }) => {
  const { path } = await context.params;
  if (!path?.length || !ALLOWED.has(path[0])) {
    return Response.json({ error: 'NOT_FOUND' }, { status: 404 });
  }

  const target = new URL(`/api/${path.map(encodeURIComponent).join('/')}`, centralBackendBase());
  target.search = request.nextUrl.search;

  const headers = new Headers();
  const contentType = request.headers.get('content-type');
  const accept = request.headers.get('accept');
  const userAgent = request.headers.get('user-agent');
  if (contentType) headers.set('content-type', contentType);
  if (accept) headers.set('accept', accept);
  if (userAgent) headers.set('user-agent', userAgent);
  headers.set('x-nexa-site-host', storefrontHost(request));
  headers.set('x-forwarded-for', request.headers.get('x-forwarded-for') || '');
  headers.set('x-forwarded-proto', request.headers.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http'));
  const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry') || request.headers.get('x-country');
  if (country) headers.set('x-nexa-country', country);

  const hasBody = !['GET', 'HEAD'].includes(request.method);
  const response = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
    cache: 'no-store',
    redirect: 'manual',
  });

  const responseHeaders = new Headers();
  for (const name of ['content-type', 'cache-control', 'location', 'content-disposition']) {
    const value = response.headers.get(name);
    if (value) responseHeaders.set(name, value);
  }
  return new Response(response.body, { status: response.status, headers: responseHeaders });
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
