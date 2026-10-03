'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackCurrentPageAttribution } from '@/lib/attribution-client';
import { trackStorefrontEngagement, trackStorefrontPageView } from '@/lib/analytics-client';

export default function AttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();

  useEffect(() => {
    trackCurrentPageAttribution();
    void trackStorefrontPageView();
    const path = pathname || '/';
    let activeMs = 0;
    let visibleStartedAt = document.visibilityState === 'visible' ? Date.now() : 0;
    let sent = false;

    const pause = () => {
      if (visibleStartedAt) activeMs += Date.now() - visibleStartedAt;
      visibleStartedAt = 0;
    };
    const resume = () => { if (!visibleStartedAt) visibleStartedAt = Date.now(); };
    const visibility = () => { if (document.visibilityState === 'visible') resume(); else pause(); };
    const flush = () => {
      if (sent) return;
      sent = true;
      pause();
      trackStorefrontEngagement(path, activeMs);
    };

    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', flush, { once: true });
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, [pathname, query]);

  return null;
}
