'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCcw, ShoppingBag } from 'lucide-react';
import { writeCart } from '@/lib/cart';

export default function RecoverCartClient({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState('');
  useEffect(() => {
    void fetch(`/api/store/abandoned-cart?token=${encodeURIComponent(token)}`, { cache: 'no-store' }).then(async (response) => { const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Could not restore cart.'); if (!Array.isArray(body.items)) throw new Error('Saved cart data is unavailable.'); writeCart(body.items, { openDrawer: false }); localStorage.setItem('nexa_abandoned_token', token); if (body.email) localStorage.setItem('nexa_recovery_email', String(body.email)); router.replace('/cart'); }).catch((reason) => setError(reason instanceof Error ? reason.message : 'Could not restore cart.'));
  }, [token, router]);

  return <div className="mx-auto grid min-h-[68vh] max-w-[1200px] place-items-center px-4 py-16 sm:px-6"><div className="w-full max-w-lg rounded-2xl bg-slate-50 p-8 text-center sm:p-10">{error?<><div className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-rose-50 text-rose-600"><RefreshCcw size={22}/></div><h2 className="mt-5 text-2xl font-bold text-slate-950">Recovery link unavailable</h2><p className="mt-3 text-sm leading-7 text-slate-600">{error}</p></>:<><div className="mx-auto grid h-14 w-14 place-items-center rounded-md bg-slate-50 text-blue-500"><ShoppingBag size={22}/></div><h2 className="mt-5 text-2xl font-bold text-slate-950">Restoring your cart…</h2><p className="mt-3 text-sm leading-7 text-slate-600">Your saved items and checkout details are being prepared.</p></>}</div></div>;
}
