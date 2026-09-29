import { describe, it, expect } from 'vitest';
import { 
    getAllArticles, 
    getArticleBySlug, 
    getArticlesByCategory, 
    getFeaturedArticle, 
    getRelatedArticles, 
    getAllTags 
} from './articles/articlesData';
import { slugify } from './utils';

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
            const publicText = [article.title, article.subtitle, article.metaTitle, article.metaDescription, article.content, ...article.tags].join(' ');
            expect(publicText).not.toMatch(/Beyond Notting Hill|cours d.anglais|\/legacy|\bADN\b|\bDNA\b/i);
            expect(publicText).not.toMatch(/\blisteux\b|\bGR\b|Grand reportage|débusqu|cache-cache/i);
            expect(article.downloads ?? []).toHaveLength(0);
        }
    });

    it('slugifies heading text correctly', () => {
        expect(slugify('1. Les Fondations : BPC vs BPS')).toBe('1-les-fondations-bpc-vs-bps');
        expect(slugify('Analyse & Statistiques (2026)')).toBe('analyse-statistiques-2026');
        expect(slugify('   Espace   et   accents   ')).toBe('espace-et-accents');
    });
});
