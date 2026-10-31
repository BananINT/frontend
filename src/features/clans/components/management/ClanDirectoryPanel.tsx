import { Lock, UserPlus, Users } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import Panel from '../Panel';
import { PRIVACY_LABELS } from '../../lib/clanLabels';
import type { ClanManagement } from '../../lib/useClanManagement';

type ClanDirectoryPanelProps = Pick<ClanManagement, 'publicClans' | 'search' | 'setSearch' | 'visibleClans' | 'handleJoin'>;

/** Searchable list of the clans a player can join. */
export default function ClanDirectoryPanel({ publicClans, search, setSearch, visibleClans, handleJoin }: ClanDirectoryPanelProps) {
    return (
        <Panel
            title="Réseaux disponibles"
            icon={Users}
            subtitle="Rejoignez une unité existante et profitez de son trésor."
            aside={
                <span className="text-[11px] font-mono text-white/60">
                    {publicClans.length} unités
                </span>
            }
        >
            <div className="space-y-3">
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher une unité..."
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-white focus:border-banan-primary outline-none"
                />
                {visibleClans.length === 0 ? (
                    <div className="p-8 rounded-xl border border-white/5 bg-white/5 text-center font-mono text-[11px] text-white/60 uppercase">
                        Aucun clan actif détecté
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {visibleClans.map(c => {
                            const inviteOnly = c.privacy === 'INVITE';
                            return (
                                <div
                                    key={c.id}
                                    className="p-3 rounded-xl border border-white/10 bg-black/30 flex items-center justify-between gap-3 hover:border-banan-primary/50 transition-colors"
                                >
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-bold text-white uppercase truncate">
                                            {c.name}
                                        </h3>
                                        <p className="text-[11px] font-mono text-white/60 truncate">
                                            {c.description || 'Pas de description.'}
                                        </p>
                                        <div className="flex gap-3 mt-1 text-[11px] font-mono text-banan-primary">
                                            <span>{formatNumber(c.treasury_balance)} 🍌</span>
                                            <span className="text-white/60">
                                                {PRIVACY_LABELS[c.privacy] ?? c.privacy}
                                            </span>
                                        </div>
                                    </div>
                                    {inviteOnly ? (
                                        <span className="px-3 py-2 rounded-lg border border-white/10 text-white/60 text-[11px] font-bold uppercase flex items-center gap-1.5 shrink-0">
                                            <Lock className="h-3 w-3" /> Invitation
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleJoin(c)}
                                            className="px-3 py-2 rounded-lg border border-banan-primary text-banan-primary text-[11px] font-bold uppercase hover:bg-banan-primary hover:text-black transition-colors flex items-center gap-1.5 shrink-0"
                                        >
                                            <UserPlus className="h-3 w-3" /> Rejoindre
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </Panel>
    );
}
