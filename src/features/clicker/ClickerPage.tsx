
import { useGame } from '@/context/GameContext';
import { Zap, TrendingUp, Trophy, CircuitBoard, Dna, Banana } from 'lucide-react';

import StockChart from './StockChart';
import SessionManager from './SessionManager';
import AchievementsModal from './AchievementsModal';
import MissionsModal from './MissionsModal';
import { Medal, Target } from 'lucide-react';
import { useState } from 'react';
import GameSection from '@/components/shared/GameSection';
import { formatNumber } from '@/utils/format';

export default function ClickerPage() {
    const { gameState, clickBanana, buyUpgrade, availableUpgrades } = useGame();
    const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);
    const [isMissionsOpen, setIsMissionsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'click' | 'auto' | 'synergy' | 'prestige'>('click');

    const filteredUpgrades = availableUpgrades.filter(u => u.type === activeTab);

    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[calc(100vh-6rem)] border-l border-white/10">
                {/* Column 1: ARMORY (Upgrades) */}
                <div className="order-2 lg:order-1 lg:col-span-1 bg-black border-r border-white/10 flex flex-col">
                    <GameSection
                        title="MARKETPLACE"
                        icon={Zap}
                        className="h-full border-none p-0"
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
                                availableUpgrades.filter(u => u.type === activeTab).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => buyUpgrade(item.id)}
                                        disabled={gameState.bananas < item.cost}
                                        className="w-full flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 active:bg-banan-primary active:text-black transition-colors disabled:opacity-30 group"
                                    >
                                        <div className="text-left">
                                            <div className="font-bold font-mono text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                                                {item.name}
                                                <span className="text-white/30 ml-2">x{item.owned}</span>
                                            </div>
                                            <div className="text-[10px] font-mono opacity-50">
                                                {item.desc || `+${item.value} ${item.type === 'click' ? '/CLICK' : '/SEC'}`}
                                            </div>
                                        </div>
                                        <div className="font-mono font-bold text-banan-primary text-xs group-hover:text-white group-active:text-black">
                                            {item.cost}
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
                        title="CANAL_PRINCIPAL"
                        rightElement="EN LIGNE"
                        className="h-full border-none p-0 relative bg-[url('/grid.svg')] bg-[length:20px_20px] flex flex-col"
                        headerClassName="p-4 mb-0 border-b border-white/10 relative z-10 bg-black/80 backdrop-blur-sm"
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
                                <div className="w-64 h-64 border border-banan-primary bg-banan-primary/5 flex items-center justify-center cursor-pointer hover:bg-banan-primary hover:text-black transition-all duration-75 active:scale-95">
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
                            </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="h-16 border-t border-white/10 grid grid-cols-2 divide-x divide-white/10 bg-black/80 backdrop-blur-sm z-10 relative">
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
                <div className="order-3 lg:order-3 lg:col-span-1 bg-black border-l border-white/10 flex flex-col">
                    <GameSection
                        title="LEADERBOARD"
                        icon={Trophy}
                        className="h-full border-none p-0"
                        headerClassName="p-4 mb-0"
                    >
                        <div className="flex-1 p-0">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className={`font-mono font-bold w-6 text-center text-xs ${i === 1 ? 'text-banan-primary' : 'text-white/30'}`}>
                                            {i.toString().padStart(2, '0')}
                                        </span>
                                        <span className="font-mono text-xs text-white/70">OPERATOR_{i}00</span>
                                    </div>
                                    <span className="font-mono text-banan-primary text-xs">{(10000 / i).toFixed(0)}</span>
                                </div>
                            ))}
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
            <AchievementsModal isOpen={isAchievementsOpen} onClose={() => setIsAchievementsOpen(false)} />
            <MissionsModal isOpen={isMissionsOpen} onClose={() => setIsMissionsOpen(false)} />
        </div>
    );
}
