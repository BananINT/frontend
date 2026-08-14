import { Link } from 'react-router';
import { ArrowLeft, Banana, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';

interface CasinoPageHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
    accent: string;
    accentGlow: string;
}

export default function CasinoPageHeader({ icon: Icon, title, subtitle, accent, accentGlow }: CasinoPageHeaderProps) {
    const { gameState } = useGame();

    return (
        <div className="p-5 md:p-8 border-b border-white/10 text-center relative overflow-hidden">
            <div className={`absolute -top-32 -right-32 w-80 h-80 ${accentGlow} blur-[120px] rounded-full pointer-events-none`} />
            <div className={`absolute -bottom-32 -left-32 w-80 h-80 ${accentGlow} blur-[120px] rounded-full pointer-events-none opacity-60`} />

            <div className="relative z-10">
                <Link
                    to="/casino"
                    className="inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white uppercase tracking-widest mb-4 md:mb-6 group transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour au Casino
                </Link>

                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className={`text-2xl sm:text-3xl md:text-5xl font-black uppercase tracking-tighter mb-3 md:mb-4 flex items-center justify-center gap-2 md:gap-4 text-balance ${accent}`}
                >
                    <Icon className="h-6 w-6 md:h-10 md:w-10 shrink-0" />
                    {title}
                    <Icon className="h-6 w-6 md:h-10 md:w-10 shrink-0" />
                </motion.h1>
                <p className="text-[11px] md:text-sm font-mono text-white/50 max-w-xl mx-auto uppercase leading-relaxed">
                    {subtitle}
                </p>

                <div className="mt-4 md:mt-6 flex items-center justify-center gap-2">
                    <span className="text-xs font-mono text-white/50 uppercase">Solde:</span>
                    <motion.span
                        key={gameState.bananas}
                        initial={{ scale: 1.15, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-xl font-sans font-bold text-banan-primary flex items-center gap-1 tabular-nums"
                    >
                        {formatNumber(gameState.bananas)} <Banana className="w-5 h-5" />
                    </motion.span>
                </div>
            </div>
        </div>
    );
}
