import { useMemo, useState } from 'react';
import { useGame } from '@app/context/GameContext';
import { api } from '@app/lib/api';
import { socketManager } from '@app/lib/socket';
import { useSocketMessage } from '@app/hooks/useSocketMessage';
import { formatNumber } from '@app/utils/format';
import type { ConfirmRequest } from '@app/components/shared/ConfirmDialog';
import { useClanData, topDonors } from './useClanData';
import { getGroupMultiplier, getNextTier } from './tiers';
import type { Clan, ClanMember } from '@app/types/clan';

export const CLAN_CREATION_COST = 1_000_000_000;
export const STARTER_PACK_COST = 5_000_000_000;
/** Anything at or above a billion gets a confirmation step. */
const CONFIRM_THRESHOLD = 1_000_000_000;

export type Notice = { tone: 'ok' | 'error'; message: string } | null;

/**
 * Everything the clan management page does: the REST data, the form state,
 * the confirmation flow, the toast, and every action. The page and its panels
 * only render.
 */
export function useClanManagement() {
    const { gameState } = useGame();
    const data = useClanData();
    const { clan, members, perks, publicClans, refresh } = data;

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
    useSocketMessage(['clan_upgrade_success', 'clan_starter_pack_success'], () => {
        refresh();
    });
    useSocketMessage<{ sender_username?: string } | undefined>('starter_pack_received', (data) => {
        setNotice({
            tone: 'ok',
            message: `🎁 ${data?.sender_username ?? 'Un agent'} vous a offert un Pack Nouveau (+5 niveaux). Rechargement...`,
        });
        // The upgrade catalogue only ships with init_game, so re-init.
        setTimeout(() => window.location.reload(), 2500);
    });

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

    return {
        ...data,
        userId: gameState.userId,
        bananas: gameState.bananas,
        treasury, bonus, nextTier, donors, myDonation, visibleClans,
        notice, say,
        newName, setNewName, newDesc, setNewDesc,
        inviteUsername, setInviteUsername,
        depositAmount, setDepositAmount,
        search, setSearch,
        transferTarget, setTransferTarget,
        dividendsOpen, setDividendsOpen,
        confirmRequest, setConfirmRequest, confirmBusy, runConfirmed,
        handleCreateClan, handleJoin, handleRespondInvite, handleDeposit, handleUpgradePerk,
        handleBuyStarterPack, startVote, handleVote, handleCancelVote, handleInvite, handleLeave, handleKickVote,
    };
}

export type ClanManagement = ReturnType<typeof useClanManagement>;
