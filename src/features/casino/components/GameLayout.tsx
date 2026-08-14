import type { ReactNode } from 'react';
import { TriangleAlert, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WinFlash from '@app/components/ui/WinFlash';
import FloatingIcons from '@app/components/ui/FloatingIcons';
import CasinoPageHeader from './CasinoPageHeader';

interface GameLayoutProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    /** Tailwind text colour for the table's accent, e.g. `text-cyan-400`. */
    accent?: string;
    accentGlow?: string;
    /** Icons drifting in the background, matching the existing casino pages. */
    floating?: LucideIcon[];
    floatingClass?: string;
    flashKey?: number;
    flashColor?: string;
    /**
     * Transient prompt for the current round (the Double ou Rien offer).
     * Floated over the bottom of the viewport rather than inserted in the
     * column, so a win never pushes the table out from under the player.
     */
    banner?: ReactNode;
    /** Last server error, floated alongside the banner for the same reason. */
    error?: string | null;
    children: ReactNode;
    /** Widens the play area for grid-heavy tables (keno, roulette, sic bo). */
    wide?: boolean;
}

/**
 * Shared chrome for every casino table: back-link header, drifting icons, the
 * win flash, and a centred play column. Keeps twenty tables visually identical
 * to the three that came before them.
 */
export default function GameLayout({
    icon,
    title,
    subtitle,
    accent = 'text-banan-primary',
    accentGlow = 'bg-banan-primary/20',
    floating = [],
    floatingClass = 'text-banan-primary/[0.06]',
    flashKey = 0,
    flashColor = 'rgba(74,222,128,0.3)',
    banner,
    error,
    children,
    wide = false,
}: GameLayoutProps) {
    return (
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
            <WinFlash triggerKey={flashKey} color={flashColor} />
            {floating.length > 0 && (
                <FloatingIcons icons={floating} count={12} className={floatingClass} />
            )}

            <CasinoPageHeader
                icon={icon}
                title={title}
                subtitle={subtitle}
                accent={accent}
                accentGlow={accentGlow}
            />

            <div className="flex-1 p-4 md:p-10 flex items-start justify-center relative z-10">
                <div className={`w-full ${wide ? 'max-w-5xl' : 'max-w-2xl'} flex flex-col gap-6`}>
                    {children}
                </div>
            </div>

            <TableOverlay banner={banner} error={error} />
        </div>
    );
}

/**
 * Bottom-anchored tray for anything that used to shove the table around: the
 * gamble offer and the last error. Nothing in here takes part in layout.
 */
function TableOverlay({ banner, error }: { banner?: ReactNode; error?: string | null }) {
    return (
        // Above the radio overlay's z-[9999]: the gamble offer is on a timer and
        // has to be reachable, whichever corner the radio has been parked in.
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[10000] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <AnimatePresence>
                {error && (
                    <motion.p
                        key={error}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="w-full max-w-md rounded-xl border border-red-500/40 bg-red-950/90 px-4 py-2.5 text-center text-xs font-mono uppercase text-red-300 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.6)]"
                    >
                        <TriangleAlert className="mr-1.5 inline w-3.5 h-3.5 align-[-2px]" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {banner && <div className="pointer-events-auto w-full max-w-2xl">{banner}</div>}
        </div>
    );
}
