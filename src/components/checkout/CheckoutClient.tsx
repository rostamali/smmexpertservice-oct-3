'use client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowRight,
    Check,
    CreditCard,
    Mail,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Tag,
    Trash2,
    Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
    customerFacingQuantity,
    readCart,
    readCartCoupon,
    stepCartItem,
    writeCart,
    writeCartCoupon,
} from '@/lib/cart';
import type { CartItem } from '@/types/store';
import { money } from '@/lib/money';
import { readCheckoutAttribution, trackCurrentPageAttribution } from '@/lib/attribution-client';
import { readAnalyticsIdentity, trackStorefrontEvent } from '@/lib/analytics-client';
import Spinner from '@/components/shared/Spinner';
import { PaymentMethodSelector, type PaymentGatewayPresentation } from '@/components/checkout/PaymentMethodSelector';

type Gateway = PaymentGatewayPresentation;

type Quote = {
    subtotal: number;
    couponDiscount: number;
    gatewayDiscount: number;
    discountTotal: number;
    taxTotal: number;
    total: number;
    currency: string;
    coupon: { code: string; type: string; amount: number } | null;
    gateway: {
        key: string;
        title: string;
        taxEnabled: boolean;
        taxPercent: number;
        discountEnabled: boolean;
        discountPercent: number;
        discountMinimumSpend: number;
    };
};

const emailPattern = /^\S+@\S+\.\S+$/;

export default function CheckoutClient({ currency }: { currency: string }) {
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [email, setEmail] = useState('');
    const [couponInput, setCouponInput] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [gateways, setGateways] = useState<Gateway[]>([]);
    const [gatewayKey, setGatewayKey] = useState('');
    const [quote, setQuote] = useState<Quote | null>(null);
    const [loading, setLoading] = useState(true);
    const [quoting, setQuoting] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [couponApplying, setCouponApplying] = useState(false);
    const [emailError, setEmailError] = useState('');
    const checkoutTracked = useRef(false);
    const quoteRequestSequence = useRef(0);
    const couponApplySequence = useRef(0);
    const skipNextAutoQuote = useRef(false);

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
        [items],
    );
    const displayCurrency = quote?.currency || currency;
    const selectedGateway = useMemo(
        () => gateways.find((gateway) => gateway.key === gatewayKey) || null,
        [gateways, gatewayKey],
    );
    const emailValid = emailPattern.test(email.trim());
    const gatewayAdjustmentLabel = (gateway: Gateway) => {
        if (gateway.discountEnabled) {
            const minimum =
                gateway.discountMinimumSpend > 0
                    ? ` · Minimum ${money(gateway.discountMinimumSpend, gateway.currency || displayCurrency)}`
                    : '';
            return `${gateway.discountPercent}% Off${minimum}`;
        }
        if (gateway.taxEnabled) return `${gateway.taxPercent}% payment tax`;
        return '';
    };

    useEffect(() => {
        const cart = readCart();
        const savedCoupon = readCartCoupon();
        setItems(cart);
        setCouponCode(savedCoupon);
        setCouponInput(savedCoupon);

        const recoveryEmail = localStorage.getItem('nexa_recovery_email');
        const savedEmail = localStorage.getItem('nexa_checkout_email');
        if (recoveryEmail) {
            setEmail(recoveryEmail);
            localStorage.removeItem('nexa_recovery_email');
        } else if (savedEmail) {
            setEmail(savedEmail);
        }

        void fetch('/api/store/payment-gateways')
            .then(async (response) => {
                const body = await response.json();
                if (!response.ok) throw new Error(body.error || 'Could not load payment methods.');
                const list = (body.items || []) as Gateway[];
                setGateways(list);
                const savedGateway = localStorage.getItem('nexa_checkout_gateway');
                const preferred = list.find((gateway) => gateway.key === savedGateway) || list[0];
                if (preferred) setGatewayKey(preferred.key);
            })
            .catch((error) =>
                toast.error(
                    error instanceof Error ? error.message : 'Could not load payment methods.',
                ),
            )
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const sync = () => setItems(readCart());
        window.addEventListener('nexa:cart-updated', sync as EventListener);
        return () => window.removeEventListener('nexa:cart-updated', sync as EventListener);
    }, []);

    useEffect(() => {
        if (!items.length || checkoutTracked.current) return;
        checkoutTracked.current = true;
        void trackStorefrontEvent({
            eventType: 'BEGIN_CHECKOUT',
            value: subtotal,
            currency,
            metadata: {
                origin: 'cart',
                items: items.map((item) => ({
                    productId: item.productId,
                    productName: item.productName,
                    variantId: item.variantId,
                    variantLabel: item.variantLabel,
                    packageId: item.packageId || null,
                    packageLabel: item.packageLabel,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                })),
            },
        });
    }, [items, subtotal, currency]);

    useEffect(() => {
        if (email.trim()) localStorage.setItem('nexa_checkout_email', email.trim());
        else localStorage.removeItem('nexa_checkout_email');
    }, [email]);

    useEffect(() => {
        if (gatewayKey) localStorage.setItem('nexa_checkout_gateway', gatewayKey);
    }, [gatewayKey]);

    const payload = useMemo(
        () =>
            items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                selections: item.selections,
                packageId: item.packageId || null,
                customInputs: item.customInputs || {},
            })),
        [items],
    );

    const requestQuote = useCallback(
        async (requestedCoupon: string | null): Promise<Quote> => {
            const response = await fetch('/api/store/quote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: requestedCoupon && emailValid ? email.trim().toLowerCase() : '',
                    couponCode: requestedCoupon,
                    paymentGatewayKey: gatewayKey,
                    items: payload,
                }),
            });

            let body: Partial<Quote> & { error?: string } = {};
            try {
                body = (await response.json()) as Partial<Quote> & { error?: string };
            } catch {
                // Keep a predictable storefront error even if an upstream error is not JSON.
            }

            if (!response.ok) {
                throw new Error(body.error || 'Could not calculate order total.');
            }

            return body as Quote;
        },
        [email, emailValid, gatewayKey, payload],
    );

    useEffect(() => {
        if (!gatewayKey || !items.length) {
            setQuote(null);
            setQuoting(false);
            return;
        }

        // A coupon may depend on the customer's email. Keep the last valid quote visible
        // while an incomplete/invalid email is being edited instead of dropping payment discounts.
        if (couponCode && email.trim() && !emailValid) {
            setQuoting(false);
            return;
        }

        if (skipNextAutoQuote.current) {
            skipNextAutoQuote.current = false;
            setQuoting(false);
            return;
        }

        let active = true;
        const requestId = ++quoteRequestSequence.current;
        const timer = window.setTimeout(() => {
            setQuoting(true);
            void requestQuote(couponCode || null)
                .then((nextQuote) => {
                    if (!active || requestId !== quoteRequestSequence.current) return;
                    setQuote(nextQuote);

                    if (couponCode) {
                        if (nextQuote.coupon) {
                            writeCartCoupon(nextQuote.coupon.code);
                        } else {
                            // A persisted coupon is no longer valid/applicable. Stop sending it on
                            // future quote requests but keep the entered value available to retry.
                            writeCartCoupon('');
                            setCouponCode('');
                        }
                    }
                })
                .catch((error) => {
                    if (!active || requestId !== quoteRequestSequence.current) return;

                    if (couponCode) {
                        // Never destroy an already valid payment-method quote just because a
                        // coupon failed. Clearing only the applied coupon triggers a clean quote
                        // without the coupon, restoring/preserving gateway discounts.
                        writeCartCoupon('');
                        setCouponCode('');
                        toast.error(
                            error instanceof Error ? error.message : 'Could not apply coupon.',
                        );
                        return;
                    }

                    setQuote(null);
                })
                .finally(() => {
                    if (!active || requestId !== quoteRequestSequence.current) return;
                    setQuoting(false);
                });
        }, 220);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [gatewayKey, couponCode, email, emailValid, items.length, requestQuote]);

    useEffect(() => {
        if (!items.length) return;
        const timer = window.setTimeout(() => {
            let token = localStorage.getItem('nexa_abandoned_token');
            if (!token) {
                token =
                    typeof crypto !== 'undefined' && 'randomUUID' in crypto
                        ? crypto.randomUUID().replaceAll('-', '')
                        : `${Date.now()}${Math.random().toString(36).slice(2)}`;
                localStorage.setItem('nexa_abandoned_token', token);
            }
            void fetch('/api/store/abandoned-cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    email: emailValid ? email.trim().toLowerCase() : null,
                    items,
                    subtotal: quote?.subtotal ?? subtotal,
                    total: quote?.total ?? subtotal,
                }),
            }).catch(() => undefined);
        }, 900);
        return () => window.clearTimeout(timer);
    }, [items, email, emailValid, quote?.subtotal, quote?.total, subtotal]);

    const updateItem = (item: CartItem, direction: 1 | -1) => {
        const next = stepCartItem(item, direction, items);
        if (
            next.key === item.key &&
            next.quantity === item.quantity &&
            next.packageId === item.packageId
        )
            return;
        const nextItems = items.map((entry) => (entry.key === item.key ? next : entry));
        setItems(writeCart(nextItems));
        void trackStorefrontEvent({
            eventType: 'UPDATE_CART',
            productId: item.productId,
            value: next.unitPrice * next.quantity,
            currency,
            metadata: { direction, quantity: next.quantity, packageId: next.packageId || null },
        });
    };

    const removeItem = (item: CartItem) => {
        const nextItems = items.filter((entry) => entry.key !== item.key);
        setItems(writeCart(nextItems));
        void trackStorefrontEvent({
            eventType: 'REMOVE_FROM_CART',
            productId: item.productId,
            value: item.unitPrice * item.quantity,
            currency,
            metadata: { productName: item.productName, variantId: item.variantId },
        });
    };

    const applyCoupon = async () => {
        const normalized = couponInput.trim().toUpperCase();

        if (!normalized) {
            toast.error('Enter a coupon code.');
            return;
        }
        if (!gatewayKey || !items.length) {
            toast.error('Choose a payment method before applying a coupon.');
            return;
        }
        if (email.trim() && !emailValid) {
            toast.error('Enter a valid email address before applying the coupon.');
            return;
        }

        setCouponInput(normalized);
        setCouponApplying(true);
        setQuoting(true);
        const applyId = ++couponApplySequence.current;
        const requestId = ++quoteRequestSequence.current;

        try {
            let candidateQuote: Quote;
            try {
                candidateQuote = await requestQuote(normalized);
            } catch (couponError) {
                if (requestId !== quoteRequestSequence.current) return;

                // A rejected coupon must not wipe out the automatic payment-method discount.
                // Recalculate immediately without the coupon and keep the failed code in the field
                // so the customer can retry the exact same value without editing it first.
                try {
                    const baseQuote = await requestQuote(null);
                    if (requestId === quoteRequestSequence.current) setQuote(baseQuote);
                } catch {
                    // If even the base quote fails, preserve the last known-good quote on screen.
                }

                if (requestId !== quoteRequestSequence.current) return;
                setCouponCode('');
                writeCartCoupon('');
                toast.error(
                    couponError instanceof Error ? couponError.message : 'Could not apply coupon.',
                );
                return;
            }

            if (requestId !== quoteRequestSequence.current) return;

            const appliedCode = candidateQuote.coupon?.code?.trim().toUpperCase() || '';
            if (!candidateQuote.coupon || appliedCode !== normalized) {
                // Some backends return HTTP 200 with coupon=null for an invalid/ineligible code.
                // Always obtain a coupon-free quote so the payment discount remains correct.
                try {
                    const baseQuote = await requestQuote(null);
                    if (requestId === quoteRequestSequence.current) setQuote(baseQuote);
                } catch {
                    setQuote(candidateQuote);
                }

                if (requestId !== quoteRequestSequence.current) return;
                setCouponCode('');
                writeCartCoupon('');
                toast.error('Coupon is invalid or not applicable to this order.');
                return;
            }

            setQuote(candidateQuote);
            setCouponInput(candidateQuote.coupon.code.toUpperCase());
            writeCartCoupon(candidateQuote.coupon.code);
            skipNextAutoQuote.current = true;
            setCouponCode(candidateQuote.coupon.code);
            toast.success(`Coupon ${candidateQuote.coupon.code} applied.`);
        } finally {
            // Coupon button loading belongs to the Apply action, not the auto-quote request.
            // A gateway/cart/email change may supersede the quote request while this action is
            // in flight, but it must never leave the Apply button spinning forever.
            if (applyId === couponApplySequence.current) setCouponApplying(false);
            if (requestId === quoteRequestSequence.current) setQuoting(false);
        }
    };

    const removeCoupon = () => {
        setCouponInput('');
        setCouponCode('');
        writeCartCoupon('');
        setQuote(null);
    };

    const selectGateway = (gateway: Gateway) => {
        setGatewayKey(gateway.key);
        void trackStorefrontEvent({
            eventType: 'SELECT_PAYMENT_METHOD',
            value: quote?.total ?? subtotal,
            currency: displayCurrency,
            metadata: {
                gatewayKey: gateway.key,
                gatewayName: gateway.checkoutTitle || gateway.name,
            },
        });
    };

    const confirm = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        if (!emailPattern.test(normalizedEmail)) {
            setEmailError('Please enter a valid email address.');
            return;
        }
        if (!gatewayKey) {
            toast.error('Choose a payment method.');
            return;
        }
        if (!items.length) return;

        setEmailError('');
        setSubmitting(true);
        try {
            trackCurrentPageAttribution();
            const response = await fetch('/api/checkout/draft', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: normalizedEmail,
                    couponCode: couponCode || null,
                    paymentGatewayKey: gatewayKey,
                    payCurrency: null,
                    items: payload,
                    attribution: (() => {
                        const attribution = readCheckoutAttribution() || {};
                        const identity = readAnalyticsIdentity();
                        return {
                            ...attribution,
                            ...(identity
                                ? {
                                      analyticsVisitorId: identity.visitorId,
                                      analyticsSessionId: identity.sessionId,
                                  }
                                : {}),
                        };
                    })(),
                    abandonedCartToken: localStorage.getItem('nexa_abandoned_token') || null,
                }),
            });
            const body = await response.json();
            if (!response.ok) throw new Error(body.error || 'Could not start email verification.');
            toast.success('Verification code sent to your email.');
            router.push(`/checkout/verify/${encodeURIComponent(body.token)}`);
        } catch (error) {
            toast.error(
                error instanceof Error ? error.message : 'Could not start email verification.',
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="px-[20px] xl:px-0 flex items-center justify-center py-24">
                <Spinner customClass="size-[40px] fill-site-primary" />
            </div>
        );
    }

    if (!items.length) {
        return (
            <div className="mx-auto max-w-[1200px] px-4 py-24 text-center sm:px-6">
                <div className="mx-auto grid h-16 w-16 place-items-center bg__gradient-primary rounded-[16px] text-white">
                    <ShoppingBag className="size-[28px]" />
                </div>
                <h1 className="mt-6 text-4xl font-bold tracking-[-0.04em] text-site-heading-font">
                    Your cart is empty
                </h1>
                <p className="mx-auto mt-3 max-w-xl text-[14px] leading-5 text-site-body-font">
                    Add a product to your cart and return here to configure payment and confirm your
                    order.
                </p>
                <Link
                    href="/shop"
                    className="mt-7 inline-flex h-12 items-center gap-2 rounded-[9px] bg__gradient-primary text-white font-medium px-5"
                >
                    Browse products <ArrowRight size={15} />
                </Link>
            </div>
        );
    }

    return (
        <div className="container px-[20px] xl:px-0">
            <div className="mb-10 max-w-4xl flex flex-col gap-[12px]">
                <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-site-primary">
                    Cart & checkout
                </span>
                <h1 className="page__title">Review and confirm your order.</h1>
                <p className="text-[13px] leading-5 text-site-body-font">
                    Update quantities, apply a coupon, choose payment, and confirm from this single
                    page.
                </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start">
                <div className="space-y-6">
                    {/* Cart Items */}
                    <section className="card-box">
                        <div className="flex items-center justify-between gap-4 border-b border-site-light-border pb-5">
                            <div>
                                <h2 className="text-[18px] font-semibold text-site-heading-font">
                                    Cart items
                                </h2>
                                <p className="mt-1 text-[11px] text-site-body-font">
                                    {items.length} item{items.length === 1 ? '' : 's'} in your order
                                </p>
                            </div>
                            <Link
                                href="/shop"
                                className="text-[12px] font-semibold text-site-primary hover:underline"
                            >
                                Continue shopping
                            </Link>
                        </div>

                        <div className="divide-y divide-dashed divide-[#e5e5e5]">
                            {items.map((item) => (
                                <article key={item.key} className="py-6 last:pb-0">
                                    {/*  */}
                                    <div className="grid gap-[10px] sm:gap-5 grid-cols-[65px_minmax(0,1fr)] sm:grid-cols-[92px_minmax(0,1fr)]">
                                        <div className="grid h-[65px] sm:h-[92px] w-[65px] sm:w-[92px] place-items-center overflow-hidden rounded-[12px] sm:rounded-[15px]">
                                            {item.imageUrl ? (
                                                <img
                                                    src={item.imageUrl}
                                                    alt={item.productName}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <ShoppingBag
                                                    size={26}
                                                    className="text-site-body-font"
                                                />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                                <div>
                                                    <Link
                                                        href={`/product/${item.productSlug}`}
                                                        className="text-[16px] sm:text-[18px] font-semibold leading-[1.12em] xl:leading-[1.106em] tracking-[-0.03em] text-site-heading-font hover:text-site-primary transition-all"
                                                    >
                                                        {item.productName}
                                                    </Link>
                                                    <p className="mt-1 text-[11px] text-site-body-font font-medium">
                                                        {Object.values(item.selections)
                                                            .map((selection) => selection.label)
                                                            .filter(Boolean)
                                                            .join(' / ') ||
                                                            item.variantLabel ||
                                                            'Standard'}
                                                        {item.packageLabel
                                                            ? ` / ${item.packageLabel}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <strong className="text-base font-bold text-site-heading-font">
                                                    {money(
                                                        item.unitPrice * item.quantity,
                                                        displayCurrency,
                                                    )}
                                                </strong>
                                            </div>
                                            <div className="mt-5 hidden sm:flex flex-wrap items-center justify-between gap-4">
                                                <div className="cart__qty-wrap">
                                                    <button
                                                        type="button"
                                                        className="cart__qty-btn"
                                                        onClick={() => updateItem(item, -1)}
                                                        aria-label={`Decrease ${item.productName}`}
                                                    >
                                                        <Minus size={15} />
                                                    </button>
                                                    <span className="min-w-[80px] px-[5px] text-center text-[11px] font-semibold text-site-heading-font">
                                                        {customerFacingQuantity(item)}
                                                        {item.productType === 'VARIABLE_PACKAGE' &&
                                                        item.packageUnit
                                                            ? ` ${item.packageUnit}`
                                                            : ''}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="cart__qty-btn"
                                                        onClick={() => updateItem(item, 1)}
                                                        aria-label={`Increase ${item.productName}`}
                                                    >
                                                        <Plus size={15} />
                                                    </button>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(item)}
                                                    className="inline-flex items-center gap-2 text-[10px] font-semibold text-rose-500 transition hover:text-rose-700"
                                                >
                                                    <Trash2 className="size-[14px]" /> Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex sm:hidden flex-wrap items-center justify-between gap-4 pt-5">
                                        <div className="cart__qty-wrap">
                                            <button
                                                type="button"
                                                className="cart__qty-btn"
                                                onClick={() => updateItem(item, -1)}
                                                aria-label={`Decrease ${item.productName}`}
                                            >
                                                <Minus size={15} />
                                            </button>
                                            <span className="min-w-[80px] px-[5px] text-center text-[11px] font-semibold text-site-heading-font">
                                                {customerFacingQuantity(item)}
                                                {item.productType === 'VARIABLE_PACKAGE' &&
                                                item.packageUnit
                                                    ? ` ${item.packageUnit}`
                                                    : ''}
                                            </span>
                                            <button
                                                type="button"
                                                className="cart__qty-btn"
                                                onClick={() => updateItem(item, 1)}
                                                aria-label={`Increase ${item.productName}`}
                                            >
                                                <Plus size={15} />
                                            </button>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item)}
                                            className="inline-flex items-center gap-2 text-[10px] font-semibold text-rose-500 transition hover:text-rose-700"
                                        >
                                            <Trash2 className="size-[14px]" /> Remove
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Contact Email */}
                    <section className="card-box">
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center bg__gradient-primary rounded-[10px] text-white">
                                <Mail className="size-[18px]" />
                            </span>
                            <div className="flex-1">
                                <h2 className="text-[18px] font-semibold text-site-heading-font">
                                    Contact email
                                </h2>
                                <p className="text-[12px] text-site-body-font">
                                    We send your verification code and receipt here.
                                </p>
                            </div>
                        </div>
                        <label className="mt-5 block">
                            <span className="mb-2 block text-[14px] font-semibold text-site-heading-font">
                                Email address
                            </span>
                            <input
                                type="email"
                                value={email}
                                onChange={(event) => {
                                    setEmail(event.target.value);
                                    if (emailError) setEmailError('');
                                }}
                                placeholder="you@example.com"
                                autoComplete="email"
                                className="h-12 w-full rounded-[9px] border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-site-primary focus:ring-4 focus:ring-blue-100"
                            />
                            {emailError ? (
                                <span className="mt-2 block text-sm text-rose-600">
                                    {emailError}
                                </span>
                            ) : null}
                        </label>
                    </section>

                    <section className="card-box">
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 place-items-center bg__gradient-primary rounded-[10px] text-white">
                                <CreditCard className="size-[18px]" />
                            </span>
                            <div className="flex-1">
                                <h2 className="text-[18px] font-bold text-site-heading-font">
                                    Payment method
                                </h2>
                                <p className="text-[12px] text-site-body-font">
                                    Select the gateway you want to use.
                                </p>
                            </div>
                        </div>
                        <PaymentMethodSelector
                            gateways={gateways}
                            selectedKey={gatewayKey}
                            onSelect={(gateway) => selectGateway(gateway as Gateway)}
                            adjustmentLabel={(gateway) => gatewayAdjustmentLabel(gateway as Gateway)}
                        />
                        {selectedGateway?.discountEnabled ? (
                            <div className="mt-4 flex items-start gap-3 rounded-[15px] border border-blue-200 bg-blue-50 px-4 py-3 text-blue-900">
                                <Tag size={17} className="mt-0.5 shrink-0 text-blue-500" />
                                <div>
                                    <strong className="block text-sm">
                                        {selectedGateway.discountPercent}% Off
                                        {selectedGateway.discountMinimumSpend > 0
                                            ? ` · Minimum ${money(selectedGateway.discountMinimumSpend, selectedGateway.currency || displayCurrency)}`
                                            : ''}
                                    </strong>
                                    <span className="mt-0.5 block text-xs text-slate-600">
                                        This payment discount is applied automatically when the
                                        order meets the minimum spend.
                                    </span>
                                </div>
                            </div>
                        ) : null}
                    </section>
                </div>

                <aside className="lg:sticky lg:top-28 ">
                    <div className="space-y-6">
                        {/* Coupon Form */}
                        <section className="card-box">
                            <div className="flex items-center gap-3">
                                <span className="grid h-10 w-10 place-items-center bg__gradient-primary rounded-[10px] text-white">
                                    <Tag className="size-[18px]" />
                                </span>
                                <div className="flex-1">
                                    <h2 className="ttext-[18px] font-semibold text-site-heading-font">
                                        Coupon
                                    </h2>
                                    <p className="text-[12px] text-site-body-font">
                                        Apply a valid coupon code to this order.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <input
                                    value={couponInput}
                                    onChange={(event) =>
                                        setCouponInput(event.target.value.toUpperCase())
                                    }
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter' && !couponApplying) {
                                            event.preventDefault();
                                            void applyCoupon();
                                        }
                                    }}
                                    placeholder="Coupon code"
                                    className="h-12 min-w-0 flex-1 rounded-[9px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                />
                                {quote?.coupon ? (
                                    <button
                                        type="button"
                                        onClick={removeCoupon}
                                        className="h-12 rounded-[9px] border border-slate-200 bg-white px-5 text-[10px] font-semibold text-slate-950 transition hover:border-rose-200 hover:text-rose-600"
                                    >
                                        Remove coupon
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => void applyCoupon()}
                                        disabled={couponApplying}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-[9px] bg-gradient-to-r from-blue-500 to-blue-600 px-6 text-[14px] font-semibold text-white transition hover:bg-blue-600 disabled:opacity-60"
                                    >
                                        {couponApplying ? (
                                            <>
                                                <Loader2 size={15} className="animate-spin" />
                                                Applying...
                                            </>
                                        ) : (
                                            'Apply coupon'
                                        )}
                                    </button>
                                )}
                            </div>
                            {quote?.coupon ? (
                                <p className="mt-3 inline-flex items-center gap-2 text-[10px] font-semibold text-emerald-600">
                                    <Check size={15} /> {quote.coupon.code} applied
                                </p>
                            ) : null}
                        </section>

                        {/* Order Summary */}
                        <section className="card-box">
                            <h2 className="text-2xl font-bold text-site-heading-font">
                                Order summary
                            </h2>
                            <div className="mt-6 space-y-4 border-b border-site-light-border pb-5 text-sm">
                                <div className="flex justify-between gap-4 text-site-body-font">
                                    <span>Subtotal</span>
                                    <strong className="text-slate-950">
                                        {money(quote?.subtotal ?? subtotal, displayCurrency)}
                                    </strong>
                                </div>
                                {quote?.couponDiscount ? (
                                    <div className="flex justify-between gap-4 text-[#1DA65A]">
                                        <span>Coupon discount</span>
                                        <strong>
                                            −{money(quote.couponDiscount, displayCurrency)}
                                        </strong>
                                    </div>
                                ) : null}
                                {quote?.gatewayDiscount ? (
                                    <div className="flex justify-between gap-4 text-[#1DA65A]">
                                        <span>Payment discount</span>
                                        <strong>
                                            −{money(quote.gatewayDiscount, displayCurrency)}
                                        </strong>
                                    </div>
                                ) : null}
                                {quote?.taxTotal ? (
                                    <div className="flex justify-between gap-4 text-site-body-font">
                                        <span>Payment tax</span>
                                        <strong className="text-slate-950">
                                            +{money(quote.taxTotal, displayCurrency)}
                                        </strong>
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex items-center justify-between gap-4 py-6">
                                <span className="text-[15px] font-semibold text-site-body-font">
                                    Total
                                </span>
                                <strong className="text-3xl font-bold tracking-[-0.03em] text-site-heading-font">
                                    {quoting && !couponApplying
                                        ? 'Updating…'
                                        : money(quote?.total ?? subtotal, displayCurrency)}
                                </strong>
                            </div>
                            <button
                                type="button"
                                onClick={() => void confirm()}
                                disabled={submitting || quoting || !quote || !gatewayKey}
                                className="inline-flex h-13 w-full items-center justify-center gap-2 rounded-[9px] bg__gradient-primary px-5 text-sm font-bold text-white shadow-[0_10px_25px_rgba(59,130,246,.32)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
                            >
                                <ShieldCheck size={17} />{' '}
                                {submitting ? 'Preparing order…' : 'Confirm Order'}
                            </button>
                            <p className="mt-4 text-center text-[13px] leading-5 text-site-body-font">
                                A verification code is sent before payment. Your order is created
                                after successful email verification.
                            </p>
                        </section>
                    </div>
                </aside>
            </div>
        </div>
    );
}
