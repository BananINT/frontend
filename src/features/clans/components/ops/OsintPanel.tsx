import { AnimatePresence, motion } from 'framer-motion';
import { Banana, Cpu, StopCircle, Terminal, Zap } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import Panel from '../Panel';
import { SCAN_COST } from '../../lib/opsTypes';
import type { ClanOps } from '../../lib/useClanOps';

type OsintPanelProps = Pick<ClanOps, 'activeHack' | 'terminalRef' | 'terminalLines' | 'osintReward' | 'setOsintReward' | 'cancelHack' | 'helpHack' | 'osintState' | 'startHack' | 'scanNetwork'>;

/** Group OSINT terminal: scan, pick a target, hack together. */
export default function OsintPanel({ activeHack, terminalRef, terminalLines, osintReward, setOsintReward, cancelHack, helpHack, osintState, startHack, scanNetwork }: OsintPanelProps) {
    return (
        <Panel
            title="Terminal OSINT de groupe"
            icon={Terminal}
            accent="green"
            subtitle="Scannez le réseau, choisissez une cible, et faites contribuer toute l'unité."
            aside={
                activeHack ? (
                    <span className="text-[11px] font-mono text-banan-osint animate-pulse uppercase">
                        {activeHack.remaining_time}s
                    </span>
                ) : null
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div
                    ref={terminalRef}
                    className="bg-black/80 border border-banan-osint/30 rounded-xl p-3 font-mono text-[11px] text-banan-osint/80 h-56 overflow-y-auto overscroll-contain space-y-1"
                >
                    <div className="text-white/60 uppercase border-b border-white/5 pb-1 mb-1 font-bold">
                        Flux du terminal
                    </div>
                    {terminalLines.length === 0 ? (
                        <div className="text-white/60 italic">
                            {'> TERMINAL PRÊT. ATTENTE DE COMMANDES...'}
                        </div>
                    ) : (
                        terminalLines.map((line, i) => (
                            <div key={i} className="break-all">
                                {line}
                            </div>
                        ))
                    )}
                </div>

                <div className="flex flex-col justify-between gap-3">
                    <AnimatePresence mode="wait">
                        {osintReward !== null ? (
                            <motion.div
                                key="reward"
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="rounded-xl border border-banan-primary bg-banan-primary/10 p-5 text-center flex-1 flex flex-col justify-center gap-2"
                            >
                                <div className="text-lg font-black text-banan-primary uppercase">
                                    Opération réussie
                                </div>
                                <div className="text-2xl font-bold text-white flex items-center justify-center gap-2 tabular-nums">
                                    +{formatNumber(osintReward)} <Banana className="h-6 w-6" />
                                </div>
                                <button
                                    onClick={() => setOsintReward(null)}
                                    className="text-[11px] font-mono text-white/50 hover:text-white uppercase underline"
                                >
                                    Fermer
                                </button>
                            </motion.div>
                        ) : activeHack ? (
                            <motion.div
                                key="active"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="rounded-xl border border-banan-osint/40 bg-banan-osint/5 p-4 space-y-3 flex-1"
                            >
                                <div className="flex justify-between items-center gap-2">
                                    <div className="text-[11px] font-mono text-banan-osint animate-pulse flex items-center gap-2 min-w-0">
                                        <Cpu className="h-3.5 w-3.5 shrink-0" />
                                        <span className="truncate">{activeHack.target.corp}</span>
                                    </div>
                                    <button
                                        onClick={cancelHack}
                                        title="Abandonner l'opération"
                                        className="text-red-500 hover:text-red-400 transition-colors"
                                    >
                                        <StopCircle className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="text-[11px] font-mono text-white/60">
                                    {activeHack.target.ip}
                                </div>
                                <div className="w-full h-2 bg-black rounded-full border border-white/10 overflow-hidden">
                                    <div
                                        className="h-full bg-banan-osint transition-all duration-1000 ease-linear"
                                        style={{
                                            width: `${Math.max(
                                                0,
                                                Math.min(
                                                    100,
                                                    100 -
                                                        (activeHack.remaining_time /
                                                            Math.max(1, activeHack.total_duration)) *
                                                            100
                                                )
                                            )}%`,
                                        }}
                                    />
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-[11px] font-mono text-white/60">
                                        {activeHack.remaining_time}s restantes
                                    </span>
                                    <button
                                        onClick={helpHack}
                                        className="px-3 py-1.5 rounded-lg bg-banan-osint/20 border border-banan-osint text-banan-osint text-[11px] font-bold uppercase hover:bg-banan-osint hover:text-black transition-colors flex items-center gap-1.5"
                                    >
                                        <Zap className="h-3 w-3" /> Aider ({activeHack.helpers})
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div key="targets" className="space-y-2 flex-1">
                                {osintState?.targets?.length ? (
                                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                        {osintState.targets.map(t => (
                                            <div
                                                key={t.id}
                                                className="p-2.5 rounded-xl border border-white/10 bg-black/30 flex items-center justify-between gap-2 hover:border-banan-osint/60 transition-colors group"
                                            >
                                                <div className="min-w-0">
                                                    <div className="text-[11px] font-mono text-white/80 group-hover:text-banan-osint transition-colors">
                                                        {t.ip}
                                                    </div>
                                                    <div className="text-[11px] font-mono text-white/60 truncate">
                                                        {t.corp} · {t.duration}s
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => startHack(t)}
                                                    className="px-2.5 py-1.5 rounded-lg bg-banan-osint/20 border border-banan-osint text-banan-osint text-[11px] font-bold uppercase hover:bg-banan-osint hover:text-black transition-colors shrink-0"
                                                >
                                                    Hack ×{t.reward_multiplier.toFixed(1)}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 rounded-xl border border-white/5 bg-black/30 text-center text-[11px] font-mono text-white/60 uppercase">
                                        Aucune cible en mémoire — lancez un scan
                                    </div>
                                )}
                            </div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={scanNetwork}
                        disabled={!!activeHack}
                        className="w-full py-2.5 rounded-lg border border-dashed border-banan-osint/40 text-banan-osint/70 text-[11px] font-bold uppercase hover:text-banan-osint hover:border-banan-osint transition-colors disabled:opacity-30"
                    >
                        Scan réseau ({formatNumber(SCAN_COST)} 🍌)
                    </button>
                </div>
            </div>
        </Panel>
    );
}
