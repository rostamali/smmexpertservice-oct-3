'use client';

import { RefreshCcw, ShieldCheck, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type JsonBody = Record<string, unknown>;
async function readJsonResponse(response: Response): Promise<JsonBody> {
  const raw = await response.text();
  if (!raw.trim()) throw new Error(`Verification service returned an empty response (${response.status}).`);
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON payload.');
    return parsed as JsonBody;
  } catch { throw new Error('Verification service returned an invalid response. Please refresh and try again.'); }
}

export default function ContactCaptcha({ open, onOpenChange, onVerified }: { open: boolean; onOpenChange: (open: boolean) => void; onVerified: (payload: { captchaToken: string; captchaPosition: number }) => Promise<{ ok: boolean; message?: string }> }) {
  const [loading, setLoading] = useState(false); const [checking, setChecking] = useState(false); const [message, setMessage] = useState(''); const [token, setToken] = useState(''); const [image, setImage] = useState(''); const [piece, setPiece] = useState(''); const [position, setPosition] = useState(0); const [width, setWidth] = useState(320); const [height, setHeight] = useState(168); const [pieceSize, setPieceSize] = useState(48); const [pieceY, setPieceY] = useState(58);
  const load = useCallback(async () => { setLoading(true); setMessage(''); setPosition(0); setToken(''); try { const response = await fetch('/api/contact/captcha', { cache: 'no-store', headers: { accept: 'application/json' } }); const body = await readJsonResponse(response); if (!response.ok) throw new Error(String(body.error || 'Could not load verification.')); setToken(String(body.token || '')); setImage(String(body.image || '')); setPiece(String(body.piece || '')); setWidth(Number(body.width) || 320); setHeight(Number(body.height) || 168); setPieceSize(Number(body.pieceSize) || 48); setPieceY(Number(body.pieceY) || 58); } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not load verification.'); } finally { setLoading(false); } }, []);
  useEffect(() => { if (open) void load(); }, [open, load]);
  const max = Math.max(1, width - pieceSize); const progress = useMemo(() => (position / max) * 100, [position, max]);
  const verify = async () => { if (!token || loading || checking || position <= 0) return; setChecking(true); setMessage('Checking verification…'); try { const result = await onVerified({ captchaToken: token, captchaPosition: position }); if (result.ok) { setMessage('Verified.'); onOpenChange(false); } else { setMessage(result.message || 'Puzzle did not match. Try again.'); window.setTimeout(() => void load(), 650); } } finally { setChecking(false); } };
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/30 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget && !checking) onOpenChange(false); }}>
    <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-[0_24px_70px_rgba(15,23,42,.18)]">
      <div className="flex items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck size={17} className="text-blue-500"/>Human verification</div><p className="mt-1 text-xs leading-5 text-slate-500">Slide the puzzle piece into the matching space.</p></div><button type="button" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900" onClick={() => onOpenChange(false)} disabled={checking}><X size={17}/></button></div>
      <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50" style={{ aspectRatio: `${width}/${height}` }}>{image ? <img src={image} alt="Verification challenge" className="absolute inset-0 h-full w-full object-cover" draggable={false}/> : null}{piece ? <img src={piece} alt="" className="absolute z-10" draggable={false} style={{ left: `${(position / width) * 100}%`, top: `${(pieceY / height) * 100}%`, width: `${(pieceSize / width) * 100}%`, height: `${(pieceSize / height) * 100}%` }}/> : null}{loading ? <div className="absolute inset-0 grid place-items-center bg-white/90 text-xs font-semibold text-slate-500 backdrop-blur-sm">Loading verification…</div> : null}<button type="button" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 disabled:opacity-50" onClick={() => void load()} disabled={loading || checking} aria-label="Refresh verification"><RefreshCcw size={14}/></button></div>
      <div className="mt-4 rounded-xl bg-slate-50 p-3"><input type="range" min="0" max={max} step="1" value={position} onChange={(event) => setPosition(Number(event.target.value))} onPointerUp={() => void verify()} onKeyUp={(event) => { if (event.key === 'Enter' || event.key === ' ') void verify(); }} disabled={!token || loading || checking} className="w-full accent-blue-500"/><div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-500"><span>Slide to verify</span><span>{Math.round(progress)}%</span></div></div>
      {message ? <div className={`mt-3 rounded-md px-3 py-2 text-xs ${message === 'Verified.' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-50 text-slate-600'}`}>{message}</div> : null}
    </div>
  </div>;
}
