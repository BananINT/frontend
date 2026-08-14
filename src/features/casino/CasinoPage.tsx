import { type CSSProperties } from 'react';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import {
    Ticket, Dices, Banana, Skull, Sparkles, Rocket, Bug, CircleDot, Club,
    Disc3, Gauge, ShieldCheck, type LucideIcon,
} from 'lucide-react';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';
import FloatingIcons from '@app/components/ui/FloatingIcons';
import SootBanner from '@app/components/shared/SootBanner';
import { useCasinoTopic } from './lib/useCasinoGame';
import type { LobbyState } from './lib/types';

/** Tailwind cannot see interpolated class names, so every accent is spelled out. */
interface Palette {
    marquee: string;
    border: string;
    glow: string;
    icon: string;
    ghost: string;
    heading: string;
    cta: string;
}

interface Game {
    to: string;
    icon: LucideIcon;
    title: string;
    description: string;
    palette: Palette;
    /** Optional badge, e.g. a clan requirement. */
    tag?: string;
}

interface Section {
    title: string;
    blurb: string;
    games: Game[];
}

const YELLOW: Palette = {
    marquee: '#FADE0066',
    border: 'hover:border-banan-primary',
    glow: 'bg-banan-primary/20',
    icon: 'text-banan-primary',
    ghost: 'group-hover:text-banan-primary/10',
    heading: 'group-hover:text-banan-primary',
    cta: 'text-banan-primary',
};
const PURPLE: Palette = {
    marquee: '#a855f766',
    border: 'hover:border-purple-400',
    glow: 'bg-purple-500/20',
    icon: 'text-purple-400',
    ghost: 'group-hover:text-purple-400/10',
    heading: 'group-hover:text-purple-400',
    cta: 'text-purple-400',
};
const GREEN: Palette = {
    marquee: '#00FF4166',
    border: 'hover:border-banan-osint',
    glow: 'bg-banan-osint/20',
    icon: 'text-banan-osint',
    ghost: 'group-hover:text-banan-osint/10',
    heading: 'group-hover:text-banan-osint',
    cta: 'text-banan-osint',
};
const CYAN: Palette = {
    marquee: '#22d3ee66',
    border: 'hover:border-cyan-400',
    glow: 'bg-cyan-500/20',
    icon: 'text-cyan-400',
    ghost: 'group-hover:text-cyan-400/10',
    heading: 'group-hover:text-cyan-400',
    cta: 'text-cyan-400',
};
const GOLD: Palette = {
    marquee: '#f5d76e66',
    border: 'hover:border-[#f5d76e]',
    glow: 'bg-[#c9a227]/20',
    icon: 'text-[#f5d76e]',
    ghost: 'group-hover:text-[#f5d76e]/10',
    heading: 'group-hover:text-[#f5d76e]',
    cta: 'text-[#f5d76e]',
};

const SECTIONS: Section[] = [
    {
        title: 'Les Grandes Tables',
        blurb: 'Nerf, sang-froid, et un bouton pour encaisser avant la catastrophe.',
        games: [
            {
                to: '/casino/crash',
                icon: Rocket,
                title: 'Bananorama',
                description: "Télémétrie en direct : la courbe grimpe jusqu'à ce que la banane pourrisse. Le retrait auto se déclenche à votre cible exacte.",
                palette: YELLOW,
            },
            {
                to: '/casino/mines',
                icon: Bug,
                title: 'Champ de Bugs',
                description: 'Sondez une carte électronique. Chaque pastille saine étend le circuit et gonfle le multiplicateur — un seul bug et tout grille.',
                palette: GREEN,
            },
            {
                to: '/casino/plinko',
                icon: CircleDot,
                title: 'Chute à Bananes',
                description: "16 rangées de clous, 17 godets, trois profils de risque. Les bords paient jusqu'à 900×.",
                palette: YELLOW,
            },
        ],
    },
    {
        title: 'Tables de Salon',
        blurb: 'Le feutre, les cartes, et un instrument de précision pour les calculateurs.',
        games: [
            {
                to: '/casino/blackjack',
                icon: Club,
                title: 'Blackjack Simien',
                description: 'Feutre, cartes en éventail et jetons. Le croupier reste à 17, blackjack payé 3:2, doublement autorisé.',
                palette: GOLD,
            },
            {
                to: '/casino/dice',
                icon: Gauge,
                title: 'Dés du Singe',
                description: "Un analyseur de hasard : calibrez votre seuil, l'aiguille tranche. Jusqu'à 46× si vous serrez le pari.",
                palette: CYAN,
            },
            {
                to: '/casino/wheel',
                icon: Disc3,
                title: 'Roue de la Fortune Pourrie',
                description: '24 quartiers de foire. L\'un d\'eux ne paie rien et vous couvre de suie pendant cinq minutes.',
                palette: PURPLE,
            },
        ],
    },
    {
        title: 'Tables Historiques',
        blurb: 'Les trois premières machines du Casino Potassium, toujours en service.',
        games: [
            {
                to: '/casino/lottery',
                icon: Ticket,
                title: 'Banana Lottery',
                description: 'Tirage toutes les 5 minutes. Plus vous achetez de tickets, plus vos chances augmentent.',
                palette: YELLOW,
            },
            {
                to: '/casino/slots',
                icon: Dices,
                title: 'Machine à Sous',
                description: 'Alignez les symboles pour rafler la mise. Les diagonales offrent des micro-gains, attention au crâne.',
                palette: YELLOW,
            },
            {
                to: '/casino/roulette',
                icon: Skull,
                title: 'Ape Roulette',
                description: '5 bananes saines, 1 pourrie. Le barillet est partagé par tout votre clan.',
                tag: 'Clan requis',
                palette: PURPLE,
            },
        ],
    },
    {
        title: 'La Maison à Nu',
        blurb: "Vérifiez que le casino ne triche pas — l'empreinte est publiée avant votre mise.",
        games: [
            {
                to: '/casino/fairness',
                icon: ShieldCheck,
                title: 'Le RNG Vérifiable',
                description: "La maison s'engage sur une graine avant que vous ne misiez. Révélez-la et rejouez chacun de vos tirages.",
                palette: GREEN,
            },
        ],
    },
];

function GameCard({ game, index }: { game: Game; index: number }) {
    const Icon = game.icon;
    const c = game.palette;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.45, delay: Math.min(index, 6) * 0.06 }}
        >
            <Link
                to={game.to}
                className={`marquee-border group relative flex flex-col justify-between h-full p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md ${c.border} transition-all overflow-hidden min-h-[13rem] shadow-[0_0_30px_rgba(0,0,0,0.4)] hover:shadow-[0_0_40px_rgba(0,0,0,0.6)]`}
                style={{ '--marquee-color': c.marquee } as CSSProperties}
            >
                <div
                    className={`absolute -top-12 -right-12 w-36 h-36 ${c.glow} blur-[70px] rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                />
                <Icon
                    className={`absolute -right-6 -bottom-6 h-32 w-32 text-white/5 ${c.ghost} transition-all group-hover:scale-110 group-hover:rotate-12 duration-500`}
                />

                <div className="relative z-10">
                    <div className="flex items-center gap-2.5 mb-3">
                        <Icon className={`h-5 w-5 ${c.icon} shrink-0`} />
                        <h3
                            className={`text-base font-black text-white uppercase tracking-wider ${c.heading} transition-colors`}
                        >
                            {game.title}
                        </h3>
                    </div>
                    <p className="font-mono text-[11px] text-white/45 leading-relaxed">{game.description}</p>
                </div>

                <div className="relative z-10 mt-4 flex items-center justify-between">
                    <span
                        className={`font-mono text-[10px] ${c.cta} uppercase font-bold flex items-center gap-1.5 group-hover:gap-2.5 transition-all`}
                    >
                        Jouer <span className="text-sm">→</span>
                    </span>
                    {game.tag && (
                        <span className="font-mono text-[9px] uppercase text-white/30 border border-white/10 rounded px-1.5 py-0.5">
                            {game.tag}
                        </span>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}

export default function CasinoPage() {
    const { gameState } = useGame();
    const { state: lobby } = useCasinoTopic<LobbyState>('lobby');

    return (
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
            <FloatingIcons
                icons={[Dices, Ticket, Skull, Sparkles, Rocket, Club]}
                count={18}
                className="text-banan-primary/[0.05]"
            />

            {/* Header */}
            <div className="p-5 md:p-8 border-b border-white/10 bg-banan-primary/5 text-center relative overflow-hidden z-10">
                <motion.div
                    animate={{ rotate: [12, 18, 12] }}
                    transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
                    className="absolute -top-8 -right-8"
                >
                    <Dices className="h-32 w-32 text-banan-primary/10" />
                </motion.div>
                <motion.div
                    animate={{ rotate: [-12, -18, -12] }}
                    transition={{ repeat: Infinity, duration: 7, ease: 'easeInOut' }}
                    className="absolute -bottom-4 -left-4"
                >
                    <Ticket className="h-24 w-24 text-banan-primary/10" />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-2xl sm:text-3xl md:text-4xl font-black text-banan-primary uppercase tracking-tighter mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-4 relative z-10"
                >
                    <motion.span animate={{ rotate: [0, -15, 15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                        <Dices className="h-6 w-6 md:h-8 md:w-8" />
                    </motion.span>
                    CASINO POTASSIUM
                    <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                        <Dices className="h-6 w-6 md:h-8 md:w-8" />
                    </motion.span>
                </motion.h1>
                <p className="text-[11px] md:text-sm font-mono text-white/50 max-w-xl mx-auto uppercase relative z-10 leading-relaxed">
                    Neuf tables, un seul jackpot commun, et un générateur que vous pouvez vérifier
                    vous-même.
                </p>

                <div className="mt-4 md:mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white/50 uppercase">Solde:</span>
                        <span className="text-xl font-sans font-bold text-banan-primary flex items-center gap-1 tabular-nums">
                            {formatNumber(gameState.bananas)} <Banana className="w-5 h-5" />
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-white/50 uppercase">Jackpot global:</span>
                        <motion.span
                            animate={{ opacity: [1, 0.65, 1] }}
                            transition={{ repeat: Infinity, duration: 2.4 }}
                            className="text-xl font-sans font-bold text-cyan-400 flex items-center gap-1 tabular-nums"
                        >
                            {formatNumber(lobby?.global_jackpot ?? 0)} <Sparkles className="w-4 h-4" />
                        </motion.span>
                    </div>
                </div>

                {/* The resume link arrives with the lobby socket state, so its
                    row is reserved up front rather than shoving the grid down. */}
                <div className="relative z-10 mt-4 h-9 flex items-center justify-center gap-3 flex-wrap">
                    {/* A sooty player is locked out of every table — say it here
                        rather than letting them discover it on a dead button. */}
                    <SootBanner variant="compact" />
                    {lobby?.open_round && (
                        <Link
                            to={`/casino/${lobby.open_round}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono uppercase tracking-widest hover:bg-amber-500/25 transition-colors"
                        >
                            Partie en cours · reprendre →
                        </Link>
                    )}
                </div>
            </div>

            {/* Sections */}
            <div className="flex-1 p-4 md:p-10 relative z-10 flex flex-col gap-10 md:gap-12 max-w-6xl mx-auto w-full">
                {SECTIONS.map((section) => (
                    <section key={section.title}>
                        <div className="flex items-center gap-4 mb-2">
                            <h2 className="text-xl font-black text-banan-primary uppercase tracking-wider whitespace-nowrap">
                                {section.title}
                            </h2>
                            <div className="h-px bg-white/10 flex-1" />
                            <span className="font-mono text-[10px] text-white/25 uppercase">
                                {section.games.length} table{section.games.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <p className="font-mono text-[11px] text-white/35 uppercase mb-5">{section.blurb}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {section.games.map((game, index) => (
                                <GameCard key={game.to} game={game} index={index} />
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}
