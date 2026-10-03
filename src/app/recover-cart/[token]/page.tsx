import { systemPageMetadata } from '@/lib/seo';
import RecoverCartClient from '@/components/RecoverCartClient';
export const generateMetadata = () => systemPageMetadata('recoverCart', { title: 'Recover Cart', description: 'Restore your saved SMMExpertService cart and continue checkout.', noindex: true });
export default async function Page({params}:{params:Promise<{token:string}>}){const{token}=await params;return <main className="min-h-[70vh] bg-site-bg"><RecoverCartClient token={token}/></main>}
