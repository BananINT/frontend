import { UserPlus } from 'lucide-react';
import Panel from '../Panel';
import type { ClanManagement } from '../../lib/useClanManagement';

type InviteAgentPanelProps = Pick<ClanManagement, 'inviteUsername' | 'setInviteUsername' | 'handleInvite'>;

/** Invite an existing player by name. */
export default function InviteAgentPanel({ inviteUsername, setInviteUsername, handleInvite }: InviteAgentPanelProps) {
    return (
        <Panel
            title="Inviter un agent"
            icon={UserPlus}
            subtitle="L'agent doit déjà exister dans le réseau global."
        >
            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    value={inviteUsername}
                    onChange={e => setInviteUsername(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleInvite()}
                    className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-banan-primary outline-none"
                    placeholder="Nom d'utilisateur de l'agent..."
                />
                <button
                    onClick={handleInvite}
                    disabled={!inviteUsername.trim()}
                    className="px-6 py-3 rounded-lg bg-banan-primary text-black font-bold uppercase text-xs hover:bg-white transition-colors disabled:opacity-40"
                >
                    Envoyer l'invitation
                </button>
            </div>
        </Panel>
    );
}
