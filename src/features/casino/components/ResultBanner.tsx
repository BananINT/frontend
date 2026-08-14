import { motion, AnimatePresence } from 'framer-motion';
import { Skull } from 'lucide-react';
import AnimatedCounter from '@app/components/ui/AnimatedCounter';
import ResultSlot from './ResultSlot';

interface ResultBannerProps {
    show: boolean;
    payout: number;
    bet: number;
    multiplier?: number;
    jackpot?: number;
    /** Extra line under the payout, e.g. "Lignes gagnantes: …". */
    caption?: string;
    /** Overrides the losing copy. */
    lossLabel?: string;
    /** Renders the purple curse treatment instead of a plain loss. */
    cursed?: boolean;
    curseLabel?: string;
}

/**
 * The win / loss card used under every table, matching the slot machine's
 * spinning-conic win treatment and the roulette's curse overlay.
 */
export default function ResultBanner({
    show,
    payout,
    bet,
    multiplier,
    jackpot = 0,
    caption,
    lossLabel = 'Rien cette fois...',
    cursed = false,
    curseLabel = 'Malédiction',
}: ResultBannerProps) {
    const won = payout > 0;
    const profited = payout > bet;
    const hitJackpot = jackpot > 0;

    return (
        <ResultSlot idle={!show}>
            <AnimatePresence mode="wait">
                {show && cursed && (
                    <motion.div
                        key="cursed"
                        initial={{ scale: 0, rotate: 180, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        className="bg-purple-900/40 border-2 border-purple-600 rounded-2xl p-4 md:p-5 w-full text-center shadow-[0_0_50px_rgba(147,51,234,0.6)]"
                    >
                        <h3 className="text-xl md:text-2xl font-black text-purple-400 uppercase tracking-widest flex items-center justify-center gap-2">
                            <Skull className="animate-pulse" /> {curseLabel} <Skull className="animate-pulse" />
                        </h3>
                        {caption && <p className="text-xs font-mono text-purple-300/70 mt-1">{caption}</p>}
                    </motion.div>
                )}

                {show && !cursed && won && (
                    <motion.div
                        key="won"
                        initial={{ scale: 0, rotate: -10, y: 50 }}
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 4, -4, 0], y: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                        className={`relative p-4 md:p-5 w-full text-center rounded-2xl overflow-hidden ${
                            hitJackpot
                                ? 'bg-cyan-950/80 border-2 border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)]'
                                : profited
                                  ? 'bg-green-500/20 border-2 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.6)]'
                                  : 'bg-white/5 border-2 border-white/20'
                        }`}
                    >
                        {profited && (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                                className={`absolute inset-0 opacity-20 pointer-events-none ${
                                    hitJackpot
                                        ? 'bg-[conic-gradient(#22D3EE,transparent,#22D3EE,transparent,#22D3EE)]'
                                        : 'bg-[conic-gradient(#4ADE80,transparent,#4ADE80,transparent,#4ADE80)]'
                                }`}
                            />
                        )}

                        <motion.h3
                            animate={profited ? { scale: [1, 1.08, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 0.6 }}
                            className={`relative z-10 text-2xl md:text-3xl font-black uppercase tracking-widest whitespace-nowrap ${
                                hitJackpot ? 'text-cyan-400' : profited ? 'text-green-400' : 'text-white/60'
                            }`}
                        >
                            + <AnimatedCounter value={payout} /> 🍌
                        </motion.h3>

                        {typeof multiplier === 'number' && multiplier > 0 && (
                            <p className="relative z-10 text-xs font-mono text-white/50 mt-1 uppercase tracking-widest">
                                {multiplier.toFixed(2)}×
                            </p>
                        )}

                        {hitJackpot && (
                            <div className="relative z-10 text-xs font-mono text-cyan-300 font-black uppercase tracking-widest animate-pulse mt-1">
                                ⚡ Jackpot Global accordé ! ⚡
                            </div>
                        )}

                        {caption && (
                            <p
                                className={`relative z-10 text-xs font-mono mt-2 ${
                                    hitJackpot ? 'text-cyan-300/70' : 'text-green-300/70'
                                }`}
                            >
                                {caption}
                            </p>
                        )}
                    </motion.div>
                )}

                {show && !cursed && !won && (
                    <motion.div
                        key="lost"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center w-full"
                    >
                        <p className="text-sm font-mono text-white/40 uppercase">{lossLabel}</p>
                        {caption && <p className="text-xs font-mono text-white/25 mt-1">{caption}</p>}
                    </motion.div>
                )}
            </AnimatePresence>
        </ResultSlot>
    );
}
