'use client';

import { AlertCircle, CheckCircle2, HelpCircle, LockKeyhole } from 'lucide-react';
import Link from 'next/link';

import StoreImage from '../StoreImage';
import Spinner from '../shared/Spinner';

type OrderVerificationFormProps = {
    email: string;
    loading: boolean;
    error: string;
    initialEmail?: string;
    setEmail: (value: string) => void;
    onVerify: () => void;
    siteName: string;
};

export default function OrderVerificationForm({
    email,
    loading,
    error,
    initialEmail,
    setEmail,
    onVerify,
    siteName,
}: OrderVerificationFormProps) {
    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f8fbff] px-4 py-10 sm:py-16">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-[240px] -top-[210px] h-[540px] w-[740px] rounded-[50%] bg-[#e6f3ff]" />
                <div className="absolute -right-[230px] top-[200px] h-[430px] w-[660px] rounded-[50%] bg-[#e9f5ff]" />
                <div className="absolute -bottom-[260px] -left-[120px] h-[520px] w-[790px] rotate-[14deg] rounded-[50%] border-[55px] border-[#eaf4ff]" />
                <div className="absolute left-[17%] top-[245px] rotate-[-10deg] rounded-[24px] border border-white/80 bg-white/55 p-6 text-[#7fb6f2] shadow-[0_15px_40px_rgba(70,130,190,.08)] backdrop-blur-sm">
                    <svg width="43" height="43" viewBox="0 0 24 24" fill="none">
                        <path d="M4 6.5h16v11H4z" stroke="currentColor" strokeWidth="1.7" rx="2" />
                        <path
                            d="m5 8 7 5 7-5"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
                <div className="absolute right-[17%] top-[350px] rotate-[9deg] rounded-[24px] border border-white/80 bg-white/55 p-6 text-[#6da9ec] shadow-[0_15px_40px_rgba(70,130,190,.08)] backdrop-blur-sm">
                    <svg width="43" height="43" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M12 3 5.5 5.7v5.4c0 4.2 2.6 7.5 6.5 9.9 3.9-2.4 6.5-5.7 6.5-9.9V5.7L12 3Z"
                            stroke="currentColor"
                            strokeWidth="1.7"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>

            <section className="relative mx-auto w-full max-w-[650px] rounded-[30px] border border-[#e3edf5] bg-white/95 px-7 py-8 shadow-[0_28px_80px_rgba(58,119,180,.12)] sm:px-12 sm:py-10">
                <Link href="/" className="flex items-center gap-3" aria-label={`${siteName} home`}>
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
                </Link>

                <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#edf6ff] px-4 py-2 text-[12px] font-extrabold uppercase tracking-[.02em] text-[#087df5]">
                    <LockKeyhole size={15} />
                    Secure Order Access
                </div>

                <h1 className="mt-5 text-[38px] font-black leading-none tracking-[-0.045em] text-[#071129] sm:text-[42px]">
                    Secure order access
                </h1>

                <p className="mt-4 text-[17px] leading-7 text-[#64799d]">
                    Verify the checkout email linked to your order to access secure delivery
                    details.
                </p>

                <label className="mt-7 block">
                    <span className="mb-2 block text-[14px] font-bold text-[#111a31]">
                        Checkout email
                    </span>

                    <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') onVerify();
                        }}
                        placeholder="Enter your checkout email"
                        className="h-[58px] w-full rounded-[12px] border border-[#d7e4ef] bg-white px-4 text-[15px] text-[#17233f] outline-none transition placeholder:text-[#93a4bb] focus:border-[#087df5] focus:ring-2 focus:ring-[#d9ecff]"
                    />
                </label>

                {error ? (
                    <div className="mt-3 flex items-center gap-3 rounded-[11px] bg-rose-50 px-4 py-3.5 text-[13px] text-rose-600">
                        <AlertCircle size={19} className="shrink-0" />
                        <span>{error}</span>
                    </div>
                ) : null}

                <button
                    type="button"
                    disabled={loading}
                    onClick={onVerify}
                    className="mt-5 flex h-[58px] w-full items-center justify-center gap-3 rounded-[10px] bg__gradient-primary px-5 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(0,112,247,.18)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? (
                        <>
                            <Spinner customClass="size-[20px] fill-white" />
                            Verifying…
                        </>
                    ) : (
                        <>
                            <CheckCircle2 size={20} />
                            Verify email
                        </>
                    )}
                </button>

                <div className="mt-5 flex items-center justify-center gap-2 text-center text-[12px] text-[#6b7e9f]">
                    <HelpCircle size={16} className="shrink-0" />
                    <span>
                        Need help?{' '}
                        <Link href="/contact" className="font-semibold text-[#087df5]">
                            Contact support
                        </Link>{' '}
                        if you used a different email at checkout.
                    </span>
                </div>

                <div className="my-6 h-px bg-[#e5edf5]" />

                <div className="flex items-center gap-4 rounded-[13px] bg-gradient-to-r from-[#f0f7ff] to-[#edf6ff] px-5 py-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-[#dcecff] text-[#087df5]">
                        <LockKeyhole size={21} />
                    </span>

                    <div>
                        <strong className="block text-[14px] font-extrabold text-[#121b31]">
                            Secure delivery access
                        </strong>
                        <p className="mt-0.5 text-[12px] text-[#687da0]">
                            Order details are shown only after email verification.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    );
}
