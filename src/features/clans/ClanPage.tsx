import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Banana, Cpu, Gift, Info, Landmark, LogOut, Lock, Mail, Plus, Send,
    Shield, TrendingUp, UserPlus, Users, Vote,
} from 'lucide-react';
import { useGame } from '@app/context/GameContext';
import { api } from '@app/lib/api';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import FloatingIcons from '@app/components/ui/FloatingIcons';
import ConfirmDialog, { type ConfirmRequest } from '@app/components/shared/ConfirmDialog';
import ClanHeader from './components/ClanHeader';
import Panel from './components/Panel';
import TaxControl from './components/TaxControl';
import TransferModal from './components/TransferModal';
import DividendsModal from './components/DividendsModal';
import { useClanData, topDonors } from './lib/useClanData';
import { getGroupMultiplier, getNextTier, getTierProgress, MAX_TREASURY_BONUS } from './lib/tiers';
import type { Clan, ClanMember } from '@app/types/clan';

const CLAN_CREATION_COST = 1_000_000_000;
const STARTER_PACK_COST = 5_000_000_000;
/** Anything at or above a billion gets a confirmation step. */
const CONFIRM_THRESHOLD = 1_000_000_000;

const PRIVACY_LABELS: Record<string, string> = {
    OPEN: 'Ouvert',
    INVITE: 'Sur invitation',
    PRIVATE: 'Privé',
};

/** Reductions read as negative, production bonuses as positive. */
const PERK_SIGN: Record<string, '+' | '-'> = {
    turbo_murissement: '-',
    bouclier_cyber: '-',
    extracteur_potassium: '+',
};

function perkEffect(perkId: string, level: number, effectPerLevel: number) {
    const sign = PERK_SIGN[perkId] ?? '+';
    return `${sign}${Math.round(level * effectPerLevel * 100)}%`;
}

type Notice = { tone: 'ok' | 'error'; message: string } | null;

export default function ClanPage() {
    const { gameState } = useGame();
    const {
        clanId, clan, members, votes, perks, invites, publicClans,
        loading, refreshing, refresh,
    } = useClanData();

    const [notice, setNotice] = useState<Notice>(null);
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [inviteUsername, setInviteUsername] = useState('');
    const [depositAmount, setDepositAmount] = useState(0);
    const [search, setSearch] = useState('');
    const [transferTarget, setTransferTarget] = useState<ClanMember | null>(null);
    const [dividendsOpen, setDividendsOpen] = useState(false);
    const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
    const [confirmBusy, setConfirmBusy] = useState(false);

    const say = (tone: 'ok' | 'error', message: string) => {
        setNotice({ tone, message });
        setTimeout(() => setNotice(null), 4000);
    };

    const runConfirmed = async () => {
        if (!confirmRequest) return;
        setConfirmBusy(true);
        try {
            await confirmRequest.onConfirm();
        } finally {
            setConfirmBusy(false);
            setConfirmRequest(null);
        }
    };

    // Teammates act on the same treasury: mirror their moves without a refresh.
    useEffect(() => {
        const onMessage = (msg: { type: string; data?: unknown }) => {
            if (msg.type === 'clan_upgrade_success' || msg.type === 'clan_starter_pack_success') {
                refresh();
            } else if (msg.type === 'starter_pack_received') {
                const data = msg.data as { sender_username?: string };
                setNotice({
                    tone: 'ok',
                    message: `🎁 ${data?.sender_username ?? 'Un agent'} vous a offert un Pack Nouveau (+5 niveaux). Rechargement...`,
                });
                // The upgrade catalogue only ships with init_game, so re-init.
                setTimeout(() => window.location.reload(), 2500);
            }
        };
        socketManager.subscribe(onMessage);
        return () => socketManager.unsubscribe(onMessage);
    }, [refresh]);

    const fail = (e: unknown, fallback: string) => {
        const err = e as { response?: { data?: { detail?: string } } };
        say('error', err.response?.data?.detail || fallback);
    };

    const treasury = clan?.treasury_balance ?? 0;
    const bonus = getGroupMultiplier(treasury);
    const nextTier = getNextTier(treasury);
    const donors = useMemo(() => topDonors(members), [members]);
    const myDonation = members.find(m => m.user_id === gameState.userId)?.total_donated ?? 0;

    const visibleClans = useMemo(() => {
        const needle = search.trim().toLowerCase();
        if (!needle) return publicClans;
        return publicClans.filter(
            c =>
                c.name.toLowerCase().includes(needle) ||
                (c.description ?? '').toLowerCase().includes(needle)
        );
    }, [publicClans, search]);

    /* ---------------------------------------------------------------- actions */

    const handleCreateClan = () => {
        const name = newName.trim();
        if (name.length < 3) return;
        setConfirmRequest({
            title: "Fonder l'unité",
            message: `Créer le clan ${name}. Les frais de fondation sont prélevés immédiatement et ne sont pas remboursables.`,
            cost: CLAN_CREATION_COST,
            purse: 'personal',
            balance: gameState.bananas,
            confirmLabel: 'Fonder',
            onConfirm: async () => {
                try {
                    await api.post('/clan/create', { name, description: newDesc });
                    socketManager.send('sync', { pendingClicks: 0 });
                    await refresh();
                    say('ok', `Unité ${name} initialisée.`);
                } catch (e) {
                    fail(e, 'Erreur lors de la création.');
                }
            },
        });
    };

    const handleJoin = async (target: Clan) => {
        try {
            await api.post('/clan/join', { clan_id: target.id });
            socketManager.send('sync', { pendingClicks: 0 });
            await refresh();
            say('ok', `Vous avez rejoint ${target.name}.`);
        } catch (e) {
            fail(e, "Erreur lors de l'adhésion.");
        }
    };

    const handleRespondInvite = async (inviteId: number, accept: boolean) => {
        try {
            await api.post(`/clan/invites/${inviteId}/respond`, { accept });
            socketManager.send('sync', { pendingClicks: 0 });
            await refresh();
            say('ok', accept ? 'Invitation acceptée.' : 'Invitation refusée.');
        } catch (e) {
            fail(e, 'Erreur lors de la réponse.');
        }
    };

    const runDeposit = async (amount: number) => {
        try {
            await api.post('/clan/deposit', { amount });
            socketManager.send('sync', { pendingClicks: 0 });
            setDepositAmount(0);
            await refresh();
            say('ok', `${formatNumber(amount)} 🍌 versés au trésor.`);
        } catch (e) {
            fail(e, 'Erreur lors du dépôt.');
        }
    };

    const handleDeposit = () => {
        const amount = depositAmount;
        if (amount <= 0) return;
        // Small top-ups go straight through; a billion-banana gift does not.
        if (amount < CONFIRM_THRESHOLD) {
            void runDeposit(amount);
            return;
        }
        setConfirmRequest({
            title: 'Verser au trésor',
            message: "Un dépôt est définitif : les bananes appartiennent ensuite à l'unité et ne peuvent pas être retirées.",
            cost: amount,
            purse: 'personal',
            balance: gameState.bananas,
            confirmLabel: 'Déposer',
            onConfirm: () => runDeposit(amount),
        });
    };

    const handleUpgradePerk = (perkId: string) => {
        const perk = perks.find(p => p.id === perkId);
        if (!perk || perk.cost === null) return;
        setConfirmRequest({
            title: `Améliorer : ${perk.name}`,
            message: `Passage au niveau ${perk.level + 1}/${perk.max_level}. Le coût est prélevé sur la trésorerie commune.`,
            cost: perk.cost,
            purse: 'treasury',
            balance: treasury,
            confirmLabel: 'Améliorer',
            onConfirm: async () => {
                try {
                    await api.post('/clan/perks/upgrade', { perk_id: perkId });
                    await refresh();
                    say('ok', 'Compétence améliorée.');
                } catch (e) {
                    fail(e, "Erreur lors de l'amélioration.");
                }
            },
        });
    };

    const handleBuyStarterPack = (recipient: ClanMember) => {
        setConfirmRequest({
            title: 'Financer un Pack Nouveau',
            message: `${recipient.username} recevra +5 niveaux sur ses upgrades initiales. Le coût sort de la trésorerie commune.`,
            cost: STARTER_PACK_COST,
            purse: 'treasury',
            balance: treasury,
            confirmLabel: 'Financer',
            onConfirm: async () => {
                try {
                    await api.post('/clan/starter-pack', { recipient_id: recipient.user_id });
                    await refresh();
                    say('ok', `Pack Nouveau financé pour ${recipient.username}.`);
                } catch (e) {
                    fail(e, "Erreur lors de l'achat du pack.");
                }
            },
        });
    };

    const startVote = async (voteType: string, targetId?: string) => {
        try {
            await api.post('/clan/vote/start', { vote_type: voteType, target_id: targetId });
            await refresh();
            say('ok', 'Vote lancé.');
        } catch (e) {
            fail(e, 'Erreur lors du lancement du vote.');
        }
    };

    const handleVote = async (voteId: number, choice: boolean) => {
        try {
            await api.post('/clan/vote/cast', { vote_id: voteId, choice });
            await refresh();
        } catch (e) {
            fail(e, 'Erreur lors du vote.');
        }
    };

    const handleCancelVote = async (voteId: number) => {
        try {
            await api.post(`/clan/vote/cancel/${voteId}`);
            await refresh();
        } catch (e) {
            fail(e, "Erreur lors de l'annulation.");
        }
    };

    const handleInvite = async () => {
        if (!inviteUsername.trim()) return;
        try {
            await api.post('/clan/invite', { invitee_username: inviteUsername.trim() });
            setInviteUsername('');
            say('ok', 'Invitation envoyée.');
        } catch (e) {
            fail(e, "Erreur lors de l'invitation.");
        }
    };

    const handleLeave = () => {
        const lastOneOut = members.length <= 1;
        setConfirmRequest({
            title: 'Quitter le clan',
            message: lastOneOut
                ? "Vous êtes le dernier membre : l'unité sera dissoute et sa trésorerie perdue."
                : `Vous perdez le bonus collectif (+${bonus}%) et vos dons restent acquis au trésor.`,
            tone: 'danger',
            confirmLabel: 'Quitter',
            onConfirm: async () => {
                try {
                    await api.post('/clan/leave');
                    socketManager.send('sync', { pendingClicks: 0 });
                    await refresh();
                    say('ok', 'Vous avez quitté le clan.');
                } catch (e) {
                    fail(e, 'Erreur lors du départ.');
                }
            },
        });
    };

    const handleKickVote = (target: ClanMember) => {
        setConfirmRequest({
            title: "Lancer un vote d'expulsion",
            message: `Tous les membres verront ce vote contre ${target.username}. Il ne peut pas être retiré discrètement.`,
            tone: 'danger',
            confirmLabel: 'Lancer le vote',
            onConfirm: () => startVote('KICK', target.user_id),
        });
    };

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
                        {invites.length > 0 && (
                            <Panel
                                title="Invitations reçues"
                                icon={Mail}
                                subtitle="Des unités vous ont ouvert leurs portes."
                                aside={
                                    <span className="text-[10px] font-mono text-banan-primary">
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
                                                <div className="text-[10px] font-mono text-banan-primary truncate">
                                                    Invité par {invite.inviter_username}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleRespondInvite(invite.id, true)}
                                                    className="px-3 py-1.5 rounded-lg bg-banan-primary text-black text-[10px] font-bold uppercase hover:bg-white transition-colors"
                                                >
                                                    Accepter
                                                </button>
                                                <button
                                                    onClick={() => handleRespondInvite(invite.id, false)}
                                                    className="px-3 py-1.5 rounded-lg border border-white/10 text-white/50 text-[10px] font-bold uppercase hover:text-white transition-colors"
                                                >
                                                    Refuser
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Panel>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                            <Panel
                                title="Réseaux disponibles"
                                icon={Users}
                                subtitle="Rejoignez une unité existante et profitez de son trésor."
                                aside={
                                    <span className="text-[10px] font-mono text-white/30">
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
                                        <div className="p-8 rounded-xl border border-white/5 bg-white/5 text-center font-mono text-[11px] text-white/30 uppercase">
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
                                                            <p className="text-[10px] font-mono text-white/40 truncate">
                                                                {c.description || 'Pas de description.'}
                                                            </p>
                                                            <div className="flex gap-3 mt-1 text-[10px] font-mono text-banan-primary">
                                                                <span>{formatNumber(c.treasury_balance)} 🍌</span>
                                                                <span className="text-white/30">
                                                                    {PRIVACY_LABELS[c.privacy] ?? c.privacy}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {inviteOnly ? (
                                                            <span className="px-3 py-2 rounded-lg border border-white/10 text-white/30 text-[10px] font-bold uppercase flex items-center gap-1.5 shrink-0">
                                                                <Lock className="h-3 w-3" /> Invitation
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleJoin(c)}
                                                                className="px-3 py-2 rounded-lg border border-banan-primary text-banan-primary text-[10px] font-bold uppercase hover:bg-banan-primary hover:text-black transition-colors flex items-center gap-1.5 shrink-0"
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

                            <Panel
                                title="Fonder une unité"
                                icon={Plus}
                                accent="green"
                                subtitle="Votre nom, vos règles, votre trésorerie."
                            >
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                                            Nom du clan
                                        </label>
                                        <input
                                            type="text"
                                            value={newName}
                                            onChange={e =>
                                                setNewName(e.target.value.toUpperCase().replace(/[^A-Z0-9_ ]/g, ''))
                                            }
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-banan-primary outline-none"
                                            placeholder="EX: ALPHA_SQUAD..."
                                            maxLength={20}
                                        />
                                        <div className="text-[9px] font-mono text-white/25 uppercase text-right">
                                            {newName.length}/20 · 3 caractères minimum
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">
                                            Description
                                        </label>
                                        <textarea
                                            value={newDesc}
                                            onChange={e => setNewDesc(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-sm font-mono text-white focus:border-banan-primary outline-none h-20"
                                            placeholder="Objectifs de l'unité..."
                                            maxLength={100}
                                        />
                                    </div>
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <div className="flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase mb-1">
                                            <Info className="h-3 w-3" /> Coût de fondation
                                        </div>
                                        <p className="text-[11px] font-mono text-white/60">
                                            <span className="text-banan-primary font-bold">
                                                {formatNumber(CLAN_CREATION_COST)} 🍌
                                            </span>{' '}
                                            — il vous reste {formatNumber(gameState.bananas)} 🍌.
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleCreateClan}
                                        disabled={newName.trim().length < 3 || gameState.bananas < CLAN_CREATION_COST}
                                        className="w-full bg-banan-primary text-black py-3.5 rounded-lg font-black uppercase tracking-widest text-xs hover:bg-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                        Initialiser l'unité
                                    </button>
                                </div>
                            </Panel>
                        </div>
                    </div>
                ) : (
                    /* --------------------------------------------------- in a clan */
                    <div className="flex flex-col gap-6 md:gap-8">
                        {/* Navigation to the ops room lives in the header switch. */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
                            <Panel
                                title="Trésorerie"
                                icon={Landmark}
                                subtitle="Le capital commun de l'unité."
                            >
                                <div className="space-y-5">
                                    <div className="text-center">
                                        <div className="text-3xl md:text-4xl font-black text-banan-primary tabular-nums flex items-center justify-center gap-2">
                                            {formatNumber(treasury)} <Banana className="h-7 w-7" />
                                        </div>
                                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest mt-1">
                                            Votre don cumulé : {formatNumber(myDonation)} 🍌
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                value={depositAmount || ''}
                                                onChange={e =>
                                                    setDepositAmount(Math.max(0, parseInt(e.target.value, 10) || 0))
                                                }
                                                placeholder="Quantité..."
                                                className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg p-2.5 text-xs font-mono text-white focus:border-banan-primary outline-none"
                                            />
                                            <button
                                                onClick={handleDeposit}
                                                disabled={depositAmount <= 0 || depositAmount > gameState.bananas}
                                                className="px-4 rounded-lg bg-banan-primary text-black text-[10px] font-bold uppercase hover:bg-white transition-colors disabled:opacity-40"
                                            >
                                                Déposer
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-1.5">
                                            {[0.1, 0.25, 0.5, 1].map(share => (
                                                <button
                                                    key={share}
                                                    onClick={() =>
                                                        setDepositAmount(Math.floor(gameState.bananas * share))
                                                    }
                                                    className="py-1.5 rounded-lg border border-white/10 bg-black/30 text-[10px] font-mono uppercase text-white/60 hover:text-white hover:border-white/40 transition-colors"
                                                >
                                                    {share === 1 ? 'Max' : `${share * 100}%`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="border-t border-white/5 pt-4 space-y-2">
                                        <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex justify-between">
                                            <span>Multiplicateur collectif</span>
                                            <span className="text-green-400 font-bold">+{bonus}%</span>
                                        </div>
                                        <div className="w-full h-2 bg-black rounded-full border border-white/5 overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-banan-primary/60 to-banan-primary"
                                                animate={{ width: `${getTierProgress(treasury) * 100}%` }}
                                                transition={{ duration: 0.6 }}
                                            />
                                        </div>
                                        {nextTier ? (
                                            <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase">
                                                <span>
                                                    Prochain : +{nextTier.bonus}% ({nextTier.name})
                                                </span>
                                                <span>Reste {formatNumber(nextTier.target - treasury)} 🍌</span>
                                            </div>
                                        ) : (
                                            <p className="text-[9px] font-mono text-banan-primary uppercase">
                                                Bonus maximum atteint (+{MAX_TREASURY_BONUS}%)
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setDividendsOpen(true)}
                                        className="w-full p-2.5 rounded-lg border border-white/10 text-white/60 text-[10px] font-bold uppercase hover:border-white hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        <TrendingUp className="h-3 w-3" /> Dividendes & mouvements
                                    </button>
                                </div>
                            </Panel>

                            <Panel
                                title="Taxe automatique"
                                icon={TrendingUp}
                                accent="cyan"
                                subtitle="Votre contribution passive au trésor."
                            >
                                <TaxControl />
                            </Panel>

                            <Panel
                                title="Gouvernance"
                                icon={Vote}
                                accent="purple"
                                subtitle="Les décisions se prennent à la majorité des membres."
                                aside={
                                    <span className="text-[10px] font-mono text-white/30">
                                        {votes.length} en cours
                                    </span>
                                }
                            >
                                <div className="space-y-4">
                                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                                        {votes.length === 0 ? (
                                            <div className="p-4 rounded-xl border border-white/5 bg-black/30 text-center text-[10px] font-mono text-white/30 uppercase">
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
                                                            <span className="text-[10px] font-bold text-purple-300 uppercase truncate">
                                                                {vote.vote_type}: {targetName || 'GENERAL'}
                                                            </span>
                                                            <span className="text-[9px] font-mono text-white/30 shrink-0">
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
                                                                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-purple-500/80 text-black uppercase hover:bg-purple-400 transition-colors"
                                                            >
                                                                Pour
                                                            </button>
                                                            <button
                                                                onClick={() => handleVote(vote.id, false)}
                                                                className="flex-1 py-1.5 rounded-lg text-[10px] font-bold border border-white/10 text-white/50 uppercase hover:text-white transition-colors"
                                                            >
                                                                Contre
                                                            </button>
                                                            {vote.initiator_id === gameState.userId && (
                                                                <button
                                                                    onClick={() => handleCancelVote(vote.id)}
                                                                    title="Annuler le vote"
                                                                    className="px-2 rounded-lg border border-white/10 text-white/30 text-[10px] font-bold uppercase hover:border-white hover:text-white transition-colors"
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
                                        <div className="text-[9px] font-mono text-white/30 uppercase">
                                            Changer la politique d'accès (vote)
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['OPEN', 'INVITE', 'PRIVATE'] as const).map(p => (
                                                <button
                                                    key={p}
                                                    onClick={() => startVote('POLICY', p)}
                                                    disabled={clan?.privacy === p}
                                                    className="py-1.5 rounded-lg text-[9px] font-bold border border-white/10 text-white/50 uppercase hover:border-purple-400 hover:text-purple-300 transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:hover:text-white/50"
                                                >
                                                    {PRIVACY_LABELS[p]}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-[9px] font-mono text-white/25 uppercase">
                                            Politique actuelle : {PRIVACY_LABELS[clan?.privacy ?? 'OPEN']}
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleLeave}
                                        className="w-full py-2 rounded-lg border border-dashed border-red-500/30 text-red-500/50 text-[10px] font-bold uppercase hover:text-red-400 hover:border-red-500 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <LogOut className="h-3 w-3" /> Quitter le clan
                                    </button>
                                </div>
                            </Panel>
                        </div>

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
                                                <span className="text-[10px] font-mono text-white/70 bg-white/10 px-1.5 py-0.5 rounded shrink-0">
                                                    {perk.level}/{perk.max_level}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-mono text-white/40 leading-relaxed">
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
                                            <div className="flex justify-between items-center text-[10px] font-mono pt-2 border-t border-white/5">
                                                <div>
                                                    <span className="text-white/40">Effet : </span>
                                                    <span className="text-white font-bold">
                                                        {perkEffect(perk.id, perk.level, perk.effect_per_level)}
                                                    </span>
                                                    {!isMax && (
                                                        <>
                                                            <span className="text-white/40"> → </span>
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
                                                        className={`px-2.5 py-1 rounded-lg font-black uppercase text-[9px] tracking-wider border transition-all ${
                                                            canAfford
                                                                ? 'bg-banan-osint text-black border-banan-osint hover:bg-white hover:border-white'
                                                                : 'text-red-400 border-red-500/20 bg-red-500/5 cursor-not-allowed'
                                                        }`}
                                                    >
                                                        {formatNumber(perk.cost)} 🍌
                                                    </button>
                                                ) : (
                                                    <span className="text-banan-osint font-black uppercase tracking-widest text-[9px] py-1 px-2 bg-banan-osint/10 border border-banan-osint/20 rounded-lg">
                                                        Maximum
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Panel>

                        <Panel
                            title="Effectifs"
                            icon={Users}
                            subtitle="Survolez un agent pour prêter des bananes, offrir un pack ou lancer une expulsion."
                            aside={
                                <span className="text-[10px] font-mono text-white/30">{members.length} agents</span>
                            }
                        >
                            {donors.length > 0 && (
                                <div className="mb-5 rounded-xl border border-banan-primary/20 bg-banan-primary/5 p-4">
                                    <div className="text-[10px] font-mono text-banan-primary uppercase font-bold tracking-widest mb-3">
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
                                                    <div className="text-[9px] font-mono text-banan-primary font-bold uppercase">
                                                        {titles[idx]}
                                                    </div>
                                                    <div className="text-sm font-black uppercase text-white truncate">
                                                        {m.username}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-white/50">
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
                                                    {m.user_id === gameState.userId && (
                                                        <span className="text-[10px] text-banan-primary opacity-60"> (vous)</span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] font-mono text-banan-primary">
                                                    Don : {formatNumber(m.total_donated)} 🍌
                                                </div>
                                            </div>
                                        </div>
                                        {m.user_id !== gameState.userId && (
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
                        userId={gameState.userId}
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

            <AnimatePresence>
                {notice && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border font-mono text-[11px] uppercase max-w-xs ${
                            notice.tone === 'ok'
                                ? 'border-green-500/40 bg-green-950/80 text-green-300'
                                : 'border-red-500/40 bg-red-950/80 text-red-300'
                        }`}
                    >
                        {notice.message}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
