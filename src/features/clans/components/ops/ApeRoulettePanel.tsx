import { Link } from 'react-router';
import { Skull } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import Panel from '../Panel';
import type { ClanOps } from '../../lib/useClanOps';

type ApeRoulettePanelProps = Pick<ClanOps, 'roulette' | 'soot'>;

/** The shared barrel; the table itself lives in the casino. */
export default function ApeRoulettePanel({ roulette, soot }: ApeRoulettePanelProps) {
    return (
        <Panel
            title="Ape Roulette"
            icon={Skull}
            accent="purple"
            subtitle="Barillet partagé par toute l'unité — la table vit au Casino Potassium."
            aside={
                <span className="text-[11px] font-mono text-purple-300">
                    {roulette?.remaining_chambers ?? 6}/6
                </span>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] gap-5 items-center">
                <div className="flex justify-center gap-1.5">
                    {Array.from({ length: 6 }).map((_, i) => {
                        const spent = i >= (roulette?.remaining_chambers ?? 6);
                        return (
                            <div
                                key={i}
                                className={`h-4 w-4 rounded-full border transition-colors ${
                                    spent
                                        ? 'bg-black/80 border-white/10'
                                        : 'bg-banan-primary border-banan-primary shadow-[0_0_8px_rgba(253,224,71,0.5)]'
                                }`}
                            />
                        );
                    })}
                </div>

                <div className="space-y-1.5 text-center md:text-left">
                    <div className="text-[11px] font-mono text-white/50 uppercase leading-relaxed">
                        5 chambres saines ({formatNumber(roulette?.safe_payout ?? 30_000_000)} 🍌), 1 pourrie
                        (suie, clics à zéro pendant 5 minutes).
                    </div>
                    <div className="text-[11px] font-mono text-red-400 uppercase font-bold">
                        Risque d'explosion : {roulette?.dud_chance ?? 16.7}%
                    </div>
                    {soot.isSooty && (
                        <div className="text-[11px] font-mono text-purple-300 uppercase font-bold">
                            Barillet bloqué pour vous · {soot.label}
                        </div>
                    )}
                </div>

                <Link
                    to="/casino/roulette"
                    className="px-5 py-3 rounded-lg bg-purple-500/20 border border-purple-400 text-purple-200 font-black uppercase text-[11px] tracking-widest hover:bg-purple-400 hover:text-black transition-colors text-center whitespace-nowrap"
                >
                    Ouvrir la table →
                </Link>
            </div>
        </Panel>
    );
}
