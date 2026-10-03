import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
export default function NotFoundView() {
    return (
        <main className="grid min-h-[72vh] place-items-center bg-site-gray-bg px-[20px] py-20">
            <div className="w-full max-w-[720px] text-center">
                <div className="text-[clamp(7rem,20vw,14rem)] font-bold leading-[.72] tracking-[-0.1em] text-site-heading-font/20">
                    404
                </div>
                <div className="relative -mt-2 sm:-mt-7">
                    <span className="text-[12px] font-semibold text-blue-600">Page missing</span>
                    <h1 className="mx-auto mt-4 max-w-[620px] text-[38px] font-bold leading-[1.02] tracking-[-.045em] text-site-heading-font sm:text-[52px]">
                        This page is no longer available.
                    </h1>
                    <p className="mx-auto mt-4 max-w-lg text-[12px] leading-5 text-site-body-font">
                        The page may have moved, changed, or no longer exists. Return home or
                        continue browsing the catalog.
                    </p>
                    <div className="mt-7 flex flex-wrap justify-center gap-2.5">
                        <Link
                            href="/"
                            className="inline-flex h-[45px] items-center rounded-lg border border-slate-300 bg-white px-5 text-[14px] font-semibold text-slate-700"
                        >
                            Back home
                        </Link>
                        <Link
                            href="/shop"
                            className="inline-flex h-[45px] items-center gap-2 rounded-lg bg-blue-500 px-5 text-[14px] font-semibold text-white hover:bg-blue-600"
                        >
                            Browse products <ArrowUpRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
}
