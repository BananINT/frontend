import { Link, useLocation } from 'react-router';
import { motion } from 'framer-motion';
import { Banana, Landmark, Radar, Shield, Target, Users, type LucideIcon } from 'lucide-react';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';
import SootBanner from '@app/components/shared/SootBanner';

interface Stat {
    label: string;
    value: string;
    icon?: LucideIcon;
    accent?: string;
}

export type ClanRoom = 'management' | 'ops';

interface ClanHeaderProps {
    title: string;
    subtitle: string;
    /** Which room the player is standing in — drives the whole colour identity. */
    room?: ClanRoom;
    /** Hidden while the player has no clan — there is nothing to switch between. */
    showTabs?: boolean;
    /** Up to three; the row is fixed-height, so fewer never moves the page. */
    stats?: Stat[];
    refreshing?: boolean;
}

const TABS = [
    { to: '/clan', label: 'Gestion', icon: Landmark },
    { to: '/clan/ops', label: 'Opérations', icon: Radar },
];

/** Tailwind needs literal class names, so each room spells its palette out. */
const ROOMS = {
    management: {
        eyebrow: "Siège de l'unité",
        title: 'text-banan-primary',
        pill: 'bg-banan-primary',
        wash: 'bg-banan-primary/5',
        ghost: 'text-banan-primary/10',
        eyebrowText: 'text-banan-primary/60',
        eyebrowBorder: 'border-banan-primary/30',
        left: Shield,
        right: Users,
        crest: Shield,
        scanlines: false,
    },
    ops: {
        eyebrow: "Chambre d'opérations",
        title: 'text-banan-osint',
        pill: 'bg-banan-osint',
        wash: 'bg-banan-osint/[0.07]',
        ghost: 'text-banan-osint/10',
        eyebrowText: 'text-banan-osint/70',
        eyebrowBorder: 'border-banan-osint/40',
        left: Radar,
        right: Target,
        crest: Radar,
        scanlines: true,
    },
} as const;

/**
 * Shared chrome for both clan rooms. Every band has a fixed height — eyebrow,
 * title, subtitle, stats, switch, soot — so moving between Gestion and
 * Opérations, or waiting on data, never shifts a single pixel vertically. The
 * rooms are told apart by colour and texture instead of by geometry.
 */
export default function ClanHeader({
    title,
    subtitle,
    room = 'management',
    showTabs = true,
    stats = [],
    refreshing = false,
}: ClanHeaderProps) {
    const { gameState } = useGame();
    const { pathname } = useLocation();
    const skin = ROOMS[room];
    const Crest = skin.crest;
    const GhostLeft = skin.left;
    const GhostRight = skin.right;

    return (
        <div
            className={`px-4 pt-5 pb-4 md:px-8 md:pt-7 md:pb-5 border-b border-white/10 ${skin.wash} text-center relative overflow-hidden z-10`}
        >
            <motion.div
                animate={{ rotate: [12, 18, 12] }}
                transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
                className="absolute -top-8 -right-8 pointer-events-none"
            >
                <GhostRight className={`h-32 w-32 ${skin.ghost}`} />
            </motion.div>
            <motion.div
                animate={{ rotate: [-12, -18, -12] }}
                transition={{ repeat: Infinity, duration: 8, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-4 pointer-events-none"
            >
                <GhostLeft className={`h-24 w-24 ${skin.ghost}`} />
            </motion.div>
            {skin.scanlines && (
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            'repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 1px, transparent 1px, transparent 3px)',
                    }}
                />
            )}

            {/* Room nameplate: the fastest way to tell the two apart. */}
            <div className="relative z-10 h-5 flex items-center justify-center">
                <span
                    className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded border ${skin.eyebrowBorder} ${skin.eyebrowText} text-[11px] font-mono uppercase tracking-[0.3em] whitespace-nowrap`}
                >
                    {skin.eyebrow}
                </span>
            </div>

            <h1
                className={`relative z-10 mt-2.5 h-8 md:h-11 flex items-center justify-center gap-2 md:gap-4 text-2xl md:text-4xl font-black uppercase tracking-tighter ${skin.title}`}
            >
                <Crest className="h-6 w-6 md:h-8 md:w-8 shrink-0" />
                <span className="truncate max-w-[70vw]">{title}</span>
                <Crest className="h-6 w-6 md:h-8 md:w-8 shrink-0" />
            </h1>

            <p className="relative z-10 mt-2 h-8 md:h-9 max-w-xl mx-auto text-[11px] md:text-xs font-mono text-white/50 uppercase leading-tight flex items-center justify-center overflow-hidden">
                <span className="line-clamp-2">{subtitle}</span>
            </p>

            <div className="relative z-10 mt-2 h-8 flex items-center justify-center gap-x-4 md:gap-x-7 overflow-hidden">
                <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] md:text-xs font-mono text-white/50 uppercase">Solde:</span>
                    <span className="text-sm md:text-xl font-sans font-bold text-banan-primary flex items-center gap-1 tabular-nums">
                        {formatNumber(gameState.bananas)} <Banana className="w-3.5 h-3.5 md:w-5 md:h-5" />
                    </span>
                </div>
                {stats.map(stat => (
                    <div key={stat.label} className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[11px] md:text-xs font-mono text-white/50 uppercase">
                            {stat.label}:
                        </span>
                        <span
                            className={`text-sm md:text-xl font-sans font-bold flex items-center gap-1 tabular-nums ${stat.accent ?? 'text-white'}`}
                        >
                            {stat.value}
                            {stat.icon && <stat.icon className="w-3 h-3 md:w-4 md:h-4" />}
                        </span>
                    </div>
                ))}
            </div>

            {/* The switch keeps its band even when there is no clan, so the
                pages below start at the same offset in every state. */}
            <div className="relative z-10 mt-3 h-10 flex justify-center">
                {showTabs && (
                    <div className="inline-flex p-1 rounded-xl border border-white/10 bg-black/50 backdrop-blur-sm">
                        {TABS.map(tab => {
                            const active = pathname === tab.to;
                            const Icon = tab.icon;
                            return (
                                <Link
                                    key={tab.to}
                                    to={tab.to}
                                    aria-current={active ? 'page' : undefined}
                                    className={`relative inline-flex items-center gap-2 px-4 md:px-5 rounded-lg text-[11px] font-mono uppercase tracking-widest transition-colors ${
                                        active ? 'text-black font-bold' : 'text-white/50 hover:text-white'
                                    }`}
                                >
                                    {active && (
                                        <motion.span
                                            layoutId="clan-tab-pill"
                                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                            className={`absolute inset-0 rounded-lg ${skin.pill}`}
                                        />
                                    )}
                                    <Icon className="h-3.5 w-3.5 relative z-10" />
                                    <span className="relative z-10">{tab.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            <div className="relative z-10 mt-2 h-7 flex items-center justify-center">
                <SootBanner variant="compact" />
            </div>

            {refreshing && (
                <div className="absolute top-2 right-2 text-[11px] font-mono text-banan-primary animate-pulse z-10">
                    SYNC...
                </div>
            )}
        </div>
    );
}
