
import { useGame } from '@app/context/GameContext';
import { Zap, TrendingUp, Trophy, CircuitBoard, Dna, Banana } from 'lucide-react';

import StockChart from './StockChart';
import SessionManager from './SessionManager';
import PlayerDossierModal from './PlayerDossierModal';
import { Medal, Target } from 'lucide-react';
import { useState } from 'react';
import GameSection from '@app/components/shared/GameSection';
import { formatNumber } from '@app/utils/format';

export default function ClickerPage() {
    const { gameState, clickBanana, buyUpgrade, availableUpgrades } = useGame();
    const [isDossierOpen, setIsDossierOpen] = useState(false);
    const [dossierTab, setDossierTab] = useState<'missions' | 'achievements'>('missions');
    const [activeTab, setActiveTab] = useState<'click' | 'auto' | 'synergy' | 'prestige'>('click');



    return (
        <div className="flex flex-col">
            <div className="grid grid-cols-1 lg:grid-cols-4 h-auto lg:h-[calc(100vh-6rem)] overflow-hidden">
                {/* Column 1: ARMORY (Upgrades) */}
                <div className="order-2 lg:order-1 lg:col-span-1 bg-banan-black border-r border-white/10 flex flex-col h-[500px] lg:h-full overflow-hidden">
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
                        title=""
                        rightElement="EN LIGNE"
                        className="h-full border-x-0 border-b-0 p-0 relative banan-grid flex flex-col"
                        headerClassName="p-4 mb-0 border-b border-white/10 relative z-10 bg-banan-black/80 backdrop-blur-sm"
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
                                    onClick={() => { setDossierTab('missions'); setIsDossierOpen(true); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-banan-primary hover:text-banan-primary transition-colors text-xs font-bold uppercase tracking-wider"
                                >
                                    <Target className="h-4 w-4" />
                                    <span>MISSIONS</span>
                                </button>
                                <button
                                    onClick={() => { setDossierTab('achievements'); setIsDossierOpen(true); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-banan-primary hover:text-banan-primary transition-colors text-xs font-bold uppercase tracking-wider"
                                >
                                    <Medal className="h-4 w-4" />
                                    <span>MÉRITE</span>
                                </button>
                            </div>
                        </div>

                        {/* Stats Footer */}
                        <div className="h-16 border-t border-white/10 grid grid-cols-2 divide-x divide-white/10 bg-banan-black/80 backdrop-blur-sm z-10 relative">
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
                <div className="order-3 lg:order-3 lg:col-span-1 bg-banan-black border-l border-white/10 flex flex-col">
                    <GameSection
                        title="LEADERBOARD"
                        icon={Trophy}
                        className="h-full border-x-0 border-b-0 p-0"
                        headerClassName="p-4 mb-0"
                    >
                        <div className="flex-1 p-0 overflow-y-auto">
                            {gameState.leaderboard && gameState.leaderboard.length > 0 ? (
                                gameState.leaderboard.map((entry, idx) => {
                                    const isCurrentUser = entry.name === gameState.session_name || (!gameState.session_name && entry.name === `OPERATOR_${gameState.userId?.substring(0, 4)}`);
                                    const displayScore = isCurrentUser ? Math.max(entry.score, gameState.bananas) : entry.score;
                                    
                                    return (
                                    <div key={`${entry.name}-${idx}`} className="flex items-center justify-between p-4 border-b border-white/10 hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <span className={`font-mono font-bold w-6 text-center text-xs ${idx === 0 ? 'text-banan-primary' : 'text-white/30'}`}>
                                                {(idx + 1).toString().padStart(2, '0')}
                                            </span>
                                            <span className={`font-mono text-xs ${isCurrentUser ? 'text-banan-primary font-bold' : 'text-white/70'}`}>
                                                {entry.name || `OPERATOR_${idx + 1}00`}
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
            <PlayerDossierModal isOpen={isDossierOpen} onClose={() => setIsDossierOpen(false)} initialTab={dossierTab} />
        </div>
    );
}
