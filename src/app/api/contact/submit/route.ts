import type { NextRequest } from 'next/server';
import { proxyContactApi } from '@/lib/contact-proxy';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return proxyContactApi(request, '/api/store/contact');
}
