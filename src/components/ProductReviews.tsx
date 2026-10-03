import { Star } from 'lucide-react';

type Review = {
    id: number;
    reviewerName: string;
    rating: number;
    comment: string;
    reviewDate: string;
    variant: { id: number; label: string } | null;
};

const dateLabel = (value: string) => {
    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? ''
        : date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          });
};

/**
 * Hide reviewer name for privacy.
 * Example:
 * "Mim Akter Chowdhury" => "Mim****ry"
 * "Rakibul Hasan" => "Rak****an"
 */
const maskReviewerName = (value: string) => {
    const name = value.trim();
    const chars = Array.from(name);
    const length = chars.length;

    if (!length) return 'Anonymous';

    // Short-name fallback
    if (length <= 2) {
        return `${chars[0]}${'*'.repeat(Math.max(1, length - 1))}`;
    }

    if (length <= 5) {
        return `${chars[0]}${'*'.repeat(length - 2)}${chars[length - 1]}`;
    }

    // First 3 + exact hidden character count + last 2
    const firstThree = chars.slice(0, 3).join('');
    const lastTwo = chars.slice(-2).join('');
    const hiddenCount = length - 5;

    return `${firstThree}${'*'.repeat(hiddenCount)}${lastTwo}`;
};

export default function ProductReviews({
    reviews,
    showEmpty = false,
}: {
    reviews: Review[];
    showEmpty?: boolean;
}) {
    if (!reviews.length) {
        return showEmpty ? (
            <section>
                <h2 className="text-3xl font-bold text-slate-950">Customer Reviews</h2>

                <p className="mt-2 text-sm text-slate-600">No published reviews yet.</p>
            </section>
        ) : null;
    }

    const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

    return (
        <section>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="text-sm font-semibold text-blue-600">Customer feedback</span>

                    <h2 className="mt-1 text-3xl font-bold tracking-[-0.035em] text-slate-950">
                        Customer Reviews
                    </h2>
                </div>

                <div className="rounded-xl bg-blue-50 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <strong className="text-3xl text-slate-950">{average.toFixed(1)}</strong>

                        <div>
                            <div className="flex gap-0.5 text-amber-400">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <Star
                                        key={value}
                                        size={15}
                                        fill={
                                            value <= Math.round(average) ? 'currentColor' : 'none'
                                        }
                                    />
                                ))}
                            </div>

                            <span className="mt-1 block text-xs text-slate-500">
                                {reviews.length} review
                                {reviews.length === 1 ? '' : 's'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-7 single__product-box flex flex-col gap-[15px]">
                {reviews.map((review) => (
                    <article
                        key={review.id}
                        className="border-b border-dashed border-[#e5e5e5] pb-[15px] last:border-b-0 last:pb-0"
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <strong className="block text-sm sm:text-base text-slate-950">
                                    {maskReviewerName(review.reviewerName)}
                                </strong>

                                <div className="mt-[8px] flex gap-0.5 text-amber-400">
                                    {[1, 2, 3, 4, 5].map((value) => (
                                        <Star
                                            key={value}
                                            size={14}
                                            fill={
                                                value <= Math.round(review.rating)
                                                    ? 'currentColor'
                                                    : 'none'
                                            }
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <p className="mt-[8px] text-sm leading-7 text-site-body-font">
                            {review.comment}
                        </p>

                        <div className="pt-4 text-xs text-site-body-font flex gap-[3px] flex-wrap">
                            <span>Product variation:</span>
                            <span className="text-site-heading-font font-semibold">
                                {review.variant?.label || 'Standard'}
                            </span>
                        </div>

                        <span className="mt-2 block text-xs text-site-body-font">
                            {dateLabel(review.reviewDate)}
                        </span>
                    </article>
                ))}
            </div>
        </section>
    );
}
