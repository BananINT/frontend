import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, Skull } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import { useSocketMessage } from '@app/hooks/useSocketMessage';
import { useResettable } from '../lib/animation';
import type { GambleResult, GambleState } from '../lib/types';

const LOSS_FLASH_MS = 1800;

interface DoubleOrNothingProps {
    gamble: GambleState | null;
    onGamble: () => void;
    /** Turns the offer down. The win is already banked; this only hides it. */
    onDecline?: () => void;
    busy?: boolean;
}

/**
 * Double ou Rien — the bolt-on offered after any table win.
 *
 * The pending amount lives on the server; this panel only shows what the server
 * says is at stake and asks it to flip. It rides in the table's fixed bottom
 * tray, so the offer arriving and expiring never moves the table itself.
 */
export default function DoubleOrNothing({ gamble, onGamble, onDecline, busy }: DoubleOrNothingProps) {
    // The countdown restarts whenever the server hands back a new pending win.
    const [remaining, , tick] = useResettable(
        gamble ? `${gamble.amount}:${gamble.chain}` : undefined,
        gamble?.expires_in ?? 0
    );

    useEffect(() => {
        if (!gamble) return;
        const timer = setInterval(() => tick((r) => Math.max(0, r - 1)), 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gamble?.amount, gamble?.chain]);

    // A win rolls straight into the next `gamble` offer (or, at the max chain,
    // is just banked), so the panel updating or fading out already reads fine.
    // A loss instead clears the offer outright with nothing to show in its
    // place, so it has to be caught here, straight off the socket, or the
    // panel would simply vanish without the player ever seeing what happened.
    const [lossFlash, setLossFlash] = useState<{ amount: number } | null>(null);
    useSocketMessage<GambleResult>('casino_result', data => {
        if (data?.game !== 'gamble' || data.won !== false) return;
        setLossFlash({ amount: Number(data.staked ?? 0) });
    });

    useEffect(() => {
        if (!lossFlash) return;
        const timer = setTimeout(() => setLossFlash(null), LOSS_FLASH_MS);
        return () => clearTimeout(timer);
    }, [lossFlash]);

    const showOffer = !!gamble && remaining > 0;

    return (
        <AnimatePresence>
            {(showOffer || lossFlash) && (
                // Entrance and idle are separate layers: framer ignores `initial`
                // on a property whose `animate` is a looping keyframe array, so a
                // single element cannot both swing in and keep swaying.
                <motion.div
                    initial={{ opacity: 0, y: 110, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 80, scale: 0.94 }}
                    transition={{
                        opacity: { duration: 0.18 },
                        // Loose and under-damped, so it overshoots and settles.
                        default: { type: 'spring', stiffness: 160, damping: 10, mass: 0.9 },
                    }}
                >
                <motion.div
                    key={lossFlash ? 'lost' : 'offer'}
                    // A loss gets a sharp shake instead of the idle sway, and
                    // settles flat rather than looping — it happened once, it
                    // does not need to keep happening.
                    animate={
                        lossFlash
                            ? { x: [0, -10, 10, -8, 8, -4, 4, 0], rotate: [0, -2, 2, -1.5, 1.5, 0] }
                            : { y: [0, -5, 0], rotate: [-0.8, 0.8, -0.8] }
                    }
                    transition={
                        lossFlash
                            ? { duration: 0.55, ease: 'easeOut' }
                            : {
                                  y: { repeat: Infinity, duration: 3.4, ease: 'easeInOut' },
                                  rotate: { repeat: Infinity, duration: 4.6, ease: 'easeInOut' },
                              }
                    }
                    style={{ transformOrigin: '50% -140%' }}
                    className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 backdrop-blur-md shadow-[0_16px_40px_rgba(0,0,0,0.7)] border transition-colors duration-300 ${
                        lossFlash
                            ? 'bg-red-950/90 border-red-500/50'
                            : 'bg-amber-950/90 border-amber-500/50'
                    }`}
                >
                    {lossFlash ? (
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <motion.span
                                initial={{ scale: 0.5, rotate: -15 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                            >
                                <Skull className="w-7 h-7 sm:w-8 sm:h-8 text-red-400 shrink-0" />
                            </motion.span>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-red-400 uppercase tracking-widest">
                                    Perdu !
                                </p>
                                <p className="text-[11px] sm:text-xs font-mono text-white/60 mt-0.5 tabular-nums">
                                    -{formatNumber(lossFlash.amount)} 🍌 envolées
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <Coins className="w-7 h-7 sm:w-8 sm:h-8 text-amber-400 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-black text-amber-400 uppercase tracking-widest">
                                        Double ou Rien
                                    </p>
                                    <p className="text-[11px] sm:text-xs font-mono text-white/60 mt-0.5 tabular-nums">
                                        {formatNumber(gamble!.amount)} 🍌 · chaîne {gamble!.chain}/{gamble!.max_chain}{' '}
                                        · {remaining}s
                                    </p>
                                </div>
                            </div>

                            {/* Stacked on a phone: side by side there is not enough
                                room for both actions and the copy without everything
                                wrapping. */}
                            <div className="flex items-center gap-2 shrink-0">
                                {onDecline && (
                                    <button
                                        onClick={onDecline}
                                        className="flex-1 sm:flex-none px-4 py-3 border border-white/15 text-white/50 font-bold uppercase tracking-widest text-[11px] sm:text-xs rounded-xl hover:bg-white/10 hover:text-white transition-colors"
                                    >
                                        Non merci
                                    </button>
                                )}

                                <motion.button
                                    whileHover={{ scale: busy ? 1 : 1.05 }}
                                    whileTap={{ scale: busy ? 1 : 0.95 }}
                                    onClick={onGamble}
                                    disabled={busy}
                                    className="flex-1 sm:flex-none px-6 py-3 bg-amber-500 text-black font-black uppercase tracking-widest text-xs sm:text-sm rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                                >
                                    Doubler
                                </motion.button>
                            </div>
                        </>
                    )}
                </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
