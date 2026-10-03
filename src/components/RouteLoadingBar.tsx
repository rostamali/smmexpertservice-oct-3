'use client';

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function RouteLoadingBar({ enabled = true }: { enabled?: boolean }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(100);
    const timer = window.setTimeout(() => { setLoading(false); setProgress(0); }, 180);
    return () => window.clearTimeout(timer);
  }, [pathname, search]);

  useEffect(() => {
    if (!loading) return;
    setProgress(18);
    const first = window.setTimeout(() => setProgress(62), 120);
    const second = window.setTimeout(() => setProgress(84), 520);
    return () => { window.clearTimeout(first); window.clearTimeout(second); };
  }, [loading]);

  useEffect(() => {
    if (!enabled) return;
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const element = event.target instanceof Element ? event.target : null;
      if (element?.closest('[data-no-route-loading]')) return;
      const target = element?.closest('a');
      if (!(target instanceof HTMLAnchorElement) || target.target === '_blank' || target.hasAttribute('download')) return;
      const url = new URL(target.href, window.location.href);
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return;
      setProgress(8); setLoading(true);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled]);

  if (!enabled || (!loading && progress === 0)) return null;
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-[2000] h-[3px] bg-site-primary/10" role="progressbar" aria-label="Loading page"><span className="block h-full bg-site-primary shadow-[0_0_16px_rgba(0,94,252,.65)] transition-[width] duration-300 ease-out" style={{ width: `${progress}%` }}/></div>;
}
