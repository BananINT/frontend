import { Link } from 'react-router';
import { ArrowLeft, Banana, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGame } from '@app/context/GameContext';
import { formatNumber } from '@app/utils/format';

interface ClickerPageHeaderProps {
    icon: LucideIcon;
    title: string;
    subtitle: string;
}

export default function ClickerPageHeader({ icon: Icon, title, subtitle }: ClickerPageHeaderProps) {
    const { gameState } = useGame();

    return (
        <div className="p-8 border-b border-white/10 bg-banan-primary/5 text-center relative overflow-hidden">
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-banan-primary/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="relative z-10">
                <Link
                    to="/clicker"
                    className="inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white uppercase tracking-widest mb-6 group transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Retour au Clicker
                </Link>

                <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 flex items-center justify-center gap-4 text-banan-primary"
                >
                    <Icon className="h-8 w-8 md:h-10 md:w-10" />
                    {title}
                </motion.h1>
                <p className="text-sm font-mono text-white/50 max-w-xl mx-auto uppercase">
                    {subtitle}
                </p>

                <div className="mt-6 flex items-center justify-center gap-2">
                    <span className="text-xs font-mono text-white/50 uppercase">Solde:</span>
                    <span className="text-xl font-sans font-bold text-banan-primary flex items-center gap-1">
                        {formatNumber(gameState.bananas)} <Banana className="w-5 h-5" />
                    </span>
                </div>
            </div>
        </div>
    );
}
