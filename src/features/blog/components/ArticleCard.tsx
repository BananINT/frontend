import { Link } from 'react-router';
import { ArrowUpRight } from 'lucide-react';
import type { BlogArticle, BlogCategory } from '../types';
import { cn } from '@app/lib/utils';

const CATEGORY_LABELS: Record<BlogCategory, { label: string; color: string }> = {
    campus: { label: 'Vie de campus', color: 'text-banan-primary' },
    coulisses: { label: 'Coulisses', color: 'text-orange-300' },
    tutoriel: { label: 'Guide de jeu', color: 'text-emerald-300' },
    guide: { label: 'Marché du jeu', color: 'text-cyan-300' },
    strategie: { label: 'Jeu collectif', color: 'text-amber-300' },
    telechargement: { label: 'Ressources', color: 'text-violet-300' },
    architecture: { label: 'Technique', color: 'text-rose-300' },
};

export function ArticleCard({ article, featured = false }: { article: BlogArticle; featured?: boolean }) {
    const formattedDate = new Date(article.publishedAt).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric',
    });

    return (
        <article className={cn(
            'group relative flex h-full flex-col justify-between border-t border-white/15 py-6 transition-colors hover:border-banan-primary/70',
            featured && 'border-l-4 border-t-0 border-banan-primary/70 py-2 pl-6 sm:pl-8',
        )}>
            <div>
                <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-wide text-white/55">
                    <span className={cn('font-bold', CATEGORY_LABELS[article.category].color)}>{CATEGORY_LABELS[article.category].label}</span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={article.publishedAt}>{formattedDate}</time>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingTime} de lecture</span>
                </div>
                <h2 className={cn('mb-3 max-w-4xl font-sans font-black uppercase leading-tight tracking-tight text-white', featured ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl')}>
                    <Link to={`/blog/${article.slug}`} className="hover:text-banan-primary focus-visible:text-banan-primary">{article.title}</Link>
                </h2>
                <p className="max-w-4xl font-sans leading-relaxed text-white/75">{article.subtitle}</p>
            </div>
            <div className="mt-7 flex items-center justify-between gap-4">
                <span className="font-mono text-xs text-white/55">{article.author.name}</span>
                <Link to={`/blog/${article.slug}`} className="inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-wide text-banan-primary hover:underline">
                    Lire l’article <ArrowUpRight className="h-4 w-4" />
                </Link>
            </div>
        </article>
    );
}
