'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, ShoppingBag, Star } from 'lucide-react';
import { money } from '@/lib/money';
import { stripHtml } from '@/lib/rich-html';

export type FundingStyleProduct = {
  id: number;
  name: string;
  slug: string;
  shortDescription?: string | null;
  imageUrl?: string | null;
  badgeText?: string | null;
  stock?: number | null;
  starRating?: number | null;
  ratingCount?: number;
  startingPrice?: number | null;
  category: { name: string; slug?: string };
};

function SelectorPanel({ title, number, children }: { title: string; number: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-white/10 bg-[linear-gradient(180deg,rgba(1,5,19,.15),#010513)] p-3.5 shadow-[inset_0_-12px_40px_rgba(116,176,253,.06),inset_0_.5px_.5px_rgba(212,232,255,.12)]">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] font-medium text-[#E3E3E3]">{title}</span>
        <span className="text-[9px] font-semibold text-[#777587]">{number}</span>
      </div>
      {children}
    </div>
  );
}

export default function HomeProductSelector({ products, currency }: { products: FundingStyleProduct[]; currency: string }) {
  const compact = products.slice(0, 8);
  const categories = useMemo(() => Array.from(new Set(compact.map((product) => product.category?.name || 'Products'))), [compact]);
  const [category, setCategory] = useState(categories[0] || 'Products');
  const productsForCategory = compact.filter((product) => (product.category?.name || 'Products') === category);
  const [selectedId, setSelectedId] = useState(compact[0]?.id || 0);
  const selected = compact.find((product) => product.id === selectedId && (product.category?.name || 'Products') === category)
    || productsForCategory[0]
    || compact[0];

  if (!selected) return null;

  const description = stripHtml(selected.shortDescription || '').replace(/\s+/g, ' ').trim();
  const selectCategory = (nextCategory: string) => {
    setCategory(nextCategory);
    const next = compact.find((product) => (product.category?.name || 'Products') === nextCategory);
    if (next) setSelectedId(next.id);
  };

  return (
    <div className="mx-auto grid max-w-[760px] gap-3.5 lg:grid-cols-[1fr_1.02fr] lg:items-start">
      <div className="space-y-3">
        <SelectorPanel title="Select Category" number="01">
          <div className="grid grid-cols-2 gap-2">
            {categories.slice(0, 4).map((item) => (
              <button key={item} type="button" onClick={() => selectCategory(item)} className={`min-h-9 rounded-[8px] px-3 text-[10px] font-semibold transition ${item === category ? 'bg-gradient-to-b from-[#4A9FF5] to-[#1856FF] text-white shadow-[0_7px_20px_rgba(0,94,252,.3),inset_0_1px_1px_rgba(255,255,255,.25)]' : 'border border-white/[.06] bg-[#0A1628] text-[#B1B1C1] hover:border-white/15 hover:text-white'}`}>{item}</button>
            ))}
          </div>
        </SelectorPanel>

        <SelectorPanel title="Select Product" number="02">
          <div className="grid grid-cols-2 gap-2">
            {productsForCategory.slice(0, 4).map((product) => (
              <button key={product.id} type="button" onClick={() => setSelectedId(product.id)} className={`min-h-9 truncate rounded-[8px] px-3 text-[10px] font-semibold transition ${product.id === selected.id ? 'bg-gradient-to-b from-[#4A9FF5] to-[#1856FF] text-white shadow-[0_7px_20px_rgba(0,94,252,.3),inset_0_1px_1px_rgba(255,255,255,.25)]' : 'border border-white/[.06] bg-[#0A1628] text-[#B1B1C1] hover:border-white/15 hover:text-white'}`}>{product.name}</button>
            ))}
          </div>
        </SelectorPanel>

        <SelectorPanel title="Choose Your Next Step" number="03">
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/product/${selected.slug}`} className="inline-flex min-h-9 items-center justify-center rounded-[8px] bg-gradient-to-b from-[#4A9FF5] to-[#1856FF] px-3 text-[10px] font-semibold text-white shadow-[0_7px_20px_rgba(0,94,252,.3)]">Configure</Link>
            <Link href="/shop" className="inline-flex min-h-9 items-center justify-center rounded-[8px] border border-white/[.08] bg-[#0A1628] px-3 text-[10px] font-semibold text-[#D6D6DF] transition hover:text-white">View Catalog</Link>
          </div>
        </SelectorPanel>
      </div>

      <article className="overflow-hidden rounded-[13px] border-2 border-[#087CFF] bg-[#010513] shadow-[0_22px_55px_rgba(0,94,252,.17),inset_0_-14px_57px_rgba(116,176,253,.06)]">
        <div className="bg-gradient-to-r from-[#4A9FF5] to-[#238CFF] py-1.5 text-center text-[9px] font-semibold text-white">{selected.badgeText || 'Featured'}</div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              {selected.startingPrice != null ? <div className="text-[30px] font-semibold leading-none tracking-[-.05em] text-white">{money(selected.startingPrice, currency)}</div> : <div className="text-[18px] font-semibold text-white">Price on selection</div>}
              <div className="mt-1 text-[9px] text-[#86868E]">Starting price</div>
            </div>
            <div className="flex items-center gap-1 rounded-md border border-white/[.08] bg-[#0A1628] px-2 py-1 text-[9px] text-[#D7D7E0]"><Star size={10} className="fill-[#4A9FF5] text-[#4A9FF5]" />{selected.starRating != null ? Number(selected.starRating).toFixed(1) : 'New'}</div>
          </div>

          <h3 className="mt-4 text-[15px] font-semibold text-white">{selected.name}</h3>
          {description ? <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-[#86868E]">{description}</p> : null}

          <Link href={`/product/${selected.slug}`} className="mt-4 flex min-h-9 w-full items-center justify-center gap-2 rounded-[7px] bg-gradient-to-b from-[#4A9FF5] to-[#1856FF] px-4 text-[10px] font-semibold text-white shadow-[0_8px_24px_rgba(0,94,252,.32),inset_0_1px_1px_rgba(255,255,255,.24)]">Choose this product <ArrowUpRight size={12} /></Link>
          <Link href={`/product/${selected.slug}`} className="mt-2 flex min-h-8 w-full items-center justify-center rounded-[7px] border border-[#74B0FD]/20 bg-[#0A1628] text-[9px] font-semibold text-[#DADAE3] transition hover:border-[#74B0FD]/40 hover:text-white">View options &amp; details</Link>

          <div className="mt-5 text-[8px] font-semibold uppercase tracking-[.08em] text-[#E3E3E3]">What&apos;s included</div>
          <dl className="mt-2.5 space-y-2 border-t border-white/[.06] pt-3 text-[9px]">
            <div className="flex items-center justify-between gap-3"><dt className="text-[#86868E]">Category</dt><dd className="text-right text-[#E3E3E3]">{selected.category?.name || 'Product'}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-[#86868E]">Configuration</dt><dd className="inline-flex items-center gap-1 text-[#E3E3E3]"><Check size={9} className="text-[#4A9FF5]" /> Available options</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-[#86868E]">Checkout</dt><dd className="inline-flex items-center gap-1 text-[#E3E3E3]"><ShoppingBag size={9} className="text-[#4A9FF5]" /> Secure cart</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-[#86868E]">Stock</dt><dd className="text-[#E3E3E3]">{selected.stock == null ? 'Available' : selected.stock > 0 ? 'In stock' : 'Check product'}</dd></div>
          </dl>
        </div>
      </article>
    </div>
  );
}
