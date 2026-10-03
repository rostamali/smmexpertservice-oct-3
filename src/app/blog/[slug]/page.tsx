import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays } from 'lucide-react';
import StoreImage from '@/components/StoreImage';
import ScrollReveal from '@/components/ScrollReveal';
import { contentMetadata } from '@/lib/seo';
import { scopedCss } from '@/lib/scoped-css';
import { redirectOr404 } from '@/lib/seo-navigation';
import { getCachedBlogPosts, getCachedContentBySlug } from '@/lib/storefront-cache';
import { stripHtml } from '@/lib/rich-html';

export const revalidate = 120;
type RelatedPost = { id: number; slug: string; title: string; excerpt: string | null; content: string; featuredImageUrl: string | null; publishedAt: string | null };
const formatDate = (value?: string | null) => { if (!value) return ''; const date = new Date(value); return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); };
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const entry = await getCachedContentBySlug('POST', slug); return entry ? contentMetadata(entry, 'post') : {}; }

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = await getCachedContentBySlug('POST', slug);
  if (!entry) return redirectOr404(`/blog/${slug}`);
  if (entry.type !== 'POST' || entry.status !== 'PUBLISHED') notFound();
  const customScope = `content-custom-${entry.id}`; const customStyle = scopedCss(entry.customCss, customScope);
  const schema = entry.schemaJson || { '@context': 'https://schema.org', '@type': entry.schemaType || 'BlogPosting', headline: entry.title, description: entry.seoDescription || entry.excerpt || undefined, image: entry.featuredImageUrl || undefined, datePublished: entry.publishedAt || undefined, dateModified: entry.updatedAt };
  const rawRelated = await getCachedBlogPosts(1, 8).catch(() => ({ posts: [] }));
  const relatedPosts = (Array.isArray(rawRelated?.posts) ? rawRelated.posts : []) as RelatedPost[];
  const related = relatedPosts.filter((post) => post.slug !== slug).slice(0, 3);
  return <main className="min-h-[70vh] bg-white text-slate-600">
    {customStyle ? <style dangerouslySetInnerHTML={{ __html: customStyle }} /> : null}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
    <section className="mx-auto max-w-[900px] px-4 pb-10 pt-16 text-center sm:px-6 lg:pt-20"><Link href="/blog" className="inline-flex items-center gap-2 text-[9px] font-semibold text-blue-600"><ArrowLeft size={13}/> Back to blog</Link><span className="mx-auto mt-5 block text-[9px] font-semibold text-blue-600">Article</span><h1 className="mx-auto mt-4 text-[38px] font-bold leading-[1.05] tracking-[-0.045em] text-slate-950 sm:text-[52px]">{entry.title}</h1>{entry.excerpt ? <p className="mx-auto mt-5 max-w-2xl text-[11px] leading-6 text-slate-600">{entry.excerpt}</p> : null}{entry.publishedAt ? <div className="mt-5 inline-flex items-center gap-2 text-[9px] text-slate-500"><CalendarDays size={13}/>{formatDate(entry.publishedAt)}</div> : null}</section>
    <article className="mx-auto max-w-[1200px] px-4 pb-16 sm:px-6"><div className="mx-auto max-w-[900px]">{entry.featuredImageUrl ? <ScrollReveal><div className="mb-10 overflow-hidden rounded-2xl bg-slate-100"><StoreImage src={entry.featuredImageUrl} alt={entry.title} width={1500} height={940} sizes="(max-width:900px) 100vw, 900px" className="h-auto w-full object-cover"/></div></ScrollReveal> : null}<ScrollReveal delay={60}><div className={`rich-copy ${customScope} text-[15px] leading-8 text-slate-700 [&_a]:font-semibold [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-7 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:bg-blue-50 [&_blockquote]:px-6 [&_blockquote]:py-4 [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:tracking-[-0.035em] [&_h2]:text-slate-950 [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-slate-950 [&_img]:my-8 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-2xl [&_li]:my-2 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-5 [&_pre]:my-7 [&_pre]:overflow-x-auto [&_pre]:rounded-xl [&_pre]:bg-slate-950 [&_pre]:p-5 [&_pre]:text-slate-100 [&_strong]:font-semibold [&_strong]:text-slate-950 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6`} dangerouslySetInnerHTML={{ __html: entry.content }}/></ScrollReveal></div></article>
    {related.length ? <section className="border-t border-slate-200 bg-slate-50 py-14"><div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-0"><div className="flex items-end justify-between gap-4"><div><span className="text-[9px] font-semibold text-blue-600">Keep reading</span><h2 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-slate-950">More from the blog</h2></div><Link href="/blog" className="hidden items-center gap-2 text-[9px] font-semibold text-blue-600 sm:inline-flex">View all <ArrowRight size={13}/></Link></div><div className="mt-8 grid gap-6 md:grid-cols-3">{related.map((post, index)=><ScrollReveal key={post.id} delay={index*60}><article><Link href={`/blog/${post.slug}`} className="block aspect-[104/85] overflow-hidden rounded-xl bg-white">{post.featuredImageUrl ? <StoreImage src={post.featuredImageUrl} alt={post.title} width={800} height={650} className="h-full w-full object-cover transition duration-500 hover:scale-[1.03]"/> : <div className="grid h-full place-items-center text-blue-500"><BookOpen size={30}/></div>}</Link><div className="pt-4"><h3 className="text-[14px] font-semibold leading-snug text-slate-950"><Link href={`/blog/${post.slug}`}>{post.title}</Link></h3><p className="mt-2 line-clamp-2 text-[10px] leading-5 text-slate-600">{post.excerpt || stripHtml(post.content).slice(0,130)}</p></div></article></ScrollReveal>)}</div></div></section> : null}
  </main>;
}
