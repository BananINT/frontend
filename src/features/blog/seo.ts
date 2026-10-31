import type { BlogArticle, BlogCategory } from './types';

/** Public origin, without a trailing slash, used to build absolute URLs. */
export const SITE_ORIGIN = 'https://bananint.fr';
/** Canonical root URL of the site, with its trailing slash. */
export const SITE_ROOT_URL = `${SITE_ORIGIN}/`;
export const BLOG_URL = `${SITE_ORIGIN}/blog`;
export const BLOG_OG_IMAGE = `${SITE_ORIGIN}/blog-og.png`;

/** Human-readable category names, shared by the pages and the SEO generator. */
export const CATEGORY_LABELS: Record<BlogCategory, string> = {
    campus: 'Vie de campus',
    coulisses: 'Coulisses',
    tutoriel: 'Tutoriel',
    guide: 'Marché',
    strategie: 'Clans',
    telechargement: 'Ressources',
    architecture: 'Technique',
};

export const PUBLISHER = {
    '@type': 'Organization',
    name: 'BananINT',
    url: SITE_ROOT_URL,
    logo: { '@type': 'ImageObject', url: BLOG_OG_IMAGE },
};

/** Articles are signed by the project, so structured data credits the organization. */
export const AUTHOR = {
    '@type': 'Organization',
    name: 'BananINT',
    url: SITE_ROOT_URL,
};

export function articleUrl(article: Pick<BlogArticle, 'slug'>): string {
    return `${BLOG_URL}/${article.slug}`;
}

export function articleJsonLd(article: BlogArticle): Record<string, unknown>[] {
    const url = articleUrl(article);
    return [
        {
            '@context': 'https://schema.org',
            '@type': article.category === 'architecture' ? 'TechArticle' : 'BlogPosting',
            headline: article.title,
            alternativeHeadline: article.subtitle,
            description: article.metaDescription,
            image: BLOG_OG_IMAGE,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            inLanguage: 'fr-FR',
            mainEntityOfPage: { '@type': 'WebPage', '@id': url },
            author: AUTHOR,
            publisher: PUBLISHER,
            keywords: article.keywords.join(', '),
            articleSection: CATEGORY_LABELS[article.category],
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_ROOT_URL },
                { '@type': 'ListItem', position: 2, name: 'Le carnet', item: BLOG_URL },
                { '@type': 'ListItem', position: 3, name: article.title, item: url },
            ],
        },
    ];
}

export function blogIndexJsonLd(articles: BlogArticle[]): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Le carnet BananINT',
        description: 'Vie étudiante à Télécom SudParis, repères sur le campus et coulisses de BananINT.',
        url: BLOG_URL,
        publisher: PUBLISHER,
        hasPart: articles.map(article => ({
            '@type': 'Article',
            name: article.title,
            headline: article.title,
            description: article.subtitle,
            url: articleUrl(article),
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            author: AUTHOR,
        })),
    };
}
