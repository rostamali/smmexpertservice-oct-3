'use client';

import { useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';

export default function TextMarquee({ items }: { items: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!track.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = track.current.animate([{ transform: 'translate3d(0,0,0)' }, { transform: 'translate3d(-50%,0,0)' }], { duration: 26000, iterations: Infinity, easing: 'linear' });
    return () => animation.cancel();
  }, []);
  const list = [...items, ...items, ...items, ...items];
  return <div className="overflow-hidden border-y border-white/10 bg-[#010513] py-5 text-white"><div ref={track} className="flex w-max items-center will-change-transform">{list.map((item, index) => <div key={`${item}-${index}`} className="flex shrink-0 items-center gap-5 px-5 text-sm font-bold uppercase tracking-[0.14em] sm:text-base"><span>{item}</span><Sparkles size={16} className="text-site-blue" /></div>)}</div></div>;
}
