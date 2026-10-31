import { AnimatePresence, motion } from 'framer-motion';
import type { Notice } from '../../lib/useClanManagement';

/** Bottom-right toast for the outcome of the last clan action. */
export default function ClanNoticeToast({ notice }: { notice: Notice }) {
    return (
        <AnimatePresence>
            {notice && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border font-mono text-[11px] uppercase max-w-xs ${
                        notice.tone === 'ok'
                            ? 'border-green-500/40 bg-green-950/80 text-green-300'
                            : 'border-red-500/40 bg-red-950/80 text-red-300'
                    }`}
                >
                    {notice.message}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
