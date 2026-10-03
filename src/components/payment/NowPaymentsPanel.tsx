'use client';

import { ArrowLeftRight, Clock3, Copy, Globe2, Loader2, QrCode, WalletCards } from 'lucide-react';

import type { InitialPayment, NowPaymentCurrency } from './types';
import ShadcnPaymentCombobox from './ShadcnPaymentCombobox';
import PaymentShell from './PaymentShell';

const remainingLabel = (expiresAt: string | null, now: number | null) => {
    if (!expiresAt || now == null) return null;
    const distance = Math.max(0, new Date(expiresAt).getTime() - now);
    const seconds = Math.max(0, Math.ceil(distance / 1000));
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

type NowPaymentsProps = {
    data: InitialPayment;
    currencies: NowPaymentCurrency[];
    loading: boolean;
    selected: string;
    onSelect: (value: string) => void;
    creating: boolean;
    onCreate: () => void;
    choosingCurrency: boolean;
    onChangeCurrency: () => void;
    onCancelChange: () => void;
    qrDataUrl: string;
    expiresAt: string | null;
    now: number | null;
    onCopy: (value: string) => void;
    siteName: string;
};

export default function NowPaymentsPanel({
    data,
    currencies,
    loading,
    selected,
    onSelect,
    creating,
    onCreate,
    choosingCurrency,
    onChangeCurrency,
    onCancelChange,
    qrDataUrl,
    expiresAt,
    now,
    onCopy,
    siteName,
}: NowPaymentsProps) {
    const showPicker = !data.externalId || choosingCurrency;
    const selectedCurrency =
        currencies.find((currency) => currency.code === selected) ||
        currencies.find((currency) => currency.code === data.payCurrency) ||
        null;

    const currencyOption = (currency: NowPaymentCurrency) => (
        <span className="flex min-w-0 items-center gap-3">
            {currency.logoUrl ? (
                <img
                    src={currency.logoUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-full bg-white object-contain"
                />
            ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eef3f8] text-[10px] font-black text-[#18345f]">
                    {currency.ticker.slice(0, 4).toUpperCase()}
                </span>
            )}

            <span className="min-w-0 flex-1">
                <span className="flex min-w-0 items-center gap-1.5">
                    <strong className="truncate text-[14px] font-extrabold uppercase text-[#111a31]">
                        {currency.ticker}
                    </strong>
                    {currency.network ? (
                        <span className="shrink-0 text-[11px] font-bold uppercase text-[#365784]">
                            [{currency.network}]
                        </span>
                    ) : null}
                </span>
                <small className="mt-0.5 block truncate text-[12px] text-[#667da2]">
                    {currency.name}
                </small>
            </span>
        </span>
    );

    return (
        <PaymentShell siteName={siteName} data={data} mode="crypto">
            <div className="pt-3">
                <span className="text-[13px] font-extrabold uppercase tracking-[.03em] text-[#087df5]">
                    Secure Checkout
                </span>

                <h1 className="mt-2 text-[34px] font-black leading-[1.06] tracking-[-0.045em] text-[#071129] sm:text-[40px]">
                    Complete your crypto payment
                </h1>

                <p className="mt-2 text-[19px] font-medium text-[#6a7fa2]">
                    Order #{data.orderNumber}
                </p>

                <p className="mt-2 max-w-[650px] text-[15px] leading-6 text-[#64799d]">
                    {showPicker
                        ? "Choose the cryptocurrency you want to pay with. You'll be redirected to a secure payment page to complete the payment."
                        : 'Send the exact amount to the generated address.'}
                </p>

                {showPicker ? (
                    <>
                        <div className="mt-5 flex items-center gap-4 rounded-[12px] border border-[#deebf6] bg-gradient-to-r from-[#eff8ff] to-[#eaf5ff] px-5 py-4">
                            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#d9edff] text-[#087df5]">
                                <Globe2 size={23} />
                            </span>
                            <div>
                                <strong className="block text-[16px] font-extrabold text-[#101a33]">
                                    Pay with cryptocurrency
                                </strong>
                                <p className="mt-0.5 text-[13px] text-[#657a9f]">
                                    Choose the cryptocurrency you want to pay with.
                                </p>
                            </div>
                        </div>

                        {data.externalId ? (
                            <div className="mt-4 flex items-center justify-between gap-4 rounded-[11px] border border-amber-200 bg-amber-50 px-4 py-3 text-[12px] text-amber-800">
                                <span>
                                    Choosing a new cryptocurrency will replace the current payment
                                    address for this order.
                                </span>
                                <button
                                    type="button"
                                    onClick={onCancelChange}
                                    className="shrink-0 font-bold underline underline-offset-2"
                                >
                                    Keep current
                                </button>
                            </div>
                        ) : null}

                        <label className="mt-4 block text-[15px] font-bold text-[#52698f]">
                            Select cryptocurrency
                        </label>

                        <div className="mt-2">
                            {loading ? (
                                <div className="overflow-hidden rounded-[12px] border border-[#83bfff] bg-white">
                                    <div className="h-14 animate-pulse bg-[#f3f8fd]" />
                                    <div className="space-y-1 p-1">
                                        {Array.from({ length: 5 }).map((_, index) => (
                                            <div
                                                key={index}
                                                className="h-[58px] animate-pulse rounded-[9px] bg-[#f7fbff]"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <ShadcnPaymentCombobox
                                    value={selected}
                                    onValueChange={onSelect}
                                    placeholder="Select cryptocurrency"
                                    searchPlaceholder="Search coin, ticker or network"
                                    emptyText="No enabled cryptocurrency is available."
                                    ariaLabel="Cryptocurrency"
                                    options={currencies.map((currency) => ({
                                        value: currency.code,
                                        keywords: `${currency.ticker} ${currency.code} ${currency.name} ${currency.network || ''}`,
                                        content: currencyOption(currency),
                                        selectedContent: currencyOption(currency),
                                    }))}
                                />
                            )}
                        </div>

                        {!loading && !currencies.length ? (
                            <div className="mt-3 rounded-[11px] bg-slate-50 p-4 text-center text-sm text-[#667da2]">
                                No enabled cryptocurrency is available.
                            </div>
                        ) : null}

                        <button
                            type="button"
                            disabled={!selected || creating}
                            onClick={onCreate}
                            className="mt-3 inline-flex h-[58px] w-full items-center justify-center gap-3 rounded-[10px] bg__gradient-primary px-6 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(0,112,247,.18)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {creating ? (
                                <Loader2 size={19} className="animate-spin" />
                            ) : (
                                <QrCode size={20} />
                            )}
                            <span>
                                {creating
                                    ? 'Preparing payment…'
                                    : data.externalId
                                      ? 'Generate new payment details'
                                      : 'Generate payment details'}
                            </span>
                            {!creating ? (
                                <span className="ml-auto text-[23px] leading-none">→</span>
                            ) : null}
                        </button>
                    </>
                ) : (
                    <div className="mt-5 rounded-[16px] border border-[#dce9f4] bg-white p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <span className="grid size-10 place-items-center rounded-[10px] bg-[#e9f5ff] text-[#087df5]">
                                    <WalletCards size={18} />
                                </span>
                                <strong className="text-[19px] font-extrabold text-[#0d1730]">
                                    Pay with cryptocurrency
                                </strong>
                            </div>

                            <button
                                type="button"
                                onClick={onChangeCurrency}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-[9px] border border-[#cfe0ef] bg-white px-4 text-[12px] font-bold text-[#111a31] transition hover:border-[#8ac3ff] hover:text-[#087df5]"
                            >
                                <ArrowLeftRight size={14} />
                                Change currency
                            </button>
                        </div>

                        <div className="mt-4 grid overflow-hidden rounded-[11px] bg-gradient-to-r from-[#f2f9ff] to-[#eef7ff] sm:grid-cols-3">
                            <div className="px-4 py-4">
                                <span className="block text-[12px] text-[#6c81a4]">Network</span>
                                <strong className="mt-1 block text-[16px] text-[#121a30]">
                                    {selectedCurrency?.network ||
                                        selectedCurrency?.ticker ||
                                        'Selected network'}
                                </strong>
                            </div>
                            <div className="border-t border-[#dce8f3] px-4 py-4 sm:border-l sm:border-t-0">
                                <span className="block text-[12px] text-[#6c81a4]">
                                    Network fee
                                </span>
                                <strong className="mt-1 block text-[14px] leading-5 text-[#121a30]">
                                    Included by blockchain
                                </strong>
                            </div>
                            <div className="border-t border-[#dce8f3] px-4 py-4 sm:border-l sm:border-t-0">
                                <span className="block text-[12px] text-[#6c81a4]">
                                    Payment note
                                </span>
                                <strong className="mt-1 block text-[14px] leading-5 text-[#121a30]">
                                    No extra {siteName} fee
                                </strong>
                            </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-4 rounded-[11px] bg-gradient-to-r from-[#f3f9ff] to-[#eef8ff] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <span className="text-[11px] font-semibold uppercase tracking-[.16em] text-[#7186a8]">
                                    Send exactly
                                </span>
                                <strong className="mt-1 block break-words text-[30px] font-black tracking-[-0.035em] text-[#09132b]">
                                    {data.payAmount || '—'} {data.payCurrency?.toUpperCase()}
                                    {selectedCurrency?.network
                                        ? ` (${selectedCurrency.network.toUpperCase()})`
                                        : ''}
                                </strong>
                            </div>

                            {selectedCurrency ? (
                                <div className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-[#d9e8f5]">
                                    {selectedCurrency.logoUrl ? (
                                        <img
                                            src={selectedCurrency.logoUrl}
                                            alt=""
                                            className="size-8 rounded-full object-contain"
                                        />
                                    ) : (
                                        <span className="grid size-8 place-items-center rounded-full bg-[#eef3f8] text-[10px] font-black">
                                            {selectedCurrency.ticker.slice(0, 4)}
                                        </span>
                                    )}
                                    <span className="text-[12px] font-bold text-[#24426f]">
                                        {selectedCurrency.ticker}
                                        {selectedCurrency.network
                                            ? ` (${selectedCurrency.network.toUpperCase()})`
                                            : ''}
                                    </span>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[170px_minmax(0,1fr)]">
                            <div className="rounded-[11px] bg-[#f8fbfe] p-3 text-center">
                                {data.payAddress && qrDataUrl ? (
                                    <img
                                        src={qrDataUrl}
                                        alt="QR code for payment address"
                                        className="mx-auto w-full max-w-[145px] rounded-[8px] bg-white p-1"
                                    />
                                ) : (
                                    <div className="grid aspect-square place-items-center rounded-[8px] bg-white text-[#91a3bd]">
                                        <QrCode size={48} />
                                    </div>
                                )}
                                <small className="mt-2 block text-[11px] text-[#7890b0]">
                                    Scan with your crypto wallet
                                </small>
                            </div>

                            <div className="flex min-w-0 flex-col gap-3">
                                <div className="rounded-[11px] border border-[#dce8f3] bg-white p-4">
                                    <span className="text-[11px] text-[#7a8dab]">
                                        Payment address
                                    </span>
                                    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <code className="min-w-0 flex-1 break-all text-[12px] text-[#1b3158]">
                                            {data.payAddress || '—'}
                                        </code>
                                        {data.payAddress ? (
                                            <button
                                                type="button"
                                                onClick={() => onCopy(data.payAddress!)}
                                                className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-[8px] border border-[#d7e4ef] px-4 text-[12px] font-bold text-[#17233b]"
                                            >
                                                <Copy size={14} />
                                                Copy
                                            </button>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-[11px] bg-amber-50 px-4 py-3 text-amber-700">
                                    <Clock3 size={20} className="shrink-0" />
                                    <div>
                                        <span className="block text-[11px]">Payment window</span>
                                        <strong className="text-[20px] leading-none">
                                            {expiresAt &&
                                            now != null &&
                                            new Date(expiresAt).getTime() <= now
                                                ? 'Expired'
                                                : remainingLabel(expiresAt, now) || 'Checking…'}
                                        </strong>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PaymentShell>
    );
}
