import { useState, useEffect, useRef } from 'react';
import { Radio, AlertCircle, Zap, Skull } from 'lucide-react';
import { socketManager } from '@app/lib/socket';
import type { CyberCombatLog } from '@app/types/game';
import GameSection from '@app/components/shared/GameSection';

export default function CyberCombatFeedCard() {
    const [feed, setFeed] = useState<CyberCombatLog[]>([]);
    const feedRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        socketManager.send('get_cyber_combat_feed', {});
    }, []);

    useEffect(() => {
        const handleMessage = (msg: { type: string; data: unknown }) => {
            if (msg.type === 'cyber_combat_feed') {
                setFeed(msg.data as CyberCombatLog[]);
            }
        };
        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, []);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = 0; // Recent logs at top
        }
    }, [feed]);

    return (
        <GameSection
            title="TÉLÉTYPE DE COMBAT & INTEL"
            icon={Radio}
            className="border-t-0 p-4 md:p-6 justify-between h-full"
            headerClassName="mb-4"
            rightElement={
                <span className="font-mono text-[11px] text-white/60">
                    INTERCEPTIONS EN CONTINU
                </span>
            }
        >
            <div className="space-y-4 flex-1 flex flex-col">

                <div 
                    ref={feedRef}
                    className="flex-1 overflow-y-auto space-y-2 max-h-[260px] pr-1"
                >
                    {feed.length === 0 ? (
                        <div className="py-12 text-center text-xs font-mono text-white/60 uppercase">
                            Écoute des fréquences tactiques en cours...
                        </div>
                    ) : (
                        feed.map((entry, idx) => {
                            const isPolice = entry.type === 'CYBER-POLICE';
                            const isDarknet = entry.type === 'DARKNET';
                            return (
                                <div
                                    key={entry.id || idx}
                                    className={`p-2.5 border text-left flex items-start gap-2.5 transition-colors ${
                                        isPolice 
                                            ? 'bg-red-950/20 border-red-500/30' 
                                            : isDarknet
                                            ? 'bg-purple-950/20 border-purple-500/30'
                                            : 'bg-white/5 border-white/10'
                                    }`}
                                >
                                    <div className="mt-0.5 shrink-0">
                                        {isPolice && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                                        {isDarknet && <Skull className="h-3.5 w-3.5 text-purple-400" />}
                                        {!isPolice && !isDarknet && <Zap className="h-3.5 w-3.5 text-yellow-400" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between text-[11px] font-mono text-white/60 mb-0.5">
                                            <span className="uppercase font-bold tracking-wider">{entry.type}</span>
                                            <span>{entry.time}</span>
                                        </div>
                                        <div className="text-[11px] font-mono text-white/80 leading-snug break-words">
                                            {entry.message}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className="pt-4 text-[11px] font-mono text-white/60 leading-tight border-t border-white/10 mt-4 flex items-center justify-between">
                <span>Flux chiffré AES-256</span>
                <span className="text-banan-primary">CANAL 108.4 MHz</span>
            </div>
        </GameSection>
    );
}
