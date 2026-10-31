import { Cpu } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import Panel from '../Panel';
import { perkEffect } from '../../lib/clanLabels';
import type { ClanManagement } from '../../lib/useClanManagement';

type PerksPanelProps = Pick<ClanManagement, 'perks' | 'treasury' | 'handleUpgradePerk'>;

/** Clan perks bought from the treasury. */
export default function PerksPanel({ perks, treasury, handleUpgradePerk }: PerksPanelProps) {
    return (
        <Panel
            title="Compétences de l'unité"
            icon={Cpu}
            accent="green"
            subtitle="Améliorations collectives financées par la trésorerie."
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {perks.map(perk => {
                    const isMax = perk.level >= perk.max_level;
                    const canAfford = perk.cost !== null && treasury >= perk.cost;
                    return (
                        <div
                            key={perk.id}
                            className="rounded-xl border border-white/10 bg-black/30 p-4 space-y-3"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <h4 className="text-xs font-bold uppercase text-banan-osint tracking-tight">
                                    {perk.name}
                                </h4>
                                <span className="text-[11px] font-mono text-white/70 bg-white/10 px-1.5 py-0.5 rounded shrink-0">
                                    {perk.level}/{perk.max_level}
                                </span>
                            </div>
                            <p className="text-[11px] font-mono text-white/60 leading-relaxed">
                                {perk.description}
                            </p>
                            <div className="flex gap-1">
                                {Array.from({ length: perk.max_level }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1.5 flex-1 rounded-sm border ${
                                            i < perk.level
                                                ? 'bg-banan-osint border-banan-osint'
                                                : 'border-white/10 bg-transparent'
                                        }`}
                                    />
                                ))}
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-mono pt-2 border-t border-white/5">
                                <div>
                                    <span className="text-white/60">Effet : </span>
                                    <span className="text-white font-bold">
                                        {perkEffect(perk.id, perk.level, perk.effect_per_level)}
                                    </span>
                                    {!isMax && (
                                        <>
                                            <span className="text-white/60"> → </span>
                                            <span className="text-banan-osint font-bold">
                                                {perkEffect(
                                                    perk.id,
                                                    perk.level + 1,
                                                    perk.effect_per_level
                                                )}
                                            </span>
                                        </>
                                    )}
                                </div>
                                {!isMax && perk.cost !== null ? (
                                    <button
                                        onClick={() => handleUpgradePerk(perk.id)}
                                        disabled={!canAfford}
                                        className={`px-2.5 py-1 rounded-lg font-black uppercase text-[11px] tracking-wider border transition-all ${
                                            canAfford
                                                ? 'bg-banan-osint text-black border-banan-osint hover:bg-white hover:border-white'
                                                : 'text-red-400 border-red-500/20 bg-red-500/5 cursor-not-allowed'
                                        }`}
                                    >
                                        {formatNumber(perk.cost)} 🍌
                                    </button>
                                ) : (
                                    <span className="text-banan-osint font-black uppercase tracking-widest text-[11px] py-1 px-2 bg-banan-osint/10 border border-banan-osint/20 rounded-lg">
                                        Maximum
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </Panel>
    );
}
