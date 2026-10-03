'use client';

import { Check, CircleX, Headphones, ShieldCheck } from 'lucide-react';

import { money } from '@/lib/money';
import type { InitialPayment } from './types';
import PaymentShell from './PaymentShell';

export default function PaymentStatusScreen({
    data,
    siteName,
}: {
    data: InitialPayment;
    siteName: string;
}) {
    const isPaid = data.paymentStatus === 'PAID';
    const mode = data.gatewayKey === 'PAYGATE' ? 'paygate' : 'crypto';

    if (isPaid) {
        return (
            <PaymentShell siteName={siteName} data={data} mode={mode}>
                <div className="pt-3">
                    <span className="text-[13px] font-extrabold uppercase tracking-[.03em] text-[#087df5]">
                        Secure Checkout
                    </span>

                    <h1 className="mt-2 text-[38px] font-black tracking-[-0.045em] text-[#071129]">
                        Payment confirmed
                    </h1>

                    <p className="mt-2 max-w-[650px] text-[15px] leading-6 text-[#64799d]">
                        Your payment has been confirmed successfully.
                    </p>

                    <div className="mt-5 rounded-[15px] border border-emerald-200 bg-emerald-50 p-7 text-center">
                        <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600">
                            <Check size={30} />
                        </span>

                        <h2 className="mt-4 text-[26px] font-black text-[#071129]">
                            Payment confirmed
                        </h2>

                        <p className="mx-auto mt-2 max-w-[520px] text-[14px] leading-6 text-[#64799d]">
                            Order {data.orderNumber} was paid successfully with {data.gatewayLabel}.
                        </p>

                        <strong className="mt-4 block text-[30px] text-[#071129]">
                            {money(Number(data.total), data.currency)}
                        </strong>
                    </div>

                    {data.deliveryUrl ? (
                        <a
                            href={data.deliveryUrl}
                            className="mt-4 inline-flex h-[54px] w-full items-center justify-center rounded-[10px] bg__gradient-primary px-6 text-[15px] font-bold text-white"
                        >
                            View secure order details
                        </a>
                    ) : null}
                </div>
            </PaymentShell>
        );
    }

    const statusText = String(data.paymentStatus || 'Expired')
        .toLowerCase()
        .replaceAll('_', ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());

    return (
        <PaymentShell siteName={siteName} data={data} mode={mode} dangerNotice>
            <div className="pt-3">
                <span className="text-[13px] font-extrabold uppercase tracking-[.03em] text-[#087df5]">
                    Secure Checkout
                </span>

                <h1 className="mt-2 text-[38px] font-black tracking-[-0.045em] text-[#071129]">
                    Payment {statusText}
                </h1>

                <p className="mt-2 max-w-[660px] text-[15px] leading-6 text-[#64799d]">
                    Your {data.gatewayLabel} payment session has {statusText.toLowerCase()} and can
                    no longer be completed. Please contact support if you already sent funds.
                </p>

                <div className="mt-5 rounded-[15px] border border-rose-200 bg-gradient-to-r from-rose-50 to-[#fff8f9] px-6 py-7 text-center">
                    <span className="mx-auto grid size-16 place-items-center rounded-full bg-rose-100 text-rose-600">
                        <CircleX size={31} />
                    </span>

                    <h2 className="mt-4 text-[26px] font-black text-[#071129]">
                        Payment {statusText}
                    </h2>

                    <p className="mx-auto mt-2 max-w-[540px] text-[14px] leading-6 text-[#64799d]">
                        Order {data.orderNumber} cannot continue with this {data.gatewayLabel}{' '}
                        payment session. Contact support if you already sent funds.
                    </p>
                </div>

                <a
                    href="/contact"
                    className="mt-4 inline-flex h-[56px] w-full items-center justify-center gap-2 rounded-[10px] border border-[#087df5] bg-white px-6 text-[15px] font-bold text-[#087df5] transition hover:bg-[#f4f9ff]"
                >
                    <Headphones size={18} />
                    Contact support
                </a>

                <div className="mt-4 flex gap-4 rounded-[12px] bg-gradient-to-r from-[#f1f8ff] to-[#edf6ff] px-5 py-4">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#dbeeff] text-[#087df5]">
                        <ShieldCheck size={22} />
                    </span>

                    <div>
                        <strong className="block text-[14px] text-[#14213a]">
                            Payment sessions expire for your security.
                        </strong>
                        <p className="mt-1 text-[12px] leading-5 text-[#667da2]">
                            Crypto payment sessions expire after a certain time to help protect
                            pricing and ensure payment integrity.
                        </p>
                    </div>
                </div>
            </div>
        </PaymentShell>
    );
}
