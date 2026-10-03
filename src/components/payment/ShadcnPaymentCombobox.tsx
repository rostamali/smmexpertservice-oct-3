'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { ChevronRight, ChevronUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PaymentComboboxOption = {
    value: string;
    keywords: string;
    content: ReactNode;
    selectedContent?: ReactNode;
    disabled?: boolean;
};

type Props = {
    value: string;
    onValueChange: (value: string) => void;
    options: PaymentComboboxOption[];
    placeholder: string;
    searchPlaceholder: string;
    emptyText: string;
    disabled?: boolean;
    ariaLabel?: string;
};

/**
 * Payment selector used by both Crypto and PayGate.
 *
 * Important:
 * - The selector is intentionally always open to match the payment-page design.
 * - Search stays visible above the list.
 * - Existing value/onValueChange API is unchanged.
 */
export default function ShadcnPaymentCombobox({
    value,
    onValueChange,
    options,
    placeholder,
    searchPlaceholder,
    emptyText,
    disabled = false,
    ariaLabel,
}: Props) {
    const [query, setQuery] = useState('');

    const selected = options.find((option) => option.value === value) || null;

    const filtered = useMemo(() => {
        const normalized = query.trim().toLowerCase();
        if (!normalized) return options;

        return options.filter((option) =>
            `${option.keywords} ${option.value}`.toLowerCase().includes(normalized),
        );
    }, [options, query]);

    return (
        <div
            className={cn(
                'w-full overflow-hidden rounded-[12px] border border-[#83bfff] bg-white shadow-[0_5px_22px_rgba(64,135,204,.05)]',
                disabled && 'opacity-60',
            )}
        >
            <div
                role="combobox"
                aria-expanded="true"
                aria-label={ariaLabel || placeholder}
                className="flex min-h-[56px] w-full items-center justify-between gap-3 border-b border-[#dbe8f4] px-4 py-2.5"
            >
                <span className="min-w-0 flex-1">
                    {selected ? (
                        selected.selectedContent || selected.content
                    ) : (
                        <span className="text-[14px] font-medium text-[#60749a]">
                            {placeholder}
                        </span>
                    )}
                </span>
                <ChevronUp size={19} className="shrink-0 text-[#1c4676]" />
            </div>

            <div className="border-b border-[#e5eef6] p-2.5">
                <label className="relative block">
                    <Search
                        size={16}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#7990af]"
                    />
                    <input
                        type="search"
                        value={query}
                        disabled={disabled}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={searchPlaceholder}
                        className="h-10 w-full rounded-[9px] border border-[#d8e5f0] bg-[#f8fbfe] pl-9 pr-3 text-[13px] text-[#152442] outline-none transition placeholder:text-[#8ea0ba] focus:border-[#82bfff] focus:bg-white focus:ring-2 focus:ring-[#e4f2ff] disabled:cursor-not-allowed"
                    />
                </label>
            </div>

            <div
                role="listbox"
                aria-label={`${ariaLabel || placeholder} options`}
                className="payment-scrollbar max-h-[330px] overflow-y-auto p-1"
            >
                {filtered.length ? (
                    filtered.map((option) => {
                        const active = option.value === value;

                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={active}
                                disabled={disabled || option.disabled}
                                onClick={() => {
                                    if (!disabled && !option.disabled) {
                                        onValueChange(option.value);
                                    }
                                }}
                                className={cn(
                                    'flex min-h-[58px] w-full items-center gap-3 rounded-[9px] px-4 py-2 text-left transition',
                                    active ? 'bg-[#edf6ff]' : 'bg-white hover:bg-[#f7fbff]',
                                    (disabled || option.disabled) &&
                                        'cursor-not-allowed opacity-45',
                                )}
                            >
                                <span className="min-w-0 flex-1">{option.content}</span>
                                <ChevronRight
                                    size={19}
                                    className={cn(
                                        'shrink-0',
                                        active ? 'text-[#087df5]' : 'text-[#58739c]',
                                    )}
                                />
                            </button>
                        );
                    })
                ) : (
                    <div className="px-4 py-8 text-center text-sm text-[#60749a]">{emptyText}</div>
                )}
            </div>
        </div>
    );
}
