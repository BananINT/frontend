import { describe, it, expect } from 'vitest';
import { 
    getAllArticles, 
    getArticleBySlug, 
    getArticlesByCategory, 
    getFeaturedArticle, 
    getRelatedArticles, 
    getAllTags,
    getRenamedSlug,
    RENAMED_SLUGS,
} from './articles/articlesData';
import { slugify } from './utils';

const PRESTIGE_UPGRADE_NAMES = [
    'DNA Amplifier', 'Genome Amplifier', 'Quantum Banana Matrix', 'Genetic Overclocking',
    'Evolutionary Boost', 'Transcendent Peel', 'Cosmic DNA Infusion', 'Dimensional Peel Split',
    'Time-Traveling Banana', 'Omniscience of the Ape', 'The Final Banana',
];

const SPOILER_PATTERNS: RegExp[] = [
    // Origin of the project and the earlier version
    /Beyond Notting Hill|cours d.anglais|extraits? de films?|\/legacy/i,
    // Hidden progression
    /\bADN\b|\bDNA\b|ascension|transcendance/i,
    new RegExp(PRESTIGE_UPGRADE_NAMES.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'i'),
    // Start-of-year surprise: INTv stays a friendly video club
    /\blisteux\b|\bGR\b|Grand reportage|débusqu|cache-cache/i,
    /INTv[^.\n]{0,80}officiel|officiel[^.\n]{0,80}INTv|captation|Offrandes?|Livrables?/i,
];

// Every app source file under src/, read as text.
const SOURCE_FILES = import.meta.glob(['../../**/*.{ts,tsx,js,jsx}', '!../../**/*.test.*'], {
    query: '?raw',
    import: 'default',
    eager: true,
}) as Record<string, string>;

describe('Blog Feature Unit Tests', () => {
    it('guarantees all article IDs and slugs are strictly unique', () => {
        const articles = getAllArticles();
        const ids = articles.map(a => a.id);
        const slugs = articles.map(a => a.slug);

        expect(new Set(ids).size).toBe(articles.length);
        expect(new Set(slugs).size).toBe(articles.length);
    });

    it('fetches article by slug', () => {
        const article = getArticleBySlug('guide-debutant-clicker-bananint');
        expect(article).toBeDefined();
        expect(article?.title).toContain('Bien commencer');
        expect(article?.category).toBe('tutoriel');
    });

    it('returns undefined for non-existent slug', () => {
        const article = getArticleBySlug('unknown-slug-xyz');
        expect(article).toBeUndefined();
    });

    it('filters articles by category', () => {
        const tutorials = getArticlesByCategory('tutoriel');
        expect(tutorials.length).toBeGreaterThan(0);
        expect(tutorials.every(a => a.category === 'tutoriel')).toBe(true);

        const all = getArticlesByCategory('all');
        expect(all.length).toBe(getAllArticles().length);
    });

    it('retrieves the featured article', () => {
        const featured = getFeaturedArticle();
        expect(featured).toBeDefined();
        expect(featured?.featured).toBe(true);
    });

    it('returns related articles excluding current article', () => {
        const currentSlug = 'guide-debutant-clicker-bananint';
        const related = getRelatedArticles(currentSlug, 3);
        expect(related.length).toBeLessThanOrEqual(3);
        expect(related.every(a => a.slug !== currentSlug)).toBe(true);
    });

    it('retrieves distinct tags', () => {
        const tags = getAllTags();
        expect(tags.length).toBeGreaterThan(0);
        expect(tags).toContain('Clicker');
        expect(tags).toContain('Trading');
    });

    it('publishes only the curated articles with no hidden-game or origin spoilers', () => {
        const articles = getAllArticles();
        expect(articles).toHaveLength(8);
        expect(articles.some(a => a.slug === 'pourquoi-un-carnet-bananint')).toBe(false);
        expect(articles.some(a => a.slug === 'listes-bde-intv-gr-campus')).toBe(false);
        for (const article of articles) {
            // Every field that can reach a page, snippet, feed or structured data.
            const publicText = [
                article.title, article.subtitle, article.metaTitle, article.metaDescription,
                article.slug, article.readingTime, article.author.name, article.author.role,
                article.content, ...article.tags, ...article.keywords,
                ...(article.faqs ?? []).flatMap(faq => [faq.question, faq.answer]),
            ].join(' ');
            for (const pattern of SPOILER_PATTERNS) {
                expect(publicText, `${article.slug} matches ${pattern}`).not.toMatch(pattern);
            }
            expect(article.downloads ?? []).toHaveLength(0);
        }
    });

    it('keeps the earlier version a discovery: no component links to /legacy', () => {
        const linkToLegacy = /(?:to|href)\s*=\s*\{?\s*['"`]\/legacy\b|navigate\(\s*['"`]\/legacy\b/;
        expect(Object.keys(SOURCE_FILES).length).toBeGreaterThan(20);
        const offenders = Object.entries(SOURCE_FILES)
            .filter(([, source]) => linkToLegacy.test(source))
            .map(([file]) => file);
        expect(offenders).toEqual([]);
    });

    it('redirects renamed slugs to a published article, never to a retired one', () => {
        expect(getRenamedSlug('guide-bourse-trading-dividendes')).toBe('guide-bourse-trading');
        expect(getArticleBySlug('guide-bourse-trading')?.id).toBe('guide-marche');
        expect(getRenamedSlug('listes-bde-intv-gr-campus')).toBeUndefined();
        expect(getRenamedSlug('toString')).toBeUndefined();
        for (const [oldSlug, newSlug] of Object.entries(RENAMED_SLUGS)) {
            expect(getArticleBySlug(oldSlug)).toBeUndefined();
            expect(getArticleBySlug(newSlug)).toBeDefined();
        }
    });

    it('slugifies heading text correctly', () => {
        expect(slugify('1. Les Fondations : BPC vs BPS')).toBe('1-les-fondations-bpc-vs-bps');
        expect(slugify('Analyse & Statistiques (2026)')).toBe('analyse-statistiques-2026');
        expect(slugify('   Espace   et   accents   ')).toBe('espace-et-accents');
    });
});
