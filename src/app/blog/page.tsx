import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import StoreImage from '@/components/StoreImage';
import ScrollReveal from '@/components/ScrollReveal';
import { getCachedBlogPosts } from '@/lib/storefront-cache';
import { stripHtml } from '@/lib/rich-html';
import { systemPageMetadata } from '@/lib/seo';

export const revalidate = 120;
export const dynamic = 'force-dynamic';

export const generateMetadata = () =>
    systemPageMetadata('blog', {
        title: 'Blog',
        description:
            'Latest social media marketing guides, product updates, and resources from SMMExpertService.',
        path: '/blog',
    });
type PublicBlogPost = {
    id: number;
    slug: string;
    title: string;
    excerpt: string | null;
    content: string;
    featuredImageUrl: string | null;
    publishedAt: string | null;
};
type BlogResult = { posts: PublicBlogPost[]; page: number; pageCount: number };
const formatDate = (value: string | null) => {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? ''
        : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

function PostMeta({ post }: { post: PublicBlogPost }) {
    return (
        <div className="text-[9px] font-semibold text-blue-600">
            SMMExpertService {post.publishedAt ? `· ${formatDate(post.publishedAt)}` : ''}
        </div>
    );
}

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const params = await searchParams;
    const requestedPage = Math.max(1, Number(params.page || 1) || 1);
    const result = (await getCachedBlogPosts(requestedPage, 12)) as BlogResult;
    const posts = Array.isArray(result?.posts) ? result.posts : [];
    const page = Number(result?.page || requestedPage);
    const pageCount = Math.max(1, Number(result?.pageCount || 1));
    const recent = posts.slice(0, 3);
    const allPosts = posts.slice(3);

    return (
        <main className="min-h-[70vh]">
            <section className="mx-auto max-w-[1200px] px-4 pb-14 pt-16 text-center sm:px-6 lg:px-0 lg:pb-20 lg:pt-20">
                <ScrollReveal>
                    <div className="mx-auto max-w-[680px]">
                        <span className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-site-primary">
                            Our blog
                        </span>
                        <h1 className="mt-3 mt-3 max-w-2xl mx-auto page__title text-center">
                            Stories and insights
                        </h1>
                        <p className="mx-auto mt-4 max-w-[560px] text-center text-[14px] text-site-body-font">
                            Product updates, practical social media marketing guides, and useful
                            ideas to help you choose services with confidence.
                        </p>
                    </div>
                </ScrollReveal>
            </section>
            <section className="mx-auto max-w-[1200px] px-4 pb-20 sm:px-6 lg:px-0">
                {!posts.length ? (
                    <div className="card-box border-dashed text-center">
                        <BookOpen className="mx-auto text-blue-500" size={26} />
                        <h2 className="mt-4 text-[16px] font-semibold text-slate-950">
                            No blog posts published yet
                        </h2>
                        <p className="mt-2 text-[12px] text-slate-500">
                            Published posts will appear here.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-7 text-[16px] font-semibold text-slate-950">
                            Recent blog posts
                        </div>
                        <div className="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
                            {recent[0] ? (
                                <ScrollReveal>
                                    <article>
                                        <Link
                                            href={`/blog/${recent[0].slug}`}
                                            className="block overflow-hidden rounded-2xl bg-slate-100"
                                        >
                                            {recent[0].featuredImageUrl ? (
                                                <StoreImage
                                                    src={recent[0].featuredImageUrl}
                                                    alt={recent[0].title}
                                                    width={820}
                                                    height={520}
                                                    className="aspect-[1.55] w-full object-cover transition duration-500 hover:scale-[1.02]"
                                                />
                                            ) : (
                                                <div className="grid aspect-[1.55] place-items-center text-blue-500">
                                                    <BookOpen size={32} />
                                                </div>
                                            )}
                                        </Link>
                                        <div className="pt-4">
                                            <PostMeta post={recent[0]} />
                                            <h2 className="mt-2 flex items-start justify-between gap-4 text-[18px] font-semibold text-slate-950">
                                                <Link href={`/blog/${recent[0].slug}`}>
                                                    {recent[0].title}
                                                </Link>
                                                <ArrowRight
                                                    size={14}
                                                    className="mt-1 shrink-0 -rotate-45"
                                                />
                                            </h2>
                                            <p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-600">
                                                {recent[0].excerpt ||
                                                    stripHtml(recent[0].content).slice(0, 190)}
                                            </p>
                                            <div className="mt-3 flex gap-2">
                                                <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] font-medium text-blue-700">
                                                    SMM
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-medium text-slate-600">
                                                    Guide
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                </ScrollReveal>
                            ) : null}
                            <div className="grid gap-6">
                                {recent.slice(1).map((post, index) => (
                                    <ScrollReveal key={post.id} delay={index * 70}>
                                        <article className="grid gap-4 sm:grid-cols-[210px_1fr]">
                                            <Link
                                                href={`/blog/${post.slug}`}
                                                className="overflow-hidden rounded-xl bg-slate-100"
                                            >
                                                {post.featuredImageUrl ? (
                                                    <StoreImage
                                                        src={post.featuredImageUrl}
                                                        alt={post.title}
                                                        width={420}
                                                        height={300}
                                                        className="aspect-[1.4] h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="grid h-full min-h-36 place-items-center text-blue-500">
                                                        <BookOpen size={24} />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="py-1">
                                                <PostMeta post={post} />
                                                <h2 className="mt-2 text-[14px] font-semibold text-slate-950">
                                                    <Link href={`/blog/${post.slug}`}>
                                                        {post.title}
                                                    </Link>
                                                </h2>
                                                <p className="mt-2 line-clamp-3 text-[9px] leading-5 text-slate-600">
                                                    {post.excerpt ||
                                                        stripHtml(post.content).slice(0, 150)}
                                                </p>
                                                <div className="mt-3 inline-flex rounded-full bg-blue-50 px-2 py-1 text-[8px] text-blue-700">
                                                    Updates
                                                </div>
                                            </div>
                                        </article>
                                    </ScrollReveal>
                                ))}
                            </div>
                        </div>

                        <div className="mt-16 mb-7 text-[16px] font-semibold text-slate-950">
                            All blog posts
                        </div>
                        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                            {(allPosts.length ? allPosts : posts).map((post, index) => (
                                <ScrollReveal key={post.id} delay={Math.min(index * 40, 200)}>
                                    <article>
                                        <Link
                                            href={`/blog/${post.slug}`}
                                            className="block overflow-hidden rounded-xl bg-slate-100"
                                        >
                                            {post.featuredImageUrl ? (
                                                <StoreImage
                                                    src={post.featuredImageUrl}
                                                    alt={post.title}
                                                    width={520}
                                                    height={340}
                                                    className="aspect-[1.48] w-full object-cover transition duration-500 hover:scale-[1.025]"
                                                />
                                            ) : (
                                                <div className="grid aspect-[1.48] place-items-center text-blue-500">
                                                    <BookOpen size={28} />
                                                </div>
                                            )}
                                        </Link>
                                        <div className="pt-3">
                                            <PostMeta post={post} />
                                            <h2 className="mt-2 flex items-start justify-between gap-3 text-[13px] font-semibold leading-snug text-slate-950">
                                                <Link href={`/blog/${post.slug}`}>
                                                    {post.title}
                                                </Link>
                                                <ArrowRight
                                                    size={12}
                                                    className="mt-1 shrink-0 -rotate-45"
                                                />
                                            </h2>
                                            <p className="mt-2 line-clamp-2 text-[9px] leading-5 text-slate-600">
                                                {post.excerpt ||
                                                    stripHtml(post.content).slice(0, 150)}
                                            </p>
                                            <div className="mt-3 flex gap-2">
                                                <span className="rounded-full bg-blue-50 px-2 py-1 text-[8px] text-blue-700">
                                                    Marketing
                                                </span>
                                                <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] text-slate-600">
                                                    Research
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                </ScrollReveal>
                            ))}
                        </div>
                    </>
                )}

                {pageCount > 1 ? (
                    <nav
                        className="mt-12 flex items-center justify-between border-t border-slate-200 pt-5 text-[9px]"
                        aria-label="Blog pagination"
                    >
                        <span>
                            {page > 1 ? (
                                <Link
                                    href={page <= 2 ? '/blog' : `/blog?page=${page - 1}`}
                                    className="text-slate-500 hover:text-blue-600"
                                >
                                    ← Previous
                                </Link>
                            ) : (
                                <span />
                            )}
                        </span>
                        <span className="text-slate-500">
                            Page {page} of {pageCount}
                        </span>
                        <span>
                            {page < pageCount ? (
                                <Link
                                    href={`/blog?page=${page + 1}`}
                                    className="text-slate-500 hover:text-blue-600"
                                >
                                    Next →
                                </Link>
                            ) : null}
                        </span>
                    </nav>
                ) : null}
            </section>
        </main>
    );
}
