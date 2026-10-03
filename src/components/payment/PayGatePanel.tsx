'use client';

import { Globe2, Info, Loader2, LockKeyhole } from 'lucide-react';

import { money } from '@/lib/money';
import type { InitialPayment, PayGateProvider } from './types';
import ShadcnPaymentCombobox from './ShadcnPaymentCombobox';
import PaymentShell from './PaymentShell';

type PayGateProps = {
    data: InitialPayment;
    providers: PayGateProvider[];
    loading: boolean;
    selectedProviderId: string;
    onSelectProvider: (value: string) => void;
    starting: string | null;
    onStart: (provider: PayGateProvider) => void;
    siteName: string;
};

const providerDescription = (provider: PayGateProvider) => {
    const name = `${provider.displayName || provider.name}`.toLowerCase();

    if (name.includes('stripe')) return 'Credit/Debit Card, Apple Pay, Google Pay and more';
    if (name.includes('paypal')) return 'Pay with your PayPal account or card';
    if (name.includes('coinbase')) return 'Pay with cryptocurrency';
    if (name.includes('binance')) return 'Pay with Binance account';
    if (name.includes('perfect money')) return 'Pay with Perfect Money account';

    return `Pay with ${provider.displayName || provider.name}`;
};

export default function PayGatePanel({
    data,
    providers,
    loading,
    selectedProviderId,
    onSelectProvider,
    starting,
    onStart,
    siteName,
}: PayGateProps) {
    const selectedProvider =
        providers.find((provider) => provider.id === selectedProviderId) || null;
    const isStarting = Boolean(starting);

    const providerOption = (provider: PayGateProvider) => (
        <span className="flex min-w-0 items-center gap-3">
            {provider.imageUrl ? (
                <img
                    src={provider.imageUrl}
                    alt=""
                    className="size-10 shrink-0 rounded-[9px] bg-white object-contain"
                />
            ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-[9px] bg-[#eef4fa] text-[14px] font-black text-[#087df5]">
                    {(provider.displayName || provider.name).slice(0, 1).toUpperCase()}
                </span>
            )}

            <span className="min-w-0 flex-1">
                <strong className="block truncate text-[14px] font-extrabold text-[#111a31]">
                    {provider.displayName || provider.name}
                </strong>
                <small
                    className={`mt-0.5 block truncate text-[12px] ${
                        provider.available ? 'text-[#667da2]' : 'text-rose-600'
                    }`}
                >
                    {provider.available
                        ? providerDescription(provider)
                        : provider.reason || 'Unavailable in your region'}
                </small>
            </span>
        </span>
    );

    return (
        <PaymentShell siteName={siteName} data={data} mode="paygate">
            <div className="pt-3">
                <span className="text-[13px] font-extrabold uppercase tracking-[.03em] text-[#087df5]">
                    Secure Checkout
                </span>

                <h1 className="mt-2 text-[34px] font-black leading-[1.06] tracking-[-0.045em] text-[#071129] sm:text-[40px]">
                    Complete your payment
                </h1>

                <p className="mt-2 text-[19px] font-medium text-[#6a7fa2]">
                    Order #{data.orderNumber}
                </p>

                <p className="mt-2 max-w-[650px] text-[15px] leading-6 text-[#64799d]">
                    Choose a payment provider below to complete your order. You'll be redirected to
                    a secure payment page to finish the payment.
                </p>

                <div className="mt-5 flex items-center gap-4 rounded-[12px] border border-[#deebf6] bg-gradient-to-r from-[#eff8ff] to-[#eaf5ff] px-5 py-4">
                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[#d9edff] text-[#087df5]">
                        <Globe2 size={23} />
                    </span>
                    <div className="min-w-0 flex-1">
                        <strong className="block text-[15px] font-extrabold text-[#101a33]">
                            Payment options may vary by country or region.
                        </strong>
                        <p className="mt-0.5 text-[12px] text-[#657a9f]">
                            Available payment providers depend on your location.
                        </p>
                    </div>
                    <Info size={20} className="shrink-0 text-[#589ff3]" />
                </div>

                <div className="mt-5">
                    <h2 className="text-[20px] font-extrabold tracking-[-0.025em] text-[#0a132c]">
                        Select a payment provider
                    </h2>
                    <p className="mt-1 text-[13px] leading-5 text-[#667da2]">
                        Choose a provider first, then click Pay Now to create the secure payment
                        session.
                    </p>
                </div>

                <div className="mt-3">
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
                    ) : providers.length ? (
                        <ShadcnPaymentCombobox
                            value={selectedProviderId}
                            onValueChange={onSelectProvider}
                            placeholder="Select payment provider"
                            searchPlaceholder="Search payment provider"
                            emptyText="No payment provider is available."
                            ariaLabel="Payment provider"
                            disabled={isStarting}
                            options={providers.map((provider) => ({
                                value: provider.id,
                                keywords: `${provider.displayName || provider.name} ${provider.name} ${provider.id} ${provider.checkoutCurrency}`,
                                content: providerOption(provider),
                                selectedContent: providerOption(provider),
                                disabled: !provider.available,
                            }))}
                        />
                    ) : (
                        <div className="rounded-[12px] border border-[#dce8f3] bg-[#f8fbfe] p-7 text-center">
                            <strong className="block text-[#111a31]">No active method found</strong>
                            <p className="mt-1 text-sm text-[#667da2]">
                                {data.gatewayLabel} did not return an active payment provider.
                            </p>
                        </div>
                    )}
                </div>

                {selectedProvider?.available ? (
                    <div className="mt-3 rounded-[11px] border border-[#dbe8f3] bg-[#f7fbff] px-4 py-3">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-[12px] text-[#667da2]">Checkout amount</span>
                            <strong className="text-[14px] text-[#111a31]">
                                {money(
                                    selectedProvider.checkoutAmount,
                                    selectedProvider.checkoutCurrency,
                                )}
                            </strong>
                        </div>
                        {selectedProvider.converted ? (
                            <p className="mt-1 text-[11px] leading-5 text-[#7185a5]">
                                Converted from{' '}
                                {money(
                                    selectedProvider.sourceAmount,
                                    selectedProvider.sourceCurrency,
                                )}{' '}
                                for this provider.
                            </p>
                        ) : null}
                    </div>
                ) : null}

                <button
                    type="button"
                    disabled={!selectedProvider || !selectedProvider.available || isStarting}
                    onClick={() => selectedProvider && onStart(selectedProvider)}
                    className="mt-3 inline-flex h-[56px] w-full items-center justify-center gap-3 rounded-[10px] bg__gradient-primary px-6 text-[16px] font-bold text-white shadow-[0_10px_24px_rgba(0,112,247,.18)] transition hover:brightness-[1.03] disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isStarting ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <LockKeyhole size={17} />
                    )}
                    {isStarting ? 'Creating secure payment…' : 'Pay Now'}
                    {!isStarting ? (
                        <span className="ml-auto text-[23px] leading-none">→</span>
                    ) : null}
                </button>
            </div>
        </PaymentShell>
    );
}
