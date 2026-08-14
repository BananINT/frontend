import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Banana } from 'lucide-react';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';
import { useSootStatus } from '@app/hooks/useSootStatus';

export const MIN_BET = 100;

interface BetControlsProps {
    bet: number;
    onBet: (bet: number) => void;
    onPlay: () => void;
    disabled?: boolean;
    busy?: boolean;
    label?: string;
    icon?: ReactNode;
    /** Table-specific controls rendered above the stake row. */
    children?: ReactNode;
    /** Replaces the play button entirely (used by in-round tables). */
    actions?: ReactNode;
    hint?: string;
}

/**
 * The stake panel shared by every table. Mirrors the slot machine's controls:
 * a range capped at 10% of balance, quick presets, and one big yellow button.
 */
export default function BetControls({
    bet,
    onBet,
    onPlay,
    disabled = false,
    busy = false,
    label = 'Miser',
    icon,
    children,
    actions,
    hint,
}: BetControlsProps) {
    const { gameState } = useGame();
    const soot = useSootStatus();

    const ceiling = Math.max(MIN_BET, Math.floor(gameState.bananas * 0.1));
    const canPlay = !disabled && !busy && gameState.bananas >= bet && bet >= MIN_BET && !soot.isSooty;

    const preset = (value: number) => onBet(Math.max(MIN_BET, Math.min(ceiling, Math.floor(value))));

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 md:p-6 flex flex-col gap-4">
            {children}

            <div className="flex justify-between items-center text-xs font-mono uppercase text-white/50">
                <span>Mise (Min {formatNumber(MIN_BET)})</span>
                <span className="text-banan-primary flex items-center gap-1">
                    {formatNumber(bet)} <Banana className="w-3.5 h-3.5" />
                </span>
            </div>

            <input
                type="range"
                min={MIN_BET}
                max={ceiling}
                step={MIN_BET}
                value={Math.min(bet, ceiling)}
                onChange={(e) => onBet(Number(e.target.value))}
                disabled={disabled || busy || gameState.bananas < MIN_BET}
                className="w-full accent-banan-primary"
            />

            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => preset(MIN_BET)}
                    disabled={disabled || busy}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase transition-colors disabled:opacity-40"
                >
                    Min
                </button>
                <button
                    onClick={() => preset(bet / 2)}
                    disabled={disabled || busy}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase transition-colors disabled:opacity-40"
                >
                    ½
                </button>
                <button
                    onClick={() => preset(bet * 2)}
                    disabled={disabled || busy}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase transition-colors disabled:opacity-40"
                >
                    ×2
                </button>
                <button
                    onClick={() => preset(ceiling)}
                    disabled={disabled || busy}
                    className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded text-xs font-mono uppercase transition-colors disabled:opacity-40"
                >
                    Max (10%)
                </button>
            </div>

            {hint && <p className="text-[10px] font-mono text-white/30 uppercase leading-relaxed">{hint}</p>}

            {/* The action row keeps a constant height: swapping the stake button
                for a table's in-round controls must not move the panel. */}
            <div className="mt-2 h-[4.25rem] shrink-0">
                {actions ?? (
                    <motion.button
                        whileHover={{ scale: canPlay ? 1.04 : 1 }}
                        whileTap={{ scale: canPlay ? 0.94 : 1 }}
                        animate={canPlay ? { scale: [1, 1.015, 1] } : {}}
                        transition={canPlay ? { repeat: Infinity, duration: 1.8 } : undefined}
                        onClick={onPlay}
                        disabled={!canPlay}
                        className={`w-full h-full bg-banan-primary text-black font-black uppercase tracking-widest text-lg rounded-xl hover:bg-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(250,222,0,0.3)] ${
                            canPlay ? 'marquee-border' : ''
                        }`}
                    >
                        {busy ? '...' : label} {icon}
                    </motion.button>
                )}
            </div>

            {/* Below the button so the soot countdown never displaces it. */}
            {soot.isSooty && (
                <p className="text-xs font-mono text-purple-400 uppercase text-center">
                    Couvert de suie — tables inaccessibles ({soot.label})
                </p>
            )}
        </div>
    );
}
