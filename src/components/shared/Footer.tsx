import Link from 'next/link';
import { ArrowRight, Mail, ShoppingBag } from 'lucide-react';
import StoreImage from '../StoreImage';

export default function Footer({
    siteName,
    footerText,
    variant = 'dark',
}: {
    siteName: string;
    footerText?: string | null;
    variant?: 'brand' | 'dark';
}) {
    const brand = variant === 'brand';
    return (
        <footer className="bg-[#0B0D12]">
            <div className="container px-4 sm:px-6 lg:px-0">
                <div
                    className={`grid gap-6 border-b border-[#26262682] py-10 sm:grid-cols-[1fr_auto] sm:items-center `}
                >
                    <div>
                        <h2 className="text-[22px] md:text-[30px] font-semibold text-[#fafafa]">
                            Need a different configuration?
                        </h2>
                        <p
                            className={`mt-2 max-w-md text-[17px] md:text-[18px] leading-5 text-white`}
                        >
                            Contact our team for a custom solution tailored to your specific needs.
                        </p>
                    </div>
                    <Link
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-[8px] bg__gradient-primary px-5 text-sm font-bold text-white"
                        href="/contact"
                    >
                        Contact Support <ArrowRight size={15} />
                    </Link>
                </div>

                <div className="grid gap-10 py-12 lg:grid-cols-[1.5fr_.8fr_.8fr_.8fr]">
                    <div>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 text-[18px] font-bold tracking-[-.035em] text-white"
                        >
                            <div className="relative overflow-hidden w-[30px] h-[30px] rounded-[7px] md:rounded-[8px]">
                                <StoreImage
                                    src={'/images/SMMExpertServiceLogo.png'}
                                    alt={siteName}
                                    width={640}
                                    height={520}
                                    sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
                                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                                />
                            </div>
                            {siteName}
                        </Link>
                        <p className={`mt-4 max-w-[300px] text-[14px] leading-5 text-white`}>
                            {footerText ||
                                'Reliable social media marketing products, configurable options, secure checkout, and responsive support.'}
                        </p>
                        <Link
                            href="/contact"
                            className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold text-white transition hover:opacity-80"
                        >
                            <Mail size={12} /> Contact support
                        </Link>
                    </div>

                    <nav>
                        <h3 className="text-[12px] sm:text-[14px] font-semibold text-white mb-3 uppercase">
                            Best Sellings
                        </h3>
                        <div className={`flex flex-col items-start gap-3`}>
                            <Link href="/product/facebook-accounts" className="footer__nav-link">
                                Facebook Accounts
                            </Link>
                            <Link href="/product/instagram-accounts" className="footer__nav-link">
                                Instagram Accounts
                            </Link>
                            <Link href="/product/telegram-accounts" className="footer__nav-link">
                                Telegram Accounts
                            </Link>
                        </div>
                    </nav>

                    <nav>
                        <h3 className="text-[12px] sm:text-[14px] font-semibold text-white mb-3 uppercase">
                            Other accounts
                        </h3>
                        <div className={`flex flex-col items-start gap-3`}>
                            <Link href="/product/linkedin-accounts" className="footer__nav-link">
                                LinkedIn Accounts
                            </Link>
                            <Link href="/product/gmail-accounts" className="footer__nav-link">
                                Gmail Accounts
                            </Link>
                            <Link href="/product/x-twitter-accounts" className="footer__nav-link">
                                X(Twitter) Accounts
                            </Link>
                        </div>
                    </nav>

                    <nav>
                        <h3 className="text-[12px] sm:text-[14px] font-semibold text-white mb-3 uppercase">
                            Quick
                        </h3>
                        <div className={`flex flex-col items-start gap-3`}>
                            <Link href="/order-lookup" className="footer__nav-link">
                                Track order
                            </Link>
                            <Link href="/contact" className="footer__nav-link">
                                Contact support
                            </Link>
                            <Link href="/shop" className="footer__nav-link">
                                Browse accounts
                            </Link>
                        </div>
                    </nav>
                </div>

                <div
                    className={`flex flex-col gap-3 border-t border-[#26262682] py-6 text-[12px] sm:text-[14px] text-body-font-dark sm:flex-row sm:items-center sm:justify-between`}
                >
                    <span className="text-white">
                        © {new Date().getFullYear()} {siteName}. All rights reserved.
                    </span>
                    <span className="inline-flex items-center gap-2 text-white">
                        <ShoppingBag size={10} /> Secure checkout experience
                    </span>
                </div>
            </div>
        </footer>
    );
}
