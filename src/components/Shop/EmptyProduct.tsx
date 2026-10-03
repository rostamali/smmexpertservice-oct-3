'use client';

import { Boxes } from 'lucide-react';
import Link from 'next/link';

export default function EmptyProduct() {
    return (
        <>
            <div className="rounded-2xl border border-dashed card-box text-center py-[35px]">
                <Boxes className="mx-auto text-blue-500 size-[35px]" />
                <h2 className="mt-4 text-[18px] font-semibold text-site-heading-font">
                    No products found
                </h2>
                <p className="mt-2 text-[13px] text-site-body-font">
                    Try another category or return to the complete catalog.
                </p>
                <Link
                    className="mt-5 inline-flex h-11 items-center rounded-[12px] bg__gradient-primary px-4 text-[14px] font-semibold text-white"
                    href="/shop"
                >
                    Browse all products
                </Link>
            </div>
        </>
    );
}
