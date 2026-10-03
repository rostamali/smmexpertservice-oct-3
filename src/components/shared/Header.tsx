'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, ShoppingBag, Star, X } from 'lucide-react';
import { readCart } from '@/lib/cart';
import { money } from '@/lib/money';
import StoreImage from '@/components/StoreImage';
import Image from 'next/image';

const TOP_BAR_KEY = 'nexa:topbar-hidden-until';
const TOP_BAR_HIDE_MS = 4 * 60 * 60 * 1000;

export type StorefrontNavCategory = {
    id: number;
    name: string;
    slug: string;
    mobileNavTitle?: string | null;
    imageUrl?: string | null;
    _count?: { products: number };
};

export type StorefrontNavProduct = {
    id: number;
    name: string;
    slug: string;
    imageUrl?: string | null;
    badgeText?: string | null;
    starRating?: number | null;
    ratingCount?: number;
    startingPrice?: number | null;
    category?: { id: number; name: string; slug: string } | null;
};

export default function Header({
    siteName,
    categories = [],
    products = [],
    currency = 'USD',
}: {
    siteName: string;
    logoUrl?: string | null;
    contactEmail?: string | null;
    categories?: StorefrontNavCategory[];
    products?: StorefrontNavProduct[];
    currency?: string;
}) {
    const pathname = usePathname();
    const isHome = pathname === '/';
    const [mobileOpen, setMobileOpen] = useState(false);
    const [openCategoryId, setOpenCategoryId] = useState<number | null>(
        () => categories[0]?.id ?? null,
    );
    const [cartCount, setCartCount] = useState(0);
    const [topBarVisible, setTopBarVisible] = useState(true);

    const productsByCategory = useMemo(() => {
        const grouped = new Map<number, StorefrontNavProduct[]>();
        for (const product of products) {
            const categoryId = product.category?.id;
            if (!categoryId) continue;
            const list = grouped.get(categoryId) || [];
            list.push(product);
            grouped.set(categoryId, list);
        }
        return grouped;
    }, [products]);

    useEffect(() => {
        if (openCategoryId == null && categories.length && !mobileOpen)
            setOpenCategoryId(categories[0].id);
    }, [categories, mobileOpen, openCategoryId]);

    useEffect(() => {
        try {
            const hiddenUntil = Number(window.localStorage.getItem(TOP_BAR_KEY) || 0);
            if (hiddenUntil > Date.now()) setTopBarVisible(false);
            else if (hiddenUntil) window.localStorage.removeItem(TOP_BAR_KEY);
        } catch {}
    }, []);

    const dismissTopBar = () => {
        setTopBarVisible(false);
        try {
            window.localStorage.setItem(TOP_BAR_KEY, String(Date.now() + TOP_BAR_HIDE_MS));
        } catch {}
    };

    useEffect(() => {
        const sync = () =>
            setCartCount(
                readCart().reduce(
                    (sum, item) =>
                        sum + (item.productType === 'VARIABLE_PACKAGE' ? 1 : item.quantity),
                    0,
                ),
            );
        sync();
        window.addEventListener('storage', sync);
        window.addEventListener('nexa:cart-updated', sync as EventListener);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('nexa:cart-updated', sync as EventListener);
        };
    }, []);

    useEffect(() => {
        if (!mobileOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = previous;
        };
    }, [mobileOpen]);

    const closeMobile = () => setMobileOpen(false);

    return (
        <div className="header">
            {topBarVisible ? (
                <div className="relative bg-blue-600 text-white">
                    <div className="mx-auto flex min-h-8 w-full max-w-[1200px] items-center justify-center px-10 text-center text-[11px] font-medium sm:px-14">
                        <span>Fast digital delivery · secure checkout · verified products</span>
                        <button
                            type="button"
                            onClick={dismissTopBar}
                            aria-label="Close announcement"
                            title="Close announcement"
                            className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-white/85 transition hover:bg-white/15 hover:text-white sm:right-5"
                        >
                            <X size={13} aria-hidden="true" />
                        </button>
                    </div>
                </div>
            ) : null}
            <header className="main-header">
                <div className="container">
                    <div className="px-[20px] xl:px-0 overflow-hidden">
                        <nav className="py-[15px] relative z-[99]">
                            <div className="p-[10px] lg:p-[12px] bg-white rounded-[12px] lg:rounded-[15px] border border-site-light-border">
                                <div className="flex items-center justify-between gap-6">
                                    <Link
                                        href="/"
                                        className="flex shrink-0 items-center gap-2 bg-white"
                                        onClick={closeMobile}
                                        aria-label={`${siteName} home`}
                                    >
                                        <div className="relative overflow-hidden w-[30px] md:w-[40px] h-[30px] md:h-[40px] rounded-[7px] md:rounded-[10px]">
                                            <StoreImage
                                                src={'/images/SMMExpertServiceLogo.png'}
                                                alt={siteName}
                                                width={640}
                                                height={520}
                                                sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                            />
                                        </div>
                                        <span className="text-[16px] md:text-[22px] font-bold tracking-[-0.035em] text-site-heading-font">
                                            {siteName}
                                        </span>
                                    </Link>

                                    <div className="hidden items-center gap-1 text-[12px] font-medium text-slate-600 lg:flex">
                                        <Link href="/" className="header__nav-link">
                                            Home
                                        </Link>
                                        <Link href="/shop" className="header__nav-link">
                                            Shop
                                        </Link>
                                        <Link href="/order-lookup" className="header__nav-link">
                                            Order Track
                                        </Link>
                                        <Link href="/contact" className="header__nav-link">
                                            Contact
                                        </Link>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Link
                                            href="/cart"
                                            className="bg__gradient-primary h-[30px] md:h-[40px] w-[30px] md:w-[40px] rounded-[7px] md:rounded-[10px] text-white relative inline-flex items-center justify-center"
                                        >
                                            <ShoppingBag className="size-[14px] md:size-[18px]" />
                                            {cartCount > 0 ? (
                                                <span className="absolute bg-white -top-1 -right-1.5 text-site-heading-font border rounded-full h-[22px] w-[22px] border-site-light-border inline-flex items-center justify-center text-[12px]">
                                                    {Math.min(cartCount, 99)}
                                                </span>
                                            ) : null}
                                        </Link>
                                        <button
                                            type="button"
                                            className="btn__ghost inline-flex h-[30px] md:h-[40px] w-[30px] md:w-[40px] lg:hidden"
                                            onClick={() => setMobileOpen((value) => !value)}
                                            aria-label="Toggle navigation"
                                            aria-expanded={mobileOpen}
                                        >
                                            {mobileOpen ? (
                                                <X className="size-[20px] md:size-[24px]" />
                                            ) : (
                                                <Menu className="size-[20px] md:size-[24px]" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </nav>

                        <div
                            className={`absolute left-0 right-0 top-0 w-full z-[98] bg-white transition-[max-height,opacity,transform] duration-500 ease-out lg:hidden ${mobileOpen ? 'max-h-[calc(100dvh-72px)] translate-y-0 opacity-100 block' : 'max-h-0 -translate-y-0 hidden opacity-0'}`}
                        >
                            <div className="container px-[20px] xl:px-0 pt-[90px] pb-[40px] overflow-y-scroll">
                                <div className="grid gap-2 border-b border-dashed border-slate-100 pb-4 text-[12px] font-medium text-slate-700">
                                    <Link
                                        href="/"
                                        onClick={closeMobile}
                                        className="header__nav-mobile-link"
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        href="/shop"
                                        onClick={closeMobile}
                                        className="header__nav-mobile-link"
                                    >
                                        Shop
                                    </Link>
                                    <Link
                                        href="/order-lookup"
                                        onClick={closeMobile}
                                        className="header__nav-mobile-link"
                                    >
                                        Track Order
                                    </Link>
                                </div>

                                <Link
                                    href="/contact"
                                    onClick={closeMobile}
                                    className="btn__primary mt-2 inline-flex h-[45px] w-full mt-5"
                                >
                                    Contact support
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </div>
    );
}
