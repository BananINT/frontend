import type { ReactNode } from 'react';

/** Surface treatments that give each table its own material.
 *
 * The casino header and stake panel stay identical everywhere — that is the
 * venue's identity — but the table itself should feel like a different object
 * on every page. These are the raw materials.
 */

/** CRT scan lines + vignette. Used by the terminal-flavoured tables. */
export function ScanLines({ opacity = 0.5, className = '' }: { opacity?: number; className?: string }) {
    return (
        <div
            aria-hidden
            className={`pointer-events-none absolute inset-0 ${className}`}
            style={{
                opacity,
                backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)',
            }}
        />
    );
}

/** Engineering graph paper: fine cells with a heavier decade line. */
export function GraphPaper({ color = 'rgba(255,255,255,0.07)', cell = 22 }: { color?: string; cell?: number }) {
    return (
        <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
                backgroundImage: `
                    linear-gradient(${color} 1px, transparent 1px),
                    linear-gradient(90deg, ${color} 1px, transparent 1px),
                    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                backgroundSize: `${cell * 5}px ${cell * 5}px, ${cell * 5}px ${cell * 5}px, ${cell}px ${cell}px, ${cell}px ${cell}px`,
            }}
        />
    );
}

/** Card-room felt: radial nap, a stitched border and a faint weave. */
export function Felt({ children }: { children: ReactNode }) {
    return (
        <div
            className="relative rounded-[2rem] border-[6px] border-[#3b2412] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.75),inset_0_0_120px_rgba(0,0,0,0.6)]"
            style={{
                background:
                    'radial-gradient(ellipse at 50% 0%, #1d6b45 0%, #124a2f 45%, #0a2a1c 100%)',
            }}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(45deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 4px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.5) 0 1px, transparent 1px 4px)',
                }}
            />
            {/* Stitched inner rail */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-dashed border-[#c9a227]/25"
            />
            <div className="relative">{children}</div>
        </div>
    );
}

/** Brushed-metal instrument face for the precision tables. */
export function BrushedPanel({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={`relative rounded-2xl border border-white/10 overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.08)] ${className}`}
            style={{ background: 'linear-gradient(160deg, #1a1a1d 0%, #101012 50%, #0a0a0c 100%)' }}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage:
                        'repeating-linear-gradient(90deg, rgba(255,255,255,0.9) 0 1px, transparent 1px 3px)',
                }}
            />
            <div className="relative">{children}</div>
        </div>
    );
}

/** Etched copper circuit board, for the Champ de Bugs. */
export function CircuitBoard({ children }: { children: ReactNode }) {
    return (
        <div
            className="relative rounded-2xl border border-emerald-900/80 overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.7),inset_0_0_80px_rgba(0,0,0,0.5)]"
            style={{ background: 'linear-gradient(150deg, #06231a 0%, #04170f 60%, #020d09 100%)' }}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.18]"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(16,185,129,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.35) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />
            {/* Solder-mask corner fiducials */}
            {['top-3 left-3', 'top-3 right-3', 'bottom-3 left-3', 'bottom-3 right-3'].map((pos) => (
                <span
                    key={pos}
                    aria-hidden
                    className={`absolute ${pos} w-2.5 h-2.5 rounded-full border border-emerald-400/40 bg-emerald-400/10`}
                />
            ))}
            <div className="relative">{children}</div>
        </div>
    );
}

/** Seven-segment style readout used across the instrument tables. */
export function Readout({
    value,
    label,
    tone = 'text-banan-primary',
    size = 'text-2xl',
}: {
    value: string;
    label: string;
    tone?: string;
    size?: string;
}) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/60">{label}</span>
            <span className={`font-black tabular-nums leading-none ${size} ${tone}`}>{value}</span>
        </div>
    );
}
