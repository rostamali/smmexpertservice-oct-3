'use client';

import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import StoreImage from '@/components/StoreImage';

export type HeroSliderImage = {
    src: string;
    alt: string;
    href?: string;
};

const externalLink = (href: string) => /^https?:\/\//i.test(href);

export default function HeroSlider({ images }: { images: HeroSliderImage[] }) {
    if (!images.length) return null;
    const interactive = images.length > 1;

    return (
        <div
            className="home-hero-swiper overflow-hidden rounded-[16px] lg:rounded-[25px] border border-site-light-border shadow-[0_20px_55px_rgba(15,23,42,.08)]"
            aria-label="Homepage image slider"
        >
            <Swiper
                className="hero-lg-slider"
                modules={[Autoplay, Navigation, Pagination]}
                slidesPerView={1}
                loop={interactive}
                speed={700}
                grabCursor={interactive}
                navigation={interactive}
                pagination={interactive ? { clickable: true } : false}
                autoplay={interactive ? { delay: 5000, disableOnInteraction: false } : false}
            >
                {images.map((image, index) => {
                    const visual = (
                        <div className="w-full h-[200px] sm:h-[350px] lg:h-[450px]">
                            <StoreImage
                                src={image.src}
                                alt={image.alt}
                                width={1600}
                                height={700}
                                sizes="(max-width: 1200px) 100vw, 1200px"
                                className="h-full w-full select-none object-cover"
                                priority={index === 0}
                            />
                        </div>
                    );
                    return (
                        <SwiperSlide key={`${image.src}-${index}`}>
                            {image.href ? (
                                <a
                                    href={image.href}
                                    target={externalLink(image.href) ? '_blank' : undefined}
                                    rel={
                                        externalLink(image.href) ? 'noreferrer noopener' : undefined
                                    }
                                    aria-label={image.alt || `Open hero slide ${index + 1}`}
                                    className="block"
                                >
                                    {visual}
                                </a>
                            ) : (
                                visual
                            )}
                        </SwiperSlide>
                    );
                })}
            </Swiper>
        </div>
    );
}
