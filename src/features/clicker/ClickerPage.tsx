
import { useGame } from '@app/context/GameContext';
import { Zap, TrendingUp, Trophy, CircuitBoard, Dna, Banana, Crosshair, type LucideIcon } from 'lucide-react';

import StockChart from './components/StockChart';
import CyberWarfareSection from './components/CyberWarfareSection';
import MissionsAchievementsSection from './components/MissionsAchievementsSection';
import AgentDossierCard from './components/AgentDossierCard';
import SystemTelemetryCard from './components/SystemTelemetryCard';
import CyberCombatFeedCard from './components/CyberCombatFeedCard';
import ThemeShopModal from './components/ThemeShopModal';
import { Palette, Eye, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { socketManager } from '@app/lib/socket';
import { AnimatePresence, motion } from 'framer-motion';
import GameSection from '@app/components/shared/GameSection';
import { formatNumber } from '@app/utils/format';
import AlgoCultModal from './components/AlgoCultModal';
import GoldenBanana from './components/GoldenBanana';
import PrestigeRitual from './components/PrestigeRitual';
import { PRESTIGE_REQUIREMENT } from '@app/config/gameConstants';
import type { AlgoCultState, CyberAttack, CyberState } from '@app/types/game';

const UPGRADE_ICONS: Record<string, LucideIcon> = {
    click: Zap,
    auto: TrendingUp,
    synergy: CircuitBoard,
    prestige: Dna,
};

export default function ClickerPage() {
    const { gameState, clickBanana, buyUpgrade, availableUpgrades } = useGame();
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'click' | 'auto' | 'synergy' | 'prestige'>('click');
    const [isAlgoOpen, setIsAlgoOpen] = useState(false);
    const [isPrestigeOpen, setIsPrestigeOpen] = useState(false);
    const canAscend = gameState.totalBananasEarned >= PRESTIGE_REQUIREMENT;
    const [algoState, setAlgoState] = useState<AlgoCultState | null>(null);
    const [cyberState, setCyberState] = useState<CyberState | null>(null);
    const [cyberAttacks, setCyberAttacks] = useState<CyberAttack[]>([]);
    const [retaliationTarget, setRetaliationTarget] = useState<{ id: string; name: string } | null>(null);
    const leaderboard = gameState.leaderboard || [];

    useEffect(() => {
        const alertTimers = new Set<ReturnType<typeof setTimeout>>();
        const handleMessage = (msg: { type: string; data: unknown }) => {
            if (msg.type === 'algo_cult_state') {
                setAlgoState(msg.data as AlgoCultState);
            } else if (msg.type === 'cyber_state') {
                setCyberState(msg.data as CyberState);
            } else if (msg.type === 'cyber_attacked') {
                setCyberAttacks(prev => [...prev, msg.data as CyberAttack]);
                const timer = setTimeout(() => {
                    alertTimers.delete(timer);
                    setCyberAttacks(prev => prev.slice(1));
                }, 10000);
                alertTimers.add(timer);
            }
        };
        socketManager.subscribe(handleMessage);
        socketManager.send('get_algo_cult_state', {});
        socketManager.send('get_cyber_state', {});

        return () => {
            socketManager.unsubscribe(handleMessage);
            alertTimers.forEach(clearTimeout);
            alertTimers.clear();
        };
    }, []);

    return (
        <div className="flex flex-col relative">
            {/* Active Overclock Frenzy Banner */}
            {cyberState?.overclock_active && (
                <div className="w-full bg-banan-primary text-black font-mono font-black text-xs py-2 px-4 text-center tracking-widest uppercase flex items-center justify-center gap-2 animate-pulse shadow-[0_0_25px_rgba(250,222,0,0.6)] z-30 sticky top-0 border-b border-black">
                    <Zap className="h-4 w-4 text-black fill-current" />
                    SURCHARGE KERNEL ACTIVE : MULTIPLICATEUR DE PRODUCTION ×2 ({cyberState.overclock_remaining}S RESTANTES)
                    <Zap className="h-4 w-4 text-black fill-current" />
                </div>
            )}

            {/* Global Cyber Attack Alerts */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {cyberAttacks.map((attack, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-black/90 border-2 border-red-500 shadow-[0_0_20px_rgba(255,0,0,0.4)] p-4 flex flex-col items-center pointer-events-auto"
                        >
                            <div className="flex items-center gap-2 text-red-500 font-black font-mono uppercase tracking-widest text-sm mb-1">
                                <AlertTriangle className="h-5 w-5 animate-pulse" />
                                SYSTÈME COMPROMIS
                            </div>
                            <div className="text-white/80 font-mono text-xs text-center leading-tight">
                                Vous avez été piraté par <span className="text-red-400 font-bold">{attack.attacker}</span>.<br/>
                                <span className="text-red-500 font-black text-sm">-{formatNumber(attack.stolen)} 🍌</span>
                                {attack.mitigated > 0 && (
                                    <div className="text-blue-400 mt-1 text-[10px]">
                                        (Pare-feu a bloqué {formatNumber(attack.mitigated)}🍌 supplémentaires)
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setRetaliationTarget({ id: attack.attacker_id || attack.attacker, name: attack.attacker });
                                    const el = document.getElementById('cyber-warfare-section');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="mt-3 px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                            >
                                <Crosshair className="h-3.5 w-3.5" />
                                CONTRE-ATTAQUER
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 h-auto lg:h-[calc(100dvh-6rem)] overflow-hidden">
                {/* Column 1: ARMORY (Upgrades) */}
                <div className="order-2 lg:order-1 lg:col-span-1 border-r border-white/10 flex flex-col h-[500px] lg:h-full overflow-hidden">
                    <GameSection
                        title="MARKETPLACE"
                        icon={Zap}
                        className="h-full border-x-0 border-b-0 p-0"
                        headerClassName="p-4 mb-0"
                    >
                        {/* Tabs */}
                        <div className="flex border-b border-white/10">
                            <button
                                onClick={() => setActiveTab('click')}
                                className={`flex-1 py-2 flex justify-center items-center hover:bg-white/5 transition-colors ${activeTab === 'click' ? 'bg-white/10 text-banan-primary' : 'text-white/30'}`}
                                title="Click Upgrades"
                            >
                                <Zap className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setActiveTab('auto')}
                                className={`flex-1 py-2 flex justify-center items-center hover:bg-white/5 transition-colors ${activeTab === 'auto' ? 'bg-white/10 text-banan-primary' : 'text-white/30'}`}
                                title="Auto Upgrades"
                            >
                                <TrendingUp className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setActiveTab('synergy')}
                                className={`flex-1 py-2 flex justify-center items-center hover:bg-white/5 transition-colors ${activeTab === 'synergy' ? 'bg-white/10 text-banan-primary' : 'text-white/30'}`}
                                title="Synergy Upgrades"
                            >
                                <CircuitBoard className="h-4 w-4" />
                            </button>
                            {(gameState.prestigeCount > 0 || gameState.banana_dna > 0) && (
                                <button
                                    onClick={() => setActiveTab('prestige')}
                                    className={`flex-1 py-2 flex justify-center items-center hover:bg-white/5 transition-colors ${activeTab === 'prestige' ? 'bg-white/10 text-banan-primary' : 'text-white/30'}`}
                                    title="Améliorations ADN Prestige"
                                >
                                    <Dna className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        {activeTab === 'prestige' && (
                            <div className="p-3 bg-banan-primary/10 border-b border-banan-primary/20 flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-mono uppercase text-white/50 tracking-wider flex items-center gap-1.5">
                                        <Dna className="w-3.5 h-3.5 text-banan-primary" />
                                        Solde ADN
                                    </span>
                                    <span className="font-mono font-black text-xs text-banan-primary flex items-center gap-1">
                                        {formatNumber(gameState.banana_dna)} 🧬
                                    </span>
                                </div>
                                <div className="text-[9px] font-mono text-white/40 leading-tight">
                                    Améliorations génétiques permanentes conservées lors de l'Ascension.
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto">
                            {availableUpgrades.filter(u => u.type === activeTab).length === 0 ? (
                                <div className="p-8 text-center text-xs font-mono text-white/30 uppercase">
                                    Aucune amélioration disponible
                                </div>
                            ) : (
                                availableUpgrades.filter(u => u.type === activeTab).sort((a, b) => a.cost - b.cost).map((item) => {
                                    const isPrestige = item.type === 'prestige';
                                    const isAcquired = isPrestige && item.owned >= 1;
                                    const isDisabled = isPrestige
                                        ? (isAcquired || gameState.banana_dna < item.cost)
                                        : (gameState.bananas < item.cost);

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => buyUpgrade(item.id)}
                                            disabled={isDisabled}
                                            className={`w-full flex items-center justify-between p-4 border-b border-white/10 transition-colors group ${
                                                isAcquired
                                                    ? 'bg-banan-primary/5 cursor-default'
                                                    : 'hover:bg-white/5 active:bg-banan-primary active:text-black disabled:opacity-30'
                                            }`}
                                        >
                                            <div className="text-left">
                                                <div className="font-bold font-mono text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                                                    {(() => { const Icon = UPGRADE_ICONS[item.type]; return Icon ? <Icon className="h-3.5 w-3.5 text-white/40" /> : null; })()}
                                                    {item.name}
                                                    {!isPrestige && <span className="text-white/30 ml-2">x{item.owned}</span>}
                                                </div>
                                                <div className="text-[10px] font-mono opacity-50">
                                                    {item.desc || `+${item.value} ${item.type === 'click' ? '/CLICK' : '/SEC'}`}
                                                </div>
                                            </div>
                                            {isAcquired ? (
                                                <span className="text-[10px] font-mono font-bold text-banan-primary border border-banan-primary/40 bg-banan-primary/10 px-2 py-0.5 rounded uppercase tracking-wider">
                                                    ACQUIS
                                                </span>
                                            ) : (
                                                <div className="font-mono font-bold text-banan-primary text-xs group-hover:text-white group-active:text-black flex items-center gap-1">
                                                    {formatNumber(item.cost)} {isPrestige ? 'ADN' : ''}
                                                </div>
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </GameSection>
                </div>

                {/* Column 2: CORE (The Clicker) */}
                <div className="order-1 lg:order-2 lg:col-span-2 flex flex-col relative w-full">
                    <GameSection
                        title=""
                        rightElement="EN LIGNE"
                        className="h-full border-x-0 border-b-0 p-0 relative banan-grid flex flex-col"
                        headerClassName="p-4 mb-0 border-b border-white/10 relative z-10 backdrop-blur-sm"
                    >
                        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[500px] relative">
                            <GoldenBanana />

                            <div className="mb-12 text-center">
                                <div className="text-[clamp(3rem,16vw,6rem)] md:text-9xl font-black font-sans text-banan-primary tracking-tighter leading-none select-none">
                                    {formatNumber(gameState.bananas)}
                                </div>
                                <div className="text-[10px] font-mono text-white/40 uppercase tracking-[1em] mt-4 border-t border-white/10 pt-2 inline-block">
                                    Bananes totales
                                </div>
                            </div>

                            {/* The Big Banana Button */}
                            <div className="relative mb-8">
                                <button
                                    type="button"
                                    onClick={clickBanana}
                                    aria-label="Cliquer la banane"
                                    className="group relative focus:outline-none focus-visible:ring-2 focus-visible:ring-banan-primary focus-visible:ring-offset-4 focus-visible:ring-offset-black"
                                >
                                    <div className="w-[min(280px,80vw)] aspect-square border border-banan-primary bg-banan-primary/5 flex items-center justify-center cursor-pointer hover:bg-banan-primary hover:text-black transition-all duration-75 active:scale-95">
                                        <Banana strokeWidth={1.5} className="w-32 h-32 text-banan-primary group-hover:text-black transition-colors duration-75" />
                                    </div>
                                    {/* Corner accents */}
                                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-banan-primary" />
                                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-banan-primary" />
                                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-banan-primary" />
                                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-banan-primary" />
                                </button>
                            </div>

                            {/* Control Panel Buttons */}
                            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
                                <button
                                    onClick={() => setIsStoreOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-banan-primary/10 border border-banan-primary/20 hover:border-banan-primary hover:bg-banan-primary hover:text-black transition-all text-banan-primary text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(var(--banan-primary-rgb),0.2)]"
                                >
                                    <Palette className="h-4 w-4" />
                                    <span>BOUTIQUE</span>
                                </button>
                                <button
                                    onClick={() => setIsAlgoOpen(true)}
                                    className={`flex items-center gap-2 px-4 py-2 border transition-all text-xs font-black uppercase tracking-wider ${
                                        algoState?.status === 'demanding'
                                            ? 'bg-red-900/50 border-red-500 text-red-500 animate-pulse shadow-[0_0_15px_rgba(255,0,0,0.5)]'
                                            : algoState?.status === 'blessed' || algoState?.status === 'cursed'
                                            ? 'bg-purple-900/20 border-purple-500/50 text-purple-400'
                                            : 'bg-white/5 border-white/10 hover:border-purple-500 hover:text-purple-400 text-white/50'
                                    }`}
                                >
                                    <Eye className="h-4 w-4" />
                                    <span>{algoState?.status === 'demanding' ? 'SACRIFICE REQUIS' : 'CULTE'}</span>
                                </button>
                                <button
                                    onClick={() => setIsPrestigeOpen(true)}
                                    className={`flex items-center gap-2 px-4 py-2 border transition-all text-xs font-black uppercase tracking-wider ${
                                        canAscend
                                            ? 'bg-banan-primary text-black border-banan-primary animate-pulse shadow-[0_0_20px_rgba(250,222,0,0.6)] hover:bg-white'
                                            : 'bg-white/5 border-white/10 hover:border-banan-primary hover:text-banan-primary text-white/50'
                                    }`}
                                >
                                    <Dna className="h-4 w-4" />
                                    <span>{canAscend ? 'ASCENSION !' : 'ASCENSION'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Footer */}
                        <div className={`h-16 border-t border-white/10 grid ${(gameState.prestigeCount > 0 || gameState.banana_dna > 0) ? 'grid-cols-3' : 'grid-cols-2'} divide-x divide-white/10 backdrop-blur-sm z-10 relative`}>
                            <div className="flex items-center justify-between px-4 sm:px-6">
                                <span className="text-[10px] font-mono uppercase text-white/50">Efficacité</span>
                                <span className="text-lg sm:text-xl font-bold font-sans text-white">{gameState.clickValue}</span>
                            </div>
                            <div className="flex items-center justify-between px-4 sm:px-6">
                                <span className="text-[10px] font-mono uppercase text-white/50">Automatisation</span>
                                <span className="text-lg sm:text-xl font-bold font-sans text-white">{gameState.autoClickers}/s</span>
                            </div>
                            {(gameState.prestigeCount > 0 || gameState.banana_dna > 0) && (
                                <div className="flex items-center justify-between px-4 sm:px-6">
                                    <span className="text-[10px] font-mono uppercase text-banan-primary flex items-center gap-1">
                                        <Dna className="w-3.5 h-3.5" />
                                        ADN & Prestige
                                    </span>
                                    <span className="text-lg sm:text-xl font-bold font-sans text-banan-primary flex items-center gap-1.5">
                                        {formatNumber(gameState.banana_dna)} 🧬
                                        {gameState.prestigeCount > 0 && (
                                            <span className="text-xs text-white/40 font-mono">★{gameState.prestigeCount}</span>
                                        )}
                                    </span>
                                </div>
                            )}
                        </div>
                    </GameSection>
                </div>

                {/* Column 3: ELITE (Leaderboard) */}
                <div className="order-3 lg:order-3 lg:col-span-1 border-l border-white/10 flex flex-col overflow-y-auto overflow-x-hidden">
                    <GameSection
                        title="LEADERBOARD"
                        icon={Trophy}
                        className="flex-1 border-x-0 border-b-0 p-0 flex flex-col shrink-0 min-h-[400px]"
                        headerClassName="p-4 mb-0"
                    >
                        <div className="flex-1 p-0 overflow-y-auto">
                            {leaderboard && leaderboard.length > 0 ? (
                                leaderboard.map((entry, idx) => {
                                    const isCurrentUser = entry.name === gameState.username || (!gameState.username && entry.name === `BANANIER_${gameState.userId?.substring(0, 4)}`);
                                    const displayScore = isCurrentUser ? Math.max(entry.score, gameState.bananas) : entry.score;
                                    
                                    return (
                                    <div key={`${entry.name}-${idx}`} className="flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className={`font-mono font-bold w-6 text-center text-xs ${idx === 0 ? 'text-banan-primary' : 'text-white/30'}`}>
                                                {(idx + 1).toString().padStart(2, '0')}
                                            </span>
                                            <span className={`font-mono text-xs ${isCurrentUser ? 'text-banan-primary font-bold' : 'text-white/70'}`}>
                                                {entry.name || `BANANIER_${idx + 1}00`}
                                                {entry.prestigeCount > 0 && (
                                                    <span className="ml-2 text-[10px] text-banan-primary" title={`Prestige ${entry.prestigeCount}`}>
                                                        ★ {entry.prestigeCount}
                                                    </span>
                                                )}
                                                {isCurrentUser && <span className="ml-2 text-[10px] opacity-70">(VOUS)</span>}
                                            </span>
                                        </div>
                                        <span className="font-mono text-banan-primary text-xs font-bold">
                                            {formatNumber(displayScore)}
                                        </span>
                                    </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-xs font-mono text-white/30 uppercase">
                                    Aucun classement disponible
                                </div>
                            )}
                        </div>
                        <div className="p-4 text-[10px] font-mono text-white/30 text-center uppercase">
                            Mise à jour en temps réel...
                        </div>
                    </GameSection>
                </div>
            </div>

            {/* Tier 1: Stock Market Section */}
            <StockChart />

            {/* Tier 2: Centre de Cyber-Guerre & Marché Noir */}
            <div id="cyber-warfare-section">
                <CyberWarfareSection 
                    retaliationTarget={retaliationTarget} 
                    onClearRetaliation={() => setRetaliationTarget(null)} 
                />
            </div>

            {/* Tier 3: Centre d'Opérations & Distinctions (Missions & Mérite) */}
            <div id="operations-section">
                <MissionsAchievementsSection />
            </div>

            {/* Tier 4: Dossier Agent, Télémétrie & Télétype de Combat (Grille 3 colonnes) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/10 border-t border-b border-white/10 w-full bg-banan-background">
                <AgentDossierCard />
                <SystemTelemetryCard />
                <CyberCombatFeedCard />
            </div>

            {/* Modals */}
            <ThemeShopModal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} />
            {algoState && <AlgoCultModal isOpen={isAlgoOpen} onClose={() => setIsAlgoOpen(false)} state={algoState} />}
            <PrestigeRitual isOpen={isPrestigeOpen} onClose={() => setIsPrestigeOpen(false)} />
        </div>
    );
}
