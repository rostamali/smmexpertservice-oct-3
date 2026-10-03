import type { ReactNode } from 'react';
import {
    Calculator,
    CornerUpRight,
    LockKeyhole,
    Network,
    ReceiptText,
    ShieldCheck,
} from 'lucide-react';

import { money } from '@/lib/money';
import StoreImage from '../StoreImage';
import type { InitialPayment } from './types';

type PaymentShellProps = {
    siteName: string;
    data: InitialPayment;
    mode: 'crypto' | 'paygate';
    children: ReactNode;
    dangerNotice?: boolean;
};

const formatStatus = (status: string) => {
    const normalized = String(status || '').toUpperCase();

    if (
        [
            'PENDING',
            'WAITING',
            'WAITING_FOR_PAYMENT',
            'AWAITING_PAYMENT',
            'NEW',
            'PROCESSING',
            'CONFIRMING',
        ].includes(normalized)
    ) {
        return 'Awaiting payment';
    }

    return normalized
        .toLowerCase()
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

export default function PaymentShell({
    siteName,
    data,
    mode,
    children,
    dangerNotice = false,
}: PaymentShellProps) {
    const paymentStatus = String(data.paymentStatus || '');
    const statusLabel = formatStatus(paymentStatus);
    const isPaid = paymentStatus.toUpperCase() === 'PAID';
    const isDanger =
        dangerNotice ||
        ['EXPIRED', 'FAILED', 'CANCELLED', 'CANCELED'].includes(paymentStatus.toUpperCase());

    const safeItems =
        mode === 'crypto'
            ? [
                  {
                      icon: <ShieldCheck size={20} />,
                      title: 'Secure payment',
                      text: 'Your payment is processed securely using blockchain technology.',
                      tone: 'blue',
                  },
                  {
                      icon: <ReceiptText size={20} />,
                      title: 'Amount preview',
                      text: "You'll always see the exact amount before completing the payment.",
                      tone: 'blue',
                  },
                  {
                      icon: <Network size={20} />,
                      title: 'Network confirmation',
                      text: 'Payments are confirmed on the blockchain network for your security.',
                      tone: 'green',
                  },
                  {
                      icon: <CornerUpRight size={20} />,
                      title: 'Safe redirection',
                      text: 'You are redirected only after the secure payment session is ready.',
                      tone: 'green',
                  },
              ]
            : [
                  {
                      icon: <ShieldCheck size={20} />,
                      title: 'Secure payment',
                      text: `Your order stays in ${data.currency}. A provider-specific checkout currency is calculated only when that payment method requires it.`,
                      tone: 'blue',
                  },
                  {
                      icon: <Calculator size={20} />,
                      title: 'Provider minimums',
                      text: 'Provider minimums are checked after conversion.',
                      tone: 'green',
                  },
                  {
                      icon: <ReceiptText size={20} />,
                      title: 'Amount preview',
                      text: 'The converted amount is shown before you continue.',
                      tone: 'blue',
                  },
                  {
                      icon: <CornerUpRight size={20} />,
                      title: 'Safe redirection',
                      text: 'You are redirected only after the secure payment session is ready.',
                      tone: 'green',
                  },
              ];

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#f7fbff] px-4 py-7 sm:px-6 lg:py-10">
            {/* Background decoration */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-[190px] top-[150px] h-[360px] w-[520px] rounded-[50%] bg-[#e5f2ff]" />
                <div className="absolute -right-[210px] -top-[170px] h-[420px] w-[650px] rounded-[50%] bg-[#e5f2ff]" />
                <div className="absolute -right-[190px] top-[420px] h-[360px] w-[520px] rounded-[50%] bg-[#e9f4ff]" />
                <div className="absolute left-[5%] top-[115px] size-6 rounded-full bg-[#9bc9fb]" />
                <div className="absolute right-[10%] top-[510px] size-2 rounded-full bg-white" />
                <div
                    className="absolute bottom-[105px] left-[5%] h-[82px] w-[82px] opacity-80"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, rgba(111,177,242,.65) 2px, transparent 2.5px)',
                        backgroundSize: '18px 18px',
                    }}
                />
                <div
                    className="absolute right-[4%] top-[545px] h-[92px] w-[92px] opacity-80"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, rgba(255,255,255,.95) 2px, transparent 2.5px)',
                        backgroundSize: '18px 18px',
                    }}
                />
                <div className="absolute left-[-70px] top-[430px] h-px w-[420px] rotate-[11deg] bg-gradient-to-r from-transparent via-[#7ab8f9] to-transparent" />
            </div>

            <main className="relative mx-auto max-w-[1160px] overflow-hidden rounded-[28px] border border-white/80 bg-white/95 shadow-[0_24px_80px_rgba(57,126,196,.12)] backdrop-blur-sm">
                <header className="flex flex-col gap-5 px-6 pb-5 pt-6 sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-10 lg:pb-6 lg:pt-7">
                    <div className="flex items-center gap-3">
                        <div className="relative size-[52px] overflow-hidden rounded-[13px] shadow-sm">
                            <StoreImage
                                src="/images/SMMExpertServiceLogo.png"
                                alt={siteName}
                                width={104}
                                height={104}
                                sizes="52px"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <strong className="text-[24px] font-extrabold tracking-[-0.04em] text-[#08112c]">
                            {siteName}
                        </strong>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[12px] font-medium text-[#61759b]">
                        <span className="inline-flex items-center gap-2">
                            <ShieldCheck size={18} className="text-[#087df5]" />
                            Secure Checkout
                        </span>
                        <span className="hidden h-5 w-px bg-[#dbe7f2] sm:block" />
                        <span className="inline-flex items-center gap-2">
                            <LockKeyhole size={15} className="text-emerald-600" />
                            Your payment is encrypted
                        </span>
                    </div>
                </header>

                <div className="grid lg:grid-cols-[minmax(0,1fr)_372px]">
                    <section className="min-w-0 px-6 pb-7 sm:px-8 lg:px-10 lg:pb-9 lg:pr-8">
                        {children}
                    </section>

                    <aside className="border-t border-[#e2ebf3] bg-[#fbfdff] px-6 pb-7 pt-6 sm:px-8 lg:border-l lg:border-t-0 lg:px-5 lg:pb-6 lg:pt-4">
                        <div className="rounded-[18px] border border-[#dfe9f2] bg-[#fbfdff] p-4 shadow-[0_8px_28px_rgba(61,114,166,.04)]">
                            <h2 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#071129]">
                                Order Summary
                            </h2>

                            <div className="relative mt-4 overflow-hidden rounded-[12px] bg-gradient-to-r from-[#eef7ff] to-[#e7f2ff] p-4">
                                <div className="relative z-10">
                                    <span className="text-[14px] text-[#263d67]">
                                        Amount to pay
                                    </span>
                                    <strong className="mt-1 block text-[40px] font-black leading-none tracking-[-0.04em] text-[#071129]">
                                        {money(Number(data.total), data.currency)}
                                    </strong>
                                </div>
                                <LockKeyhole
                                    size={58}
                                    strokeWidth={1.9}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#bddcff]"
                                />
                            </div>

                            <div className="mt-4 space-y-3 text-[13px]">
                                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                                    <span className="text-[#61759b]">Order Number</span>
                                    <span className="break-all font-medium text-[#32486f]">
                                        #{data.orderNumber}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                                    <span className="text-[#61759b]">Currency</span>
                                    <span className="font-medium text-[#32486f]">
                                        {data.currency}
                                    </span>
                                </div>
                                <div className="grid grid-cols-[110px_minmax(0,1fr)] gap-3">
                                    <span className="text-[#61759b]">Payment Status</span>
                                    <span className="inline-flex items-center gap-2 font-medium text-[#32486f]">
                                        <span
                                            className={`size-2.5 rounded-full ${
                                                isPaid
                                                    ? 'bg-emerald-500'
                                                    : isDanger
                                                      ? 'bg-rose-500'
                                                      : 'bg-amber-400'
                                            }`}
                                        />
                                        {statusLabel}
                                    </span>
                                </div>
                            </div>

                            {isDanger ? (
                                <div className="mt-5 flex gap-3 rounded-[12px] bg-rose-50 p-4">
                                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
                                        <LockKeyhole size={19} />
                                    </span>
                                    <div>
                                        <strong className="block text-[13px] text-rose-700">
                                            Payment session expired
                                        </strong>
                                        <p className="mt-1 text-[12px] leading-5 text-rose-600">
                                            This payment session can no longer be completed.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-5 flex gap-3 rounded-[12px] bg-emerald-50 p-4">
                                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                                        <ShieldCheck size={20} />
                                    </span>
                                    <div>
                                        <strong className="block text-[13px] text-emerald-700">
                                            Encrypted payment
                                        </strong>
                                        <p className="mt-1 text-[12px] leading-5 text-emerald-600">
                                            Your payment information is secure and protected.
                                        </p>
                                    </div>
                                </div>
                            )}

                            <h3 className="mt-5 text-[17px] font-extrabold tracking-[-0.02em] text-[#081129]">
                                Why your payment is safe?
                            </h3>

                            <div className="mt-4 space-y-4">
                                {safeItems.map((item) => (
                                    <div key={item.title} className="flex gap-3">
                                        <span
                                            className={`grid size-10 shrink-0 place-items-center rounded-full ${
                                                item.tone === 'green'
                                                    ? 'bg-emerald-50 text-emerald-600'
                                                    : 'bg-blue-50 text-[#087df5]'
                                            }`}
                                        >
                                            {item.icon}
                                        </span>
                                        <div className="min-w-0">
                                            <strong className="block text-[13px] font-bold text-[#10182d]">
                                                {item.title}
                                            </strong>
                                            <p className="mt-0.5 text-[12px] leading-[1.45] text-[#61759b]">
                                                {item.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
