export default function CircuitDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className="relative h-[116px] overflow-hidden bg-site-bg" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 h-24 w-[640px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(0,94,252,.26),transparent_68%)] blur-2xl" />
      <svg viewBox="0 0 1200 116" preserveAspectRatio="none" className={`absolute inset-0 h-full w-full ${flip ? 'scale-x-[-1]' : ''}`}>
        <path d="M0 72H220c74 0 87-46 155-46h450c68 0 81 46 155 46h220" stroke="rgba(255,255,255,.10)" strokeWidth="1.2" fill="none" />
        <path d="M0 72H220c74 0 87-46 155-46" stroke="#1856FF" strokeWidth="1.2" fill="none" opacity=".7" />
        <path d="M825 26c68 0 81 46 155 46h220" stroke="#1856FF" strokeWidth="1.2" fill="none" opacity=".7" />
        <path d="M375 26H825" stroke="#1856FF" strokeWidth="1.1" strokeDasharray="18 90" strokeLinecap="round" fill="none" className="motion-safe:[animation:nexa-line-dash_8s_linear_infinite]" opacity=".65" />
      </svg>
      <div className="absolute left-1/2 top-[26px] h-10 w-10 -translate-x-1/2 rounded-full bg-[#1856FF]/25 blur-xl motion-safe:[animation:nexa-glow-pulse_3.2s_ease-in-out_infinite]" />
      <div className="absolute left-1/2 top-[26px] grid h-7 w-7 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-to-b from-[#4A9FF5] to-[#1856FF] shadow-[0_6px_26px_rgba(0,94,252,.75),inset_0_1px_1px_rgba(255,255,255,.45)]">
        <span className="h-1.5 w-1.5 rounded-full bg-white/85" />
      </div>
    </div>
  );
}
