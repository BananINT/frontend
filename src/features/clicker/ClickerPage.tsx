
import { useGame } from '@app/context/GameContext';
import { Zap, TrendingUp, Trophy, CircuitBoard, Dna, Banana, type LucideIcon } from 'lucide-react';

import StockChart from './components/StockChart';
import SessionManager from './components/SessionManager';
import MissionsModal from './components/MissionsModal';
import AchievementsModal from './components/AchievementsModal';
import { Medal, Target, Palette, Terminal, Eye, Fingerprint, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import GameSection from '@app/components/shared/GameSection';
import { formatNumber } from '@app/utils/format';
import ThemeShopModal from './components/ThemeShopModal';
import OsintModal from './components/OsintModal';
import AlgoCultModal from './components/AlgoCultModal';
import CyberModal from './components/CyberModal';

const UPGRADE_ICONS: Record<string, LucideIcon> = {
    click: Zap,
    auto: TrendingUp,
    synergy: CircuitBoard,
    prestige: Dna,
};

export default function ClickerPage() {
    const { gameState, clickBanana, buyUpgrade, availableUpgrades } = useGame();
    const [isMissionsOpen, setIsMissionsOpen] = useState(false);
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'click' | 'auto' | 'synergy' | 'prestige'>('click');
    const [isStoreOpen, setIsStoreOpen] = useState(false);
    const [isOsintOpen, setIsOsintOpen] = useState(false);
    const [isAlgoOpen, setIsAlgoOpen] = useState(false);
    const [isCyberOpen, setIsCyberOpen] = useState(false);
    const [algoState, setAlgoState] = useState<any>(null);
    const [cyberAttacks, setCyberAttacks] = useState<any[]>([]);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('/api/stats/leaderboard');
                if (res.ok) {
                    const data = await res.json();
                    setLeaderboard(data);
                }
            } catch (err) {
                console.error("Failed to fetch leaderboard", err);
            }
        };
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 10000); // 10s poll
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleMessage = (msg: any) => {
            if (msg.type === 'algo_cult_state') {
                setAlgoState(msg.data);
            } else if (msg.type === 'cyber_attacked') {
                setCyberAttacks(prev => [...prev, msg.data]);
                setTimeout(() => {
                    setCyberAttacks(prev => prev.slice(1));
                }, 8000);
            }
        };
        import('@app/lib/socket').then(({ socketManager }) => {
            socketManager.subscribe(handleMessage);
            socketManager.send('get_algo_cult_state', {});
        });
        
        return () => {
            import('@app/lib/socket').then(({ socketManager }) => {
                socketManager.unsubscribe(handleMessage);
            });
        };
    }, []);

    return (
        <div className="flex flex-col relative">
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
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 h-auto lg:h-[calc(100vh-6rem)] overflow-hidden">
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
                            {gameState.prestigeCount > 0 && (
                                <button
                                    onClick={() => setActiveTab('prestige')}
                                    className={`flex-1 py-2 flex justify-center items-center hover:bg-white/5 transition-colors ${activeTab === 'prestige' ? 'bg-white/10 text-banan-primary' : 'text-white/30'}`}
                                    title="Prestige Upgrades"
                                >
                                    <Dna className="h-4 w-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {availableUpgrades.filter(u => u.type === activeTab).length === 0 ? (
                                <div className="p-8 text-center text-xs font-mono text-white/30 uppercase">
                                    Aucune amélioration disponible
                                </div>
                            ) : (
                                availableUpgrades.filter(u => u.type === activeTab).sort((a, b) => a.cost - b.cost).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => buyUpgrade(item.id)}
                                        disabled={gameState.bananas < item.cost}
                                        className="w-full flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 active:bg-banan-primary active:text-black transition-colors disabled:opacity-30 group"
                                    >
                                        <div className="text-left">
                                            <div className="font-bold font-mono text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                                                {(() => { const Icon = UPGRADE_ICONS[item.type]; return Icon ? <Icon className="h-3.5 w-3.5 text-white/40" /> : null; })()}
                                                {item.name}
                                                <span className="text-white/30 ml-2">x{item.owned}</span>
                                            </div>
                                            <div className="text-[10px] font-mono opacity-50">
                                                {item.desc || `+${item.value} ${item.type === 'click' ? '/CLICK' : '/SEC'}`}
                                            </div>
                                        </div>
                                        <div className="font-mono font-bold text-banan-primary text-xs group-hover:text-white group-active:text-black">
                                            {formatNumber(item.cost)}
                                        </div>
                                    </button>
                                ))
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
                        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[500px]">
                            <div className="mb-12 text-center">
                                <div className="text-8xl md:text-9xl font-black font-sans text-banan-primary tracking-tighter leading-none select-none">
                                    {formatNumber(gameState.bananas)}
                                </div>
                                <div className="text-[10px] font-mono text-white/40 uppercase tracking-[1em] mt-4 border-t border-white/10 pt-2 inline-block">
                                    Bananes totales
                                </div>
                            </div>

                            {/* The Big Banana Button */}
                            <button
                                onClick={clickBanana}
                                className="group relative focus:outline-none mb-8"
                            >
                                <div className="w-[280px] h-[280px] border border-banan-primary bg-banan-primary/5 flex items-center justify-center cursor-pointer hover:bg-banan-primary hover:text-black transition-all duration-75 active:scale-95">
                                    <Banana strokeWidth={1.5} className="w-32 h-32 text-banan-primary group-hover:text-black transition-colors duration-75" />
                                </div>
                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-banan-primary" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-banan-primary" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-banan-primary" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-banan-primary" />
                            </button>

                            {/* Control Panel Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsMissionsOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-banan-primary hover:text-banan-primary transition-colors text-xs font-bold uppercase tracking-wider"
                                >
                                    <Target className="h-4 w-4" />
                                    <span>MISSIONS</span>
                                </button>
                                <button
                                    onClick={() => setIsAchievementsOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-banan-primary hover:text-banan-primary transition-colors text-xs font-bold uppercase tracking-wider"
                                >
                                    <Medal className="h-4 w-4" />
                                    <span>MÉRITE</span>
                                </button>
                                <button
                                    onClick={() => setIsOsintOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-banan-osint/10 border border-banan-osint/30 text-banan-osint hover:bg-banan-osint hover:text-black hover:border-banan-osint transition-all text-xs font-bold uppercase tracking-wider"
                                >
                                    <Terminal className="h-4 w-4" />
                                    <span>OSINT</span>
                                </button>
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
                                    onClick={() => setIsCyberOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-black border border-purple-500/50 hover:bg-purple-900/30 hover:text-purple-400 hover:border-purple-400 transition-all text-purple-500 text-xs font-black uppercase tracking-wider relative group overflow-hidden"
                                >
                                    <Fingerprint className="h-4 w-4" />
                                    <span>CYBER</span>
                                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8cGF0aCBkPSJNMCAwbDhfOHptOCAwTDBfOHoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                </button>
                            </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="h-16 border-t border-white/10 grid grid-cols-2 divide-x divide-white/10 backdrop-blur-sm z-10 relative">
                            <div className="flex items-center justify-between px-6">
                                <span className="text-[10px] font-mono uppercase text-white/50">Efficacité</span>
                                <span className="text-xl font-bold font-sans text-white">{gameState.clickValue}</span>
                            </div>
                            <div className="flex items-center justify-between px-6">
                                <span className="text-[10px] font-mono uppercase text-white/50">Automatisation</span>
                                <span className="text-xl font-bold font-sans text-white">{gameState.autoClickers}/s</span>
                            </div>
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

            {/* Stock Market Section */}
            <StockChart />
            <SessionManager />

            {/* Modals */}
            <MissionsModal isOpen={isMissionsOpen} onClose={() => setIsMissionsOpen(false)} />
            <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
            <ThemeShopModal isOpen={isStoreOpen} onClose={() => setIsStoreOpen(false)} />
            <OsintModal isOpen={isOsintOpen} onClose={() => setIsOsintOpen(false)} />
            <AlgoCultModal isOpen={isAlgoOpen} onClose={() => setIsAlgoOpen(false)} state={algoState} />
            <CyberModal isOpen={isCyberOpen} onClose={() => setIsCyberOpen(false)} />
        </div>
    );
}
