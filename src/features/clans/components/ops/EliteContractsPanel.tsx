import { motion } from 'framer-motion';
import { Target } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import Panel from '../Panel';
import type { ClanOps } from '../../lib/useClanOps';

type EliteContractsPanelProps = Pick<ClanOps, 'activeContract' | 'contracts' | 'claimContract' | 'acceptContract'>;

/** Time-limited contracts paid into the treasury. */
export default function EliteContractsPanel({ activeContract, contracts, claimContract, acceptContract }: EliteContractsPanelProps) {
    return (
        <Panel
            title="Contrats d'élite"
            icon={Target}
            subtitle="Objectifs à durée limitée, récompense versée au trésor."
        >
            {activeContract ? (
                <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                        <div className="text-xs font-bold text-banan-primary uppercase">
                            {activeContract.name}
                        </div>
                        <div className="text-[11px] font-mono text-white/60 shrink-0">
                            +{formatNumber(activeContract.reward)} 🍌
                        </div>
                    </div>
                    <p className="text-[11px] font-mono text-white/50 leading-relaxed">
                        {activeContract.description}
                    </p>
                    <div className="w-full h-2.5 bg-black rounded-full border border-white/10 overflow-hidden">
                        <motion.div
                            className="h-full bg-banan-primary"
                            animate={{
                                width: `${Math.min(
                                    100,
                                    ((activeContract.progress ?? 0) /
                                        Math.max(1, activeContract.goal_amount)) *
                                        100
                                )}%`,
                            }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
                        <span className="tabular-nums">
                            {formatNumber(activeContract.progress ?? 0)} /{' '}
                            {formatNumber(activeContract.goal_amount)}
                        </span>
                        {activeContract.deadline && (
                            <span>
                                Échéance : {new Date(activeContract.deadline).toLocaleString()}
                            </span>
                        )}
                    </div>
                    {activeContract.completed && (
                        <button
                            onClick={claimContract}
                            className="w-full py-2.5 rounded-lg bg-banan-primary text-black text-[11px] font-black uppercase tracking-widest hover:bg-white transition-colors"
                        >
                            Réclamer {formatNumber(activeContract.reward)} 🍌
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {contracts?.available_contracts?.length ? (
                        contracts.available_contracts.map(c => (
                            <div
                                key={c.contract_key}
                                className="p-3 rounded-xl border border-white/10 bg-black/30 flex items-center justify-between gap-3 hover:border-banan-primary/50 transition-colors group"
                            >
                                <div className="min-w-0">
                                    <div className="text-[11px] font-bold text-white/80 uppercase group-hover:text-banan-primary transition-colors truncate">
                                        {c.name}
                                    </div>
                                    <div className="text-[11px] font-mono text-white/60">
                                        {c.description} · +{formatNumber(c.reward)} 🍌
                                    </div>
                                </div>
                                <button
                                    onClick={() => acceptContract(c.contract_key)}
                                    className="px-3 py-1.5 rounded-lg bg-banan-primary/20 border border-banan-primary text-banan-primary text-[11px] font-bold uppercase hover:bg-banan-primary hover:text-black transition-colors shrink-0"
                                >
                                    Accepter
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-6 rounded-xl border border-white/5 bg-black/30 text-center text-[11px] font-mono text-white/60 uppercase">
                            Aucun contrat disponible
                        </div>
                    )}
                </div>
            )}
        </Panel>
    );
}
