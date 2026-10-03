import { systemPageMetadata } from '@/lib/seo';
import { redirect } from 'next/navigation';

export const generateMetadata = () => systemPageMetadata('checkout', { title: 'Checkout', description: 'Complete your SMMExpertService checkout securely.', path: '/checkout', noindex: true });

export default function CheckoutPage() {
  redirect('/cart');
}
