import { useState, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { 
    Search, 
    X, 
    Terminal, 
    Layers, 
    BookOpen, 
    TrendingUp, 
    Shield, 
    Cpu, 
    Sparkles,
    Tag,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { 
    getAllArticles, 
    getAllTags 
} from './articles/articlesData';
import { ArticleCard } from './components/ArticleCard';
import { SeoHead } from './components/SeoHead';
import type { BlogCategory } from './types';
import { cn } from '@app/lib/utils';

interface CategoryTab {
    id: BlogCategory | 'all';
    label: string;
    icon: typeof BookOpen;
}

const CATEGORY_TABS: CategoryTab[] = [
    { id: 'all', label: 'Tout le carnet', icon: Layers },
    { id: 'campus', label: 'Vie de campus', icon: BookOpen },
    { id: 'coulisses', label: 'Coulisses', icon: Cpu },
    { id: 'tutoriel', label: 'Tutoriels', icon: BookOpen },
    { id: 'guide', label: 'Marché', icon: TrendingUp },
    { id: 'strategie', label: 'Clans', icon: Shield },
];

const ITEMS_PER_PAGE = 12;

export default function BlogListPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const allArticles = useMemo(() => getAllArticles(), []);
    const allTags = useMemo(() => getAllTags(), []);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');
    const selectedTag = searchParams.get('tag');
    const [currentPage, setCurrentPage] = useState(1);
    const articlesSectionRef = useRef<HTMLDivElement | null>(null);

    const handleCategoryChange = (category: BlogCategory | 'all') => {
        setSelectedCategory(category);
        setCurrentPage(1);
    };

    const handleTagChange = (tag: string | null) => {
        setSearchParams(tag ? { tag } : {});
        setCurrentPage(1);
    };

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        setCurrentPage(1);
    };

    const handleResetFilters = () => {
        setSelectedCategory('all');
        setSearchParams({});
        setSearchQuery('');
        setCurrentPage(1);
    };

    // Filtered articles
    const filteredArticles = useMemo(() => {
        return allArticles.filter(article => {
            // Category filter
            if (selectedCategory !== 'all' && article.category !== selectedCategory) {
                return false;
            }

            // Tag filter
            if (selectedTag && !article.tags.includes(selectedTag)) {
                return false;
            }

            // Search filter
            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase().trim();
                const matchTitle = article.title.toLowerCase().includes(query);
                const matchSubtitle = article.subtitle.toLowerCase().includes(query);
                const matchKeywords = article.keywords.some(k => k.toLowerCase().includes(query));
                const matchTags = article.tags.some(t => t.toLowerCase().includes(query));
                const matchContent = article.content.toLowerCase().includes(query);

                return matchTitle || matchSubtitle || matchKeywords || matchTags || matchContent;
            }

            return true;
        });
    }, [allArticles, selectedCategory, selectedTag, searchQuery]);

    const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE);
    const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));

    const paginatedArticles = useMemo(() => {
        const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
        return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredArticles, safeCurrentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        if (articlesSectionRef.current) {
            articlesSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Check if we show the spotlight featured banner (only on default unfiltered view and page 1)
    const isUnfiltered = selectedCategory === 'all' && !selectedTag && !searchQuery.trim() && safeCurrentPage === 1;
    const featuredArticle = useMemo(() => {
        return allArticles.find(a => a.featured) || allArticles[0];
    }, [allArticles]);

    // JSON-LD structured data for the Blog Hub
    const jsonLd = useMemo(() => ({
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Le carnet BananINT',
        description: 'Vie étudiante à Télécom SudParis, repères sur le campus et coulisses de BananINT.',
        url: 'https://bananint.fr/blog',
        publisher: {
            '@type': 'Organization',
            name: 'BananINT Syndicate',
            logo: {
                '@type': 'ImageObject',
                url: 'https://bananint.fr/blog-og.png'
            }
        },
        hasPart: allArticles.map(article => ({
            '@type': 'Article',
            name: article.title,
            headline: article.title,
            description: article.subtitle,
            url: `https://bananint.fr/blog/${article.slug}`,
            datePublished: article.publishedAt,
            dateModified: article.updatedAt,
            author: {
                '@type': 'Person',
                name: article.author.name
            }
        }))
    }), [allArticles]);

    return (
        <div className="min-h-screen overflow-x-clip bg-[#0c0d09] text-white selection:bg-banan-primary selection:text-black">
            <SeoHead
                title="Le carnet — campus, idées et BananINT"
                description="Vie étudiante à Télécom SudParis, MAISEL, assos et coulisses du projet : le carnet BananINT, à lire entre deux cours."
                canonicalUrl="https://bananint.fr/blog"
                keywords={[
                    'BananINT blog',
                    'BananINT guides',
                    'tutoriel clicker bananint',
                    'stratégie bourse bananes',
                    'MAISEL associations campus',
                    'vie étudiante Télécom SudParis',
                    'campus Télécom SudParis'
                ]}
                ogType="website"
                jsonLd={jsonLd}
            />

            <div className="relative mx-auto w-full min-w-0 max-w-[1280px] px-4 pb-20 pt-8 sm:px-8 lg:px-10">
                {/* Header Hero */}
                <header className="relative isolate mb-10 py-9 sm:py-14">
                    <div className="pointer-events-none absolute -right-20 -top-28 -z-10 h-[25rem] w-[25rem] rounded-full bg-banan-primary/15 blur-3xl" aria-hidden="true" />
                    <div className="relative">
                        <p className="mb-5 font-mono text-xs font-bold uppercase tracking-[0.18em] text-banan-primary sm:text-sm">BananINT / Télécom SudParis / Évry</p>
                        <h1 className="max-w-6xl font-sans text-[clamp(2.5rem,10vw,6rem)] font-black uppercase leading-[0.98] tracking-tighter text-white drop-shadow-[0_0_25px_rgba(250,255,0,0.13)]">Le carnet <span className="text-banan-primary drop-shadow-[0_0_30px_rgba(250,255,0,0.4)]">BananINT.</span></h1>
                        <p className="mt-6 max-w-4xl font-sans text-base leading-relaxed text-white/80 sm:text-xl">La vie à Télécom SudParis, les histoires du campus, et quelques détours dans le jeu. À feuilleter entre deux cours.</p>
                    </div>
                </header>

                {/* Search & Filter Controls */}
                <div className="mb-10 space-y-4">
                    <div className="flex min-w-0 flex-col gap-3 md:flex-row">
                        {/* Search Input */}
                        <div className="relative min-w-0 flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                aria-label="Rechercher dans le carnet"
                                placeholder="Chercher un lieu, une asso, un sujet…"
                                className="w-full rounded-2xl bg-white/5 border border-white/20 focus:border-banan-primary pl-12 pr-12 py-3.5 text-base text-white placeholder-white/50 font-mono outline-none transition-colors"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => handleSearchChange('')}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-white/50 hover:text-white"
                                    title="Effacer la recherche"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Reset Filters button if any active */}
                        {(selectedCategory !== 'all' || selectedTag || searchQuery) && (
                            <button
                                onClick={handleResetFilters}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 bg-white/5 hover:bg-white/10 border border-white/15 text-sm font-mono font-bold text-white/90 transition-colors"
                            >
                                <X className="w-4 h-4" />
                                <span>Réinitialiser les filtres</span>
                            </button>
                        )}
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {CATEGORY_TABS.map((tab) => {
                            const TabIcon = tab.icon;
                            const isActive = selectedCategory === tab.id;
                            const count = tab.id === 'all' 
                                ? allArticles.length 
                                : allArticles.filter(a => a.category === tab.id).length;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleCategoryChange(tab.id)}
                                    aria-pressed={isActive}
                                    className={cn(
                                        "inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-mono uppercase tracking-wider whitespace-nowrap transition-all border",
                                        isActive 
                                            ? "bg-banan-primary text-black font-bold border-banan-primary shadow-[0_0_15px_rgba(250,255,0,0.25)]" 
                                            : "bg-[#0d0d0d] text-white/80 hover:text-white border-white/15 hover:border-white/30"
                                    )}
                                >
                                    <TabIcon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-xs font-mono",
                                        isActive ? "bg-black/25 text-black font-bold" : "bg-white/10 text-white/70"
                                    )}>
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Popular Tags Bar */}
                    <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-white/5">
                        <div className="flex items-center gap-1.5 text-xs font-mono text-white/60 mr-1">
                            <Tag className="w-3.5 h-3.5" />
                            <span>Tags :</span>
                        </div>
                        {allTags.map((tag) => {
                            const isSelected = selectedTag === tag;
                            return (
                                <button
                                    key={tag}
                                    onClick={() => handleTagChange(isSelected ? null : tag)}
                                    aria-pressed={isSelected}
                                    className={cn(
                                        "rounded-full text-xs font-mono px-3 py-1.5 transition-colors border",
                                        isSelected
                                            ? "bg-banan-primary/20 text-banan-primary border-banan-primary font-bold"
                                            : "bg-white/5 text-white/75 hover:text-white border-white/10 hover:border-white/20"
                                    )}
                                >
                                    #{tag}
                                </button>
                            );
                        })}
                        {selectedTag && (
                            <button
                                onClick={() => handleTagChange(null)}
                                className="text-xs font-mono text-rose-400 hover:text-rose-300 underline underline-offset-2 ml-1"
                            >
                                Effacer tag
                            </button>
                        )}
                    </div>
                </div>

                {/* Featured Hero Article (when in default unfiltered state) */}
                {isUnfiltered && featuredArticle && (
                    <div className="mb-12">
                        <div className="flex items-center gap-2 mb-4 text-xs font-mono font-bold text-banan-primary uppercase tracking-widest">
                            <Sparkles className="w-4 h-4" />
                            <span>Pour commencer</span>
                        </div>
                        <ArticleCard article={featuredArticle} featured={true} />
                    </div>
                )}

                {/* Articles List / Grid */}
                <div>
                    <div ref={articlesSectionRef} className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold font-sans tracking-tight text-white">
                            {selectedCategory === 'all' && !selectedTag && !searchQuery ? 'À feuilleter' : 'Votre sélection'}
                        </h2>
                        <span className="text-sm font-mono text-white/60">
                            {filteredArticles.length} article{filteredArticles.length > 1 ? 's' : ''}
                        </span>
                    </div>

                    {filteredArticles.length === 0 ? (
                        <div className="border-t border-white/15 py-16 text-center">
                            <Terminal className="w-12 h-12 text-white/30 mx-auto mb-3" />
                            <h3 className="font-mono text-lg uppercase text-white mb-2">
                                Pas encore d’article sur ce sujet
                            </h3>
                            <p className="text-white/70 text-base max-w-md mx-auto mb-6">
                                Aucun article ne correspond à votre recherche "{searchQuery}" ou aux filtres appliqués.
                            </p>
                            <button
                                onClick={handleResetFilters}
                                className="px-5 py-2.5 bg-banan-primary text-black font-mono font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-banan-primary/90 transition-colors"
                            >
                                Revoir tous les articles
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-2">
                                {paginatedArticles.filter(article => !isUnfiltered || article.slug !== featuredArticle?.slug).map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-white/10 font-mono">
                                    <div className="text-sm text-white/60">
                                        Affichage <span className="text-white font-bold">{(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}</span> à <span className="text-white font-bold">{Math.min(safeCurrentPage * ITEMS_PER_PAGE, filteredArticles.length)}</span> sur <span className="text-banan-primary font-bold">{filteredArticles.length}</span> articles
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(safeCurrentPage - 1)}
                                            disabled={safeCurrentPage === 1}
                                            className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors",
                                                safeCurrentPage === 1
                                                    ? "opacity-30 cursor-not-allowed border-white/10 text-white/40"
                                                    : "border-white/15 bg-white/5 hover:bg-white/10 text-white hover:border-banan-primary cursor-pointer"
                                            )}
                                            aria-label="Page précédente"
                                        >
                                            <ChevronLeft className="w-4 h-4" />
                                            <span className="hidden sm:inline">Précédent</span>
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                const isCurrent = page === safeCurrentPage;
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        className={cn(
                                                            "w-9 h-9 rounded-lg text-sm font-bold transition-all border",
                                                            isCurrent
                                                                ? "bg-banan-primary text-black border-banan-primary shadow-[0_0_10px_rgba(250,255,0,0.3)]"
                                                                : "bg-white/5 text-white/80 hover:text-white border-white/10 hover:border-white/25 cursor-pointer"
                                                        )}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <button
                                            onClick={() => handlePageChange(safeCurrentPage + 1)}
                                            disabled={safeCurrentPage === totalPages}
                                            className={cn(
                                                "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors",
                                                safeCurrentPage === totalPages
                                                    ? "opacity-30 cursor-not-allowed border-white/10 text-white/40"
                                                    : "border-white/15 bg-white/5 hover:bg-white/10 text-white hover:border-banan-primary cursor-pointer"
                                            )}
                                            aria-label="Page suivante"
                                        >
                                            <span className="hidden sm:inline">Suivant</span>
                                            <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
