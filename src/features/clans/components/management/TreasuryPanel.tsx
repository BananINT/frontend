import { motion } from 'framer-motion';
import { Banana, Landmark, TrendingUp } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import Panel from '../Panel';
import { getTierProgress, MAX_TREASURY_BONUS } from '../../lib/tiers';
import type { ClanManagement } from '../../lib/useClanManagement';

type TreasuryPanelProps = Pick<ClanManagement, 'treasury' | 'myDonation' | 'depositAmount' | 'setDepositAmount' | 'handleDeposit' | 'bananas' | 'bonus' | 'nextTier' | 'setDividendsOpen'>;

/** Treasury balance, deposits and the collective multiplier. */
export default function TreasuryPanel({ treasury, myDonation, depositAmount, setDepositAmount, handleDeposit, bananas, bonus, nextTier, setDividendsOpen }: TreasuryPanelProps) {
    return (
        <Panel
            title="Trésorerie"
            icon={Landmark}
            subtitle="Le capital commun de l'unité."
        >
            <div className="space-y-5">
                <div className="text-center">
                    <div className="text-3xl md:text-4xl font-black text-banan-primary tabular-nums flex items-center justify-center gap-2">
                        {formatNumber(treasury)} <Banana className="h-7 w-7" />
                    </div>
                    <p className="text-[11px] font-mono text-white/60 uppercase tracking-widest mt-1">
                        Votre don cumulé : {formatNumber(myDonation)} 🍌
                    </p>
                </div>

                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={depositAmount || ''}
                            onChange={e =>
                                setDepositAmount(Math.max(0, parseInt(e.target.value, 10) || 0))
                            }
                            placeholder="Quantité..."
                            className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-white focus:border-banan-primary outline-none"
                        />
                        <button
                            onClick={handleDeposit}
                            disabled={depositAmount <= 0 || depositAmount > bananas}
                            className="px-4 rounded-lg bg-banan-primary text-black text-[11px] font-bold uppercase hover:bg-white transition-colors disabled:opacity-40"
                        >
                            Déposer
                        </button>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                        {[0.1, 0.25, 0.5, 1].map(share => (
                            <button
                                key={share}
                                onClick={() =>
                                    setDepositAmount(Math.floor(bananas * share))
                                }
                                className="py-1.5 rounded-lg border border-white/10 bg-black/30 text-[11px] font-mono uppercase text-white/60 hover:text-white hover:border-white/40 transition-colors"
                            >
                                {share === 1 ? 'Max' : `${share * 100}%`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/5 pt-4 space-y-2">
                    <div className="text-[11px] font-mono text-white/60 uppercase tracking-wider flex justify-between">
                        <span>Multiplicateur collectif</span>
                        <span className="text-green-400 font-bold">+{bonus}%</span>
                    </div>
                    <div className="w-full h-2 bg-black rounded-full border border-white/5 overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-banan-primary/60 to-banan-primary"
                            animate={{ width: `${getTierProgress(treasury) * 100}%` }}
                            transition={{ duration: 0.6 }}
                        />
                    </div>
                    {nextTier ? (
                        <div className="flex justify-between text-[11px] font-mono text-white/60 uppercase">
                            <span>
                                Prochain : +{nextTier.bonus}% ({nextTier.name})
                            </span>
                            <span>Reste {formatNumber(nextTier.target - treasury)} 🍌</span>
                        </div>
                    ) : (
                        <p className="text-[11px] font-mono text-banan-primary uppercase">
                            Bonus maximum atteint (+{MAX_TREASURY_BONUS}%)
                        </p>
                    )}
                </div>

                <button
                    onClick={() => setDividendsOpen(true)}
                    className="w-full p-2.5 rounded-lg border border-white/10 text-white/60 text-[11px] font-bold uppercase hover:border-white hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <TrendingUp className="h-3 w-3" /> Dividendes & mouvements
                </button>
            </div>
        </Panel>
    );
}
