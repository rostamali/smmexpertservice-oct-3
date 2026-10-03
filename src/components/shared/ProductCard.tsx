import Link from 'next/link';
import { ArrowUpRight, Boxes, Star } from 'lucide-react';
import ProductRating from '@/components/ProductRating';
import StoreImage from '@/components/StoreImage';
import { money } from '@/lib/money';
import { stripHtml } from '@/lib/rich-html';
import { cn } from '@/lib/utils';

export type ProductCardProduct = {
    id: number;
    name: string;
    slug: string;
    shortDescription?: string | null;
    imageUrl?: string | null;
    badgeText?: string | null;
    className?: string | null;
    stock?: number | null;
    starRating?: number | null;
    ratingCount?: number;
    startingPrice?: number | null;
    category: { name: string };
};

export default function ProductCard({
    product,
    currency,
}: {
    product: ProductCardProduct;
    currency: string;
}) {
    const description = product.shortDescription
        ? stripHtml(product.shortDescription).replace(/\s+/g, ' ').trim()
        : '';
    const truncatedDescription =
        description.length > 90 ? `${description.slice(0, 90).trimEnd()}...` : description;

    return (
        <article className={cn('group product__card', product.className)}>
            <Link href={`/product/${product.slug}`} className="relative block overflow-hidden">
                <div className="relative overflow-hidden w-full h-[125px] sm:h-[250px] lg:h-[200px] xl:h-[245px] rounded-[8px] md:rounded-[12px]">
                    {product.imageUrl ? (
                        <StoreImage
                            src={product.imageUrl}
                            alt={product.name}
                            width={640}
                            height={520}
                            sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="grid h-full place-items-center text-blue-500">
                            <Boxes size={30} />
                        </div>
                    )}
                    {product.badgeText ? (
                        <span className="product__badge">{product.badgeText}</span>
                    ) : null}
                </div>

                <div className="flex flex-1 flex-col justify-between mt-[12px] gap-[6px] sm:gap-[15px]">
                    <div className="header flex flex-col gap-[10px] sm:gap-[15px]">
                        <div className="title">
                            <h3 className="text-[16px] sm:text-[20px] font-bold xl:font-semibold leading-[1.2em] xl:leading-[1.106em] tracking-[-0.03em] text-site-heading-font group-hover:text-site-primary transition-all">
                                {product.name}
                            </h3>
                            <div className="flex items-center gap-[3px] mt-[5px] sm:mt-[9px]">
                                <span className="text-[#FABF24] ">
                                    <Star className="size-[15px] fill-[#FABF24]" />
                                </span>
                                <div className="flex items-center gap-[2px] text-[13px] leading-[1.4em]">
                                    <span className="font-semibold text-site-heading-font">
                                        {Math.max(
                                            0,
                                            Math.min(5, Number(product.starRating)),
                                        ).toFixed(1)}
                                    </span>
                                    <span className="text-site-body-font">
                                        ({product.ratingCount})
                                    </span>
                                </div>
                            </div>
                        </div>
                        {truncatedDescription ? (
                            <p className="text-[14px] line-clamp-2 sm:line-clamp-none leading-5 text-site-body-font normal-case">
                                {truncatedDescription}
                            </p>
                        ) : null}
                    </div>

                    <div className="flex items-end justify-between gap-3">
                        <div>
                            <span className="uppercase text-[9px] sm:text-[12px] font-medium text-site-heading-font">
                                Starting Price
                            </span>
                            <div className="text-[18px] sm:text-[22px] font-semibold tracking-[-0.03em] text-site-primary">
                                {product.startingPrice == null
                                    ? 'Unavailable'
                                    : money(product.startingPrice, currency)}
                            </div>
                        </div>
                        <div aria-label={`View ${product.name}`} className="product__card-cta--btn">
                            <ArrowUpRight className="size-[14px] sm:size-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
