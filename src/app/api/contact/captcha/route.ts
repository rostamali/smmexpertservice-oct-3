import type { NextRequest } from 'next/server';
import { proxyContactApi } from '@/lib/contact-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return proxyContactApi(request, '/api/store/contact/captcha');
}
