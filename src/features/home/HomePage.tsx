import React from 'react';
import ShinyText from '@app/components/ui/ShinyText';
import Aurora from '@app/components/ui/Aurora';
import LavaLamp from '@app/components/ui/LavaLamp';
import { Banana, Users, Calendar, Gamepad, ArrowDown, Rocket, Heart } from 'lucide-react';
import { Link } from 'react-router';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import SplitFlapDisplay from '@app/components/ui/SplitFlap';
import Globe from '@app/components/ui/Globe';
import { formatNumber } from '@app/utils/format';
import MarketTicker from './components/MarketTicker';
import ShowcaseSection from './components/ShowcaseSection';
import LiveHub from './components/LiveHub';
import HallOfFame from './components/HallOfFame';
import HardwareStack from './components/HardwareStack';
import BananierLogs from './components/BananierLogs';
import RecruitmentHub from './components/RecruitmentHub';
import WikINTAd from '@app/features/events/components/WikINTAd';


const FlipNumber = ({ value, flaps = 3, fontSize = '3rem' }: { value: number, flaps?: number, fontSize?: string }) => (
    <span style={{ fontSize, lineHeight: 1 }}>
        <SplitFlapDisplay value={formatNumber(value)} duration={80} minLength={flaps} />
    </span>
);

const TeamCardsGroup = ({ children }: { children: React.ReactNode }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const cards = containerRef.current.querySelectorAll('.team-card');
        cards.forEach((card) => {
            const htmlCard = card as HTMLElement;
            const rect = htmlCard.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            htmlCard.style.setProperty('--mouse-x', `${x}px`);
            htmlCard.style.setProperty('--mouse-y', `${y}px`);
        });
    };

    return (
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="group/cards grid grid-cols-1 md:grid-cols-3 gap-6"
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
        <div className="min-h-[calc(100vh-6rem)] bg-black text-white overflow-x-hidden relative font-sans">
            <Aurora>
                <div className="relative z-20 flex flex-col items-center pt-12 pb-12 px-4 text-center">

                    {/* Header Text - Enhanced with Glow & Cast Shadow */}
                    <div className="mb-12 relative z-30 px-4 group">
                        <motion.span 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-xs sm:text-sm font-mono text-banan-primary uppercase tracking-[0.4em] mb-6 block"
                        >
                            Un club de Télécom SudParis
                        </motion.span>
                        
                        <div className="relative">
                            {/* Main Title with Extra Inner Glow */}
                            <h1 className="text-[clamp(1.5rem,11.5vw,12rem)] font-black tracking-tighter uppercase leading-[0.85] relative z-30">
                                <ShinyText text="BananINT" speed={6} className="selection:bg-banan-primary selection:text-banan-background" />
                            </h1>
                        </div>

                        <motion.p 
                            initial={{ opacity: 0 }}
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
                        <div className="lg:hidden grid grid-cols-2 gap-4 w-full relative z-20 px-4">
                            <div className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl">
                                <Users className="w-8 h-8 text-banan-primary mb-2" />
                                <div className="text-3xl font-black text-white"><FlipNumber value={stats.total_players} fontSize="1.875rem" /></div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">Membres</div>
                            </div>
                            <div className="flex flex-col items-center justify-center p-6 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl">
                                <Banana className="w-8 h-8 text-banan-primary mb-2" />
                                <div className="text-3xl font-black text-white"><FlipNumber value={stats.total_bananas} fontSize="1.875rem" /></div>
                                <div className="text-[10px] font-mono uppercase tracking-widest text-white/50">Bananes</div>
                            </div>
                        </div>

                        {/* Left Stat - Floating on PC */}
                        <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group absolute left-0 top-[25%] -translate-y-1/2 z-20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <Users className="w-12 h-12 text-banan-primary mb-4 transition-transform group-hover:scale-110" />
                            <div className="text-5xl font-black text-white mb-2"><FlipNumber value={stats.total_players} /></div>
                            <div className="text-xs font-mono uppercase tracking-widest text-white/50">Membres Actifs</div>
                        </div>

                        {/* Globe Center - Full Width */}
                        <div className="w-[calc(100%+2rem)] -mx-4 lg:w-full lg:mx-0 h-[450px] lg:h-[800px] flex items-center justify-center relative pointer-events-none -mt-32 lg:-mt-48">
                            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-80 mix-blend-screen overflow-visible scale-[1.5] lg:scale-[1.3]">
                                <Globe />
                            </div>
                        </div>

                        {/* Right Stat - Floating on PC */}
                        <div className="hidden lg:flex flex-col items-center justify-center p-8 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group absolute right-0 top-[25%] -translate-y-1/2 z-20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                            <Banana className="w-12 h-12 text-banan-primary mb-4 transition-transform group-hover:scale-110" />
                            <div className="text-5xl font-black text-white mb-2"><FlipNumber value={stats.total_bananas} /></div>
                            <div className="text-xs font-mono uppercase tracking-widest text-white/50">Bananes Farmées</div>
                        </div>
                    </div>
                    
                    <ShowcaseSection 
                        title="Une expérience unique"
                        centered
                        maxWidth="max-w-2xl"
                        className="mb-20"
                    >
                        <p className="text-white/70 font-mono text-sm leading-relaxed mb-10">
                            Rejoignez le réseau central. Farmez des bananes, investissez dans le marché boursier cryptographique, achetez des améliorations illégales et dominez le classement mondial. Le protocole vous attend.
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

                    <HallOfFame />
                    
                    <WikINTAd />

                    <MarketTicker />

                    <LiveHub />

                    <ShowcaseSection 
                        title="Nos Events" 
                        icon={Rocket}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="flex items-center justify-center bg-white/5 rounded-3xl border border-white/10 h-[500px] relative overflow-hidden group">
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

                    <BananierLogs />
  
                    <ShowcaseSection 
                        title="L'équipe (les addicts)"
                        icon={Heart}
                    >
                        <TeamCardsGroup>
                            <TeamCard glowColor="rgba(var(--banan-green-rgb), 0.15)">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-banan-green to-banan-green/50 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(var(--banan-green-rgb),0.3)] overflow-hidden">
                                    <img src="/img/team/luc.webp" alt="Lucas Thuries" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Lucas Thuries</h3>
                                    <p className="text-banan-green font-mono text-sm tracking-widest uppercase mb-4">Banana Advocate / M. Grosse Banane</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Mène la révolution banane, une réunion à la fois."</p>
                                </div>
                            </TeamCard>

                            <TeamCard className="border-banan-primary/30" glowColor="rgba(var(--banan-primary-rgb), 0.15)">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-banan-primary to-banan-primary/50 rounded-full flex items-center justify-center text-black shadow-[0_0_30px_rgba(var(--banan-primary-rgb),0.3)] overflow-hidden">
                                    <img src="/img/team/dim.webp" alt="Dimitri Fajal" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Dimitri Fajal</h3>
                                    <p className="text-banan-primary font-mono text-sm tracking-widest uppercase mb-4">Président / Singe du code</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Transforme la caféine en algorithmes enrichis en potassium."</p>
                                </div>
                            </TeamCard>

                            <TeamCard glowColor="rgba(var(--banan-teal-rgb), 0.15)">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-banan-teal to-banan-teal/50 rounded-full flex items-center justify-center text-white shadow-[0_0_30px_rgba(var(--banan-teal-rgb),0.3)] overflow-hidden">
                                    <img src="/img/team/flo.webp" alt="Florian Rivière" className="w-full h-full object-cover" />
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-white uppercase mb-1">Florian Rivière</h3>
                                    <p className="text-banan-teal font-mono text-sm tracking-widest uppercase mb-4">CM / Hype Man</p>
                                    <div className="w-full h-px bg-white/10 mb-4"></div>
                                    <p className="text-white/60 text-sm">"Répand la bonne parole plus vite qu'on ne glisse."</p>
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
                        <div className="p-10 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-banan-primary/50 to-transparent opacity-50"></div>
                            <p className="text-xl md:text-2xl text-white/80 font-light leading-relaxed italic">
                                "Plus qu'un simple club, BananINT est l'épicentre de l'innovation et du potassium sur le campus. Là où le BDE s'essouffle et MiNET s'enferme dans ses racks, nous injectons une dose massive d'utilité et de fun. Notre dévotion à la banane n'est pas qu'un délire d'initiés, c'est une mission : apporter des services concrets, une technique irréprochable et assez d'énergie pour faire glisser toute l'école vers le futur."
                            </p>
                        </div>
                    </ShowcaseSection>
                    
                    <RecruitmentHub />
                </div>
            </Aurora>
        </div>
    );
}
