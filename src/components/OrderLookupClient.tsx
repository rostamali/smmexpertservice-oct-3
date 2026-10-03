'use client';

import { useState } from 'react';
import { Search, ShieldCheck } from 'lucide-react';

type OrderLookupItem = {
    id: number;
    title: string;
    variantLabel: string;
    quantity: number;
    packageQuantity: number | null;
    packageUnit: string | null;
};
type OrderLookupResult = {
    orderNumber: string;
    status: string;
    total: string;
    createdAt: string;
    items: OrderLookupItem[];
};
type OrderLookupError = { error?: string };
const isOrderLookupResult = (
    data: OrderLookupResult | OrderLookupError,
): data is OrderLookupResult => 'orderNumber' in data && 'items' in data;

export default function OrderLookupClient() {
    const [orderNumber, setOrderNumber] = useState('');
    const [email, setEmail] = useState('');
    const [result, setResult] = useState<OrderLookupResult | null>(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const lookup = async () => {
        if (loading) return;
        const normalizedOrderNumber = orderNumber
            .trim()
            .replace(/^#+\s*/, '')
            .replace(/^NX-/i, '');
        setLoading(true);
        setMessage('');
        setResult(null);
        try {
            const response = await fetch(
                `/api/orders/lookup?orderNumber=${encodeURIComponent(normalizedOrderNumber)}&email=${encodeURIComponent(email)}`,
            );
            const data: OrderLookupResult | OrderLookupError = await response.json();
            if (!response.ok || !isOrderLookupResult(data)) {
                setMessage(('error' in data && data.error) || 'Order not found.');
                return;
            }
            setResult(data);
        } catch {
            setMessage('Unable to look up this order right now.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'h-12 w-full rounded-md border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
    return (
        <div className="mx-auto max-w-[760px] pt-[30px] xl:pt-[60px] pb-[80px] px-[20px] xl:px-0">
            <div className="text-center">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-site-primary">
                    Order lookup
                </span>
                <h1 className="mt-3 max-w-2xl mx-auto page__title text-center">
                    Find your order in seconds.
                </h1>
                <p className="mx-auto mt-4 max-w-xl text-center text-[14px] text-site-body-font">
                    Enter the order number and checkout email to view the latest status and ordered
                    items.
                </p>
            </div>
            <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_4px_rgba(10,22,94,.08)] sm:p-8">
                <h2 className="text-xl font-bold text-slate-950">Track order</h2>
                <div className="mt-5 grid gap-4">
                    <label className="grid gap-2 text-sm font-semibold text-slate-950">
                        Order number
                        <input
                            value={orderNumber}
                            onChange={(event) => setOrderNumber(event.target.value)}
                            placeholder="20260902-ABC123"
                            className={inputClass}
                        />
                    </label>
                    <label className="grid gap-2 text-sm font-semibold text-slate-950">
                        Checkout email
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            className={inputClass}
                        />
                    </label>
                    <button
                        type="button"
                        onClick={() => void lookup()}
                        disabled={loading}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-blue-500 px-5 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-50"
                    >
                        {loading ? (
                            'Finding…'
                        ) : (
                            <>
                                Find order <Search size={14} />
                            </>
                        )}
                    </button>
                    {message ? (
                        <div className="rounded-md bg-rose-50 px-4 py-3 text-sm text-rose-700">
                            {message}
                        </div>
                    ) : null}
                    {result ? (
                        <div className="rounded-xl bg-slate-50 p-5">
                            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-950">
                                <ShieldCheck size={15} className="text-blue-500" /> Order #
                                {result.orderNumber}
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="rounded-lg bg-white p-3">
                                    <span className="text-xs uppercase tracking-[.12em] text-slate-500">
                                        Status
                                    </span>
                                    <strong className="mt-1 block text-sm text-slate-950">
                                        {result.status}
                                    </strong>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <span className="text-xs uppercase tracking-[.12em] text-slate-500">
                                        Total
                                    </span>
                                    <strong className="mt-1 block text-sm text-slate-950">
                                        ${result.total}
                                    </strong>
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                {result.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm"
                                    >
                                        <span className="text-slate-600">
                                            {item.title} ×{' '}
                                            {item.packageQuantity
                                                ? `${item.packageQuantity} ${item.packageUnit || 'Unit'}`
                                                : item.quantity}
                                        </span>
                                        <strong className="text-right text-slate-950">
                                            {item.variantLabel}
                                        </strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
