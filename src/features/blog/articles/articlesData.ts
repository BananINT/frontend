import type { BlogArticle, BlogCategory } from '../types';
import { CAMPUS_ARTICLES } from './campusArticles.ts';
import { GAME_ARTICLES } from './gameArticles.ts';

export const BLOG_ARTICLES: BlogArticle[] = [
    ...CAMPUS_ARTICLES,
    ...GAME_ARTICLES,
];

/**
 * Old slugs of articles that were renamed, mapped to their current slug.
 * Retired articles are not listed here: their URLs fall back to /blog.
 * Keep in sync with the 301 redirects in nginx.conf.
 */
export const RENAMED_SLUGS: Readonly<Record<string, string>> = {
    'guide-bourse-trading-dividendes': 'guide-bourse-trading',
};

/** Current slug for a renamed article, or undefined if the slug was never renamed. */
export function getRenamedSlug(slug: string): string | undefined {
    return Object.hasOwn(RENAMED_SLUGS, slug) ? RENAMED_SLUGS[slug] : undefined;
}

export function getAllArticles(): BlogArticle[] {
    return BLOG_ARTICLES;
}

export function getArticleBySlug(slug: string): BlogArticle | undefined {
    return BLOG_ARTICLES.find(article => article.slug === slug);
}

export function getArticlesByCategory(category: BlogCategory | 'all'): BlogArticle[] {
    if (category === 'all') return BLOG_ARTICLES;
    return BLOG_ARTICLES.filter(article => article.category === category);
}

export function getFeaturedArticle(): BlogArticle | undefined {
    return BLOG_ARTICLES.find(article => article.featured) || BLOG_ARTICLES[0];
}

export function getRelatedArticles(currentSlug: string, limit: number = 3): BlogArticle[] {
    const current = getArticleBySlug(currentSlug);
    if (!current) return BLOG_ARTICLES.slice(0, limit);

    return BLOG_ARTICLES
        .filter(article => article.slug !== currentSlug)
        .sort((a, b) => {
            // Prioritize matching category, then matching tags
            const aCat = a.category === current.category ? 2 : 0;
            const bCat = b.category === current.category ? 2 : 0;
            const aTags = a.tags.filter(t => current.tags.includes(t)).length;
            const bTags = b.tags.filter(t => current.tags.includes(t)).length;
            return (bCat + bTags) - (aCat + aTags);
        })
        .slice(0, limit);
}

export function getAllTags(): string[] {
    const tagsSet = new Set<string>();
    BLOG_ARTICLES.forEach(article => {
        article.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
}
