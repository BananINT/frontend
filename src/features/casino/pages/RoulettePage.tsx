import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, Dices, Banana } from 'lucide-react';
import { socketManager } from '@app/lib/socket';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';
import { fireWinConfetti, fireJackpotConfetti } from '@app/utils/confetti';
import CasinoPageHeader from '../components/CasinoPageHeader';
import RevolverCylinder from '../components/RevolverCylinder';
import AnimatedCounter from '@app/components/ui/AnimatedCounter';
import WinFlash from '@app/components/ui/WinFlash';
import FloatingIcons from '@app/components/ui/FloatingIcons';
import SootBanner from '@app/components/shared/SootBanner';
import { useSootStatus } from '@app/hooks/useSootStatus';

export default function RoulettePage() {
    const { gameState } = useGame();
    const soot = useSootStatus();
    const [rouletteState, setRouletteState] = useState<{ remaining_chambers: number, dud_chance: number } | null>(null);
    const [rouletteSpinning, setRouletteSpinning] = useState(false);
    const [rouletteOutcome, setRouletteOutcome] = useState<{ outcome: string, payout: number, global_jackpot_won?: number } | null>(null);
    const [recentPulls, setRecentPulls] = useState<string[]>([]);
    const [flashKey, setFlashKey] = useState(0);
    const hasFiredConfetti = useRef(false);

    useEffect(() => {
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
                const result = msg.data as { outcome: string, payout: number, global_jackpot_won?: number };
                setRouletteSpinning(true);
                setRouletteOutcome(null);
                hasFiredConfetti.current = false;
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
    }, [gameState.clan_id]);

    const hasWon = rouletteOutcome && rouletteOutcome.outcome === 'SAFE';
    const hitDud = rouletteOutcome && rouletteOutcome.outcome === 'DUD';
    const hitJackpot = !!(rouletteOutcome?.global_jackpot_won && rouletteOutcome.global_jackpot_won > 0);

    useEffect(() => {
        if (rouletteOutcome && hasWon && !hasFiredConfetti.current) {
            hasFiredConfetti.current = true;
            setFlashKey(k => k + 1);
            if (hitJackpot) fireJackpotConfetti();
            else fireWinConfetti();
        }
    }, [rouletteOutcome, hasWon, hitJackpot]);

    const handlePlay = () => {
        if (gameState.bananas < 10000000 || !gameState.clan_id || rouletteSpinning || soot.isSooty) return;
        setRouletteOutcome(null);
        socketManager.send('play_ape_roulette', {});
    };

    const canPlay = !rouletteSpinning && gameState.bananas >= 10000000 && !soot.isSooty && !!gameState.clan_id;

    const triggerLabel = () => {
        if (rouletteSpinning) return 'EN ROTATION...';
        if (soot.isSooty) return `BARILLET BLOQUÉ · ${soot.label}`;
        if (gameState.bananas < 10000000) return 'FONDS INSUFFISANTS (10M 🍌)';
        return 'PRESSER LA DÉTENTE (10M 🍌)';
    };

    return (
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
            <WinFlash triggerKey={flashKey} color={hitJackpot ? 'rgba(34,211,238,0.35)' : 'rgba(74,222,128,0.3)'} />
            <FloatingIcons icons={[Skull, Dices]} count={10} className="text-purple-400/[0.06]" />

            <CasinoPageHeader
                icon={Skull}
                title="Ape Roulette"
                subtitle="5 bananes saines, 1 pourrie. Le barillet de 6 chambres est partagé par votre clan."
                accent="text-purple-400"
                accentGlow="bg-purple-500/20"
            />

            <div className="flex-1 p-4 md:p-10 flex items-start justify-center relative z-10">
                <motion.div
                    animate={hitDud && !!rouletteOutcome ? { x: [0, -14, 14, -10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-xl flex flex-col gap-6"
                >
                    {!gameState.clan_id ? (
                        <div className="p-10 text-center border border-white/10 bg-white/5 rounded-2xl space-y-4">
                            <Skull className="h-16 w-16 text-purple-600 mx-auto animate-pulse" />
                            <h3 className="text-lg font-black uppercase text-white tracking-widest">CLAN REQUIS</h3>
                            <p className="text-xs font-mono text-white/50 uppercase max-w-xs mx-auto leading-relaxed">
                                L'Ape Roulette est un jeu d'équipe coopératif. Vous devez faire partie d'une unité pour y accéder.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center space-y-2">
                                <p className="text-[11px] font-mono text-white/50 uppercase leading-relaxed max-w-sm mx-auto">
                                    6 chambres. 5 saines (Gagnez 30M 🍌), 1 pourrie (SUIE + CLICS 0 pendant 5 minutes). Le barillet est partagé par le clan !
                                </p>
                                <div className="bg-black/50 border border-white/10 p-4 rounded-2xl max-w-xs mx-auto text-center space-y-1">
                                    <div className="text-[11px] font-mono text-white/60 uppercase">Chambres restantes</div>
                                    <div className="text-3xl font-black text-banan-primary">
                                        {rouletteState?.remaining_chambers !== undefined ? rouletteState.remaining_chambers : 6} / 6
                                    </div>
                                    <div className="text-[11px] font-mono text-red-500 uppercase font-bold tracking-widest">
                                        Risque d'explosion : {rouletteState?.dud_chance !== undefined ? rouletteState.dud_chance : '16.7'}%
                                    </div>
                                </div>
                            </div>

                            <RevolverCylinder
                                remaining={rouletteState?.remaining_chambers ?? 6}
                                spinning={rouletteSpinning}
                                outcome={(rouletteOutcome?.outcome as 'SAFE' | 'DUD' | undefined) ?? null}
                            />

                            {/* Logs Terminal */}
                            <div className="bg-black/70 border border-white/10 p-3 rounded-xl font-mono text-[11px] text-banan-primary/80 h-24 overflow-y-auto">
                                <div className="text-white/60 uppercase border-b border-white/5 pb-1 mb-1 font-bold">Flux de l'Unité</div>
                                {recentPulls.length === 0 ? (
                                    <div className="text-white/60 italic">Aucun tirage récent...</div>
                                ) : (
                                    recentPulls.map((line, idx) => (
                                        <div key={idx} className="truncate">{`> ${line}`}</div>
                                    ))
                                )}
                            </div>

                            {/* Action Status Panel */}
                            <div className="space-y-4">
                                {/* Fixed stage: the trigger below must stay put
                                    whether or not a verdict is on screen. */}
                                <div className="relative h-32">
                                    {!soot.isSooty && !rouletteOutcome && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/15">
                                                Barillet armé
                                            </span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <AnimatePresence mode="wait">
                                            {soot.isSooty ? (
                                                <SootBanner />
                                            ) : rouletteOutcome ? (
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: [1, 1.08, 1], opacity: 1 }}
                                                    transition={{ duration: 0.4 }}
                                                    className={`relative w-full p-4 border rounded-2xl text-center font-mono text-xs uppercase overflow-hidden ${
                                                        rouletteOutcome.outcome === 'SAFE'
                                                            ? hitJackpot
                                                                ? 'border-cyan-500 bg-cyan-950/40 text-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)] font-black marquee-border'
                                                                : 'border-green-500/40 bg-green-950/20 text-green-400 shadow-[0_0_30px_rgba(34,197,94,0.2)]'
                                                            : 'border-red-500/40 bg-red-950/20 text-red-400'
                                                    }`}
                                                    style={hitJackpot ? { '--marquee-color': '#22D3EE' } as CSSProperties : undefined}
                                                >
                                                    <div className="relative z-10 text-lg font-bold">
                                                        {rouletteOutcome.outcome === 'SAFE'
                                                            ? <>SAIN ! +<AnimatedCounter value={rouletteOutcome.payout} /> 🍌</>
                                                            : '💥 BOOM ! Le pistolet a explosé !'}
                                                    </div>
                                                    {hitJackpot && (
                                                        <div className="relative z-10 text-[11px] text-cyan-300 font-extrabold animate-pulse mt-1">
                                                            ⚡ SURGE DE POTASSIUM ACTIVÉE ! +{formatNumber(rouletteOutcome.global_jackpot_won!)} 🍌 DU JACKPOT ⚡
                                                        </div>
                                                    )}
                                                    {hitDud && (
                                                        <p className="relative z-10 text-[11px] text-red-400/80 mt-1">Vous êtes couvert de suie</p>
                                                    )}
                                                    <button
                                                        onClick={() => setRouletteOutcome(null)}
                                                        className="relative z-10 mt-3 text-[11px] underline text-white/50 hover:text-white"
                                                    >
                                                        Fermer
                                                    </button>
                                                </motion.div>
                                            ) : null}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Right above the trigger, so the player never has
                                    to look away from the cylinder to check their
                                    balance against the 10M stake. */}
                                <div className="flex justify-between items-center text-[11px] font-mono uppercase text-white/60 mb-2">
                                    <span>Solde disponible</span>
                                    <span
                                        className={`flex items-center gap-1 tabular-nums ${
                                            gameState.bananas < 10000000 ? 'text-red-400' : 'text-white/70'
                                        }`}
                                    >
                                        {formatNumber(gameState.bananas)} <Banana className="w-3 h-3" />
                                    </span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: rouletteSpinning ? 1 : 1.02 }}
                                    whileTap={{ scale: rouletteSpinning ? 1 : 0.97 }}
                                    animate={canPlay ? { scale: [1, 1.015, 1] } : {}}
                                    transition={canPlay ? { repeat: Infinity, duration: 1.8 } : undefined}
                                    onClick={handlePlay}
                                    disabled={rouletteSpinning || gameState.bananas < 10000000 || soot.isSooty}
                                    className={`w-full py-5 bg-banan-primary text-black font-black uppercase tracking-widest text-sm rounded-xl hover:bg-white transition-colors disabled:opacity-30 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(250,222,0,0.3)] ${canPlay ? 'marquee-border' : ''}`}
                                >
                                    {triggerLabel()}
                                </motion.button>
                            </div>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
