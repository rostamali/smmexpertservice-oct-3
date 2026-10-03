'use client';

import { Check, CircleHelp, X } from 'lucide-react';
import { useState } from 'react';

export type PaymentGatewayPresentation = {
    key: string;
    name: string;
    groupName: string;
    description: string | null;
    checkoutTitle: string;
    checkoutDescription: string | null;
    imageUrl?: string | null;
    helpImageUrl?: string | null;
    helpTitle?: string | null;
    helpText?: string | null;
    currency: string | null;
    taxEnabled: boolean;
    taxPercent: number;
    discountEnabled: boolean;
    discountPercent: number;
    discountMinimumSpend: number;
};

export function PaymentMethodSelector({
    gateways,
    selectedKey,
    onSelect,
    adjustmentLabel,
}: {
    gateways: PaymentGatewayPresentation[];
    selectedKey: string;
    onSelect: (gateway: PaymentGatewayPresentation) => void;
    adjustmentLabel: (gateway: PaymentGatewayPresentation) => string;
}) {
    const [helpGateway, setHelpGateway] = useState<PaymentGatewayPresentation | null>(null);
    return (
        <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {gateways.map((gateway) => {
                    const selected = selectedKey === gateway.key;
                    return (
                        <div
                            key={gateway.key}
                            className={`relative overflow-hidden rounded-[15px] border transition ${selected ? 'border-site-primary ring ring-site-primary bg-slate-50' : 'border-slate-200 hover:border-blue-200 bg-white'}`}
                        >
                            <button
                                type="button"
                                onClick={() => onSelect(gateway)}
                                className={`w-full p-4 text-left`}
                            >
                                <div className="flex items-start gap-3">
                                    {gateway.imageUrl ? (
                                        <span className="grid h-12 w-16 shrink-0 place-items-center rounded-[10px] border border-slate-100 bg-white p-1.5">
                                            <img
                                                src={gateway.imageUrl}
                                                alt=""
                                                className="max-h-full max-w-full object-contain"
                                            />
                                        </span>
                                    ) : (
                                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-blue-50 text-base font-bold text-site-primary">
                                            {(gateway.checkoutTitle || gateway.name)
                                                .slice(0, 1)
                                                .toUpperCase()}
                                        </span>
                                    )}
                                    <span className="min-w-0 flex-1">
                                        <strong className="block text-sm font-bold text-site-heading-font">
                                            {gateway.checkoutTitle || gateway.name}
                                        </strong>
                                        <span className="mt-1 block text-xs leading-5 text-site-body-font">
                                            {gateway.checkoutDescription ||
                                                gateway.description ||
                                                'Secure payment method'}
                                        </span>
                                        {gateway.discountEnabled || gateway.taxEnabled ? (
                                            <span className="mt-2 block text-xs font-bold text-site-primary">
                                                {adjustmentLabel(gateway)}
                                            </span>
                                        ) : null}
                                    </span>
                                    <span
                                        className={`grid h-5 w-5 shrink-0 place-items-center rounded-[8px] border ${selected ? 'border-site-primary bg-site-primary text-white' : 'border-slate-300'}`}
                                    >
                                        {selected ? <Check size={12} /> : null}
                                    </span>
                                </div>
                            </button>
                            {gateway.helpImageUrl ? (
                                <button
                                    type="button"
                                    onClick={() => setHelpGateway(gateway)}
                                    className="absolute bottom-2.5 right-3 inline-flex items-center gap-1 text-[11px] font-semibold text-site-primary hover:underline"
                                >
                                    <CircleHelp size={12} />
                                    Help
                                </button>
                            ) : null}
                        </div>
                    );
                })}
            </div>
            {helpGateway ? (
                <div
                    className="fixed inset-0 z-[100] grid place-items-center bg-slate-950/55 p-4"
                    role="dialog"
                    aria-modal="true"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setHelpGateway(null);
                    }}
                >
                    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-5">
                            <div>
                                <h3 className="text-lg font-bold text-site-heading-font">
                                    {helpGateway.helpTitle ||
                                        `${helpGateway.checkoutTitle || helpGateway.name} payment help`}
                                </h3>
                                {helpGateway.helpText ? (
                                    <p className="mt-1 text-sm leading-6 text-site-body-font">
                                        {helpGateway.helpText}
                                    </p>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                onClick={() => setHelpGateway(null)}
                                className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600"
                            >
                                <X size={17} />
                            </button>
                        </div>
                        <div className="max-h-[72vh] overflow-auto bg-slate-50 p-4">
                            <img
                                src={helpGateway.helpImageUrl!}
                                alt={`${helpGateway.checkoutTitle || helpGateway.name} payment help`}
                                className="mx-auto max-h-[68vh] max-w-full rounded-xl bg-white object-contain shadow-sm"
                            />
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
}
