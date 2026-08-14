import { AnimatePresence, motion } from 'framer-motion';

interface WinFlashProps {
    triggerKey: number;
    color?: string;
}

export default function WinFlash({ triggerKey, color = 'rgba(250,222,0,0.35)' }: WinFlashProps) {
    return (
        <AnimatePresence>
            {triggerKey > 0 && (
                <motion.div
                    key={triggerKey}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, times: [0, 0.15, 1] }}
                    className="fixed inset-0 pointer-events-none z-[100]"
                    style={{ background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)` }}
                />
            )}
        </AnimatePresence>
    );
}
