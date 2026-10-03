'use client';

import { LockKeyhole, ShoppingCart, Zap } from 'lucide-react';
import { money } from '@/lib/money';
import { useProductPurchase } from './ProductPurchaseProvider';

export default function ProductPurchaseSummary() {
    const {
        product,
        currency,
        notice,
        variationSelectionComplete,
        isComplete,
        variant,
        effectiveStock,
        selectedPackage,
        resolvedVariantLabel,
        packageFieldLabel,
        effectivePrice,
        total,
        canPurchase,
        addToCart,
        buyNow,
    } = useProductPurchase();

    const priceReady = Boolean(
        variant && (product.productType !== 'VARIABLE_PACKAGE' || selectedPackage),
    );
    // Keep normal variation selections compact (for example: Old / USA).
    // Package is intentionally rendered as its own row below Availability.
    const selectedText = resolvedVariantLabel || '';

    const selectedFallback =
        variationSelectionComplete && isComplete && !variant
            ? 'Combination unavailable'
            : 'Choose all options';
    const availability = variant
        ? effectiveStock == null
            ? 'In stock'
            : effectiveStock > 0
              ? `${effectiveStock} available`
              : 'Out of stock'
        : '—';
    const availabilityClassName =
        availability === 'Out of stock'
            ? 'text-rose-600'
            : availability === '—'
              ? 'text-slate-950'
              : 'text-emerald-600';

    return (
        <div className="single__product-summary">
            <div className="grid gap-5 text-sm">
                <SummaryRow label="Selected" value={selectedText || selectedFallback} multiline />
                <SummaryRow
                    label="Unit price"
                    value={priceReady ? money(effectivePrice, currency) : '—'}
                />
                <SummaryRow
                    label="Availability"
                    value={availability}
                    valueClassName={availabilityClassName}
                />
                {product.productType === 'VARIABLE_PACKAGE' ? (
                    <SummaryRow
                        label={cleanSelectionLabel(packageFieldLabel || 'Quantity')}
                        value={
                            selectedPackage
                                ? `${selectedPackage.quantity} ${product.packageUnitLabel}`.trim()
                                : '—'
                        }
                        multiline
                    />
                ) : null}
            </div>

            <div className="mt-4 flex items-end justify-between gap-4 border-t border-site-light-border pt-4">
                <span className="text-sm font-semibold text-slate-600">Total</span>
                <strong className="text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
                    {priceReady ? money(total, currency) : '—'}
                </strong>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-[12px]">
                <button
                    type="button"
                    onClick={addToCart}
                    disabled={!canPurchase}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 transition hover:border-blue-200 hover:text-blue-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <ShoppingCart size={17} /> Add to Cart
                </button>
                <button
                    type="button"
                    onClick={buyNow}
                    disabled={!canPurchase}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[10px] bg-blue-500 px-4 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <Zap size={17} /> Buy Now
                </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] font-medium text-slate-500">
                <LockKeyhole size={13} /> Secure checkout · 100% safe & encrypted
            </div>

            {notice ? <PurchaseNotice notice={notice} /> : null}
        </div>
    );
}

function cleanSelectionLabel(label: string) {
    return (
        label
            .replace(/^select\s+/i, '')
            .replace(/:\s*$/, '')
            .trim() || 'Option'
    );
}

function SummaryRow({
    label,
    value,
    multiline = false,
    valueClassName = 'text-slate-950',
}: {
    label: string;
    value: string;
    multiline?: boolean;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="shrink-0 text-slate-600">{label}</span>
            <strong
                className={`${multiline ? 'max-w-[68%] text-right leading-5' : 'text-right'} ${valueClassName}`}
            >
                {value}
            </strong>
        </div>
    );
}

function PurchaseNotice({ notice, compact = false }: { notice: string; compact?: boolean }) {
    const success = notice.includes('added');
    return (
        <div
            className={`${compact ? 'mt-2 px-2.5 py-1.5 text-[11px]' : 'mt-3 px-3 py-2.5 text-sm'} rounded-[9px] border ${
                success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                    : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
        >
            {notice}
        </div>
    );
}
