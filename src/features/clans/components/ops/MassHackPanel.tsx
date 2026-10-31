import { motion } from 'framer-motion';
import { Cpu, Globe } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import Panel from '../Panel';
import type { ClanOps } from '../../lib/useClanOps';

type MassHackPanelProps = Pick<ClanOps, 'massHack' | 'massProgress' | 'cpuInject' | 'setCpuInject' | 'injectCpu' | 'bananas'>;

/** The world target every clan feeds with CPU. */
export default function MassHackPanel({ massHack, massProgress, cpuInject, setCpuInject, injectCpu, bananas }: MassHackPanelProps) {
    return (
        <Panel
            title="Hacking de masse (mondial)"
            icon={Globe}
            accent="cyan"
            subtitle="Tous les clans du réseau visent la même cible."
            aside={
                massHack ? (
                    <span
                        className={`text-[11px] font-mono uppercase px-2 py-0.5 rounded border ${
                            massHack.status === 'active'
                                ? 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10'
                                : 'text-white/60 border-white/10'
                        }`}
                    >
                        {massHack.status}
                    </span>
                ) : null
            }
        >
            {massHack ? (
                <div className="space-y-3">
                    <div className="text-[11px] font-mono text-cyan-300 uppercase truncate">
                        Cible : {massHack.target_name}
                    </div>
                    <div className="w-full h-3 bg-black rounded-full border border-white/10 overflow-hidden">
                        <motion.div
                            className="h-full bg-cyan-400"
                            animate={{ width: `${massProgress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-mono text-white/60">
                        <span className="tabular-nums">
                            {formatNumber(massHack.current_cpu)} / {formatNumber(massHack.required_cpu)} CPU
                        </span>
                        <span>
                            Échéance : {new Date(massHack.deadline * 1000).toLocaleDateString()}
                        </span>
                    </div>

                    {massHack.status === 'active' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                value={cpuInject || ''}
                                onChange={e => setCpuInject(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg text-white text-[11px] font-mono px-2.5 py-2 focus:border-cyan-400 outline-none"
                            />
                            <button
                                onClick={injectCpu}
                                disabled={cpuInject <= 0 || cpuInject > bananas}
                                className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[11px] font-bold uppercase hover:bg-cyan-400 hover:text-black transition-colors flex items-center gap-1.5 disabled:opacity-40 shrink-0"
                            >
                                <Cpu className="h-3 w-3" /> Injecter
                            </button>
                        </div>
                    )}

                    {massHack.top_clans.length > 0 && (
                        <div className="space-y-1 pt-2 border-t border-white/5">
                            {massHack.top_clans.slice(0, 5).map((c, i) => (
                                <div
                                    key={c.clan_id}
                                    className="flex items-center justify-between text-[11px] font-mono text-white/50"
                                >
                                    <span className="truncate">
                                        #{i + 1} {c.name}
                                    </span>
                                    <span className="tabular-nums shrink-0">
                                        {formatNumber(c.amount)} 🍌
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div className="p-6 text-center text-[11px] font-mono text-white/60 uppercase animate-pulse">
                    Chargement de la cible mondiale...
                </div>
            )}
        </Panel>
    );
}
