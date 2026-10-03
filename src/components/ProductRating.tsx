import { Star } from 'lucide-react';

export default function ProductRating({
    rating,
    count,
    compact = false,
}: {
    rating: number | null | undefined;
    count: number | null | undefined;
    compact?: boolean;
}) {
    if (rating == null) return null;
    const normalized = Math.max(0, Math.min(5, Number(rating)));
    const ratingCount = Math.max(0, Number(count || 0));
    const rounded = Math.round(normalized);
    return (
        <div
            className={`inline-flex items-center gap-0.5 sm:gap-1.5`}
            aria-label={`${normalized.toFixed(1)} out of 5 from ${ratingCount} ratings`}
        >
            <span
                className="inline-flex items-center gap-0 lg:gap-0.5 text-[#FABF24]"
                aria-hidden="true"
            >
                {[1, 2, 3, 4, 5].map((value) => (
                    <Star
                        key={value}
                        className="size-[15px] -mt-[2px]"
                        fill={value <= rounded ? 'currentColor' : 'none'}
                    />
                ))}
            </span>
            <span className="text-site-heading-font text-[15px] font-medium">
                {normalized.toFixed(1)}
            </span>
            <span className="text-site-body-font text-[15px]">({ratingCount})</span>
        </div>
    );
}
