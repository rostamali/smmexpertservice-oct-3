'use client';

import {
    CalendarDays,
    Check,
    ChevronDown,
    Copy,
    FileDown,
    FileText,
    Lock,
    ReceiptText,
} from 'lucide-react';
import { toast } from 'sonner';

import { money } from '@/lib/money';

const formatDateTime = (date: Date | string) =>
    new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    }).format(new Date(date));

type DeliveryItem = {
    id: number;
    label: string;
    details: string;
};

type Result = {
    createdAt: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: string;
    currency: string;
    items: Array<{
        id: number;
        title: string;
        variantLabel: string;
        quantity: number;
        packageQuantity: number | null;
        packageUnit: string | null;
        lineTotal: string;
    }>;
    deliveryAvailable: boolean;
    deliveryItems: DeliveryItem[];
};

type OrderDeliveryDetailsProps = {
    result: Result;
    active: DeliveryItem | null;
    setActive: (id: number) => void;
    siteName: string;
};

export default function OrderDeliveryDetails({
    result,
    active,
    setActive,
}: OrderDeliveryDetailsProps) {
    const copyOrderNumber = async () => {
        try {
            await navigator.clipboard.writeText(result.orderNumber);
            toast.success('Order number copied.');
        } catch {
            toast.error('Could not copy order number.');
        }
    };

    const copyDelivery = async (details: string) => {
        try {
            await navigator.clipboard.writeText(details);
            toast.success('Delivery details copied.');
        } catch {
            toast.error('Could not copy delivery details.');
        }
    };

    return (
        <main className="relative min-h-screen overflow-hidden bg-[#f8fbff] px-4 py-8 sm:px-6 sm:py-12">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -left-[220px] -top-[260px] h-[520px] w-[760px] rounded-[50%] bg-[#edf7ff]" />
                <div className="absolute left-[-180px] top-[130px] h-[250px] w-[650px] rotate-[10deg] rounded-[50%] border-[48px] border-[#e7f3ff]" />
                <div className="absolute -right-[220px] top-[80px] h-[360px] w-[680px] rotate-[12deg] rounded-[50%] border-[55px] border-[#e5f2ff]" />
                <div className="absolute -right-[190px] bottom-[30px] h-[420px] w-[650px] rounded-[50%] bg-[#eaf5ff]" />
                <div
                    className="absolute left-[3%] top-[70px] h-[65px] w-[65px] opacity-60"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle, rgba(106,154,209,.6) 2px, transparent 2.5px)',
                        backgroundSize: '18px 18px',
                    }}
                />
            </div>

            <div className="relative mx-auto max-w-[1240px]">
                <section className="text-center">
                    <div className="relative mx-auto grid size-[82px] place-items-center rounded-full bg__gradient-primary text-white shadow-[0_14px_40px_rgba(0,116,247,.2)]">
                        <FileDown size={34} />
                        <span className="absolute inset-[-12px] rounded-full border border-[#d9ebff]" />
                    </div>

                    <h1 className="mt-6 text-[36px] font-black tracking-[-0.045em] text-[#071129] sm:text-[46px]">
                        Your Order Has Been <span className="text-[#087df5]">Delivered!</span>
                    </h1>

                    <p className="mx-auto mt-3 max-w-[680px] text-[16px] leading-7 text-[#64799d]">
                        Thank you for your purchase! Your digital product is ready to access.
                        <br className="hidden sm:block" />
                        You can find your product delivery details below.
                    </p>
                </section>

                <section className="mt-8 grid gap-6 lg:grid-cols-2">
                    <article className="rounded-[22px] border border-[#dfeaf4] bg-white p-5 shadow-[0_14px_45px_rgba(63,121,177,.07)] sm:p-6">
                        <div className="flex items-center gap-4">
                            <span className="grid size-[54px] shrink-0 place-items-center rounded-full bg-[#edf6ff] text-[#087df5]">
                                <ReceiptText size={24} />
                            </span>
                            <div>
                                <h2 className="text-[23px] font-extrabold tracking-[-0.03em] text-[#071129]">
                                    Order Details
                                </h2>
                                <p className="mt-0.5 text-[13px] text-[#667da2]">
                                    Here are your order information and payment details.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 rounded-[15px] border border-[#dbe8f3] bg-gradient-to-r from-[#f6fbff] to-[#f2f8ff] p-5">
                            <div className="flex items-start gap-4">
                                <span className="grid size-11 shrink-0 place-items-center rounded-[11px] bg-[#e3f1ff] text-[#087df5]">
                                    <CalendarDays size={20} />
                                </span>

                                <div className="min-w-0 flex-1">
                                    <span className="block text-[12px] text-[#7589a8]">
                                        Order Number
                                    </span>
                                    <strong className="mt-0.5 block break-all text-[15px] text-[#10192d]">
                                        {result.orderNumber}
                                    </strong>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => void copyOrderNumber()}
                                    className="grid size-10 shrink-0 place-items-center rounded-[9px] border border-[#cfe1ef] bg-white text-[#087df5] transition hover:bg-[#f4f9ff]"
                                    aria-label="Copy order number"
                                >
                                    <Copy size={17} />
                                </button>
                            </div>

                            <div className="mt-4 flex items-center gap-3 text-[13px] text-[#6c82a4]">
                                <CalendarDays size={17} />
                                Placed on {formatDateTime(result.createdAt)}
                            </div>
                        </div>

                        <div className="mt-5 divide-y divide-[#e7eef5]">
                            {result.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 py-4"
                                >
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span className="grid size-12 shrink-0 place-items-center rounded-[12px] bg-gradient-to-br from-[#7e69ff] to-[#5643ea] text-lg font-black text-white">
                                            {item.title.slice(0, 1).toUpperCase()}
                                        </span>

                                        <div className="min-w-0">
                                            <strong className="block truncate text-[15px] text-[#10192d]">
                                                {item.title}
                                            </strong>
                                            <p className="mt-0.5 truncate text-[12px] text-[#7688a5]">
                                                {item.variantLabel || 'Default'}
                                            </p>
                                        </div>
                                    </div>

                                    <b className="shrink-0 text-[15px] text-[#10192d]">
                                        {money(Number(item.lineTotal), result.currency)}
                                    </b>
                                </div>
                            ))}
                        </div>

                        <div className="mt-1 flex items-center justify-between border-t border-[#e7eef5] pt-5 text-[18px] font-extrabold text-[#10192d]">
                            <span>Total</span>
                            <span className="text-[24px] text-[#087df5]">
                                {money(Number(result.total), result.currency)}
                            </span>
                        </div>

                        {result.status === 'COMPLETED' ? (
                            <div className="mt-6 flex gap-4 rounded-[14px] border border-emerald-200 bg-emerald-50 px-5 py-5">
                                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-emerald-500 text-white">
                                    <Check size={24} />
                                </span>
                                <div>
                                    <h3 className="text-[18px] font-extrabold text-emerald-700">
                                        Order Completed
                                    </h3>
                                    <p className="mt-1 text-[13px] text-[#627c75]">
                                        Your digital product is ready to access.
                                    </p>
                                </div>
                            </div>
                        ) : null}
                    </article>

                    <article className="rounded-[22px] border border-[#dfeaf4] bg-white p-5 shadow-[0_14px_45px_rgba(63,121,177,.07)] sm:p-6">
                        <div className="flex items-center gap-4">
                            <span className="grid size-[54px] shrink-0 place-items-center rounded-full bg-[#edf6ff] text-[#087df5]">
                                <Lock size={24} />
                            </span>

                            <div>
                                <h2 className="text-[23px] font-extrabold tracking-[-0.03em] text-[#071129]">
                                    Your Delivery Access
                                </h2>
                                <p className="mt-0.5 text-[13px] text-[#667da2]">
                                    Here is your purchase product details.
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 space-y-3">
                            {result.deliveryItems.map((item) => {
                                const isOpen = active?.id === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className="overflow-hidden rounded-[15px] border border-[#dbe8f3] bg-white"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setActive(item.id)}
                                            className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-[#edf6ff] text-[#087df5]">
                                                    <FileText size={18} />
                                                </span>
                                                <strong className="truncate text-[14px] text-[#10192d]">
                                                    {item.label}
                                                </strong>
                                            </div>

                                            <ChevronDown
                                                size={19}
                                                className={`shrink-0 text-[#234878] transition-transform duration-300 ${
                                                    isOpen ? 'rotate-180' : ''
                                                }`}
                                            />
                                        </button>

                                        <div
                                            className={`grid transition-all duration-300 ease-in-out ${
                                                isOpen
                                                    ? 'grid-rows-[1fr] opacity-100'
                                                    : 'grid-rows-[0fr] opacity-0'
                                            }`}
                                        >
                                            <div className="overflow-hidden">
                                                <div className="border-t border-[#dbe8f3] px-4 pb-4 pt-3">
                                                    <div className="flex items-center justify-between gap-4">
                                                        <span className="text-[14px] font-extrabold text-[#087df5]">
                                                            Account Access:
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                void copyDelivery(item.details)
                                                            }
                                                            className="inline-flex h-9 items-center gap-2 rounded-[7px] bg__gradient-primary px-4 text-[12px] font-bold text-white"
                                                        >
                                                            <Copy size={14} />
                                                            Copy
                                                        </button>
                                                    </div>

                                                    <pre className="mt-3 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-[10px] bg-gradient-to-r from-[#f7fbff] to-[#f2f8ff] p-4 font-mono text-[12px] leading-6 text-[#5e7294]">
                                                        {item.details}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                            {!result.deliveryItems.length ? (
                                <div className="rounded-[14px] bg-[#f7fbff] p-6 text-center text-sm text-[#6d82a2]">
                                    Delivery details are not available yet.
                                </div>
                            ) : null}
                        </div>
                    </article>
                </section>
            </div>
        </main>
    );
}
