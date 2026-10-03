'use client';

import { useState, type FormEvent } from 'react';
import ContactCaptcha from '@/components/ContactCaptcha';

type JsonBody = Record<string, unknown>;

async function readJsonResponse(response: Response): Promise<JsonBody> {
  const raw = await response.text();
  if (!raw.trim()) throw new Error(`Contact service returned an empty response (${response.status}).`);
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON payload.');
    return parsed as JsonBody;
  } catch {
    throw new Error('Contact service returned an invalid response. Please try again later.');
  }
}

export default function ContactForm({ contactEmail }: { contactEmail?: string | null }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', orderNumber: '', subject: '', message: '', consent: false });
  const [working, setWorking] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [captchaOpen, setCaptchaOpen] = useState(false);
  const patch = <K extends keyof typeof form,>(key: K, value: (typeof form)[K]) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) { setNotice({ type: 'error', text: 'Enter a valid email address.' }); return; }
    if (!form.consent) { setNotice({ type: 'error', text: 'Please agree to be contacted about this request.' }); return; }
    setCaptchaOpen(true);
  };

  const submitVerified = async ({ captchaToken, captchaPosition }: { captchaToken: string; captchaPosition: number }) => {
    setWorking(true);
    setNotice(null);
    try {
      const response = await fetch('/api/contact/submit', {
        method: 'POST', headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ name: `${form.firstName} ${form.lastName}`.trim(), email: form.email, orderNumber: form.orderNumber, subject: form.subject, message: form.message, captchaToken, captchaPosition }),
      });
      const body = await readJsonResponse(response);
      if (!response.ok) {
        if (body.code === 'CAPTCHA_FAILED') return { ok: false, message: String(body.error || 'Verification failed.') };
        throw new Error(String(body.error || 'Could not send your message.'));
      }
      setNotice({ type: 'success', text: 'Thank you. We received your request and will reply with useful next steps.' });
      setForm({ firstName: '', lastName: '', email: '', orderNumber: '', subject: '', message: '', consent: false });
      return { ok: true, message: 'Verified.' };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not send your message.';
      setNotice({ type: 'error', text: message });
      return { ok: false, message };
    } finally { setWorking(false); }
  };

  const inputClass = 'h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100';

  return <>
    <form onSubmit={submit} className="mx-auto max-w-[640px] text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <label><span className="mb-1.5 block text-[9px] font-medium text-slate-700">First name <b className="text-blue-600">*</b></span><input value={form.firstName} onChange={(event) => patch('firstName', event.target.value)} placeholder="First name" required className={inputClass} /></label>
        <label><span className="mb-1.5 block text-[9px] font-medium text-slate-700">Last name <b className="text-blue-600">*</b></span><input value={form.lastName} onChange={(event) => patch('lastName', event.target.value)} placeholder="Last name" required className={inputClass} /></label>
      </div>
      <label className="mt-4 block"><span className="mb-1.5 block text-[9px] font-medium text-slate-700">Email <b className="text-blue-600">*</b></span><input type="email" value={form.email} onChange={(event) => patch('email', event.target.value)} placeholder="you@company.com" required className={inputClass} /></label>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label><span className="mb-1.5 block text-[9px] font-medium text-slate-700">Order number</span><input value={form.orderNumber} onChange={(event) => patch('orderNumber', event.target.value)} placeholder="Optional" className={inputClass} /></label>
        <label><span className="mb-1.5 block text-[9px] font-medium text-slate-700">Subject <b className="text-blue-600">*</b></span><input value={form.subject} onChange={(event) => patch('subject', event.target.value)} placeholder="How can we help?" required className={inputClass} /></label>
      </div>
      <label className="mt-4 block"><span className="mb-1.5 block text-[9px] font-medium text-slate-700">Message <b className="text-blue-600">*</b></span><textarea value={form.message} onChange={(event) => patch('message', event.target.value)} placeholder="Leave us a message..." required rows={6} className="min-h-36 w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-3 text-[11px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></label>
      <label className="mt-4 flex items-start gap-2 text-[9px] text-slate-600"><input type="checkbox" checked={form.consent} onChange={(event) => patch('consent', event.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-500"/><span>You agree to be contacted about this request.{contactEmail ? ` Support email: ${contactEmail}.` : ''}</span></label>
      {notice ? <div className={`mt-5 rounded-lg px-4 py-3 text-[10px] ${notice.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>{notice.text}</div> : null}
      <button type="submit" disabled={working} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-500 px-5 text-[10px] font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">{working ? 'Sending…' : 'Send message'}</button>
    </form>
    <ContactCaptcha open={captchaOpen} onOpenChange={setCaptchaOpen} onVerified={submitVerified} />
  </>;
}
