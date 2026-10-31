import { Skull } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSootStatus } from '@app/hooks/useSootStatus';

interface SootBannerProps {
    /** `full` for a page banner, `compact` for a one-line badge. */
    variant?: 'full' | 'compact';
    className?: string;
}

/**
 * The dud-chamber penalty is invisible unless we say so: this renders the live
 * cooldown wherever soot can bite (Ape Roulette, casino lobby, clan ops).
 * Renders nothing when the player is clean.
 */
export default function SootBanner({ variant = 'full', className = '' }: SootBannerProps) {
    const { isSooty, label, progress } = useSootStatus();

    if (!isSooty) return null;

    if (variant === 'compact') {
        return (
            <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-purple-500/40 bg-purple-900/20 text-purple-300 text-[11px] font-mono uppercase tracking-widest ${className}`}
            >
                <Skull className="h-3 w-3 animate-pulse" />
                Suie · {label}
            </span>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full p-4 rounded-2xl border border-purple-600/40 bg-purple-950/25 space-y-2 ${className}`}
        >
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs font-black text-purple-300 uppercase tracking-widest">
                    <Skull className="h-4 w-4 animate-pulse" />
                    Couvert de suie
                </div>
                <div className="text-2xl font-black text-purple-200 tabular-nums">{label}</div>
            </div>
            <div className="h-1.5 w-full bg-black/60 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-purple-400"
                    animate={{ width: `${progress * 100}%` }}
                    transition={{ duration: 0.9, ease: 'linear' }}
                />
            </div>
            <p className="text-[11px] font-mono text-purple-300/60 uppercase leading-relaxed">
                Vos clics ne rapportent rien et les tables du casino sont verrouillées jusqu'à la fin du décompte.
            </p>
        </motion.div>
    );
}
