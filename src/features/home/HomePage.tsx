import React, { Suspense, lazy } from 'react';
import ShinyText from '@app/components/ui/ShinyText';
import Aurora from '@app/components/ui/Aurora';
import LavaLamp from '@app/components/ui/LavaLamp';
import { Banana, Users, Calendar, Gamepad, ArrowDown, ArrowUpRight, BookOpen, Rocket, Heart } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import SplitFlapDisplay from '@app/components/ui/SplitFlap';
import { formatNumber } from '@app/utils/format';
import MarketTicker from './components/MarketTicker';
import ShowcaseSection from './components/ShowcaseSection';
import LiveHub from './components/LiveHub';
import HallOfFame from './components/HallOfFame';
import HardwareStack from './components/HardwareStack';
import BananierLogs from './components/BananierLogs';
import RecruitmentHub from './components/RecruitmentHub';
import WikINTAd from '@app/features/events/components/WikINTAd';
import GlobeStill from './components/GlobeStill';

// three.js + three-globe are the heaviest dependencies on the page; the still
// image holds the exact same spot until the live globe chunk arrives.
const Globe = lazy(() => import('@app/components/ui/Globe'));


const FlipNumber = ({ value, flaps = 3, fontSize = '3rem', compact = false }: { value: number, flaps?: number, fontSize?: string, compact?: boolean }) => (
    <span className="block max-w-full" style={{ fontSize, lineHeight: 1 }}>
        {compact ? <span className="block break-all text-[clamp(1rem,5vw,1.875rem)]">{formatNumber(value)}</span> : <SplitFlapDisplay value={formatNumber(value)} duration={80} minLength={flaps} />}
    </span>
);

const TeamCardsGroup = ({ children }: { children: React.ReactNode }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    // Card rects are cached while the pointer is over the group and dropped on
    // scroll/resize, so a mousemove costs one rAF write pass instead of N layout reads.
    const cardsRef = useRef<{ el: HTMLElement, rect: DOMRect }[] | null>(null);
    const pointerRef = useRef({ x: 0, y: 0 });
    const frameRef = useRef<number | null>(null);

    const measure = () => {
        const container = containerRef.current;
        if (!container) return [];
        cardsRef.current = Array.from(container.querySelectorAll<HTMLElement>('.team-card'))
            .map(el => ({ el, rect: el.getBoundingClientRect() }));
        return cardsRef.current;
    };

    useEffect(() => {
        const invalidate = () => { cardsRef.current = null; };
        window.addEventListener('resize', invalidate);
        window.addEventListener('scroll', invalidate, { passive: true, capture: true });
        return () => {
            window.removeEventListener('resize', invalidate);
            window.removeEventListener('scroll', invalidate, { capture: true });
            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
        };
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        pointerRef.current = { x: e.clientX, y: e.clientY };
        if (frameRef.current !== null) return;
        frameRef.current = requestAnimationFrame(() => {
            frameRef.current = null;
            const { x: px, y: py } = pointerRef.current;
            (cardsRef.current ?? measure()).forEach(({ el, rect }) => {
                el.style.setProperty('--mouse-x', `${px - rect.left}px`);
                el.style.setProperty('--mouse-y', `${py - rect.top}px`);
            });
        });
    };

    return (
        <div 
            ref={containerRef}
            onMouseEnter={measure}
            onMouseMove={handleMouseMove}
            className="group/cards grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
            {children}
        </div>
    );
};

const TeamCard = ({ children, className = "", glowColor = "rgba(255,255,255,0.08)" }: { children: React.ReactNode, className?: string, glowColor?: string }) => {
    return (
        <div 
            className={`team-card relative p-6 bg-white/5 border border-white/10 rounded-3xl transition-colors hover:bg-white/10 overflow-hidden ${className}`}
        >
            <div 
                className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover/cards:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle 350px at var(--mouse-x, 0px) var(--mouse-y, 0px), ${glowColor}, transparent 80%)`
                }}
            />
            <div className="relative z-10 w-full h-full flex flex-col">
                {children}
            </div>
        </div>
    );
};

export default function HomePage() {
    const [stats, setStats] = useState({ total_players: 1, total_bananas: 1 });

    useEffect(() => {
        const fetchStats = () => {
            fetch('/api/stats/global')
                .then(res => res.json())
                .then(data => {
                    if (data.total_players !== undefined && data.total_bananas !== undefined) {
                        setStats({
                            total_players: data.total_players,
                            total_bananas: data.total_bananas,
                        });
                    }
                })
                .catch(err => console.error("Failed to fetch global stats:", err));
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000);
        return () => clearInterval(interval);
    }, []);


    return (
        <div className="min-h-[calc(100dvh-6rem)] bg-black text-white overflow-x-hidden relative font-sans">
            <Aurora>
                <div className="relative z-20 flex flex-col items-center pt-12 pb-12 px-4 text-center">

                    {/* Header Text - Enhanced with Glow & Cast Shadow */}
                    <div className="mb-12 relative z-30 px-4 group">
                        <motion.span 
                            initial={false}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-xs sm:text-sm font-mono text-banan-primary uppercase tracking-[0.4em] mb-6 block"
                        >
                            Un club de Télécom SudParis
                        </motion.span>
                        
                        <div className="relative">
                            {/* Main Title with Extra Inner Glow */}
                            <h1 className="text-[clamp(1.5rem,10vw,12rem)] sm:text-[clamp(1.5rem,11.5vw,12rem)] font-black tracking-tighter uppercase leading-[0.85] relative z-30">
                                <ShinyText text="BananINT" speed={6} className="selection:bg-banan-primary selection:text-banan-background" />
                            </h1>
                        </div>

                        <motion.p 
                            initial={false}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.2, delay: 0.8 }}
                            className="mt-8 text-sm sm:text-2xl text-white/80 max-w-2xl mx-auto font-light leading-relaxed tracking-wide"
                        >
                            Fournisseur de potassium numérique
                        </motion.p>
                    </div>

                    {/* HERO CONTAINER: Stats floating over Globe on PC */}
                    <div className="w-full max-w-[1600px] mx-auto relative flex flex-col items-center lg:min-h-[800px] mt-4">
                        {/* Mobile Stats (Shows below globe on mobile) */}
                        <div className="lg:hidden grid min-w-0 grid-cols-2 gap-3 w-full relative z-20 px-1 sm:gap-4 sm:px-4">
                            <div className="flex min-w-0 flex-col items-center justify-center overflow-hidden border-t-2 border-banan-primary bg-black/65 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-md sm:p-6">
                                <Users className="w-8 h-8 text-banan-primary mb-2" />
                                <div className="max-w-full font-black text-white"><FlipNumber value={stats.total_players} compact /></div>
                                <div className="text-[11px] font-mono uppercase tracking-widest text-white/50">Membres</div>
                            </div>
                            <div className="flex min-w-0 flex-col items-center justify-center overflow-hidden border-t-2 border-banan-primary bg-black/65 p-3 shadow-[0_10px_40px_rgba(0,0,0,0.4)] backdrop-blur-md sm:p-6">
                                <Banana className="w-8 h-8 text-banan-primary mb-2" />
                                <div className="max-w-full font-black text-white"><FlipNumber value={stats.total_bananas} compact /></div>
                                <div className="text-[11px] font-mono uppercase tracking-widest text-white/50">Bananes</div>
                            </div>
                        </div>

                        {/* Left Stat - Floating on PC */}
                        <div className="group absolute left-0 top-[42%] z-20 hidden w-64 -translate-y-1/2 overflow-hidden border-l-2 border-banan-primary bg-black/70 p-6 text-left shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:block xl:w-72">
                            <div className="mb-6 flex items-center justify-between text-banan-primary"><span className="font-mono text-[11px] uppercase tracking-[0.25em]">Sur le campus</span><Users className="h-7 w-7 transition-transform group-hover:scale-110" /></div>
                            <div className="font-black text-white"><FlipNumber value={stats.total_players} fontSize="clamp(2rem, 2.5vw, 2.5rem)" /></div>
                            <div className="mt-3 font-mono text-xs uppercase tracking-widest text-white/55">Membres actifs</div>
                        </div>

                        {/* Globe Center - Full Width */}
                        <div className="w-[calc(100%+2rem)] -mx-4 lg:w-full lg:mx-0 h-[450px] lg:h-[800px] flex items-center justify-center relative pointer-events-none -mt-16 lg:-mt-24">
                            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-80 mix-blend-screen overflow-visible scale-[1.15] lg:scale-[1.3]">
                                <Suspense fallback={<GlobeStill />}>
                                    <Globe />
                                </Suspense>
                            </div>
                        </div>

                        {/* Right Stat - Floating on PC */}
                        <div className="group absolute right-0 top-[42%] z-20 hidden w-64 -translate-y-1/2 overflow-hidden border-r-2 border-banan-primary bg-black/70 p-6 text-right shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl lg:block xl:w-72">
                            <div className="mb-6 flex items-center justify-between text-banan-primary"><Banana className="h-7 w-7 transition-transform group-hover:-rotate-12" /><span className="font-mono text-[11px] uppercase tracking-[0.25em]">Au compteur</span></div>
                            <div className="font-black text-white"><FlipNumber value={stats.total_bananas} fontSize="clamp(2rem, 2.5vw, 2.5rem)" /></div>
                            <div className="mt-3 font-mono text-xs uppercase tracking-widest text-white/55">Bananes farmées</div>
                        </div>
                    </div>
                    
                    <ShowcaseSection 
                        title="Un clicker qui a mal tourné"
                        centered
                        maxWidth="max-w-2xl"
                        className="mb-20"
                    >
                        <p className="text-white/70 font-mono text-sm leading-relaxed mb-10">
                            Le premier classement a lancé une course aux clics et aux bots sur le campus. Depuis, le jeu a grandi : améliore ta production, surveille le marché et essaie de grimper à ton tour.
                        </p>
                        <Link 
                            to="/clicker" 
                            className="group relative inline-flex items-center gap-3 bg-black border-2 border-banan-primary text-banan-primary font-black uppercase tracking-tighter text-lg px-10 py-4 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-banan-primary hover:text-black overflow-hidden shadow-[0_0_15px_rgba(var(--banan-primary-rgb),0.3)] hover:shadow-[0_0_50px_rgba(var(--banan-primary-rgb),0.8)]"
                        >
                            <div className="absolute inset-0 bg-banan-primary/10 animate-pulse group-hover:opacity-0 transition-opacity duration-300 pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-12 group-hover:translate-x-[150%] transition-transform duration-700 z-20 pointer-events-none"></div>
                            
                            <Banana className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-125" />
                            <span className="relative z-10 tracking-widest">Jouer Maintenant</span>
                        </Link>
                    </ShowcaseSection>

                    <BananierLogs />

                    <HallOfFame />
                    
                    <WikINTAd />

                    <MarketTicker />

                    <LiveHub />

                    <ShowcaseSection 
                        title="Nos Events" 
                        icon={Rocket}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 h-64 sm:h-96 lg:h-[500px] relative overflow-hidden group">
                                <LavaLamp />
                            </div>

                            <div className="flex flex-col gap-6 justify-center">
                                <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-banan-primary transition-colors group">
                                    <div className="p-3 bg-white/10 rounded-xl text-banan-primary group-hover:bg-banan-primary group-hover:text-black transition-colors">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1 group-hover:text-banan-primary transition-colors">WEB Week-end Banane</h4>
                                        <p className="text-white/60 text-sm leading-relaxed">Un week-end délirant où on mange des bananes entre amis!</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-banan-green transition-colors group">
                                    <div className="p-3 bg-white/10 rounded-xl text-banan-green group-hover:bg-banan-green group-hover:text-black transition-colors">
                                        <Gamepad className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1 group-hover:text-banan-green transition-colors">Tournois Jeux</h4>
                                        <p className="text-white/60 text-sm leading-relaxed">Mario Kart, Donkey Kong et plein d'autres jeux ! Viens affronter tes potes dans une ambiance banane.</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-banan-teal transition-colors group">
                                    <div className="p-3 bg-white/10 rounded-xl text-banan-teal group-hover:bg-banan-teal group-hover:text-black transition-colors">
                                        <ArrowDown className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold mb-1 group-hover:text-banan-teal transition-colors">Import de Bananes</h4>
                                        <p className="text-white/60 text-sm leading-relaxed">On importe des bananes pour toute l'école ! Recettes à base de banane et bonheur garanti.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ShowcaseSection>

                    <ShowcaseSection title="Le campus en vrai" icon={BookOpen}>
                        <p className="-mt-5 mb-9 max-w-2xl text-sm leading-relaxed text-white/65 sm:mt-0 sm:text-base">
                            Entre deux parties, il y a les lieux, les assos et les mots du campus. On a commencé à les raconter dans le carnet.
                        </p>
                        <div className="grid gap-x-8 gap-y-6 md:grid-cols-3">
                            {[
                                { number: '01', title: 'TSP, MAISEL, INT : les premiers repères du campus', slug: 'tsp-maisel-assos-premiers-reperes', label: 'Pour commencer' },
                                { number: '02', title: 'Pourquoi il y a « INT » partout sur le campus', slug: 'expressions-associations-int-xrtc', label: 'Les mots du campus' },
                                { number: '03', title: 'NOVA, le Ritz et les petits détours d’une journée', slug: 'nova-ritz-quotidien-campus-evry', label: 'Les lieux' },
                            ].map((article) => (
                                <Link key={article.slug} to={`/blog/${article.slug}`} className="group flex min-w-0 flex-col border-t-2 border-white/25 pt-4 transition-colors hover:border-banan-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-banan-primary">
                                    <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-banan-primary">{article.number} / {article.label}</span>
                                    <span className="mt-4 flex min-w-0 items-start justify-between gap-4 text-lg font-bold leading-snug text-white group-hover:text-banan-primary sm:text-xl">
                                        <span>{article.title}</span>
                                        <ArrowUpRight className="mt-1 h-5 w-5 shrink-0 text-banan-primary transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" aria-hidden="true" />
                                    </span>
                                </Link>
                            ))}
                        </div>
                        <div className="mt-9 flex flex-wrap gap-x-8 gap-y-4">
                            <Link to="/blog/vie-etudiante-telecom-sudparis" className="inline-flex items-center gap-2 font-mono text-sm font-bold text-banan-primary underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-banan-primary">
                                Vie étudiante à Télécom SudParis <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                            <Link to="/blog" className="inline-flex items-center gap-2 font-mono text-sm font-bold text-banan-primary underline underline-offset-4 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-banan-primary">
                                Tout le carnet <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </ShowcaseSection>
  
                    <ShowcaseSection 
                        title="L'équipe (les addicts)"
                        icon={Heart}
                    >
                        <TeamCardsGroup>
                            <TeamCard glowColor="rgba(var(--banan-green-rgb), 0.15)">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-banan-green to-banan-green/50 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(var(--banan-green-rgb),0.3)] overflow-hidden">
                                    <img src="/img/team/luc.webp" alt="Lucas Thuries" width={512} height={512} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Lucas Thuries</h3>
                                    <p className="text-banan-green font-mono text-sm tracking-widest uppercase mb-4">Banana Advocate</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Négocie les alliances stratégiques et convertit les sceptiques au protocole banane."</p>
                                </div>
                            </TeamCard>

                            <TeamCard className="border-banan-primary/30" glowColor="rgba(var(--banan-primary-rgb), 0.15)">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-banan-primary to-banan-primary/50 rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(var(--banan-primary-rgb),0.3)] overflow-hidden">
                                    <img src="/img/team/dim.webp" alt="Dimitri Fajal" width={512} height={512} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Dimitri Fajal</h3>
                                    <p className="text-banan-primary font-mono text-sm tracking-widest uppercase mb-4">Président & Tech Lead</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Conçoit l'architecture du système et orchestre la simulation économique en temps réel."</p>
                                </div>
                            </TeamCard>

                            <TeamCard glowColor="rgba(var(--banan-teal-rgb), 0.15)">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-banan-teal to-banan-teal/50 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(var(--banan-teal-rgb),0.3)] overflow-hidden">
                                    <img src="/img/team/flo.webp" alt="Florian Rivière" width={512} height={512} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Florian Rivière</h3>
                                    <p className="text-banan-teal font-mono text-sm tracking-widest uppercase mb-4">Community Manager</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Fédère la communauté des bananiers et pilote les opérations de communication."</p>
                                </div>
                            </TeamCard>

                            <TeamCard glowColor="rgba(245, 158, 11, 0.15)">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-amber-400 to-amber-600/50 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(245,158,11,0.3)] overflow-hidden">
                                    <img src="/img/team/theo.webp" alt="Théo Darvoux" width={512} height={512} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Théo Darvoux</h3>
                                    <p className="text-amber-400 font-mono text-sm tracking-widest uppercase mb-4">Emissaire BananINT</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Établit les liaisons diplomatiques et guide les nouvelles recrues vers l'écosystème."</p>
                                </div>
                            </TeamCard>
                        </TeamCardsGroup>
                    </ShowcaseSection>

                    <HardwareStack />

                    <ShowcaseSection
                        title="Le protocole potassium"
                        centered
                        maxWidth="max-w-4xl"
                    >
                        <p className="mx-auto max-w-3xl font-mono text-base leading-relaxed text-white/80 sm:text-xl">
                            Un club qui n’existe pas tout à fait.<br />Un clicker que des gens ont pris beaucoup trop au sérieux.<br /><span className="font-bold text-banan-primary">Bienvenue à BananINT.</span>
                        </p>
                    </ShowcaseSection>
                    
                    <RecruitmentHub />
                </div>
            </Aurora>
        </div>
    );
}
