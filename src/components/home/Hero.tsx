import HeroSlider from '@/components/HeroSlider';

type HeroSlide = {
    imageUrl: string;
    href?: string;
    alt?: string;
};

type HeroProps = {
    slides: HeroSlide[];
};

export default function Hero({ slides = [] }: HeroProps) {
    const customImages = slides
        .filter((slide) => Boolean(slide.imageUrl?.trim()))
        .slice(0, 8)
        .map((slide, index) => ({
            src: slide.imageUrl,
            alt: slide.alt?.trim() || `SMMExpertService hero slide ${index + 1}`,
            href: slide.href?.trim() || undefined,
        }));

    if (customImages.length === 0) {
        return null;
    }

    return (
        <section className="bg-site-gray-bg pt-2 sm:pt-7 lg:pt-4">
            <div className="container px-[20px] xl:px-0">
                <HeroSlider images={customImages} />
            </div>
        </section>
    );
}
