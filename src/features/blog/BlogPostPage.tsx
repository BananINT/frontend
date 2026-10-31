import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { ArrowLeft, CalendarDays, Check, Clock3, Copy, Download, BookOpen, Cpu, Shield, TrendingUp } from 'lucide-react';
import { getArticleBySlug, getRelatedArticles, getRenamedSlug } from './articles/articlesData';
import { MarkdownArticleRenderer } from './components/MarkdownArticleRenderer';
import { TableOfContents } from './components/TableOfContents';
import { FaqSection } from './components/FaqSection';
import { ArticleCard } from './components/ArticleCard';
import { SeoHead } from './components/SeoHead';
import { articleJsonLd, articleUrl } from './seo';
import type { BlogCategory } from './types';
import { cn } from '@app/lib/utils';

const CATEGORY_MAP: Record<BlogCategory, { label: string; icon: typeof BookOpen; color: string }> = {
    campus: { label: 'Vie de campus', icon: BookOpen, color: 'border-banan-primary/60 bg-banan-primary/15 text-banan-primary' },
    coulisses: { label: 'Coulisses', icon: Cpu, color: 'border-orange-400/60 bg-orange-400/15 text-orange-300' },
    tutoriel: { label: 'Tutoriel', icon: BookOpen, color: 'border-emerald-400/60 bg-emerald-400/15 text-emerald-300' },
    guide: { label: 'Marché', icon: TrendingUp, color: 'border-cyan-400/60 bg-cyan-400/15 text-cyan-300' },
    strategie: { label: 'Clans', icon: Shield, color: 'border-amber-400/60 bg-amber-400/15 text-amber-300' },
    telechargement: { label: 'Ressources', icon: Download, color: 'border-violet-400/60 bg-violet-400/15 text-violet-300' },
    architecture: { label: 'Technique', icon: Cpu, color: 'border-rose-400/60 bg-rose-400/15 text-rose-300' },
};

const TAG_COLORS = [
    'border-banan-primary/50 bg-banan-primary/10 text-banan-primary hover:bg-banan-primary hover:text-black',
    'border-cyan-400/50 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400 hover:text-black',
    'border-emerald-400/50 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400 hover:text-black',
    'border-orange-400/50 bg-orange-400/10 text-orange-300 hover:bg-orange-400 hover:text-black',
];

function ReadingProgress() {
    const [progress, setProgress] = useState(0);
    useEffect(() => {
        const onScroll = () => {
            const remaining = document.documentElement.scrollHeight - window.innerHeight;
            setProgress(remaining > 0 ? Math.min(100, Math.max(0, window.scrollY / remaining * 100)) : 0);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return <div className="print-hide fixed left-0 top-0 z-50 h-1 bg-banan-primary"
        style={{ width: progress + '%' }} role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100} />;
}

export default function BlogPostPage() {
    const { slug } = useParams<{ slug: string }>();
    const [copied, setCopied] = useState(false);
    const article = useMemo(() => slug ? getArticleBySlug(slug) : undefined, [slug]);
    const relatedArticles = useMemo(() => article ? getRelatedArticles(article.slug, 3) : [], [article]);

    useEffect(() => { window.scrollTo(0, 0); }, [slug]);

    if (!article) {
        const renamed = slug ? getRenamedSlug(slug) : undefined;
        return <Navigate to={renamed ? '/blog/' + renamed : '/blog'} replace />;
    }

    const category = CATEGORY_MAP[article.category];
    const CategoryIcon = category.icon;
    const canonicalUrl = articleUrl(article);
    const shareUrl = typeof window === 'undefined' ? canonicalUrl : window.location.href;
    const date = new Date(article.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch { setCopied(false); }
    };

    const downloadMarkdown = () => {
        const markdown = ['# ' + article.title, '', article.subtitle, '', article.content.trim(), ''].join('\n');
        const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = article.slug + '.md';
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const jsonLd = articleJsonLd(article);

    return (
        <div className="blog-print-article min-h-screen overflow-x-clip bg-[#0c0d09] text-white selection:bg-banan-primary selection:text-black">
            <SeoHead title={article.metaTitle} description={article.metaDescription} canonicalUrl={canonicalUrl}
                keywords={article.keywords} ogType="article" publishedTime={article.publishedAt}
                modifiedTime={article.updatedAt} authorName={article.author.name}
                articleSection={category.label} tags={article.tags} jsonLd={jsonLd} />

            <ReadingProgress />

            <div className="mx-auto w-full min-w-0 max-w-[1200px] px-4 pb-20 pt-8 sm:px-8 lg:px-10">
                <Link to="/blog" className="print-hide mb-6 inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-banan-primary hover:text-white">
                    <ArrowLeft className="h-4 w-4" /> Le carnet
                </Link>

                <header className="relative isolate py-5 sm:py-7">
                    <div className="pointer-events-none absolute -right-8 -top-24 -z-10 h-72 w-72 rounded-full bg-banan-primary/10 blur-3xl" aria-hidden="true" />
                    <div className="relative">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={cn('inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-wide', category.color)}>
                                <CategoryIcon className="h-4 w-4" />{category.label}
                            </span>
                            {article.tags.map((tag, index) => (
                                <Link key={tag} to={'/blog?tag=' + encodeURIComponent(tag)}
                                    className={cn('rounded-full border px-3 py-1.5 font-mono text-xs font-bold transition-colors', TAG_COLORS[index % TAG_COLORS.length])}>#{tag}</Link>
                            ))}
                        </div>

                        <h1 className="mt-5 max-w-none font-sans text-3xl font-black uppercase leading-[1.06] tracking-tighter text-white drop-shadow-[0_0_20px_rgba(250,255,0,0.12)] sm:text-4xl xl:text-5xl">
                            {article.title}
                        </h1>
                        <p className="mt-4 max-w-5xl font-sans text-base leading-relaxed text-white/75 sm:text-lg">{article.subtitle}</p>

                        <div className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-white/15 pt-5">
                            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs text-white/65">
                                <span className="font-bold text-white/85">{article.author.name}</span>
                                <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-banan-primary" />{date}</span>
                                <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5 text-banan-primary" />{article.readingTime}</span>
                            </div>
                            <div className="print-hide flex flex-wrap items-center gap-2 font-mono text-xs font-bold uppercase">
                                <button type="button" onClick={downloadMarkdown} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-2 hover:border-banan-primary hover:text-banan-primary"><Download className="h-3.5 w-3.5" />MD</button>
                                <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-2 hover:border-banan-primary hover:text-banan-primary"><Download className="h-3.5 w-3.5" />PDF</button>
                                <button type="button" onClick={copyLink} className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-2 hover:border-banan-primary hover:text-banan-primary">{copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Copié' : 'Lien'}</button>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="print-hide mt-6 lg:hidden">
                    <details className="group border-y border-white/20 py-3">
                        <summary className="cursor-pointer font-mono text-sm font-bold uppercase tracking-wider text-banan-primary marker:text-banan-primary">Sommaire de l’article</summary>
                        <div className="pt-3"><TableOfContents content={article.content} /></div>
                    </details>
                </div>

                <div className="mt-6 grid min-w-0 grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_14rem] xl:gap-12">
                    <article className="min-w-0">
                        <MarkdownArticleRenderer content={article.content} />
                        {article.faqs && article.faqs.length > 0 && <FaqSection faqs={article.faqs} />}
                    </article>
                    <aside className="print-hide hidden min-w-0 lg:block">
                        <div className="sticky top-24"><TableOfContents content={article.content} /></div>
                    </aside>
                </div>

                {relatedArticles.length > 0 && (
                    <section className="print-hide mt-16 border-t border-white/15 pt-8" aria-labelledby="related-heading">
                        <div className="mb-6 flex items-center gap-4">
                            <h2 id="related-heading" className="font-sans text-2xl font-black uppercase tracking-tight text-banan-primary">À lire aussi</h2>
                            <span className="h-px flex-1 bg-white/15" />
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {relatedArticles.map(related => <ArticleCard key={related.id} article={related} />)}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
