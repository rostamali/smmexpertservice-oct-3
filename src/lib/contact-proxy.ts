import type { NextRequest } from 'next/server';
import { centralBackendBase } from '@/lib/api-client';

const storefrontHost = (request: NextRequest) => (
  process.env.NEXA_SITE_HOST ||
  request.headers.get('x-forwarded-host') ||
  request.headers.get('host') ||
  ''
).split(',')[0].trim().split(':')[0].toLowerCase();

const safeJson = (value: string): Record<string, unknown> | null => {
  if (!value.trim()) return null;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
};

export async function proxyContactApi(request: NextRequest, upstreamPath: '/api/store/contact/captcha' | '/api/store/contact') {
  try {
    const target = new URL(upstreamPath, centralBackendBase());
    const headers = new Headers({
      accept: 'application/json',
      'x-nexa-site-host': storefrontHost(request),
      'x-forwarded-for': request.headers.get('x-forwarded-for') || '',
      'x-forwarded-proto': request.headers.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http'),
    });
    const contentType = request.headers.get('content-type');
    if (contentType) headers.set('content-type', contentType);

    const response = await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual',
    });

    const raw = await response.text();
    const body = safeJson(raw);
    if (!body) {
      const looksLikeHtml = /^\s*<!doctype\s+html|^\s*<html/i.test(raw);
      return Response.json({
        error: looksLikeHtml
          ? 'Verification service returned an HTML page instead of JSON. Check CENTRAL_BACKEND_URL and make sure the Central Admin API includes /api/store/contact/captcha.'
          : `Verification service returned an invalid response (${response.status}).`,
        code: 'UPSTREAM_INVALID_RESPONSE',
        upstreamStatus: response.status,
      }, { status: 502 });
    }

    return Response.json(body, {
      status: response.status,
      headers: { 'cache-control': 'no-store' },
    });
  } catch (error) {
    return Response.json({
      error: error instanceof Error ? `Verification service unavailable: ${error.message}` : 'Verification service unavailable.',
      code: 'UPSTREAM_UNAVAILABLE',
    }, { status: 502 });
  }
}
