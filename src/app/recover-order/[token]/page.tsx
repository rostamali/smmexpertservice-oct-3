import { systemPageMetadata } from '@/lib/seo';
import { notFound, redirect } from 'next/navigation';
import { centralApiFetch } from '@/lib/api-client';

export const generateMetadata = () => systemPageMetadata('recoverOrder', { title: 'Recover Order', description: 'Continue payment for your saved SMMExpertService order.', noindex: true });
export const dynamic = 'force-dynamic';

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const result = await centralApiFetch<{ redirect: string }>(`/api/store/recover-order/${encodeURIComponent(token)}`, { cache: 'no-store' });
    redirect(result.redirect);
  } catch (error) {
    if (error && typeof error === 'object' && 'digest' in error) throw error;
    notFound();
  }
}
