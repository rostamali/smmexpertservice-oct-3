import Link from 'next/link';
import { ArrowUpRight, Boxes } from 'lucide-react';
import ProductRating from '@/components/ProductRating';
import StoreImage from '@/components/StoreImage';
import { money } from '@/lib/money';
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

export default function ProductCardSm({
    product,
    currency,
}: {
    product: ProductCardProduct;
    currency: string;
}) {
    return (
        <article
            className={cn(
                'group flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_28px_rgba(15,23,42,.06)] transition duration-300 hover:-translate-y-2 hover:border-blue-200 hover:shadow-[0_16px_42px_rgba(59,130,246,.12)] relative',
                product.className,
            )}
        >
            {product.badgeText ? (
                <span className="absolute top-0 left-[50%] translate-x-[-50%] bg-gradient-to-b from-[#ff4d4f] to-[#FF0036] text-white text-[10px] font-semibold tracking-normal leading-[1em] px-[7px] py-[5px] rounded-b-sm z-[30]">
                    {product.badgeText}
                </span>
            ) : null}
            <Link href={`/product/${product.slug}`} className="relative block p-2.5 xl:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative overflow-hidden w-full sm:w-[78px] h-[78px] rounded-2xl">
                        {product.imageUrl ? (
                            <StoreImage
                                src={product.imageUrl}
                                alt={product.name}
                                width={640}
                                height={520}
                                sizes="(min-width:1280px) 25vw, (min-width:640px) 50vw, 100vw"
                                className="h-full w-full object-contain transition duration-500 group-hover:scale-130"
                            />
                        ) : (
                            <div className="grid h-full place-items-center text-blue-500">
                                <Boxes size={30} />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <h3 className="text-[16px] font-semibold leading-[1.2em] sm:text-[20px] xl:font-bold xl:leading-[1.106em] tracking-[-0.03em] text-slate-950">
                            {product.name}
                        </h3>
                        <ProductRating
                            rating={product.starRating}
                            count={product.ratingCount}
                            compact
                        />
                    </div>
                </div>

                <div className="flex flex-1 flex-col mt-4">
                    <div className="mt-auto flex items-end justify-between gap-3">
                        <div>
                            <div className="text-[7px] sm:text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-400">
                                Starting from
                            </div>
                            <div className="mt-1 text-[14px] sm:text-[17px] font-semibold tracking-[-0.03em] text-primary">
                                {product.startingPrice == null
                                    ? 'Unavailable'
                                    : money(product.startingPrice, currency)}
                            </div>
                        </div>
                        <div
                            aria-label={`View ${product.name}`}
                            className="grid h-6 sm:h-8 w-6 sm:w-8 place-items-center rounded-md sm:rounded-lg bg-blue-500 text-white transition hover:bg-blue-600"
                        >
                            <ArrowUpRight className="size-3 sm:size-4 md:size-5" />
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}
