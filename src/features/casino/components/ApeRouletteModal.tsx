import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banana, Skull, Dices } from 'lucide-react';
import Modal from '@app/components/shared/Modal';
import { socketManager } from '@app/lib/socket';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ApeRouletteModal({ isOpen, onClose }: Props) {
    const { gameState } = useGame();
    const [rouletteState, setRouletteState] = useState<{ remaining_chambers: number, dud_chance: number } | null>(null);
    const [rouletteSpinning, setRouletteSpinning] = useState(false);
    const [rouletteOutcome, setRouletteOutcome] = useState<{ outcome: string, payout: number } | null>(null);
    const [recentPulls, setRecentPulls] = useState<string[]>([]);

    useEffect(() => {
        if (!isOpen) return;

        // Fetch initial state
        if (gameState.clan_id) {
            socketManager.send('get_ape_roulette_state', {});
        }

        const handleMessage = (msg: { type: string; data: unknown }) => {
            if (msg.type === 'ape_roulette_state') {
                setRouletteState(msg.data as { remaining_chambers: number, dud_chance: number });
            } else if (msg.type === 'ape_roulette_member_pulled') {
                const data = msg.data as { username: string, outcome: string };
                setRecentPulls(prev => [
                    `${data.username} a tiré : ${data.outcome === 'SAFE' ? 'SAIN 🍌' : 'BOOM 💥 !'}`,
                    ...prev.slice(0, 4)
                ]);
            } else if (msg.type === 'ape_roulette_result') {
                const result = msg.data as { outcome: string, payout: number };
                setRouletteSpinning(true);
                setRouletteOutcome(null);
                setTimeout(() => {
                    setRouletteSpinning(false);
                    setRouletteOutcome(result);
                    setRecentPulls(prev => [
                        `Vous avez tiré : ${result.outcome === 'SAFE' ? 'SAIN 🍌' : 'BOOM 💥 !'}`,
                        ...prev.slice(0, 4)
                    ]);
                }, 1500);
            }
        };

        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, [isOpen, gameState.clan_id]);

    const handlePlay = () => {
        if (gameState.bananas < 10000000 || !gameState.clan_id || rouletteSpinning || !!gameState.isSooty) return;
        setRouletteOutcome(null);
        socketManager.send('play_ape_roulette', {});
    };

    const hasWon = rouletteOutcome && rouletteOutcome.outcome === 'SAFE';
    const hitDud = rouletteOutcome && rouletteOutcome.outcome === 'DUD';

    return (
        <Modal 
            isOpen={isOpen} 
            onClose={() => { if (!rouletteSpinning) onClose(); }} 
            title={<span className="flex items-center gap-2"><Skull className="h-5 w-5" /> L'APE ROULETTE</span>}
            borderColor={hitDud ? "border-purple-600" : hasWon ? "border-green-500" : "border-banan-primary"}
        >
            <div className="flex flex-col gap-6">
                {!gameState.clan_id ? (
                    <div className="p-8 text-center border border-white/10 bg-white/5 space-y-4">
                        <Skull className="h-16 w-16 text-purple-600 mx-auto animate-pulse" />
                        <h3 className="text-lg font-black uppercase text-white tracking-widest">CLAN REQUIS</h3>
                        <p className="text-xs font-mono text-white/50 uppercase max-w-xs mx-auto leading-relaxed">
                            L'Ape Roulette est un jeu d'équipe coopératif. Vous devez faire partie d'une unité pour y accéder.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="text-center space-y-2">
                            <p className="text-[10px] font-mono text-white/50 uppercase leading-relaxed max-w-sm mx-auto">
                                6 chambres. 5 saines (Gagnez 30M 🍌), 1 pourrie (SUIE + CLICS 0 pendant 5 minutes). Le barillet est partagé par le clan !
                            </p>
                            <div className="bg-black/50 border border-white/10 p-4 rounded max-w-xs mx-auto text-center space-y-1">
                                <div className="text-[10px] font-mono text-white/40 uppercase">Chambres restantes</div>
                                <div className="text-3xl font-black text-banan-primary">
                                    {rouletteState?.remaining_chambers !== undefined ? rouletteState.remaining_chambers : 6} / 6
                                </div>
                                <div className="text-[10px] font-mono text-red-500 uppercase font-bold tracking-widest">
                                    Risque d'explosion : {rouletteState?.dud_chance !== undefined ? rouletteState.dud_chance : '16.7'}%
                                </div>
                            </div>
                        </div>

                        {/* Revolver Cylinder Representation */}
                        <div className="flex justify-center items-center h-28 relative">
                            {Array.from({ length: 6 }).map((_, i) => {
                                const angle = i * 60; // 360 / 6
                                const remaining = rouletteState?.remaining_chambers ?? 6;
                                const isSpent = i >= remaining;
                                return (
                                    <motion.div
                                        key={i}
                                        className={`absolute h-6 w-6 rounded-full border transition-all duration-300 ${
                                            isSpent 
                                                ? 'bg-black/80 border-white/10' 
                                                : 'bg-banan-primary border-banan-primary shadow-[0_0_8px_rgba(253,224,71,0.6)]'
                                        }`}
                                        style={{
                                            transform: `rotate(${angle}deg) translateY(-32px)`
                                        }}
                                        animate={rouletteSpinning ? { rotate: angle + 720 } : {}}
                                        transition={rouletteSpinning ? { repeat: 0, duration: 1.5, ease: 'easeInOut' } : {}}
                                    />
                                );
                            })}
                            <Dices className={`h-8 w-8 text-white/10 ${rouletteSpinning ? 'animate-spin' : ''}`} />
                        </div>

                        {/* Logs Terminal */}
                        <div className="bg-black/70 border border-white/10 p-3 rounded font-mono text-[9px] text-banan-primary/80 h-20 overflow-y-auto">
                            <div className="text-white/30 uppercase border-b border-white/5 pb-1 mb-1 font-bold">Flux de l'Unité</div>
                            {recentPulls.length === 0 ? (
                                <div className="text-white/20 italic">Aucun tirage récent...</div>
                            ) : (
                                recentPulls.map((line, idx) => (
                                    <div key={idx} className="truncate">{`> ${line}`}</div>
                                ))
                            )}
                        </div>

                        {/* Action Status Panel */}
                        <div className="space-y-4">
                            <AnimatePresence mode="wait">
                                {gameState.isSooty ? (
                                    <div className="p-4 border border-purple-600/40 bg-purple-900/10 text-center space-y-1">
                                        <div className="text-xs font-black text-purple-400 uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse">
                                            <Skull className="h-4 w-4" /> COUVERT DE SUIE <Skull className="h-4 w-4" />
                                        </div>
                                        <p className="text-[10px] font-mono text-purple-300/60 uppercase">
                                            Clicks inactifs pendant encore : {gameState.sootRemaining}s
                                        </p>
                                    </div>
                                ) : rouletteOutcome ? (
                                    <motion.div 
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className={`p-4 border text-center font-mono text-xs uppercase ${
                                            rouletteOutcome.outcome === 'SAFE' 
                                                ? 'border-green-500/40 bg-green-950/20 text-green-400' 
                                                : 'border-red-500/40 bg-red-950/20 text-red-400'
                                        }`}
                                    >
                                        <div className="font-bold">
                                            {rouletteOutcome.outcome === 'SAFE' 
                                                ? `SAIN ! +${formatNumber(rouletteOutcome.payout)} 🍌` 
                                                : '💥 BOOM ! Le pistolet a explosé !'}
                                        </div>
                                        {rouletteOutcome.outcome === 'DUD' && (
                                            <p className="text-[9px] text-red-400/50 mt-1">Vous êtes couvert de suie</p>
                                        )}
                                        <button 
                                            onClick={() => setRouletteOutcome(null)}
                                            className="mt-2 text-[9px] underline text-white/50 hover:text-white"
                                        >
                                            Fermer
                                        </button>
                                    </motion.div>
                                ) : null}
                            </AnimatePresence>

                            <button 
                                onClick={handlePlay}
                                disabled={rouletteSpinning || gameState.bananas < 10000000 || !!gameState.isSooty}
                                className="w-full py-4 bg-banan-primary text-black font-black uppercase tracking-widest text-sm hover:bg-white transition-colors disabled:opacity-30 flex items-center justify-center gap-2"
                            >
                                {rouletteSpinning ? 'EN ROTATION...' : <>PRESSER LA DÉTENTE (10M 🍌)</>}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
}
