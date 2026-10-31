import { Gift, LogOut, Send, Users } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import Panel from '../Panel';
import { STARTER_PACK_COST } from '../../lib/useClanManagement';
import type { ClanManagement } from '../../lib/useClanManagement';

type MembersPanelProps = Pick<ClanManagement, 'members' | 'donors' | 'userId' | 'setTransferTarget' | 'handleBuyStarterPack' | 'handleKickVote'>;

/** Roster, honour board and per-member actions. */
export default function MembersPanel({ members, donors, userId, setTransferTarget, handleBuyStarterPack, handleKickVote }: MembersPanelProps) {
    return (
        <Panel
            title="Effectifs"
            icon={Users}
            subtitle="Survolez un agent pour prêter des bananes, offrir un pack ou lancer une expulsion."
            aside={
                <span className="text-[11px] font-mono text-white/60">{members.length} agents</span>
            }
        >
            {donors.length > 0 && (
                <div className="mb-5 rounded-xl border border-banan-primary/20 bg-banan-primary/5 p-4">
                    <div className="text-[11px] font-mono text-banan-primary uppercase font-bold tracking-widest mb-3">
                        🥇 Tableau d'honneur (top donateurs)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {donors.map((m, idx) => {
                            const titles = [
                                '🥇 Mécène Bananier',
                                '🥈 Grand Donateur',
                                '🥉 Singe Solidaire',
                            ];
                            return (
                                <div
                                    key={m.user_id}
                                    className="p-3 rounded-xl border border-white/10 bg-black/40 space-y-1"
                                >
                                    <div className="text-[11px] font-mono text-banan-primary font-bold uppercase">
                                        {titles[idx]}
                                    </div>
                                    <div className="text-sm font-black uppercase text-white truncate">
                                        {m.username}
                                    </div>
                                    <div className="text-[11px] font-mono text-white/50">
                                        Donné :{' '}
                                        <span className="text-banan-primary font-bold">
                                            {formatNumber(m.total_donated)} 🍌
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {members.map((m, idx) => (
                    <div
                        key={m.user_id}
                        className="p-3 rounded-xl border border-white/10 bg-black/30 flex items-center justify-between gap-2 group hover:border-banan-primary/50 transition-colors"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-xs text-white/50 group-hover:text-banan-primary transition-colors shrink-0">
                                {idx + 1}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-white uppercase truncate">
                                    {m.username}
                                    {m.user_id === userId && (
                                        <span className="text-[11px] text-banan-primary opacity-60"> (vous)</span>
                                    )}
                                </div>
                                <div className="text-[11px] font-mono text-banan-primary">
                                    Don : {formatNumber(m.total_donated)} 🍌
                                </div>
                            </div>
                        </div>
                        {m.user_id !== userId && (
                            <div className="flex gap-0.5 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => setTransferTarget(m)}
                                    title="Transférer des bananes"
                                    className="p-2 rounded-lg text-banan-primary hover:bg-banan-primary/10 transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleBuyStarterPack(m)}
                                    title={`Financer un Pack Nouveau (${formatNumber(STARTER_PACK_COST)} 🍌)`}
                                    className="p-2 rounded-lg text-banan-primary hover:bg-banan-primary/10 transition-colors"
                                >
                                    <Gift className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => handleKickVote(m)}
                                    title="Lancer un vote d'expulsion"
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <LogOut className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Panel>
    );
}
