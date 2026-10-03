'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { trackGooglePurchase } from '@/lib/analytics-client';

import PaymentStatusScreen from './PaymentStatusScreen';
import NowPaymentsPanel from './NowPaymentsPanel';
import PayGatePanel from './PayGatePanel';
import type { InitialPayment, NowPaymentCurrency, PayGateProvider } from './types';
import { terminalStatuses } from './types';

export default function PaymentPageClient({
    initial,
    siteName,
}: {
    initial: InitialPayment;
    siteName: string;
}) {
    const [data, setData] = useState(initial);
    const [currencies, setCurrencies] = useState<NowPaymentCurrency[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState(
        initial.externalId ? initial.payCurrency || '' : '',
    );
    const [loadingCurrencies, setLoadingCurrencies] = useState(
        initial.gatewayKey === 'NOWPAYMENTS' && !terminalStatuses.includes(initial.paymentStatus),
    );
    const [choosingNowCurrency, setChoosingNowCurrency] = useState(!initial.externalId);
    const [creatingNowPayment, setCreatingNowPayment] = useState(false);
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [expiresAt, setExpiresAt] = useState<string | null>(
        initial.gatewayKey === 'NOWPAYMENTS' && initial.externalId
            ? initial.paymentExpiresAt
            : null,
    );
    const initialServerNow = Date.parse(initial.serverNow || '');
    const [serverOffsetMs, setServerOffsetMs] = useState(
        Number.isFinite(initialServerNow) ? initialServerNow - Date.now() : 0,
    );
    const [now, setNow] = useState<number | null>(null);
    const [providers, setProviders] = useState<PayGateProvider[]>([]);
    const [selectedProviderId, setSelectedProviderId] = useState('');
    const [loadingProviders, setLoadingProviders] = useState(
        initial.gatewayKey === 'PAYGATE' && !terminalStatuses.includes(initial.paymentStatus),
    );
    const [startingProvider, setStartingProvider] = useState<string | null>(null);

    useEffect(() => {
        if (data.paymentStatus === 'PAID')
            trackGooglePurchase({
                transactionId: data.orderNumber,
                value: Number(data.total),
                currency: data.currency,
            });
    }, [data.paymentStatus, data.orderNumber, data.total, data.currency]);
    useEffect(() => {
        const tick = () => setNow(Date.now() + serverOffsetMs);
        tick();
        const timer = setInterval(tick, 1000);
        return () => clearInterval(timer);
    }, [serverOffsetMs]);

    const syncServerClock = (value: unknown) => {
        if (typeof value !== 'string') return;
        const parsed = Date.parse(value);
        if (Number.isFinite(parsed)) setServerOffsetMs(parsed - Date.now());
    };

    useEffect(() => {
        if (data.gatewayKey !== 'NOWPAYMENTS' || terminalStatuses.includes(data.paymentStatus))
            return;
        let active = true;
        setLoadingCurrencies(true);
        void fetch('/api/payments/nowpayments/currencies', { cache: 'no-store' })
            .then(async (response) => {
                const body = await response.json();
                if (!response.ok) throw new Error(body.error || 'Could not load currencies.');
                const raw = Array.isArray(body.currencies) ? body.currencies : [];
                const list: NowPaymentCurrency[] = raw
                    .map((item: unknown) => {
                        const record =
                            item && typeof item === 'object'
                                ? (item as Record<string, unknown>)
                                : {};
                        const availableForPayment =
                            record.availableForPayment === true ||
                            record.available_for_payment === true;
                        const availableForPayout =
                            record.availableForPayout === true ||
                            record.available_for_payout === true;
                        return {
                            code: String(record.code || ''),
                            ticker: String(record.ticker || record.code || '').toUpperCase(),
                            name: String(record.name || record.code || ''),
                            network: record.network ? String(record.network) : null,
                            logoUrl: record.logoUrl ? String(record.logoUrl) : null,
                            availableForPayment,
                            availableForPayout,
                        };
                    })
                    .filter(
                        (item: NowPaymentCurrency) =>
                            item.code && item.availableForPayment && item.availableForPayout,
                    );
                if (!active) return;
                setCurrencies(list);
                // Do not auto-select the first cryptocurrency. Keep an existing valid
                // selection (for an already-created payment); otherwise show the
                // "Select Cryptocurrency" placeholder until the customer chooses one.
                setSelectedCurrency((current) =>
                    list.some((item) => item.code === current) ? current : '',
                );
            })
            .catch((error) =>
                toast.error(
                    error instanceof Error
                        ? error.message
                        : 'Could not load available cryptocurrencies.',
                ),
            )
            .finally(() => active && setLoadingCurrencies(false));
        return () => {
            active = false;
        };
    }, [data.gatewayKey, data.paymentStatus]);

    useEffect(() => {
        if (data.gatewayKey !== 'PAYGATE' || terminalStatuses.includes(data.paymentStatus)) return;
        let active = true;
        setLoadingProviders(true);
        void fetch(
            `/api/payments/paygate/providers?orderNumber=${encodeURIComponent(data.orderNumber)}`,
            { cache: 'no-store' },
        )
            .then(async (response) => {
                const body = await response.json();
                if (!response.ok) throw new Error(body.error || 'Could not load payment methods.');
                if (active) {
                    const list = Array.isArray(body.items) ? (body.items as PayGateProvider[]) : [];
                    setProviders(list);
                    setSelectedProviderId((current) =>
                        list.some((item) => item.id === current && item.available) ? current : '',
                    );
                }
            })
            .catch((error) =>
                toast.error(
                    error instanceof Error ? error.message : 'Could not load payment methods.',
                ),
            )
            .finally(() => active && setLoadingProviders(false));
        return () => {
            active = false;
        };
    }, [data.gatewayKey, data.orderNumber, data.paymentStatus]);

    useEffect(() => {
        if (!data.payAddress) {
            setQrDataUrl('');
            return;
        }
        let active = true;
        void import('qrcode')
            .then((QRCode) =>
                QRCode.toDataURL(data.payAddress!, {
                    width: 260,
                    margin: 1,
                    errorCorrectionLevel: 'M',
                }),
            )
            .then((url) => active && setQrDataUrl(url))
            .catch(() => active && setQrDataUrl(''));
        return () => {
            active = false;
        };
    }, [data.payAddress]);

    useEffect(() => {
        if (
            data.gatewayKey !== 'NOWPAYMENTS' ||
            !data.externalId ||
            terminalStatuses.includes(data.paymentStatus)
        )
            return;
        const refresh = () =>
            void fetch(
                `/api/payments/nowpayments/status?orderNumber=${encodeURIComponent(data.orderNumber)}`,
                { cache: 'no-store' },
            )
                .then(async (response) => {
                    const body = await response.json();
                    if (response.ok) {
                        syncServerClock(body.serverNow);
                        setData((current) => ({ ...current, ...body }));
                        if (Object.prototype.hasOwnProperty.call(body, 'expiresAt'))
                            setExpiresAt(body.expiresAt || null);
                    }
                })
                .catch(() => undefined);
        const timer = setInterval(refresh, 8000);
        return () => clearInterval(timer);
    }, [data.gatewayKey, data.externalId, data.orderNumber, data.paymentStatus]);

    useEffect(() => {
        if (
            data.gatewayKey !== 'NOWPAYMENTS' ||
            !data.externalId ||
            !expiresAt ||
            now == null ||
            terminalStatuses.includes(data.paymentStatus)
        )
            return;
        if (now < new Date(expiresAt).getTime()) return;
        let active = true;
        void fetch(
            `/api/payments/nowpayments/status?orderNumber=${encodeURIComponent(data.orderNumber)}`,
            { cache: 'no-store' },
        )
            .then(async (response) => {
                const body = await response.json();
                if (response.ok && active) {
                    syncServerClock(body.serverNow);
                    setData((current) => ({ ...current, ...body }));
                    if (Object.prototype.hasOwnProperty.call(body, 'expiresAt'))
                        setExpiresAt(body.expiresAt || null);
                }
            })
            .catch(() => undefined);
        return () => {
            active = false;
        };
    }, [data.gatewayKey, data.externalId, data.orderNumber, data.paymentStatus, expiresAt, now]);

    const copy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success('Payment address copied.');
        } catch {
            toast.error('Could not copy payment address.');
        }
    };
    const createNowPayment = async () => {
        if (!selectedCurrency) return toast.error('Choose a cryptocurrency.');
        setCreatingNowPayment(true);
        try {
            const replaceExisting = Boolean(
                data.externalId &&
                String(data.payCurrency || '').toLowerCase() !== selectedCurrency.toLowerCase(),
            );
            const response = await fetch('/api/payments/nowpayments/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderNumber: data.orderNumber,
                    payCurrency: selectedCurrency,
                    replaceExisting,
                }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error || 'Could not create payment.');
            syncServerClock(body.serverNow);
            setData((current) => ({ ...current, ...body }));
            setExpiresAt(body.expiresAt || null);
            setChoosingNowCurrency(false);
            toast.success(
                replaceExisting
                    ? 'Currency changed. New payment details are ready.'
                    : 'Payment details are ready.',
            );
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not create payment.');
        } finally {
            setCreatingNowPayment(false);
        }
    };
    const startPayGate = async (provider: PayGateProvider) => {
        if (!provider.available) return;
        setStartingProvider(provider.id);
        try {
            const response = await fetch('/api/payments/paygate/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber: data.orderNumber, provider: provider.id }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error || 'Could not start payment.');
            if (!body.redirectUrl)
                throw new Error('Payment provider did not return a redirect URL.');
            window.location.assign(body.redirectUrl);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not start payment.');
            setStartingProvider(null);
        }
    };

    if (terminalStatuses.includes(data.paymentStatus)) {
        return <PaymentStatusScreen data={data} siteName={siteName} />;
    }

    return (
        <div className="payment-page">
            {/* Each Payment Panel */}
            {data.gatewayKey === 'NOWPAYMENTS' ? (
                <NowPaymentsPanel
                    siteName={siteName}
                    data={data}
                    currencies={currencies}
                    loading={loadingCurrencies}
                    selected={selectedCurrency}
                    onSelect={setSelectedCurrency}
                    creating={creatingNowPayment}
                    onCreate={() => void createNowPayment()}
                    choosingCurrency={choosingNowCurrency}
                    onChangeCurrency={() => {
                        setSelectedCurrency(
                            data.payCurrency &&
                                currencies.some((item) => item.code === data.payCurrency)
                                ? data.payCurrency
                                : '',
                        );
                        setChoosingNowCurrency(true);
                    }}
                    onCancelChange={() => {
                        setSelectedCurrency(data.payCurrency || '');
                        setChoosingNowCurrency(false);
                    }}
                    qrDataUrl={qrDataUrl}
                    expiresAt={expiresAt}
                    now={now}
                    onCopy={(value) => void copy(value)}
                />
            ) : null}
            {data.gatewayKey === 'PAYGATE' ? (
                <PayGatePanel
                    siteName={siteName}
                    data={data}
                    providers={providers}
                    loading={loadingProviders}
                    selectedProviderId={selectedProviderId}
                    onSelectProvider={setSelectedProviderId}
                    starting={startingProvider}
                    onStart={(provider) => void startPayGate(provider)}
                />
            ) : null}
        </div>
    );
}
