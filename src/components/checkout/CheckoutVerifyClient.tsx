'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, LockKeyhole, Mail, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

import { writeCart, writeCartCoupon } from '@/lib/cart';
import { money } from '@/lib/money';
import Spinner from '../shared/Spinner';
import StoreImage from '../StoreImage';

type Draft = {
    emailMasked: string;
    total: number;
    discountTotal: number;
    taxTotal: number;
    currency: string;
    couponCode: string | null;
    paymentGatewayKey: string;
    expiresAt: string;
    otpExpiresAt: string | null;
    resendAvailableAt: string;
};

const remainingSeconds = (at: string) =>
    Math.max(0, Math.ceil((new Date(at).getTime() - Date.now()) / 1000));

export default function CheckoutVerifyClient({
    token,
    currency,
    siteName = 'SMMService',
}: {
    token: string;
    currency: string;
    siteName?: string;
}) {
    const router = useRouter();
    const [data, setData] = useState<Draft | null>(null);
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);
    const [seconds, setSeconds] = useState(0);

    const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        void fetch(`/api/checkout/draft/${encodeURIComponent(token)}`, { cache: 'no-store' })
            .then(async (response) => {
                const body = await response.json();
                if (!response.ok) throw new Error(body.error || 'Verification session expired.');

                setData(body);
                setSeconds(remainingSeconds(body.resendAvailableAt));
            })
            .catch((error) =>
                toast.error(
                    error instanceof Error ? error.message : 'Verification session expired.',
                ),
            )
            .finally(() => setLoading(false));

        window.setTimeout(() => otpRefs.current[0]?.focus(), 0);
    }, [token]);

    useEffect(() => {
        if (!data) return;

        const update = () => setSeconds(remainingSeconds(data.resendAvailableAt));
        update();

        const timer = window.setInterval(update, 1000);
        return () => window.clearInterval(timer);
    }, [data?.resendAvailableAt]);

    const verify = async () => {
        if (code.length !== 6) {
            toast.error('Enter the 6-digit verification code.');
            return;
        }

        setVerifying(true);

        try {
            const response = await fetch(
                `/api/checkout/draft/${encodeURIComponent(token)}/verify`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                },
            );

            const body = await response.json();

            if (!response.ok) throw new Error(body.error || 'Verification failed.');

            writeCart([], { openDrawer: false });
            writeCartCoupon('');
            localStorage.removeItem('nexa_abandoned_token');

            toast.success('Email verified. Your order has been created.');

            if (body.redirectUrl) window.location.href = body.redirectUrl;
            else router.push(`/pay/${encodeURIComponent(body.orderNumber)}`);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Verification failed.');
            setCode('');
            otpRefs.current[0]?.focus();
        } finally {
            setVerifying(false);
        }
    };

    const resend = async () => {
        if (seconds > 0) return;

        setResending(true);

        try {
            const response = await fetch(
                `/api/checkout/draft/${encodeURIComponent(token)}/resend`,
                { method: 'POST' },
            );

            const body = await response.json();

            if (!response.ok) throw new Error(body.error || 'Could not resend code.');

            setData((current) =>
                current
                    ? {
                          ...current,
                          resendAvailableAt: body.resendAvailableAt,
                          otpExpiresAt: body.otpExpiresAt,
                      }
                    : current,
            );

            setSeconds(remainingSeconds(body.resendAvailableAt));
            toast.success('A new verification code was sent.');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not resend code.');
        } finally {
            setResending(false);
        }
    };

    const setDigit = (index: number, rawValue: string) => {
        const digit = rawValue.replace(/\D/g, '').slice(-1);
        const next = code.padEnd(6, ' ').split('');
        next[index] = digit || ' ';
        const nextCode = next.join('').replace(/ /g, '');

        // Preserve digit positions while editing.
        const positioned = Array.from({ length: 6 }, (_, position) =>
            position === index ? digit : code[position] || '',
        ).join('');

        setCode(positioned);

        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpPaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;

        event.preventDefault();
        setCode(pasted);
        otpRefs.current[Math.min(pasted.length, 6) - 1]?.focus();
    };

    if (loading) {
        return (
            <div className="grid min-h-[620px] place-items-center bg-[#f7fbff]">
                <Spinner customClass="size-[40px] fill-site-primary" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="mx-auto max-w-[1200px] px-4 py-24 text-center sm:px-6">
                <h1 className="text-3xl font-bold text-slate-950">
                    Verification session unavailable
                </h1>
                <p className="mt-3 text-slate-600">Return to your cart and request a new code.</p>
                <button
                    type="button"
                    onClick={() => router.push('/cart')}
                    className="mt-6 rounded-md bg-blue-500 px-6 py-3 text-sm font-semibold text-white"
                >
                    Return to cart
                </button>
            </div>
        );
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f8fbff] px-4 py-10 sm:py-16">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-[230px] -top-[200px] h-[530px] w-[720px] rounded-[50%] bg-[#e6f3ff]" />
                <div className="absolute -right-[220px] top-[210px] h-[420px] w-[650px] rounded-[50%] bg-[#eaf5ff]" />
                <div className="absolute -bottom-[260px] -left-[120px] h-[520px] w-[780px] rotate-[14deg] rounded-[50%] border-[55px] border-[#eaf4ff]" />
                <div className="absolute left-[17%] top-[245px] rotate-[-10deg] rounded-[24px] border border-white/80 bg-white/55 p-6 text-[#7fb6f2] shadow-[0_15px_40px_rgba(70,130,190,.08)] backdrop-blur-sm">
                    <Mail size={43} strokeWidth={1.8} />
                </div>
                <div className="absolute right-[17%] top-[350px] rotate-[9deg] rounded-[24px] border border-white/80 bg-white/55 p-6 text-[#6da9ec] shadow-[0_15px_40px_rgba(70,130,190,.08)] backdrop-blur-sm">
                    <LockKeyhole size={43} strokeWidth={1.8} />
                </div>
            </div>

            <section className="relative mx-auto w-full max-w-[620px] rounded-[30px] border border-[#e3edf5] bg-white/95 px-7 py-8 shadow-[0_28px_80px_rgba(58,119,180,.12)] sm:px-12 sm:py-10">
                <div className="flex items-center gap-3">
                    <div className="relative size-[50px] overflow-hidden rounded-[13px]">
                        <StoreImage
                            src="/images/SMMExpertServiceLogo.png"
                            alt={siteName}
                            width={100}
                            height={100}
                            sizes="50px"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <strong className="text-[24px] font-extrabold tracking-[-0.04em] text-[#08112c]">
                        {siteName}
                    </strong>
                </div>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#edf6ff] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[.02em] text-[#087df5]">
                    <LockKeyhole size={15} />
                    Secure Checkout
                </div>

                <h1 className="mt-5 text-[38px] font-black leading-none tracking-[-0.045em] text-[#071129] sm:text-[42px]">
                    Verify your email
                </h1>

                <p className="mt-4 text-[17px] leading-7 text-[#64799d]">
                    We sent a 6-digit code to{' '}
                    <strong className="font-semibold text-[#425676]">{data.emailMasked}</strong>
                    <br className="hidden sm:block" /> to protect your checkout.
                </p>

                <label className="mt-7 block">
                    <span className="mb-3 block text-[14px] font-bold text-[#111a31]">
                        Verification code
                    </span>

                    <div className="grid grid-cols-6 gap-2.5 sm:gap-3">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <input
                                key={index}
                                ref={(node) => {
                                    otpRefs.current[index] = node;
                                }}
                                inputMode="numeric"
                                autoComplete={index === 0 ? 'one-time-code' : 'off'}
                                maxLength={1}
                                value={code[index] || ''}
                                onChange={(event) => setDigit(index, event.target.value)}
                                onPaste={handleOtpPaste}
                                onKeyDown={(event) => {
                                    if (event.key === 'Backspace' && !code[index] && index > 0) {
                                        otpRefs.current[index - 1]?.focus();
                                    }

                                    if (event.key === 'ArrowLeft' && index > 0) {
                                        otpRefs.current[index - 1]?.focus();
                                    }

                                    if (event.key === 'ArrowRight' && index < 5) {
                                        otpRefs.current[index + 1]?.focus();
                                    }

                                    if (event.key === 'Enter') {
                                        void verify();
                                    }
                                }}
                                aria-label={`Verification digit ${index + 1}`}
                                className="aspect-[.9] min-w-0 rounded-[12px] border border-[#d7e4ef] bg-white text-center text-[23px] font-medium text-[#52698e] outline-none transition focus:border-[#087df5] focus:ring-2 focus:ring-[#d9ecff]"
                            />
                        ))}
                    </div>
                </label>

                <button
                    type="button"
                    onClick={() => void verify()}
                    disabled={verifying || code.length !== 6}
                    className="mt-6 inline-flex h-[58px] w-full items-center justify-center gap-3 rounded-[10px] bg__gradient-primary px-5 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(0,112,247,.18)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {verifying ? (
                        <Spinner customClass="size-[19px] fill-white" />
                    ) : (
                        <CheckCircle2 size={20} />
                    )}
                    {verifying ? 'Verifying…' : 'Verify & Create Order'}
                </button>

                <div className="flex items-center justify-center">
                    <button
                        type="button"
                        disabled={seconds > 0 || resending}
                        onClick={() => void resend()}
                        className="mt-5 inline-flex items-center justify-center gap-2 text-[13px] font-medium text-[#64799d] disabled:cursor-not-allowed"
                    >
                        <RotateCcw size={15} />
                        {resending
                            ? 'Sending…'
                            : seconds > 0
                              ? `Request a new code in ${seconds}s`
                              : 'Send a new code'}
                    </button>
                </div>

                <div className="my-6 h-px bg-[#e5edf5]" />

                <div className="flex items-center gap-4 rounded-[13px] bg-gradient-to-r from-[#f0f7ff] to-[#edf6ff] px-5 py-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-[#dcecff] text-[#087df5]">
                        <LockKeyhole size={21} />
                    </span>
                    <div>
                        <strong className="block text-[14px] font-extrabold text-[#121b31]">
                            {money(data.total, data.currency || currency)} checkout protected
                        </strong>
                        <p className="mt-0.5 text-[12px] text-[#687da0]">
                            Your information is encrypted and secure.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
