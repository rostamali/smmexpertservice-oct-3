import Link from 'next/link';
import { Mail, Phone, Send } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';
import { contactData } from '@/config/contact-data';
import { systemPageMetadata } from '@/lib/seo';

export const generateMetadata = () =>
    systemPageMetadata('contact', {
        title: 'Contact Support',
        description:
            'Need help with your order or accounts? Contact SMMExpertService for fast support, order assistance, and secure communication anytime.',
        path: '/contact',
    });

export default async function ContactPage() {
    return (
        <main className="bg-site-gray-bg">
            <section>
                <div className="container px-[20px] xl:px-0 pt-[30px] xl:pt-[60px] pb-[80px]">
                    <ScrollReveal>
                        <div className="mx-auto max-w-[720px] text-center">
                            <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-site-primary">
                                Contact us
                            </span>
                            <h1 className="mt-3 page__title">We&apos;d love to hear from you</h1>
                            <p className="mt-4 text-center text-[13px] leading-5 text-site-body-font">
                                Our support team is here to help with products, checkout, payments,
                                and orders.
                            </p>
                        </div>
                    </ScrollReveal>

                    <div className="mt-16 grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {contactData.map(({ icon: Icon, title, text, value, href }) => (
                            <ScrollReveal key={title}>
                                <div className="card-box h-full">
                                    <div className="flex gap-3">
                                        <span className="mx-auto grid h-12 w-12 place-items-center bg__gradient-primary rounded-[12px] text-white">
                                            <Icon className="size-[22px]" />
                                        </span>
                                        <div className="flex-1">
                                            <h2 className="text-[16px] font-semibold text-site-heading-font">
                                                {title}
                                            </h2>
                                            <p className="mt-1 text-[14px] text-site-body-font">
                                                {text}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        href={href}
                                        target="_blank"
                                        className="mt-5 inline-block text-[14px] font-medium text-site-primary"
                                    >
                                        {value}
                                    </Link>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}
