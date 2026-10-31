import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Banana } from 'lucide-react';
import { formatNumber } from '@app/utils/format';

/** Customs raid banner shown after a busted black-market buy. */
export default function RaidAlertBanner({ raidAlert }: { raidAlert: number | null }) {
    return (
        <AnimatePresence>
            {raidAlert !== null && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-red-900/90 border-b-2 border-red-500 text-center relative overflow-hidden"
                >
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-1 animate-pulse" />
                    <div className="text-white font-black text-lg uppercase tracking-widest">
                        🚨 SAISIE DOUANIÈRE SUR TORBANANA 🚨
                    </div>
                    <div className="text-xs font-mono text-red-200">
                        La Cyber-Police a intercepté votre transaction illégale.
                    </div>
                    <div className="text-base font-mono font-bold text-red-400 mt-1">
                        AMENDE: -{formatNumber(raidAlert)} <Banana className="inline h-4 w-4" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
