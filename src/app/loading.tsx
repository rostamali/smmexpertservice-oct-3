export default function Loading() {
  return <div className="pointer-events-none fixed inset-x-0 top-0 z-[2000] h-[3px] overflow-hidden bg-site-primary/10" role="progressbar" aria-label="Loading page"><span className="block h-full w-2/3 animate-pulse bg-gradient-to-r from-site-primary to-site-blue shadow-[0_0_16px_rgba(0,94,252,.65)]" /></div>;
}
