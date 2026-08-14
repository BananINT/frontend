import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

export type Accent = 'yellow' | 'green' | 'purple' | 'cyan' | 'red';

/** Tailwind cannot see interpolated class names, so each accent is spelled out. */
const ACCENTS: Record<Accent, { text: string; border: string; glow: string; ghost: string }> = {
    yellow: {
        text: 'text-banan-primary',
        border: 'hover:border-banan-primary/40',
        glow: 'bg-banan-primary/20',
        ghost: 'text-banan-primary/5',
    },
    green: {
        text: 'text-banan-osint',
        border: 'hover:border-banan-osint/40',
        glow: 'bg-banan-osint/20',
        ghost: 'text-banan-osint/5',
    },
    purple: {
        text: 'text-purple-400',
        border: 'hover:border-purple-400/40',
        glow: 'bg-purple-500/20',
        ghost: 'text-purple-400/5',
    },
    cyan: {
        text: 'text-cyan-400',
        border: 'hover:border-cyan-400/40',
        glow: 'bg-cyan-500/20',
        ghost: 'text-cyan-400/5',
    },
    red: {
        text: 'text-red-400',
        border: 'hover:border-red-400/40',
        glow: 'bg-red-500/20',
        ghost: 'text-red-400/5',
    },
};

interface PanelProps {
    title: string;
    icon: LucideIcon;
    accent?: Accent;
    subtitle?: string;
    /** Rendered on the header row, right aligned (badges, counters…). */
    aside?: ReactNode;
    children: ReactNode;
    className?: string;
}

/**
 * The clan feature's card surface — same visual language as the casino tables
 * (glass, rounded, glow on hover, oversized ghost icon).
 */
export default function Panel({
    title,
    icon: Icon,
    accent = 'yellow',
    subtitle,
    aside,
    children,
    className = '',
}: PanelProps) {
    const c = ACCENTS[accent];

    return (
        <motion.section
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.4 }}
            className={`group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-5 md:p-6 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.35)] transition-colors ${c.border} ${className}`}
        >
            <div
                className={`absolute -top-16 -right-16 w-44 h-44 ${c.glow} blur-[80px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />
            <Icon
                className={`absolute -right-7 -bottom-7 h-32 w-32 ${c.ghost} pointer-events-none transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12`}
            />

            <header className="relative z-10 flex items-start gap-3 mb-4">
                <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${c.text}`} />
                <div className="min-w-0 flex-1">
                    <h2 className="text-base md:text-lg font-black text-white uppercase tracking-wider leading-none">
                        {title}
                    </h2>
                    {subtitle && (
                        <p className="mt-1.5 font-mono text-[10px] text-white/40 uppercase leading-relaxed">
                            {subtitle}
                        </p>
                    )}
                </div>
                {aside && <div className="shrink-0">{aside}</div>}
            </header>

            <div className="relative z-10 flex-1">{children}</div>
        </motion.section>
    );
}
