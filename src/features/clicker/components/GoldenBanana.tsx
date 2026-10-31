import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Banana } from 'lucide-react';
import { socketManager } from '@app/lib/socket';
import { useSocketMessage } from '@app/hooks/useSocketMessage';
import { fireWinConfetti } from '@app/utils/confetti';
import { formatNumber } from '@app/utils/format';

const MIN_SPAWN_DELAY_MS = 45_000;
const MAX_SPAWN_DELAY_MS = 90_000;
const VISIBLE_DURATION_MS = 8_000;

export default function GoldenBanana() {
    const [spot, setSpot] = useState<{ top: number; left: number } | null>(null);
    const [popup, setPopup] = useState<{ id: number; bonus: number } | null>(null);
    const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        let spawnTimer: ReturnType<typeof setTimeout>;

        const scheduleSpawn = () => {
            const delay = MIN_SPAWN_DELAY_MS + Math.random() * (MAX_SPAWN_DELAY_MS - MIN_SPAWN_DELAY_MS);
            spawnTimer = setTimeout(() => {
                setSpot({
                    top: 10 + Math.random() * 70,
                    left: 10 + Math.random() * 80,
                });
                hideTimerRef.current = setTimeout(() => {
                    setSpot(null);
                    scheduleSpawn();
                }, VISIBLE_DURATION_MS);
            }, delay);
        };

        scheduleSpawn();
        return () => {
            clearTimeout(spawnTimer);
            if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        };
    }, []);

    useSocketMessage<{ bonus: number }>('golden_banana_success', data => {
        fireWinConfetti();
        setPopup({ id: Date.now(), bonus: data.bonus });
        setTimeout(() => setPopup(null), 1800);
    });

    const handleClick = () => {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        socketManager.send('claim_golden_banana', {});
        setSpot(null);
    };

    return (
        <>
            <AnimatePresence>
                {spot && (
                    <motion.button
                        key="golden-banana"
                        onClick={handleClick}
                        initial={{ scale: 0, opacity: 0, rotate: -30 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                        className="absolute z-20 cursor-pointer"
                        style={{ top: `${spot.top}%`, left: `${spot.left}%` }}
                        aria-label="Banane dorée"
                    >
                        <motion.div
                            animate={{ y: [0, -10, 0], rotate: [0, 8, -8, 0] }}
                            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-yellow-300/40 blur-xl rounded-full scale-150 animate-pulse" />
                            <Banana className="relative w-14 h-14 text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.8)]" strokeWidth={1.5} fill="currentColor" />
                        </motion.div>
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {popup && (
                    <motion.div
                        key={popup.id}
                        initial={{ opacity: 0, y: 0, scale: 0.8 }}
                        animate={{ opacity: 1, y: -40, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.8, ease: 'easeOut' }}
                        className="absolute z-30 top-1/3 left-1/2 -translate-x-1/2 pointer-events-none text-2xl font-black text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.6)] whitespace-nowrap"
                    >
                        + {formatNumber(popup.bonus)} 🍌
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
