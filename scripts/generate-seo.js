import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
// The output directory defaults to dist/; pass another one as the first argument
// (e.g. `node --experimental-strip-types scripts/generate-seo.js /tmp/out`).
const DIST_DIR = path.resolve(process.argv[2] || path.resolve(ROOT_DIR, 'dist'));

function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function prepareStaticArticleMarkdown(content) {
    return content.replace(/```mermaid\s*\n([\s\S]*?)\n```/g, (block, diagram) => {
        if (diagram.includes('A[Cliquer] --> B[Gagner des bananes]') && diagram.includes('D --> A')) {
            return '![La boucle du clicker : cliquer, gagner des bananes, choisir une amélioration, observer la progression, puis recommencer](/blog/diagram-clicker.svg)';
        }
        return block;
    });
}

async function run() {
    console.log('🚀 [SEO Generator] Starting static prerendering and sitemap generation...');

    const indexHtmlPath = path.resolve(DIST_DIR, 'index.html');
    if (!fs.existsSync(indexHtmlPath)) {
        console.error('❌ [SEO Generator] dist/index.html not found! Run "vite build" first.');
        process.exit(1);
    }

    // Load articles data and the SEO helpers shared with the React pages
    const articlesModule = await import('../src/features/blog/articles/articlesData.ts');
    const articles = articlesModule.BLOG_ARTICLES;
    const {
        SITE_ORIGIN: BASE_URL,
        SITE_ROOT_URL,
        BLOG_URL,
        CATEGORY_LABELS,
        articleUrl,
        articleJsonLd,
        blogIndexJsonLd,
        homeJsonLd,
    } = await import('../src/features/blog/seo.ts');
    // Stable date for non-article URLs: the most recent article update, not the build time.
    const latestUpdate = articles
        .map(a => a.updatedAt || a.publishedAt)
        .sort()
        .at(-1);

    console.log(`📄 [SEO Generator] Loaded ${articles.length} articles from articlesData.ts`);

    const templateHtml = fs.readFileSync(indexHtmlPath, 'utf8');

    function createPrerenderedHtml({
        title,
        description,
        canonicalUrl,
        keywords = [],
        ogType = 'website',
        ogImage = '/blog-og.png',
        publishedTime,
        modifiedTime,
        author,
        section,
        jsonLd,
        bodyFallbackHtml = ''
    }) {
        let html = templateHtml;

        // 1. Replace Title
        const fullTitle = `${escapeHtml(title)}`;
        html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${fullTitle}</title>`);

        // 2. Replace or Inject Description
        const descTag = `<meta name="description" content="${escapeHtml(description)}" />`;
        if (/<meta name="description"[\s\S]*?>/i.test(html)) {
            html = html.replace(/<meta name="description"[\s\S]*?>/i, descTag);
        } else {
            html = html.replace('</head>', `    ${descTag}\n  </head>`);
        }

        // 3. Replace or Inject Canonical
        const canonicalTag = `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`;
        if (/<link rel="canonical"[\s\S]*?>/i.test(html)) {
            html = html.replace(/<link rel="canonical"[\s\S]*?>/i, canonicalTag);
        } else {
            html = html.replace('</head>', `    ${canonicalTag}\n  </head>`);
        }

        // 4. Keywords
        if (keywords && keywords.length > 0) {
            const kwTag = `<meta name="keywords" content="${escapeHtml(keywords.join(', '))}" />`;
            if (/<meta name="keywords"[\s\S]*?>/i.test(html)) {
                html = html.replace(/<meta name="keywords"[\s\S]*?>/i, kwTag);
            } else {
                html = html.replace('</head>', `    ${kwTag}\n  </head>`);
            }
        }

        // 5. Open Graph Tags
        const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${BASE_URL}${ogImage}`;
        const ogTags = [
            `<meta property="og:title" content="${escapeHtml(title)}" />`,
            `<meta property="og:description" content="${escapeHtml(description)}" />`,
            `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
            `<meta property="og:type" content="${escapeHtml(ogType)}" />`,
            `<meta property="og:image" content="${escapeHtml(fullImageUrl)}" />`,
            `<meta property="og:site_name" content="BananINT" />`,
            `<meta property="og:locale" content="fr_FR" />`,
        ];

        if (publishedTime) {
            ogTags.push(`<meta property="article:published_time" content="${escapeHtml(publishedTime)}" />`);
        }
        if (modifiedTime) {
            ogTags.push(`<meta property="article:modified_time" content="${escapeHtml(modifiedTime)}" />`);
        }
        if (author) {
            ogTags.push(`<meta property="article:author" content="${escapeHtml(author)}" />`);
        }
        if (section) {
            ogTags.push(`<meta property="article:section" content="${escapeHtml(section)}" />`);
        }

        // Twitter Card Tags
        const twitterTags = [
            `<meta name="twitter:card" content="summary_large_image" />`,
            `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
            `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
            `<meta name="twitter:image" content="${escapeHtml(fullImageUrl)}" />`,
        ];

        // Replace existing OG & Twitter if present, or append
        html = html.replace(/<!-- Open Graph[\s\S]*?<!-- Twitter Card[\s\S]*?<meta name="twitter:image"[\s\S]*?\/>/i, 
            `<!-- Open Graph / Social -->\n    ${ogTags.join('\n    ')}\n\n    <!-- Twitter Card -->\n    ${twitterTags.join('\n    ')}`);

        // 6. JSON-LD structured data
        if (jsonLd) {
            const jsonLdTag = `<script id="seo-json-ld" type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;
            html = html.replace('</head>', `    ${jsonLdTag}\n  </head>`);
        }

        // 7. Inject Semantic SEO SSR Body Preview into <div id="root">
        if (bodyFallbackHtml) {
            html = html.replace('<div id="root"></div>', `<div id="root">${bodyFallbackHtml}</div>`);
        }

        return html;
    }

    // --- A0. Generate _home.html (homepage), served at / by nginx. index.html stays
    // the empty shell of the app routes, which must not show the homepage content.
    const homeDescription = templateHtml.match(/<meta name="description" content="(.*?)"/)[1];
    const homeArticles = [
        ['TSP, MAISEL, INT : les premiers repères du campus', 'tsp-maisel-assos-premiers-reperes'],
        ['Pourquoi il y a « INT » partout sur le campus', 'expressions-associations-int-xrtc'],
        ['NOVA, le Ritz et les petits détours d’une journée', 'nova-ritz-quotidien-campus-evry'],
        ['Vie étudiante à Télécom SudParis', 'vie-etudiante-telecom-sudparis'],
    ];
    const homeFallback = `
        <main style="padding: 3rem 16px; max-width: 1280px; margin: 0 auto; box-sizing: border-box; color: white; font-family: sans-serif; text-align: center;">
            <p style="color: #FAFF00; font-size: 0.85rem; font-family: monospace; letter-spacing: 0.3em; text-transform: uppercase;">Un club de Télécom SudParis</p>
            <h1 style="font-size: clamp(3rem, 11.5vw, 12rem); line-height: 0.85; text-transform: uppercase; letter-spacing: -0.04em; margin: 1.5rem 0;">BananINT</h1>
            <p style="color: #ddd; font-size: 1.2rem;">Fournisseur de potassium numérique</p>
            <h2 style="margin-top: 4rem;">Un clicker qui a mal tourné</h2>
            <p style="color: #bbb; max-width: 42rem; margin: 1rem auto; line-height: 1.6;">Le premier classement a lancé une course aux clics et aux bots sur le campus. Depuis, le jeu a grandi : améliore ta production, surveille le marché et essaie de grimper à ton tour.</p>
            <a href="/clicker" style="color: #FAFF00;">Jouer Maintenant</a>
            <h2 style="margin-top: 4rem;">Le campus en vrai</h2>
            <p style="color: #bbb; max-width: 42rem; margin: 1rem auto; line-height: 1.6;">Entre deux parties, il y a les lieux, les assos et les mots du campus. On a commencé à les raconter dans le carnet.</p>
            <nav>
                <ul style="list-style: none; padding: 0;">
                    ${homeArticles.map(([label, slug]) => `<li style="margin: 0.75rem 0;"><a href="/blog/${slug}" style="color: #FAFF00;">${escapeHtml(label)}</a></li>`).join('')}
                    <li style="margin: 0.75rem 0;"><a href="/blog" style="color: #FAFF00;">Tout le carnet</a></li>
                </ul>
            </nav>
        </main>
    `;

    const homeHtml = createPrerenderedHtml({
        title: templateHtml.match(/<title>(.*?)<\/title>/)[1],
        description: homeDescription,
        canonicalUrl: SITE_ROOT_URL,
        jsonLd: homeJsonLd(homeDescription),
        bodyFallbackHtml: homeFallback,
    });

    fs.writeFileSync(path.resolve(DIST_DIR, '_home.html'), homeHtml, 'utf8');
    console.log('  ✅ [SSG] Generated dist/_home.html');

    // --- A. Generate /blog/index.html (Blog Index) ---
    const blogIndexDir = path.resolve(DIST_DIR, 'blog');
    fs.mkdirSync(blogIndexDir, { recursive: true });

    const blogIndexStructuredData = blogIndexJsonLd(articles);

    const blogIndexFallback = `
        <header style="padding: 2rem clamp(20px, 4vw, 48px); max-width: 1280px; margin: 0 auto; box-sizing: border-box; color: white; font-family: sans-serif;">
            <div style="padding: 2.5rem 0 3rem; background: radial-gradient(circle at 85% 20%, rgba(250,255,0,0.12), transparent 45%);">
                <p style="color: #FAFF00; font-size: 0.85rem; font-family: monospace; letter-spacing: 0.15em; text-transform: uppercase;">BananINT / Télécom SudParis / Évry</p>
                <h1 style="font-size: clamp(3rem, 7vw, 6rem); line-height: 0.98; text-transform: uppercase; letter-spacing: -0.04em; margin: 1rem 0;">Le carnet <span style="color: #FAFF00; text-shadow: 0 0 30px rgba(250,255,0,0.45);">BananINT.</span></h1>
                <p style="color: #ddd; font-size: 1.2rem;">La vie à Télécom SudParis, les histoires du campus, et quelques détours dans le jeu. À feuilleter entre deux cours.</p>
            </div>
            <nav style="margin-top: 2rem;">
                <ul style="list-style: none; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 420px), 1fr)); column-gap: 2.5rem;">
                    ${articles.map(a => `
                        <li style="border-top: 1px solid rgba(255,255,255,0.15); padding: 1.5rem 0;">
                            <a href="/blog/${a.slug}" style="color: #FAFF00; font-weight: bold; text-decoration: none; font-size: 1.2rem;">${escapeHtml(a.title)}</a>
                            <p style="color: #888; font-size: 0.9rem; margin-top: 0.5rem;">${escapeHtml(a.subtitle)}</p>
                        </li>
                    `).join('')}
                </ul>
            </nav>
        </header>
    `;

    const blogIndexHtml = createPrerenderedHtml({
        title: 'Le carnet : vie étudiante à Télécom SudParis (TSP) | BananINT',
        description: 'Vie étudiante à Télécom SudParis, MAISEL, assos et coulisses du projet : le carnet BananINT, à lire entre deux cours.',
        canonicalUrl: BLOG_URL,
        keywords: [
            'BananINT blog',
            'BananINT guides',
            'tutoriel clicker bananint',
            'stratégie bourse bananes',
            'MAISEL associations campus',
            'vie étudiante Télécom SudParis',
            'campus Télécom SudParis'
        ],
        ogType: 'website',
        jsonLd: blogIndexStructuredData,
        bodyFallbackHtml: blogIndexFallback
    });

    fs.writeFileSync(path.resolve(blogIndexDir, 'index.html'), blogIndexHtml, 'utf8');
    console.log('  ✅ [SSG] Generated dist/blog/index.html');

    // --- B. Generate /blog/:slug/index.html for each article ---
    for (const article of articles) {
        const articleDir = path.resolve(blogIndexDir, article.slug);
        fs.mkdirSync(articleDir, { recursive: true });

        const structuredData = articleJsonLd(article);

        if (article.faqs && article.faqs.length > 0) {
            structuredData.push({
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: article.faqs.map(faq => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.answer
                    }
                }))
            });
        }

        const articleFallback = `
            <article style="padding: 2rem clamp(20px, 4vw, 48px); max-width: 1200px; margin: 0 auto; box-sizing: border-box; color: white; font-family: sans-serif;">
                <nav style="color: #666; font-size: 0.85rem; font-family: monospace; margin-bottom: 1rem;">
                    <a href="/" style="color: #888; text-decoration: none;">Accueil</a> &gt; 
                    <a href="/blog" style="color: #888; text-decoration: none;">Blog</a> &gt; 
                    <span style="color: #FAFF00;">${escapeHtml(article.title)}</span>
                </nav>
                <header style="padding: 1.5rem 0; background: radial-gradient(circle at 85% 15%, rgba(250,255,0,0.1), transparent 40%);">
                    <span style="display: inline-block; padding: 0.35rem 0.8rem; font-family: monospace; font-size: 0.75rem; text-transform: uppercase; background: rgba(250,255,0,0.1); color: #FAFF00; border: 1px solid rgba(250,255,0,0.3); border-radius: 999px;">
                        ${escapeHtml(CATEGORY_LABELS[article.category])}
                    </span>
                    ${article.tags.map(tag => `<a href="/blog?tag=${encodeURIComponent(tag)}" style="display: inline-block; margin-left: 0.4rem; padding: 0.35rem 0.8rem; font-family: monospace; font-size: 0.75rem; text-decoration: none; background: rgba(250,255,0,0.08); color: #FAFF00; border: 1px solid rgba(250,255,0,0.25); border-radius: 999px;">#${escapeHtml(tag)}</a>`).join('')}
                    <h1 style="font-size: 2.2rem; text-transform: uppercase; margin-top: 1rem;">${escapeHtml(article.title)}</h1>
                    <p style="color: #aaa; font-size: 1.1rem; line-height: 1.6;">${escapeHtml(article.subtitle)}</p>
                    <div style="font-family: monospace; font-size: 0.85rem; color: #777; margin: 1.5rem 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                        Par ${escapeHtml(article.author.name)} (${escapeHtml(article.author.role)}) • Lecture : ${escapeHtml(article.readingTime)}
                    </div>
                </header>
                <div style="max-width: 78ch; line-height: 1.7; color: #ddd; font-size: 1.05rem;">
                    ${renderToStaticMarkup(createElement(ReactMarkdown, {
                        remarkPlugins: [remarkGfm, remarkMath],
                        rehypePlugins: [rehypeKatex],
                        children: prepareStaticArticleMarkdown(article.content)
                    }))}
                </div>
                <nav style="max-width: 78ch; margin-top: 3rem; border-top: 1px solid rgba(255,255,255,0.15); padding-top: 1.5rem;">
                    <h2 style="font-size: 1.2rem;">À lire aussi</h2>
                    <ul style="padding-left: 1.2rem; line-height: 1.8;">
                        ${articlesModule.getRelatedArticles(article.slug, 3).map(a => `<li><a href="/blog/${a.slug}" style="color: #FAFF00;">${escapeHtml(a.title)}</a></li>`).join('')}
                    </ul>
                </nav>
            </article>
        `;

        const articleHtml = createPrerenderedHtml({
            title: `${article.metaTitle} | BananINT`,
            description: article.metaDescription,
            canonicalUrl: articleUrl(article),
            keywords: article.keywords,
            ogType: 'article',
            publishedTime: article.publishedAt,
            modifiedTime: article.updatedAt,
            author: article.author.name,
            section: CATEGORY_LABELS[article.category],
            jsonLd: structuredData,
            bodyFallbackHtml: articleFallback
        });

        fs.writeFileSync(path.resolve(articleDir, 'index.html'), articleHtml, 'utf8');
        console.log(`  ✅ [SSG] Generated dist/blog/${article.slug}/index.html`);
    }

    // --- C. Generate sitemap.xml ---
    // Only prerendered pages with their own canonical URL belong here; the game
    // routes are client-rendered and share the root page's canonical.
    const staticRoutes = [
        { loc: SITE_ROOT_URL, priority: '1.0', changefreq: 'weekly', lastmod: latestUpdate },
        { loc: BLOG_URL, priority: '0.9', changefreq: 'weekly', lastmod: latestUpdate },
    ];

    const articleRoutes = articles.map(a => ({
        loc: articleUrl(a),
        priority: '0.85',
        changefreq: 'monthly',
        lastmod: a.updatedAt || a.publishedAt
    }));

    const allSitemapUrls = [...staticRoutes, ...articleRoutes];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allSitemapUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

    fs.writeFileSync(path.resolve(DIST_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
    console.log(`  ✅ [Sitemap] Generated dist/sitemap.xml with ${allSitemapUrls.length} indexed URLs`);

    // --- D. Generate robots.txt ---
    const robotsTxt = `# BananINT Robots Exclusion Protocol
User-agent: *
Allow: /
Disallow: /silent-check-sso.html
Disallow: /api/

Sitemap: ${BASE_URL}/sitemap.xml
`;
    fs.writeFileSync(path.resolve(DIST_DIR, 'robots.txt'), robotsTxt, 'utf8');
    console.log('  ✅ [Robots] Generated dist/robots.txt');

    // --- E. Generate RSS Feed (feed.xml) ---
    const feedXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>BananINT - Le carnet</title>
    <link>${BLOG_URL}</link>
    <description>Vie étudiante à Télécom SudParis, repères sur le campus et coulisses de BananINT.</description>
    <language>fr-FR</language>
    <lastBuildDate>${new Date(latestUpdate).toUTCString()}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    ${articles.map(a => `
    <item>
      <title>${escapeHtml(a.title)}</title>
      <link>${articleUrl(a)}</link>
      <guid isPermaLink="true">${articleUrl(a)}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <description>${escapeHtml(a.metaDescription || a.subtitle)}</description>
      <category>${escapeHtml(CATEGORY_LABELS[a.category])}</category>
    </item>`).join('')}
  </channel>
</rss>
`;

    fs.writeFileSync(path.resolve(DIST_DIR, 'feed.xml'), feedXml, 'utf8');
    console.log('  ✅ [RSS] Generated dist/feed.xml');

    console.log('✨ [SEO Generator] All static files, meta tags, and structured schemas successfully generated!');
}

run().catch(err => {
    console.error('❌ [SEO Generator] Fatal Error:', err);
    process.exit(1);
});
