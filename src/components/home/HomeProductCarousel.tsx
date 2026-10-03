'use client';

import { Children, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

export default function HomeProductCarousel({ children }: { children: ReactNode }) {
    const items = Children.toArray(children);
    if (!items.length) return null;

    return (
        <div className="relative">
            <div className="mb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-sm font-semibold text-blue-600">Popular products</span>
                    <h2 className="mt-2 text-3xl font-bold tracking-[-0.04em] text-site-heading-font sm:text-4xl">
                        Explore top-rated services
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-site-body-font">
                        Sorted by the highest custom review count, so the most-reviewed products
                        appear first.
                    </p>
                </div>
                <div className="flex shrink-0 gap-2">
                    <button
                        type="button"
                        aria-label="Previous products"
                        className="home-products-prev grid size-9 sm:size-10 place-items-center rounded-xl border border-slate-200 bg-white text-site-heading-font transition hover:border-blue-200 hover:text-site-primary disabled:cursor-not-allowed disabled:opacity-35"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        type="button"
                        aria-label="Next products"
                        className="home-products-next grid size-9 sm:size-10 place-items-center rounded-xl border border-slate-200 bg-white text-site-heading-font transition hover:border-blue-200 hover:text-site-primary disabled:cursor-not-allowed disabled:opacity-35"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
            <div className="overflow-hidden">
                <Swiper
                    modules={[Autoplay, Navigation]}
                    className="home-products-swiper"
                    speed={650}
                    loop={items.length > 4}
                    rewind={items.length > 2 && items.length <= 4}
                    watchOverflow
                    autoplay={
                        items.length > 2
                            ? {
                                  delay: 3500,
                                  disableOnInteraction: false,
                                  pauseOnMouseEnter: true,
                              }
                            : false
                    }
                    navigation={{
                        prevEl: '.home-products-prev',
                        nextEl: '.home-products-next',
                    }}
                    breakpoints={{
                        0: { slidesPerView: 2, spaceBetween: 12 },
                        640: { slidesPerView: 2, spaceBetween: 20 },
                        1024: { slidesPerView: 4, spaceBetween: 20 },
                    }}
                >
                    {items.map((item, index) => (
                        <SwiperSlide key={index}>{item}</SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
}
