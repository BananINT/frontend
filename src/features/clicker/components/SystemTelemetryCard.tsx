import { useState, useEffect } from 'react';
import { Activity, Radio, Dna, Banana, Zap, MousePointerClick } from 'lucide-react';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';
import GameSection from '@app/components/shared/GameSection';

export default function SystemTelemetryCard() {
    const { gameState } = useGame();
    const [latency, setLatency] = useState(28);

    useEffect(() => {
        const interval = setInterval(() => {
            // Jitter around 20-35ms
            setLatency(Math.floor(22 + Math.random() * 14));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <GameSection
            title="TÉLÉMÉTRIE SYSTÈME & CARRIÈRE"
            icon={Activity}
            className="border-t-0 p-4 md:p-6 justify-between h-full"
            headerClassName="mb-4"
            rightElement={
                <span className="flex items-center gap-1.5 font-mono text-[9px] text-green-400 bg-green-950/30 border border-green-500/30 px-2 py-0.5 rounded font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    LIVE
                </span>
            }
        >
            <div className="space-y-4">

                {/* Stats 2x2 Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-white/5 border border-white/10">
                        <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-1">
                            <Banana className="h-3 w-3 text-banan-primary" />
                            Production Totale
                        </div>
                        <div className="font-mono text-sm font-bold text-white mt-1 truncate">
                            {formatNumber(gameState.totalBananasEarned || gameState.bananas || 0)}
                        </div>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10">
                        <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-1">
                            <MousePointerClick className="h-3 w-3 text-cyan-400" />
                            Clics Manuels
                        </div>
                        <div className="font-mono text-sm font-bold text-white mt-1 truncate">
                            {formatNumber(gameState.clickCount || 0)}
                        </div>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10">
                        <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-1">
                            <Zap className="h-3 w-3 text-yellow-400" />
                            Efficacité Clic
                        </div>
                        <div className="font-mono text-sm font-bold text-banan-primary mt-1 truncate">
                            +{formatNumber(gameState.clickValue || 1)}
                        </div>
                    </div>

                    <div className="p-3 bg-white/5 border border-white/10">
                        <div className="text-[9px] font-mono text-white/40 uppercase flex items-center gap-1">
                            <Activity className="h-3 w-3 text-green-400" />
                            Automatisation
                        </div>
                        <div className="font-mono text-sm font-bold text-green-400 mt-1 truncate">
                            +{formatNumber(gameState.autoClickers || 0)}/s
                        </div>
                    </div>
                </div>

                {/* Prestige & DNA Row */}
                {(gameState.prestigeCount > 0 || gameState.banana_dna > 0) && (
                    <div className="p-3 bg-banan-primary/5 border border-banan-primary/30 flex items-center justify-between">
                        <div>
                            <div className="text-[9px] font-mono text-white/50 uppercase">ADN Mutagène & Ascensions</div>
                            <div className="font-mono text-xs font-black text-banan-primary mt-0.5">
                                {formatNumber(gameState.banana_dna || 0)} 🧬 • ★{gameState.prestigeCount || 0} Ascensions
                            </div>
                        </div>
                        <Dna className="h-5 w-5 text-banan-primary opacity-80" />
                    </div>
                )}

                {/* Network Diagnostics */}
                <div className="p-3 bg-white/5 border border-white/10 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white/50 flex items-center gap-1.5">
                        <Radio className="h-3 w-3 text-banan-primary" />
                        Ping Serveur WebSocket :
                    </span>
                    <span className="font-bold text-green-400">
                        {latency} ms (99.98% Nominal)
                    </span>
                </div>
            </div>

            <div className="pt-4 text-[9px] font-mono text-white/30 leading-tight border-t border-white/10 mt-4">
                Fréquence d'échantillonnage : 10Hz. Synchronisation prioritaire garantie par le protocole WebSocket BananINT.
            </div>
        </GameSection>
    );
}
