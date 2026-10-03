'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, X } from 'lucide-react';
import { FAKE_ORDER_NAMES, FAKE_ORDER_SETTINGS } from '@/config/fake-orders';

type ProductFallback = {
    name: string;
    accountName?: string | null;
};

type OrderNotice = {
    id: string;
    buyer: string;
    accountName: string;
    productName: string;
    createdAt: string;
    fake: boolean;
};

const relativeTime = (date: string) => {
    const diff = Math.max(0, Date.now() - new Date(date).getTime());
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? '' : 's'} ago`;
};

const createFallbackOrders = (products: ProductFallback[]): OrderNotice[] => {
    if (!products.length || !FAKE_ORDER_SETTINGS.enabled) return [];
    const max = Math.min(FAKE_ORDER_SETTINGS.maxGeneratedOrders, FAKE_ORDER_NAMES.length);
    const now = Date.now();
    const offset = Math.floor(Math.random() * FAKE_ORDER_NAMES.length);

    return Array.from({ length: max }, (_, index) => {
        const product = products[(offset + index) % products.length];
        const buyer = FAKE_ORDER_NAMES[(offset + index) % FAKE_ORDER_NAMES.length];
        return {
            id: `sample-${index}`,
            buyer,
            accountName: product.accountName || FAKE_ORDER_SETTINGS.defaultAccountName,
            productName: product.name,
            createdAt: new Date(now - (index + 2) * 11 * 60_000).toISOString(),
            fake: true,
        };
    });
};

export default function RecentPurchaseNotice({
    fallbackProducts = [],
}: {
    fallbackProducts?: ProductFallback[];
}) {
    const [items, setItems] = useState<OrderNotice[]>([]);
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const fallbackKey = fallbackProducts
        .map((product) => `${product.accountName || ''}:${product.name}`)
        .join('|');

    useEffect(() => {
        let active = true;

        if (FAKE_ORDER_SETTINGS.enabled && FAKE_ORDER_SETTINGS.mode === 'generated') {
            setItems(createFallbackOrders(fallbackProducts));
            return () => {
                active = false;
            };
        }

        void fetch('/api/store/recent-purchases', { cache: 'no-store' })
            .then((response) => response.json())
            .then((body) => {
                if (!active) return;
                const realItems = Array.isArray(body.items) ? body.items : [];
                if (realItems.length) {
                    setItems(
                        realItems.map(
                            (
                                item: {
                                    id?: number | string;
                                    email?: string;
                                    productName?: string;
                                    createdAt?: string;
                                    accountName?: string | null;
                                },
                                realIndex: number,
                            ) => ({
                                id: String(item.id ?? `real-${realIndex}`),
                                buyer: String(item.email || 'Customer').split('@')[0] || 'Customer',
                                accountName:
                                    item.accountName || FAKE_ORDER_SETTINGS.defaultAccountName,
                                productName: item.productName || 'Product',
                                createdAt: item.createdAt || new Date().toISOString(),
                                fake: false,
                            }),
                        ),
                    );
                    return;
                }
                setItems(createFallbackOrders(fallbackProducts));
            })
            .catch(() => {
                if (!active) return;
                setItems(createFallbackOrders(fallbackProducts));
            });

        return () => {
            active = false;
        };
    }, [fallbackKey]);

    useEffect(() => {
        if (!items.length || dismissed) return;
        const first = window.setTimeout(() => setVisible(true), FAKE_ORDER_SETTINGS.firstDelayMs);
        const rotate = window.setInterval(() => {
            setVisible(false);
            window.setTimeout(() => {
                setIndex((current) => (current + 1) % items.length);
                setVisible(true);
            }, FAKE_ORDER_SETTINGS.transitionMs);
        }, FAKE_ORDER_SETTINGS.rotateEveryMs);

        return () => {
            window.clearTimeout(first);
            window.clearInterval(rotate);
        };
    }, [items, dismissed]);

    const current = useMemo(() => items[index] || null, [items, index]);
    if (!current || dismissed) return null;

    const maskedBuyer = `${current.buyer}${FAKE_ORDER_SETTINGS.buyerMask}`;

    return (
        <div
            className={`fixed hidden bottom-4 left-4 z-[70] w-[calc(100%-2rem)] max-w-[360px] transition-all duration-300 sm:bottom-6 sm:left-6 ${visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'}`}
        >
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_16px_45px_rgba(10,22,94,.12)] backdrop-blur-xl">
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
                    aria-label="Dismiss order notification"
                >
                    <X size={13} />
                </button>
                <div className="flex items-start gap-3 pr-7">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-slate-50 text-blue-500">
                        <ShoppingBag size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-950">
                            {maskedBuyer}
                            {FAKE_ORDER_SETTINGS.titleSuffix}
                        </p>
                        <p className="mt-1 truncate text-xs font-medium text-slate-600">
                            {current.accountName} / {current.productName}
                        </p>
                        <span className="mt-1.5 block text-[11px] text-slate-500">
                            {relativeTime(current.createdAt)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
