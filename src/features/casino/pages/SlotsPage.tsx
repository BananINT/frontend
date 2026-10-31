import { useState, useEffect, useRef, type CSSProperties } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banana, Dices, Skull, Bell, Cherry, Gem, Bug, type LucideIcon } from 'lucide-react';
import { socketManager } from '@app/lib/socket';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';
import { fireWinConfetti, fireJackpotConfetti } from '@app/utils/confetti';
import CasinoPageHeader from '../components/CasinoPageHeader';
import ResultSlot from '../components/ResultSlot';
import AnimatedCounter from '@app/components/ui/AnimatedCounter';
import WinFlash from '@app/components/ui/WinFlash';
import FloatingIcons from '@app/components/ui/FloatingIcons';

type SymbolType = 'diamond' | 'banana' | 'cherry' | 'bell' | 'skull' | 'bug' | 'empty';

const SYMBOL_MAP: Record<SymbolType, { icon: LucideIcon, color: string }> = {
    'diamond': { icon: Gem, color: 'text-cyan-400' },
    'banana': { icon: Banana, color: 'text-banan-primary' },
    'cherry': { icon: Cherry, color: 'text-red-500' },
    'bell': { icon: Bell, color: 'text-yellow-600' },
    'skull': { icon: Skull, color: 'text-purple-600' },
    'bug': { icon: Bug, color: 'text-green-500' },
    'empty': { icon: Dices, color: 'text-white/10' }
};

interface SlotsResult {
    grid: SymbolType[][];
    payout: number;
    win_lines: string[];
    skulls_hit: number;
    global_jackpot_won?: number;
}

export default function SlotsPage() {
    const { gameState } = useGame();

    const [bet, setBet] = useState(100);
    const [isSpinning, setIsSpinning] = useState(false);
    const [grid, setGrid] = useState<SymbolType[][]>([
        ['empty', 'empty', 'empty', 'empty', 'empty'],
        ['empty', 'empty', 'empty', 'empty', 'empty'],
        ['empty', 'empty', 'empty', 'empty', 'empty']
    ]);
    const [resultData, setResultData] = useState<SlotsResult | null>(null);
    const [showResult, setShowResult] = useState(false);
    const [flashKey, setFlashKey] = useState(0);
    const hasFiredConfetti = useRef(false);

    useEffect(() => {
        const handleSlotsResult = (msg: { type: string; data: unknown }) => {
            if (msg.type === 'slots_machine_result') {
                const data = msg.data as SlotsResult;
                setGrid(data.grid);
                setResultData(data);
                hasFiredConfetti.current = false;

                setTimeout(() => {
                    setIsSpinning(false);
                    setShowResult(true);
                }, 1500);
            } else if (msg.type === 'slots_machine_error') {
                setIsSpinning(false);
            }
        };

        socketManager.subscribe(handleSlotsResult);
        return () => socketManager.unsubscribe(handleSlotsResult);
    }, []);

    const hasWon = resultData && resultData.payout > 0;
    const hitSkull = resultData && resultData.skulls_hit > 0;
    const hitJackpot = !!(resultData?.global_jackpot_won && resultData.global_jackpot_won > 0);

    useEffect(() => {
        if (showResult && hasWon && !hitSkull && !hasFiredConfetti.current) {
            hasFiredConfetti.current = true;
            setFlashKey(k => k + 1);
            if (hitJackpot) fireJackpotConfetti();
            else fireWinConfetti();
        }
    }, [showResult, hasWon, hitSkull, hitJackpot]);

    const handleSpin = () => {
        if (gameState.bananas < bet) return;
        setIsSpinning(true);
        setShowResult(false);
        socketManager.send('play_slots', { bet });
    };

    const canSpin = !isSpinning && gameState.bananas >= bet && bet >= 100;

    return (
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
            <WinFlash triggerKey={flashKey} color={hitJackpot ? 'rgba(34,211,238,0.35)' : 'rgba(74,222,128,0.3)'} />
            <FloatingIcons icons={[Dices, Gem, Cherry, Bell]} count={12} className="text-banan-primary/[0.06]" />

            <CasinoPageHeader
                icon={Dices}
                title="Machine à Sous"
                subtitle="Alignez les symboles pour rafler la mise. 100% calculé côté serveur."
                accent="text-banan-primary"
                accentGlow="bg-banan-primary/20"
            />

            <div className="flex-1 p-4 md:p-10 flex items-start justify-center relative z-10">
                <div className="w-full max-w-2xl flex flex-col gap-6">

                    {/* 3x5 Grid */}
                    <motion.div
                        animate={hitSkull && showResult ? { x: [0, -12, 12, -8, 8, -4, 4, 0] } : hasWon && showResult ? { scale: [1, 1.02, 1] } : {}}
                        transition={{ duration: 0.5 }}
                        className={`bg-black/50 border border-white/10 rounded-2xl p-4 shrink-0 mx-auto w-full shadow-[0_0_40px_rgba(0,0,0,0.6)] ${showResult && hasWon ? 'marquee-border' : ''}`}
                        style={hitJackpot ? { '--marquee-color': '#22D3EE' } as CSSProperties : undefined}
                    >
                        <div className="grid grid-cols-5 gap-2">
                            {grid.map((row, rowIndex) => (
                                row.map((symbol, colIndex) => {
                                    const SymbolIcon = SYMBOL_MAP[symbol].icon;
                                    const isWinLine = showResult && resultData?.win_lines?.includes(`row_${rowIndex}`);
                                    const isDiag1 = showResult && resultData?.win_lines?.includes('diag_1') && ((rowIndex === 0 && (colIndex === 0 || colIndex === 4)) || (rowIndex === 1 && (colIndex === 1 || colIndex === 3)) || (rowIndex === 2 && colIndex === 2));
                                    const isDiag2 = showResult && resultData?.win_lines?.includes('diag_2') && ((rowIndex === 2 && (colIndex === 0 || colIndex === 4)) || (rowIndex === 1 && (colIndex === 1 || colIndex === 3)) || (rowIndex === 0 && colIndex === 2));
                                    const isHighlight = isWinLine || isDiag1 || isDiag2;

                                    return (
                                        <div
                                            key={`${rowIndex}-${colIndex}`}
                                            className={`aspect-square flex items-center justify-center border rounded-lg transition-all duration-300 relative overflow-hidden ${
                                                isHighlight ? 'border-banan-primary bg-banan-primary/20 shadow-[0_0_20px_rgba(250,222,0,0.3)]' : 'border-white/5 bg-white/5'
                                            }`}
                                        >
                                            <AnimatePresence mode="wait">
                                                {isSpinning ? (
                                                    <motion.div
                                                        key="spin"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="absolute inset-0 flex items-center justify-center"
                                                    >
                                                        <motion.div
                                                           animate={{ y: [-20, 20] }}
                                                           transition={{ repeat: Infinity, duration: 0.1, repeatType: "reverse" }}
                                                        >
                                                            <Dices className="w-8 h-8 md:w-10 md:h-10 text-white/20 blur-[1px]" />
                                                        </motion.div>
                                                    </motion.div>
                                                ) : (
                                                    <motion.div
                                                        key="symbol"
                                                        className="relative z-10 flex items-center justify-center w-full h-full"
                                                        initial={{ scale: 0, opacity: 0, rotate: -20 }}
                                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                                        transition={{ type: 'spring', damping: 12, stiffness: 100, delay: (rowIndex * 5 + colIndex) * 0.02 }}
                                                    >
                                                        <SymbolIcon className={`w-8 h-8 md:w-12 md:h-12 ${SYMBOL_MAP[symbol].color} ${isHighlight ? 'animate-bounce drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : ''}`} />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })
                            ))}
                        </div>
                    </motion.div>

                    {/* Result Area — fixed stage, so a win never shoves the
                        stake panel down the page. */}
                    <ResultSlot idle={!showResult}>
                        <AnimatePresence>
                            {showResult && hasWon && !hitSkull && (
                                <motion.div
                                    initial={{ scale: 0, rotate: -10, y: 50 }}
                                    animate={{ scale: [1, 1.25, 1], rotate: [0, 5, -5, 0], y: 0 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                    className={`relative p-4 md:p-5 w-full text-center rounded-2xl overflow-hidden ${
                                        hitJackpot
                                            ? 'bg-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)]'
                                            : 'bg-green-500/20 border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)]'
                                    }`}
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                                        className={`absolute inset-0 opacity-20 pointer-events-none ${hitJackpot ? 'bg-[conic-gradient(#22D3EE,transparent,#22D3EE,transparent,#22D3EE)]' : 'bg-[conic-gradient(#4ADE80,transparent,#4ADE80,transparent,#4ADE80)]'}`}
                                    />
                                    <motion.h3
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 0.5 }}
                                        className={`relative z-10 text-2xl md:text-3xl font-black uppercase tracking-widest whitespace-nowrap ${
                                            hitJackpot ? 'text-cyan-400 font-extrabold' : 'text-green-400'
                                        }`}
                                    >
                                        + <AnimatedCounter value={resultData.payout} /> 🍌
                                    </motion.h3>
                                    {hitJackpot && (
                                        <div className="relative z-10 text-[11px] md:text-xs font-mono text-cyan-300 font-black uppercase tracking-widest animate-pulse mt-1">
                                            ⚡ MEGA JACKPOT GLOBAL ACCORDÉ ! ⚡
                                        </div>
                                    )}
                                    <p className={`relative z-10 text-xs font-mono mt-2 ${hitJackpot ? 'text-cyan-300/70' : 'text-green-300/70'}`}>
                                        Lignes gagnantes: {resultData.win_lines.join(', ')}
                                    </p>
                                </motion.div>
                            )}

                            {showResult && hitSkull && (
                                <motion.div
                                    initial={{ scale: 0, rotate: 180, opacity: 0 }}
                                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                    className="bg-purple-900/40 border-2 border-purple-600 rounded-2xl p-4 md:p-5 w-full text-center shadow-[0_0_50px_rgba(147,51,234,0.6)]"
                                >
                                    <h3 className="text-xl md:text-2xl font-black text-purple-400 uppercase tracking-widest flex items-center justify-center gap-2">
                                        <Skull className="animate-pulse" /> MALÉDICTION <Skull className="animate-pulse" />
                                    </h3>
                                    <p className="text-xs font-mono text-purple-300/70 mt-1">Vous perdez la moitié de vos bananes!</p>
                                </motion.div>
                            )}

                            {showResult && !hasWon && !hitSkull && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center w-full"
                                >
                                    <p className="text-sm font-mono text-white/60 uppercase">Rien cette fois...</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </ResultSlot>

                    {/* Controls */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
                        <div className="flex justify-between items-center text-xs font-mono uppercase text-white/50">
                            <span>Mise (Min 100)</span>
                            <span className="text-banan-primary">{formatNumber(bet)} 🍌</span>
                        </div>

                        <input
                            type="range"
                            min="100"
                            max={Math.max(100, Math.floor(gameState.bananas * 0.1))}
                            step="100"
                            value={bet}
                            onChange={(e) => setBet(Number(e.target.value))}
                            disabled={isSpinning || gameState.bananas < 100}
                            className="w-full accent-banan-primary"
                        />

                        <div className="flex gap-2">
                            <button
                                onClick={() => setBet(100)}
                                disabled={isSpinning}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase transition-colors"
                            >
                                Min
                            </button>
                            <button
                                onClick={() => setBet(Math.max(100, Math.floor(gameState.bananas * 0.1)))}
                                disabled={isSpinning}
                                className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase transition-colors"
                            >
                                Max (10%)
                            </button>
                        </div>

                        {/* Right above the spin button, so the player never has
                            to look away from the reels to check their balance. */}
                        <div className="flex justify-between items-center text-[11px] font-mono uppercase text-white/60">
                            <span>Solde disponible</span>
                            <span
                                className={`flex items-center gap-1 tabular-nums ${
                                    gameState.bananas < bet ? 'text-red-400' : 'text-white/70'
                                }`}
                            >
                                {formatNumber(gameState.bananas)} <Banana className="w-3 h-3" />
                            </span>
                        </div>

                        <motion.button
                            whileHover={{ scale: isSpinning ? 1 : 1.04 }}
                            whileTap={{ scale: isSpinning ? 1 : 0.94 }}
                            animate={canSpin ? { scale: [1, 1.015, 1] } : {}}
                            transition={canSpin ? { repeat: Infinity, duration: 1.8 } : undefined}
                            onClick={handleSpin}
                            disabled={!canSpin}
                            className={`w-full py-5 bg-banan-primary text-black font-black uppercase tracking-widest text-lg rounded-xl hover:bg-white transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(250,222,0,0.3)] ${canSpin ? 'marquee-border' : ''}`}
                        >
                            {isSpinning ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <Dices />
                                </motion.div>
                            ) : (
                                <>LANCER <Dices /></>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
}
