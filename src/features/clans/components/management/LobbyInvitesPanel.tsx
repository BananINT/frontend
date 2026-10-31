import { Mail } from 'lucide-react';
import Panel from '../Panel';
import type { ClanManagement } from '../../lib/useClanManagement';

type LobbyInvitesPanelProps = Pick<ClanManagement, 'invites' | 'handleRespondInvite'>;

/** Invitations waiting for a player without a clan. */
export default function LobbyInvitesPanel({ invites, handleRespondInvite }: LobbyInvitesPanelProps) {
    return (
        <Panel
            title="Invitations reçues"
            icon={Mail}
            subtitle="Des unités vous ont ouvert leurs portes."
            aside={
                <span className="text-[11px] font-mono text-banan-primary">
                    {invites.length}
                </span>
            }
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {invites.map(invite => (
                    <div
                        key={invite.id}
                        className="p-3 rounded-xl border border-banan-primary/40 bg-banan-primary/5 flex items-center justify-between gap-3"
                    >
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-white uppercase truncate">
                                {invite.clan_name}
                            </div>
                            <div className="text-[11px] font-mono text-banan-primary truncate">
                                Invité par {invite.inviter_username}
                            </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <button
                                onClick={() => handleRespondInvite(invite.id, true)}
                                className="px-3 py-1.5 rounded-lg bg-banan-primary text-black text-[11px] font-bold uppercase hover:bg-white transition-colors"
                            >
                                Accepter
                            </button>
                            <button
                                onClick={() => handleRespondInvite(invite.id, false)}
                                className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-[11px] font-bold uppercase hover:text-white transition-colors"
                            >
                                Refuser
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </Panel>
    );
}
