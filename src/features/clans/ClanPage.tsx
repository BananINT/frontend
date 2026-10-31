import { AnimatePresence } from 'framer-motion';
import { Banana, Landmark, Shield, TrendingUp, Users } from 'lucide-react';
import { formatNumber } from '@app/utils/format';
import FloatingIcons from '@app/components/ui/FloatingIcons';
import ConfirmDialog from '@app/components/shared/ConfirmDialog';
import ClanHeader from './components/ClanHeader';
import Panel from './components/Panel';
import TaxControl from './components/TaxControl';
import TransferModal from './components/TransferModal';
import DividendsModal from './components/DividendsModal';
import LobbyInvitesPanel from './components/management/LobbyInvitesPanel';
import ClanDirectoryPanel from './components/management/ClanDirectoryPanel';
import FoundClanPanel from './components/management/FoundClanPanel';
import TreasuryPanel from './components/management/TreasuryPanel';
import GovernancePanel from './components/management/GovernancePanel';
import PerksPanel from './components/management/PerksPanel';
import MembersPanel from './components/management/MembersPanel';
import InviteAgentPanel from './components/management/InviteAgentPanel';
import ClanNoticeToast from './components/management/ClanNoticeToast';
import { useClanManagement } from './lib/useClanManagement';

export default function ClanPage() {
    const m = useClanManagement();
    const {
        clanId, clan, members, invites, publicClans, loading, refreshing, refresh,
        treasury, bonus, userId, say, notice,
        transferTarget, setTransferTarget, dividendsOpen, setDividendsOpen,
        confirmRequest, setConfirmRequest, confirmBusy, runConfirmed,
    } = m;

    /* ------------------------------------------------------------------ views */

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-banan-primary font-mono animate-pulse uppercase">
                    Synchronisation du réseau des clans...
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
            <FloatingIcons icons={[Shield, Users, Landmark]} count={14} className="text-banan-primary/[0.05]" />

            <ClanHeader
                title={clanId ? clan?.name ?? 'UNITÉ' : 'SIÈGE SOCIAL DES CLANS'}
                subtitle={
                    clanId
                        ? clan?.description || 'Unité de production de bananes hautement coordonnée.'
                        : "Unissez vos forces, mutualisez la trésorerie et débloquez le multiplicateur collectif."
                }
                room="management"
                showTabs={!!clanId}
                refreshing={refreshing}
                stats={
                    clanId
                        ? [
                              {
                                  label: 'Trésor',
                                  value: formatNumber(treasury),
                                  icon: Banana,
                                  accent: 'text-banan-primary',
                              },
                              { label: 'Membres', value: String(members.length), accent: 'text-white' },
                              { label: 'Bonus', value: `+${bonus}%`, accent: 'text-green-400' },
                          ]
                        : [{ label: 'Unités', value: String(publicClans.length), accent: 'text-white' }]
                }
            />

            <div className="flex-1 p-4 md:p-10 relative z-10 w-full max-w-7xl mx-auto">
                {!clanId ? (
                    /* ------------------------------------------------ no clan yet */
                    <div className="flex flex-col gap-6 md:gap-8">
                        {invites.length > 0 && <LobbyInvitesPanel {...m} />}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                            <ClanDirectoryPanel {...m} />

                            <FoundClanPanel {...m} />
                        </div>
                    </div>
                ) : (
                    /* --------------------------------------------------- in a clan */
                    <div className="flex flex-col gap-6 md:gap-8">
                        {/* Navigation to the ops room lives in the header switch. */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                            <TreasuryPanel {...m} />

                            <Panel
                                title="Taxe automatique"
                                icon={TrendingUp}
                                accent="cyan"
                                subtitle="Votre contribution passive au trésor."
                            >
                                <TaxControl />
                            </Panel>

                            <GovernancePanel {...m} />
                        </div>

                        <PerksPanel {...m} />

                        <MembersPanel {...m} />

                        <InviteAgentPanel {...m} />
                    </div>
                )}
            </div>

            <AnimatePresence>
                {transferTarget && (
                    <TransferModal
                        recipient={transferTarget}
                        onClose={() => setTransferTarget(null)}
                        onDone={() => {
                            refresh();
                            say('ok', 'Transfert effectué.');
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {dividendsOpen && (
                    <DividendsModal
                        clan={clan}
                        members={members}
                        userId={userId}
                        onClose={() => setDividendsOpen(false)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {confirmRequest && (
                    <ConfirmDialog
                        request={confirmRequest}
                        busy={confirmBusy}
                        onCancel={() => setConfirmRequest(null)}
                        onConfirm={runConfirmed}
                    />
                )}
            </AnimatePresence>

            <ClanNoticeToast notice={notice} />
        </div>
    );
}
