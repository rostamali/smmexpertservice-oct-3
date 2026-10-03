'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = element.animate(
      [
        { opacity: 0.72, transform: 'translate3d(0,10px,0)', filter: 'blur(3px)' },
        { opacity: 1, transform: 'translate3d(0,0,0)', filter: 'blur(0px)' },
      ],
      { duration: 520, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both' },
    );
    return () => animation.cancel();
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
