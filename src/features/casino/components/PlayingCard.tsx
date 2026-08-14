import { motion } from 'framer-motion';

interface PlayingCardProps {
    /** Server card string, e.g. "K♠". `null` renders a face-down card. */
    card: string | null;
    index?: number;
    /** Highlight ring, used for held video-poker cards. */
    held?: boolean;
    onClick?: () => void;
    size?: 'sm' | 'md' | 'lg';
}

const SIZES = {
    sm: 'w-10 h-14 text-sm',
    md: 'w-14 h-20 text-lg',
    lg: 'w-16 h-24 md:w-20 md:h-28 text-xl md:text-2xl',
};

export default function PlayingCard({ card, index = 0, held, onClick, size = 'md' }: PlayingCardProps) {
    const suit = card?.slice(-1) ?? '';
    const rank = card?.slice(0, -1) ?? '';
    const isRed = suit === '♥' || suit === '♦';

    return (
        <motion.div
            initial={{ rotateY: 180, opacity: 0, y: -20 }}
            animate={{ rotateY: 0, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 14, stiffness: 140, delay: index * 0.08 }}
            onClick={onClick}
            className={`${SIZES[size]} rounded-lg border flex flex-col items-center justify-center font-black shrink-0 select-none ${
                onClick ? 'cursor-pointer' : ''
            } ${
                card
                    ? `bg-white/90 border-white/20 shadow-[0_4px_14px_rgba(0,0,0,0.5)] ${isRed ? 'text-red-600' : 'text-black'}`
                    : 'bg-banan-primary/10 border-banan-primary/30'
            } ${held ? 'ring-2 ring-banan-primary shadow-[0_0_20px_rgba(250,222,0,0.4)] -translate-y-2' : ''} transition-all`}
        >
            {card ? (
                <>
                    <span className="leading-none">{rank}</span>
                    <span className="leading-none opacity-80">{suit}</span>
                </>
            ) : (
                <span className="text-banan-primary/40 text-2xl">🍌</span>
            )}
        </motion.div>
    );
}
