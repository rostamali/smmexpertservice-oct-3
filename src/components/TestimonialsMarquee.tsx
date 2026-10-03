'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Quote, Star } from 'lucide-react';

export type SiteReview = {
  id: number;
  reviewerName: string;
  rating: number;
  comment: string;
  reviewDate: string;
  product: { id: number; name: string; slug: string; imageUrl?: string | null };
  variant: { id: number; label: string } | null;
};

const repeatItems = <T,>(items: T[], min = 8): T[] => {
  if (!items.length) return [];
  const result = [...items];
  let index = 0;
  while (result.length < min) { result.push(items[index % items.length]); index += 1; }
  return result;
};

function ReviewCard({ review }: { review: SiteReview }) {
  return (
    <Link href={`/product/${review.product.slug}`} className="group block min-w-[310px] max-w-[370px] shrink-0 rounded-[18px] border border-slate-200 bg-[linear-gradient(180deg,rgba(1,5,19,.25),#010513)] p-6 text-left shadow-[inset_0_-14px_57px_rgba(116,176,253,.06),inset_0_.5px_.5px_rgba(212,232,255,.12)] transition duration-300 hover:-translate-y-1.5 hover:border-blue-200 hover:shadow-[0_22px_55px_rgba(59,130,246,.14)]">
      <div className="flex items-start justify-between gap-4"><Quote size={31} className="rotate-180 text-blue-500" /><div className="flex items-center gap-0.5 text-blue-500">{Array.from({ length: 5 }).map((_, index) => <Star key={index} size={13} fill={index < Math.round(review.rating) ? 'currentColor' : 'none'} />)}</div></div>
      <p className="mt-5 line-clamp-4 text-sm leading-7 text-slate-600">{review.comment}</p>
      <div className="mt-6 border-t border-slate-200 pt-5"><strong className="block text-sm font-bold text-slate-950">{review.reviewerName}</strong><span className="mt-1 block truncate text-xs font-medium text-slate-500 transition group-hover:text-blue-500">{review.product.name}</span></div>
    </Link>
  );
}

function Row({ reviews, reverse = false }: { reviews: SiteReview[]; reverse?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  useEffect(() => {
    if (!ref.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    animation.current = ref.current.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-50%,0,0)' }], { duration: reverse ? 50000 : 45000, iterations: Infinity, easing: 'linear', direction: reverse ? 'reverse' : 'normal' });
    return () => animation.current?.cancel();
  }, [reverse]);
  return <div className="overflow-hidden" onMouseEnter={() => animation.current?.pause()} onMouseLeave={() => animation.current?.play()}><div ref={ref} className="flex w-max gap-5 py-1 will-change-transform">{[...reviews, ...reviews].map((review, index) => <ReviewCard key={`${review.id}-${index}`} review={review} />)}</div></div>;
}

export default function TestimonialsMarquee({ reviews }: { reviews: SiteReview[] }) {
  const first = repeatItems(reviews.filter((_, index) => index % 2 === 0), 6);
  const second = repeatItems(reviews.filter((_, index) => index % 2 === 1), 6);
  if (!reviews.length) return null;
  return <div className="space-y-5"><Row reviews={first.length ? first : second} /><Row reviews={second.length ? second : first} reverse /></div>;
}
