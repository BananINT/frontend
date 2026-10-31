import { LogOut, Vote } from 'lucide-react';
import Panel from '../Panel';
import { PRIVACY_LABELS } from '../../lib/clanLabels';
import type { ClanManagement } from '../../lib/useClanManagement';

type GovernancePanelProps = Pick<ClanManagement, 'votes' | 'members' | 'userId' | 'handleVote' | 'handleCancelVote' | 'startVote' | 'clan' | 'handleLeave'>;

/** Running votes, access policy and the way out. */
export default function GovernancePanel({ votes, members, userId, handleVote, handleCancelVote, startVote, clan, handleLeave }: GovernancePanelProps) {
    return (
        <Panel
            title="Gouvernance"
            icon={Vote}
            accent="purple"
            subtitle="Les décisions se prennent à la majorité des membres."
            aside={
                <span className="text-[11px] font-mono text-white/60">
                    {votes.length} en cours
                </span>
            }
        >
            <div className="space-y-4">
                <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                    {votes.length === 0 ? (
                        <div className="p-4 rounded-xl border border-white/5 bg-black/30 text-center text-[11px] font-mono text-white/60 uppercase">
                            Aucun vote en cours
                        </div>
                    ) : (
                        votes.map(vote => {
                            const total = vote.yes_votes + vote.no_votes;
                            const yesPct = total > 0 ? (vote.yes_votes / total) * 100 : 0;
                            const targetName =
                                vote.vote_type === 'KICK'
                                    ? members.find(m => m.user_id === vote.target_id)?.username ??
                                      vote.target_id
                                    : vote.target_id;
                            return (
                                <div
                                    key={vote.id}
                                    className="p-3 rounded-xl border border-purple-400/30 bg-purple-500/5 space-y-2"
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <span className="text-[11px] font-bold text-purple-300 uppercase truncate">
                                            {vote.vote_type}: {targetName || 'GENERAL'}
                                        </span>
                                        <span className="text-[11px] font-mono text-white/60 shrink-0">
                                            {vote.yes_votes} / {vote.no_votes}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-black/60 rounded-full w-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-400 transition-all duration-500"
                                            style={{ width: `${yesPct}%` }}
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleVote(vote.id, true)}
                                            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-purple-500/80 text-black uppercase hover:bg-purple-400 transition-colors"
                                        >
                                            Pour
                                        </button>
                                        <button
                                            onClick={() => handleVote(vote.id, false)}
                                            className="flex-1 py-1.5 rounded-lg text-[11px] font-bold border border-white/10 text-white/50 uppercase hover:text-white transition-colors"
                                        >
                                            Contre
                                        </button>
                                        {vote.initiator_id === userId && (
                                            <button
                                                onClick={() => handleCancelVote(vote.id)}
                                                title="Annuler le vote"
                                                className="px-2 rounded-lg border border-white/10 text-white/60 text-[11px] font-bold uppercase hover:border-white hover:text-white transition-colors"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="border-t border-white/5 pt-3 space-y-2">
                    <div className="text-[11px] font-mono text-white/60 uppercase">
                        Changer la politique d'accès (vote)
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {(['OPEN', 'INVITE', 'PRIVATE'] as const).map(p => (
                            <button
                                key={p}
                                onClick={() => startVote('POLICY', p)}
                                disabled={clan?.privacy === p}
                                className="py-1.5 rounded-lg text-[11px] font-bold border border-white/10 text-white/50 uppercase hover:border-purple-400 hover:text-purple-300 transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white/50"
                            >
                                {PRIVACY_LABELS[p]}
                            </button>
                        ))}
                    </div>
                    <p className="text-[11px] font-mono text-white/60 uppercase">
                        Politique actuelle : {PRIVACY_LABELS[clan?.privacy ?? 'OPEN']}
                    </p>
                </div>

                <button
                    onClick={handleLeave}
                    className="w-full py-2 rounded-lg border border-dashed border-red-500/30 text-red-500/50 text-[11px] font-bold uppercase hover:text-red-400 hover:border-red-500 transition-colors flex items-center justify-center gap-2"
                >
                    <LogOut className="h-3 w-3" /> Quitter le clan
                </button>
            </div>
        </Panel>
    );
}
