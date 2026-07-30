import { useState, useEffect, useCallback, useRef } from 'react';
import { Shield, Users, Landmark, Vote, Plus, Info, Banana, TrendingUp, UserPlus, LogOut, Terminal, Cpu, StopCircle, Zap, Skull, Send, Gift } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '@app/context/GameContext';
import { useAuth } from '@app/context/AuthContext';
import { formatNumber } from '@app/utils/format';
import GameSection from '@app/components/shared/GameSection';
import { api } from '@app/lib/api';
import { socketManager } from '@app/lib/socket';
import type { Clan, ClanMember, ClanVote, ClanInvite, ClanPerk } from '@app/types/clan';

interface OsintTarget {
    id: string;
    ip: string;
    corp: string;
    difficulty: number;
    duration: number;
    reward_multiplier: number;
}

interface ActiveHack {
    target: OsintTarget;
    remaining_time: number;
    total_duration: number;
    completed: boolean;
    helpers: number;
}

interface OsintState {
    targets: OsintTarget[];
    active_hack: ActiveHack | null;
    error?: string;
}

interface OsintResult {
    reward: number;
    message?: string;
}

const getGroupMultiplier = (balance: number) => {
    if (balance >= 5000000000000) return 25;
    if (balance >= 1000000000000) return 20;
    if (balance >= 250000000000) return 15;
    if (balance >= 50000000000) return 10;
    if (balance >= 10000000000) return 5;
    return 0;
};

const getNextTier = (balance: number) => {
    if (balance < 10000000000) return { name: "Palier 1", target: 10000000000, bonus: 5 };
    if (balance < 50000000000) return { name: "Palier 2", target: 50000000000, bonus: 10 };
    if (balance < 250000000000) return { name: "Palier 3", target: 250000000000, bonus: 15 };
    if (balance < 1000000000000) return { name: "Palier 4", target: 1000000000000, bonus: 20 };
    if (balance < 5000000000000) return { name: "Palier 5", target: 5000000000000, bonus: 25 };
    return null;
};

export default function ClanPage() {
    const { gameState } = useGame();
    useAuth();
    const [clanData, setClanData] = useState<Clan | null>(null);
    const [members, setMembers] = useState<ClanMember[]>([]);
    const [votes, setVotes] = useState<ClanVote[]>([]);
    const [publicClans, setPublicClans] = useState<Clan[]>([]);
    const [invites, setInvites] = useState<ClanInvite[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Form states
    const [newName, setNewName] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [inviteUsername, setInviteUsername] = useState('');
    const [depositAmount, setDepositAmount] = useState(0);

    // OSINT State
    const [osintState, setOsintState] = useState<OsintState | null>(null);
    const [osintResult, setOsintResult] = useState<OsintResult | null>(null);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const terminalRef = useRef<HTMLDivElement>(null);

    // Ape Roulette State
    const [rouletteState, setRouletteState] = useState<{ remaining_chambers: number, dud_chance: number } | null>(null);
    const [rouletteSpinning, setRouletteSpinning] = useState(false);
    const [rouletteOutcome, setRouletteOutcome] = useState<{ outcome: string, payout: number } | null>(null);

    // Banana Transfer State
    const [transferModalOpen, setTransferModalOpen] = useState(false);
    const [selectedTransferRecipient, setSelectedTransferRecipient] = useState<ClanMember | null>(null);
    const [transferAmount, setTransferAmount] = useState(0);
    const [perks, setPerks] = useState<ClanPerk[]>([]);
    const [dividendsModalOpen, setDividendsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<any[]>([]);

    const addLog = useCallback((line: string) => {
        setTerminalLines(prev => [...prev.slice(-20), `> ${line}`]);
    }, []);

    const refreshData = useCallback(async () => {
        setIsRefreshing(true);
        await Promise.all([
            fetchPublicClans(),
            fetchMyInvites()
        ]);
        if (gameState.clan_id) {
            await fetchClanDetails(gameState.clan_id);
            socketManager.send('get_osint_state', {});
            socketManager.send('get_ape_roulette_state', {});
        } else {
            setLoading(false);
        }
        setIsRefreshing(false);
    }, [gameState.clan_id]);

    useEffect(() => {
        refreshData();
    }, [refreshData]);

    // OSINT Socket Listeners
    useEffect(() => {
        const handleMessage = (msg: { type: string, data: unknown, message?: string }) => {
            if (msg.type === 'osint_state') {
                setOsintState(msg.data as OsintState);
            } else if (msg.type === 'osint_scan') {
                addLog(`[RESEAU] Nouveau scan de clan terminé.`);
            } else if (msg.type === 'osint_hack_complete') {
                const data = msg.data as OsintResult;
                setOsintResult(data);
                addLog(`[SUCCES] Opération terminée. +${formatNumber(data.reward)} bananes au trésor.`);
                refreshData();
            } else if (msg.type === 'error' && msg.message?.includes('OSINT')) {
                addLog(`[ERREUR] ${msg.message}`);
            } else if (msg.type === 'ape_roulette_state') {
                setRouletteState(msg.data as { remaining_chambers: number, dud_chance: number });
            } else if (msg.type === 'ape_roulette_member_pulled') {
                const data = msg.data as { username: string, outcome: string };
                addLog(`[ROULETTE] ${data.username} a tiré : ${data.outcome === 'SAFE' ? 'SAIN 🍌' : 'BOOM 💥 !'}`);
            } else if (msg.type === 'ape_roulette_result') {
                const result = msg.data as { outcome: string, payout: number };
                setRouletteSpinning(true);
                setRouletteOutcome(null);
                setTimeout(() => {
                    setRouletteSpinning(false);
                    setRouletteOutcome(result);
                    if (result.outcome === 'SAFE') {
                        addLog(`[ROULETTE] Vous avez tiré une banane saine ! +${formatNumber(result.payout)} 🍌`);
                    } else {
                        addLog(`[ROULETTE] BOOM ! Le pistolet a explosé ! Vous êtes couvert de suie.`);
                    }
                    refreshData();
                }, 1500);
            } else if (msg.type === 'clan_upgrade_success') {
                const data = msg.data as { perk_id: string, new_level: number, treasury_balance: number };
                setPerks(prev => prev.map(p => p.id === data.perk_id ? { 
                    ...p, 
                    level: data.new_level,
                    cost: p.cost ? p.cost * 2 : null
                } : p));
                setClanData(prev => prev ? { ...prev, treasury_balance: data.treasury_balance } : null);
                addLog(`[CLAN] Le perk '${data.perk_id}' a été amélioré au niveau ${data.new_level}.`);
                refreshData();
            } else if (msg.type === 'clan_starter_pack_success') {
                const data = msg.data as { recipient_username: string, treasury_balance: number };
                setClanData(prev => prev ? { ...prev, treasury_balance: data.treasury_balance } : null);
                addLog(`[CLAN] Pack Nouveau financé pour ${data.recipient_username}.`);
                refreshData();
            } else if (msg.type === 'starter_pack_received') {
                const data = msg.data as { sender_username: string, clan_name: string };
                alert(`🎁 Félicitations ! L'agent ${data.sender_username} vous a offert un Pack Nouveau de l'unité ${data.clan_name} ! Vos upgrades initiales ont augmenté de +5 niveaux.`);
                window.location.reload();
            }
        };
        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, [addLog, refreshData]);

    // Local tick for OSINT
    useEffect(() => {
        if (!osintState?.active_hack) return;
        
        const hack = osintState.active_hack;
        if (hack.completed) {
            if (!osintResult) {
                socketManager.send('complete_osint_hack', {});
            }
            return;
        }

        const interval = setInterval(() => {
            setOsintState(prev => {
                if (!prev || !prev.active_hack) return prev;
                const newRemaining = prev.active_hack.remaining_time - 1;
                
                if (Math.random() < 0.2) {
                    const logs = [
                        `Synchronisation des membres...`,
                        `Optimisation du trafic de groupe...`,
                        `Force brute collective en cours...`,
                        `Contournement multi-nœuds...`,
                        `Extraction des métadonnées...`
                    ];
                    addLog(logs[Math.floor(Math.random() * logs.length)]);
                }

                if (newRemaining <= 0) {
                    clearInterval(interval);
                    return { ...prev, active_hack: { ...prev.active_hack, remaining_time: 0, completed: true } };
                }
                return { ...prev, active_hack: { ...prev.active_hack, remaining_time: newRemaining } };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [osintState?.active_hack, addLog, osintResult]);

    // Scroll terminal
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalLines]);

    const fetchPublicClans = async () => {
        try {
            const res = await fetch('/api/clan/');
            const data = await res.json();
            setPublicClans(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error fetching public clans", e);
        }
    };

    const fetchMyInvites = async () => {
        try {
            const res = await api.get('/clan/invites/me');
            setInvites(res.data);
        } catch (e) {
            console.error("Error fetching invites", e);
        }
    };

    const fetchClanDetails = async (clanId: string) => {
        try {
            const [clanRes, membersRes, votesRes, perksRes] = await Promise.all([
                fetch(`/api/clan/${clanId}`),
                fetch(`/api/clan/${clanId}/members`),
                fetch(`/api/clan/${clanId}/votes`),
                api.get('/clan/perks')
            ]);
            
            const [clan, membersData, votesData] = await Promise.all([
                clanRes.json(),
                membersRes.json(),
                votesRes.json()
            ]);
            
            setClanData(clan);
            setMembers(membersData);
            setVotes(votesData);
            setPerks(perksRes.data);
        } catch (e) {
            console.error("Error fetching clan details", e);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgradePerk = async (perkId: string) => {
        try {
            const res = await api.post('/clan/perks/upgrade', { perk_id: perkId });
            if (res.data.success) {
                refreshData();
            }
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors de l'amélioration");
        }
    };

    const handleBuyStarterPack = async (recipientId: string, recipientName: string) => {
        if (!window.confirm(`Voulez-vous financer un Pack Nouveau (5B 🍌 de la trésorerie) pour aider ${recipientName} à rattraper le niveau ?`)) {
            return;
        }
        try {
            const res = await api.post('/clan/starter-pack', { recipient_id: recipientId });
            if (res.data.success) {
                alert(`Succès : Un Pack Nouveau a été financé pour ${recipientName} !`);
                refreshData();
            }
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors de l'achat du pack");
        }
    };

    const openDividendsModal = async () => {
        setDividendsModalOpen(true);
        try {
            const res = await api.get('/clan/transactions');
            setTransactions(res.data);
        } catch (e) {
            console.error("Error fetching transactions", e);
        }
    };

    const handleCreateClan = async () => {
        if (!newName || newName.length < 3) return;
        try {
            await api.post('/clan/create', { name: newName, description: newDesc });
            window.location.reload();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors de la création");
        }
    };

    const handleDeposit = async () => {
        if (depositAmount <= 0) return;
        try {
            await api.post('/clan/deposit', { amount: depositAmount });
            setDepositAmount(0);
            refreshData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors du dépôt");
        }
    };

    const handleSetTax = async (rate: number) => {
        try {
            await api.post('/clan/tax/set', { tax_rate: rate });
            socketManager.send('sync', { pendingClicks: 0 });
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors du paramétrage de la taxe");
        }
    };

    const handlePlayRoulette = () => {
        setRouletteOutcome(null);
        socketManager.send('play_ape_roulette', {});
    };

    const handleVote = async (voteId: number, choice: boolean) => {
        try {
            await api.post('/clan/vote/cast', { vote_id: voteId, choice });
            refreshData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors du vote");
        }
    };

    const handleCancelVote = async (voteId: number) => {
        try {
            await api.post(`/clan/vote/cancel/${voteId}`);
            refreshData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors de l'annulation");
        }
    };

    const startVote = async (type: string, target?: string) => {
        try {
            await api.post('/clan/vote/start', { vote_type: type, target_id: target });
            refreshData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors du lancement du vote");
        }
    };

    const handleJoin = async (clanId: string) => {
        try {
            await api.post('/clan/join', { clan_id: clanId });
            window.location.reload();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors de l'adhésion");
        }
    };

    const handleInvite = async () => {
        if (!inviteUsername) return;
        try {
            await api.post('/clan/invite', { invitee_username: inviteUsername });
            alert("Invitation envoyée !");
            setInviteUsername('');
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors de l'invitation");
        }
    };

    const handleRespondInvite = async (inviteId: number, accept: boolean) => {
        try {
            await api.post(`/clan/invites/${inviteId}/respond`, { accept });
            if (accept) {
                window.location.reload();
            } else {
                fetchMyInvites();
            }
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors de la réponse");
        }
    };

    const handleLeave = async () => {
        if (!confirm("Êtes-vous sûr de vouloir quitter le clan ?")) return;
        try {
            await api.post('/clan/leave');
            window.location.reload();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors du départ");
        }
    };

    const handleExecuteTransfer = async () => {
        if (!selectedTransferRecipient || transferAmount <= 0) return;
        try {
            await api.post('/clan/transfer', { 
                recipient_id: selectedTransferRecipient.user_id, 
                amount: transferAmount 
            });
            socketManager.send('sync', { pendingClicks: 0 });
            setTransferModalOpen(false);
            setTransferAmount(0);
            refreshData();
        } catch (e: unknown) {
            const err = e as { response?: { data?: { detail?: string } } };
            alert(err.response?.data?.detail || "Erreur lors du transfert");
        }
    };

    // OSINT Actions
    const handleOsintScan = () => {
        addLog("Lancement du scanner réseau de l'unité...");
        socketManager.send('scan_osint_network', {});
    };

    const handleOsintHack = (targetId: string, ip: string) => {
        addLog(`Ciblage de l'IP : ${ip}`);
        addLog("Déploiement des outils d'infiltration de groupe...");
        socketManager.send('start_osint_hack', { target_id: targetId });
    };

    const handleHelpOsint = () => {
        addLog("Injection de puissance de calcul supplémentaire...");
        socketManager.send('help_osint_hack', {});
    };

    const handleCancelOsint = () => {
        addLog("Abandon de l'opération...");
        socketManager.send('cancel_osint_hack', {});
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-banan-primary font-mono animate-pulse">SYNCHRONISATION DU RÉSEAU DES CLANS...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto">
            {/* Page Header */}
            <div className="p-8 border-b border-white/10 bg-banan-primary/5 text-center relative overflow-hidden">
                <Shield className="h-32 w-32 text-banan-primary/10 absolute -top-8 -right-8 rotate-12" />
                <Landmark className="h-24 w-24 text-banan-primary/10 absolute -bottom-4 -left-4 -rotate-12" />
                
                <h1 className="text-4xl font-black text-banan-primary uppercase tracking-tighter mb-4 flex items-center justify-center gap-4">
                    <Shield className="h-8 w-8" />
                    {gameState.clan_id ? clanData?.name : "SIÈGE SOCIAL DES CLANS"}
                    <Shield className="h-8 w-8" />
                </h1>
                <p className="text-sm font-mono text-white/50 max-w-xl mx-auto uppercase leading-relaxed">
                    {gameState.clan_id 
                        ? clanData?.description || "Unité de production de bananes hautement coordonnée."
                        : "Unissez vos forces. Gérez votre trésorerie, votez pour l'avenir de votre unité, et lancez des opérations OSINT coordonnées pour dominer le réseau."
                    }
                </p>
                
                {isRefreshing && <div className="absolute top-2 right-2 text-[10px] font-mono text-banan-primary animate-pulse">REFRESHING...</div>}
            </div>

            <div className="flex-1 p-8 space-y-12">
                {!gameState.clan_id ? (
                    <div className="max-w-6xl mx-auto space-y-12">
                        {/* Invites */}
                        {invites.length > 0 && (
                            <GameSection title="INVITATIONS REÇUES" icon={UserPlus}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {invites.map(invite => (
                                        <div key={invite.id} className="p-4 border border-banan-primary bg-banan-primary/5 flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-bold text-white uppercase">Clan: {invite.clan_name}</div>
                                                <div className="text-[10px] font-mono text-banan-primary">Invité par: {invite.inviter_username}</div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleRespondInvite(invite.id, true)}
                                                    className="px-4 py-1 bg-banan-primary text-black text-[10px] font-bold uppercase hover:bg-white"
                                                >
                                                    ACCEPTER
                                                </button>
                                                <button 
                                                    onClick={() => handleRespondInvite(invite.id, false)}
                                                    className="px-4 py-1 border border-white/10 text-white/50 text-[10px] font-bold uppercase hover:text-white"
                                                >
                                                    REFUSER
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </GameSection>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* List of Clans */}
                        <GameSection title="RÉSEAUX DISPONIBLES" icon={Users}>
                            <div className="space-y-4">
                                {publicClans.length === 0 ? (
                                    <div className="p-8 border border-white/5 bg-white/5 text-center font-mono text-white/30">
                                        AUCUN CLAN ACTIF DÉTECTÉ
                                    </div>
                                ) : (
                                    publicClans.map((clan) => (
                                        <div key={clan.id} className="p-4 border border-white/10 bg-white/5 flex items-center justify-between group hover:border-banan-primary transition-colors">
                                            <div>
                                                <h3 className="text-lg font-bold text-white uppercase">{clan.name}</h3>
                                                <p className="text-xs font-mono text-white/50">{clan.description || 'Pas de description.'}</p>
                                                <div className="flex gap-4 mt-2 text-[10px] font-mono text-banan-primary">
                                                    <span>TRÉSOR: {formatNumber(clan.treasury_balance)} 🍌</span>
                                                    <span>POLITIQUE: {clan.privacy}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleJoin(clan.id)}
                                                className="px-4 py-2 border border-banan-primary text-banan-primary text-xs font-bold hover:bg-banan-primary hover:text-black transition-colors flex items-center gap-2"
                                            >
                                                <UserPlus className="h-3 w-3" /> REJOINDRE
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </GameSection>

                        {/* Create Clan Form */}
                        <GameSection title="FONDER UNE UNITÉ" icon={Plus}>
                            <div className="p-6 border border-banan-primary/20 bg-banan-primary/5 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Nom du Clan</label>
                                    <input 
                                        type="text" 
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value.toUpperCase().replace(/[^A-Z0-9_ ]/g, ''))}
                                        className="w-full bg-black/40 border border-white/10 p-3 text-sm font-mono text-white focus:border-banan-primary outline-none"
                                        placeholder="EX: ALPHA_SQUAD..."
                                        maxLength={20}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Description</label>
                                    <textarea 
                                        value={newDesc}
                                        onChange={(e) => setNewDesc(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 p-3 text-sm font-mono text-white focus:border-banan-primary outline-none h-24"
                                        placeholder="Objectifs de l'unité..."
                                        maxLength={100}
                                    />
                                </div>
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded">
                                    <div className="flex items-center gap-2 text-red-500 text-[10px] font-bold uppercase mb-1">
                                        <Info className="h-3 w-3" /> Coût de Fondation
                                    </div>
                                    <p className="text-xs font-mono text-white/60">
                                        La création d'un clan nécessite un investissement de <span className="text-banan-primary font-bold">1,000,000,000 🍌</span>.
                                    </p>
                                </div>
                                <button 
                                    onClick={handleCreateClan}
                                    disabled={newName.length < 3 || gameState.bananas < 1000000000}
                                    className="w-full bg-banan-primary text-black py-4 font-black uppercase tracking-tighter hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    INITIALISER L'UNITÉ
                                </button>
                            </div>
                        </GameSection>
                    </div>
                </div>
                ) : (
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Clan Dashboard (If in clan) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            
                            {/* Treasury Card */}
                            <GameSection title="TRÉSORERIE" icon={Landmark}>
                                <div className="p-6 bg-white/5 border border-white/10 text-center space-y-4 h-full flex flex-col justify-between">
                                    <div>
                                        <div className="text-4xl font-black text-banan-primary font-sans">
                                            {formatNumber(clanData?.treasury_balance || 0)} <Banana className="inline h-8 w-8 -mt-1" />
                                        </div>
                                        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Capital de l'Unité</p>
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <input 
                                                type="number"
                                                value={depositAmount || ''}
                                                onChange={(e) => setDepositAmount(parseInt(e.target.value) || 0)}
                                                placeholder="Quantité..."
                                                className="flex-1 bg-black/40 border border-white/10 p-2 text-xs font-mono text-white focus:border-banan-primary outline-none"
                                            />
                                            <button 
                                                onClick={handleDeposit}
                                                className="px-4 py-2 bg-banan-primary text-black text-[10px] font-bold uppercase hover:bg-white transition-colors"
                                            >
                                                DÉPOSER
                                            </button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={openDividendsModal}
                                                className="flex-1 p-2 border border-white/10 text-white/50 text-[10px] font-bold uppercase hover:border-white hover:text-white transition-colors flex items-center justify-center gap-2"
                                            >
                                                <TrendingUp className="h-3 w-3" /> DIVIDENDES (1%/JOUR)
                                            </button>
                                        </div>

                                        {/* Multiplicateur de Groupe */}
                                        <div className="border-t border-white/5 pt-4 space-y-2 text-left">
                                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex justify-between">
                                                <span>MULTIPLICATEUR COLLECTIF</span>
                                                <span className="text-banan-primary font-bold">+{getGroupMultiplier(clanData?.treasury_balance || 0)}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-black border border-white/5 relative overflow-hidden">
                                                {(() => {
                                                    const bal = clanData?.treasury_balance || 0;
                                                    const next = getNextTier(bal);
                                                    if (!next) return <div className="absolute top-0 left-0 h-full bg-banan-primary w-full" />;
                                                    const prevTarget = bal < 10000000000 ? 0 : 
                                                                       bal < 50000000000 ? 10000000000 : 
                                                                       bal < 250000000000 ? 50000000000 : 
                                                                       bal < 1000000000000 ? 250000000000 : 
                                                                       1000000000000;
                                                    const range = next.target - prevTarget;
                                                    const progress = ((bal - prevTarget) / range) * 100;
                                                    return (
                                                        <div 
                                                            className="absolute top-0 left-0 h-full bg-banan-primary transition-all duration-500" 
                                                            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} 
                                                        />
                                                    );
                                                })()}
                                            </div>
                                            {(() => {
                                                const next = getNextTier(clanData?.treasury_balance || 0);
                                                if (!next) return <p className="text-[8px] font-mono text-banan-primary uppercase">Bonus maximum atteint (+25%)</p>;
                                                const needed = next.target - (clanData?.treasury_balance || 0);
                                                return (
                                                    <div className="flex justify-between text-[8px] font-mono text-white/30 uppercase leading-normal">
                                                        <span>Prochain : +{next.bonus}% ({next.name})</span>
                                                        <span>Besoin: {formatNumber(needed)} 🍌</span>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <div className="border-t border-white/5 pt-4 space-y-2 text-left">
                                            <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider flex justify-between">
                                                <span>TAXE AUTOMATIQUE</span>
                                                <span className="text-banan-primary font-bold">{Math.round((gameState.taxRate ?? 0) * 100)}%</span>
                                            </div>
                                            <p className="text-[8px] font-mono text-white/30 uppercase leading-normal">
                                                Prélève automatiquement vos gains de clics et BPS pour alimenter le trésor.
                                            </p>
                                            <div className="grid grid-cols-5 gap-1 pt-1">
                                                {[0.0, 0.05, 0.10, 0.20, 0.50].map((rate) => {
                                                    const isActive = (gameState.taxRate ?? 0) === rate;
                                                    return (
                                                        <button
                                                            key={rate}
                                                            onClick={() => handleSetTax(rate)}
                                                            className={`py-1 text-[9px] font-mono border font-bold uppercase transition-all ${
                                                                isActive
                                                                    ? 'border-banan-primary bg-banan-primary text-black'
                                                                    : 'border-white/10 text-white/50 hover:border-white hover:text-white'
                                                            }`}
                                                        >
                                                            {rate * 100}%
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </GameSection>

                            {/* Operations / OSINT Terminal */}
                            <GameSection title="TERMINAL OSINT DE GROUPE" icon={Terminal}>
                                <div className="flex flex-col gap-4 h-full min-h-[300px]">
                                    {/* Visual Terminal Window */}
                                    <div className="bg-black/90 border border-banan-osint/30 p-3 rounded-sm font-mono text-[10px] overflow-hidden flex flex-col h-32 relative">
                                        <div ref={terminalRef} className="flex-1 overflow-y-auto space-y-1 text-banan-osint/80 pr-2 custom-scrollbar">
                                            {terminalLines.map((line, i) => (
                                                <div key={i} className="break-all">{line}</div>
                                            ))}
                                            {terminalLines.length === 0 && <div>{`> TERMINAL PRET. ATTENTE DE COMMANDES...`}</div>}
                                        </div>
                                    </div>

                                    {/* Result or Active Hack */}
                                    <div className="flex-1">
                                        <AnimatePresence mode="wait">
                                            {osintResult ? (
                                                <motion.div
                                                    key="result"
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="bg-banan-primary/10 border border-banan-primary p-4 text-center h-full flex flex-col justify-center"
                                                >
                                                    <div className="text-xl font-black text-banan-primary uppercase mb-2">OPÉRATION RÉUSSIE</div>
                                                    <div className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                                        +{formatNumber(osintResult.reward)} <Banana className="h-6 w-6" />
                                                    </div>
                                                    <button onClick={() => setOsintResult(null)} className="mt-4 text-[10px] font-mono text-white/50 hover:text-white uppercase">Fermer</button>
                                                </motion.div>
                                            ) : osintState?.active_hack ? (
                                                <motion.div key="active" className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <div className="text-[10px] font-mono text-banan-primary animate-pulse flex items-center gap-2">
                                                            <Cpu className="h-3 w-3" /> HACKING: {osintState.active_hack.target.corp}
                                                        </div>
                                                        <button onClick={handleCancelOsint} className="text-red-500"><StopCircle className="h-4 w-4" /></button>
                                                    </div>
                                                    <div className="w-full h-2 bg-black border border-white/10 relative overflow-hidden">
                                                        <div 
                                                            className="absolute top-0 left-0 h-full bg-banan-primary transition-all duration-1000 ease-linear"
                                                            style={{ width: `${Math.max(0, Math.min(100, 100 - (osintState.active_hack.remaining_time / osintState.active_hack.total_duration) * 100))}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[9px] font-mono text-white/40">{osintState.active_hack.remaining_time}s restantes</span>
                                                        <button 
                                                            onClick={handleHelpOsint}
                                                            className="px-3 py-1 bg-banan-primary/20 border border-banan-primary text-banan-primary text-[10px] font-bold uppercase hover:bg-banan-primary hover:text-black transition-all flex items-center gap-1"
                                                        >
                                                            <Zap className="h-3 w-3" /> AIDER ({osintState.active_hack.helpers} aides)
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {osintState?.targets.map(t => (
                                                        <div key={t.id} className="p-2 border border-white/5 bg-white/5 flex items-center justify-between hover:border-banan-osint transition-colors group">
                                                            <div>
                                                                <div className="text-[10px] font-mono text-white/80 group-hover:text-banan-osint">{t.ip}</div>
                                                                <div className="text-[8px] font-mono text-white/30 truncate w-32">{t.corp}</div>
                                                            </div>
                                                            <button 
                                                                onClick={() => handleOsintHack(t.id, t.ip)}
                                                                className="px-2 py-1 bg-banan-osint/20 border border-banan-osint text-banan-osint text-[9px] font-bold uppercase hover:bg-banan-osint hover:text-black"
                                                            >
                                                                HACK ({Math.round(t.reward_multiplier * 100)}%)
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button 
                                                        onClick={handleOsintScan}
                                                        className="w-full py-2 border border-dashed border-banan-osint/30 text-banan-osint/50 text-[10px] font-bold uppercase hover:text-banan-osint hover:border-banan-osint"
                                                    >
                                                        SCAN RÉSEAU (100M 🍌)
                                                    </button>
                                                </div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </GameSection>

                            {/* Governance / Votes */}
                            <GameSection title="GOUVERNANCE" icon={Vote}>
                                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                                    {votes.length === 0 ? (
                                        <div className="p-4 border border-white/5 bg-white/5 text-center text-[10px] font-mono text-white/30 uppercase">
                                            Aucun vote en cours
                                        </div>
                                    ) : (
                                        votes.map((vote) => {
                                            const total = vote.yes_votes + vote.no_votes;
                                            const yesPct = total > 0 ? (vote.yes_votes / total) * 100 : 0;
                                            return (
                                                <div key={vote.id} className="p-3 border border-banan-primary/30 bg-banan-primary/5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-[10px] font-bold text-banan-primary uppercase">{vote.vote_type}: {vote.target_id || 'GENERAL'}</span>
                                                        <span className="text-[9px] font-mono text-white/30 italic">OUI: {vote.yes_votes} | NON: {vote.no_votes}</span>
                                                    </div>
                                                    <div className="h-1 bg-white/10 w-full mb-3 overflow-hidden">
                                                        <div className="h-full bg-banan-primary transition-all duration-500" style={{ width: `${yesPct}%` }} />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleVote(vote.id!, true)}
                                                            className="flex-1 py-1 text-[10px] font-bold bg-banan-primary text-black uppercase hover:bg-white"
                                                        >
                                                            POUR
                                                        </button>
                                                        <button 
                                                            onClick={() => handleVote(vote.id!, false)}
                                                            className="flex-1 py-1 text-[10px] font-bold border border-white/10 text-white/50 uppercase hover:text-white"
                                                        >
                                                            CONTRE
                                                        </button>
                                                        {vote.initiator_id === gameState.userId && (
                                                            <button 
                                                                onClick={() => handleCancelVote(vote.id!)}
                                                                className="px-2 py-1 border border-white/10 text-white/30 text-[10px] font-bold uppercase hover:border-white hover:text-white transition-all"
                                                                title="Annuler le vote"
                                                            >
                                                                ✕
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    <div className="space-y-2 pt-4 border-t border-white/5">
                                        <div className="text-[9px] font-mono text-white/30 uppercase mb-2">Changer la Politique (Vote)</div>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['OPEN', 'INVITE', 'PRIVATE'].map(p => (
                                                <button 
                                                    key={p}
                                                    onClick={() => startVote('POLICY', p)}
                                                    className="py-1 text-[8px] font-bold border border-white/10 text-white/50 uppercase hover:border-banan-primary hover:text-banan-primary transition-all"
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 mt-4">
                                        <button 
                                            onClick={handleLeave}
                                            className="w-full py-2 border border-dashed border-red-500/20 text-red-500/30 text-[10px] font-bold uppercase hover:text-red-500 hover:border-red-500 transition-all"
                                        >
                                            + QUITTER LE CLAN
                                        </button>
                                    </div>
                                </div>
                            </GameSection>

                            {/* Ape Roulette Machine */}
                            <GameSection title="L'APE ROULETTE" icon={Skull}>
                                <div className="p-4 bg-white/5 border border-white/10 h-full flex flex-col justify-between space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-mono text-white/50 uppercase leading-relaxed">
                                            Contient 6 chambres. 5 saines (Gagnez 30M 🍌), 1 pourrie (SUIE + CLICS 0 pendant 5m). Le barillet est partagé par le clan !
                                        </p>
                                        <div className="bg-black/40 border border-white/5 p-3 rounded text-center space-y-1">
                                            <div className="text-[10px] font-mono text-white/40 uppercase">Chambres restantes</div>
                                            <div className="text-2xl font-black text-banan-primary">
                                                {rouletteState?.remaining_chambers !== undefined ? rouletteState.remaining_chambers : 6} / 6
                                            </div>
                                            <div className="text-[9px] font-mono text-red-500 uppercase font-bold">
                                                Risque d'explosion : {rouletteState?.dud_chance !== undefined ? rouletteState.dud_chance : '16.7'}%
                                            </div>
                                        </div>
                                    </div>

                                    {/* Chambers Indicator */}
                                    <div className="flex justify-center gap-1.5 my-2">
                                        {Array.from({ length: 6 }).map((_, i) => {
                                            const remaining = rouletteState?.remaining_chambers ?? 6;
                                            const isSpent = i >= remaining;
                                            return (
                                                <div 
                                                    key={i} 
                                                    className={`h-4 w-4 rounded-full border transition-all duration-300 ${
                                                        isSpent 
                                                            ? 'bg-black/80 border-white/10' 
                                                            : 'bg-banan-primary border-banan-primary shadow-[0_0_5px_rgba(253,224,71,0.5)] animate-pulse'
                                                    }`} 
                                                />
                                            );
                                        })}
                                    </div>

                                    {/* Action Area */}
                                    <div className="space-y-3">
                                        <AnimatePresence mode="wait">
                                            {gameState.isSooty ? (
                                                <div className="p-3 border border-purple-600/40 bg-purple-900/10 text-center space-y-1">
                                                    <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center justify-center gap-1.5 animate-pulse">
                                                        <Skull className="h-3 w-3" /> COUVERT DE SUIE <Skull className="h-3 w-3" />
                                                    </div>
                                                    <p className="text-[9px] font-mono text-purple-300/60 uppercase">
                                                        Clicks inactifs : {gameState.sootRemaining}s
                                                    </p>
                                                </div>
                                            ) : rouletteOutcome ? (
                                                <motion.div 
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className={`p-3 border text-center font-mono text-[10px] uppercase ${
                                                        rouletteOutcome.outcome === 'SAFE' 
                                                            ? 'border-green-500/40 bg-green-950/20 text-green-400' 
                                                            : 'border-red-500/40 bg-red-950/20 text-red-400'
                                                    }`}
                                                >
                                                    <div>
                                                        {rouletteOutcome.outcome === 'SAFE' 
                                                            ? `SAIN ! +${formatNumber(rouletteOutcome.payout)} 🍌` 
                                                            : 'EXPLOSION ! COUVERT DE SUIE'}
                                                    </div>
                                                    <button 
                                                        onClick={() => setRouletteOutcome(null)}
                                                        className="mt-2 text-[8px] underline text-white/50 hover:text-white"
                                                    >
                                                        Fermer
                                                    </button>
                                                </motion.div>
                                            ) : null}
                                        </AnimatePresence>

                                        <button 
                                            onClick={handlePlayRoulette}
                                            disabled={rouletteSpinning || gameState.bananas < 10000000 || !!gameState.isSooty}
                                            className="w-full py-3 bg-banan-primary text-black font-black uppercase text-xs hover:bg-white tracking-widest transition-all disabled:opacity-30 disabled:hover:bg-banan-primary"
                                        >
                                            {rouletteSpinning ? 'EN ROTATION...' : 'PRESSER LA DETENTE (10M 🍌)'}
                                        </button>
                                    </div>
                                </div>
                            </GameSection>

                            {/* Skills Tree / Perks */}
                            <GameSection title="COMPÉTENCES DE L'UNITÉ" icon={Cpu}>
                                <div className="p-4 bg-white/5 border border-white/10 space-y-4 h-full flex flex-col justify-between font-mono text-xs">
                                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2 font-mono">
                                        Améliorations collectives financées par la trésorerie.
                                    </p>
                                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-1 custom-scrollbar">
                                        {perks && perks.map((perk) => {
                                            const isMax = perk.level >= perk.max_level;
                                            const canAfford = clanData && perk.cost !== null && clanData.treasury_balance >= perk.cost;
                                            
                                            // Format current and next effects
                                            let currentEffect = "0%";
                                            let nextEffect = "0%";
                                            if (perk.id === 'turbo_murissement') {
                                                currentEffect = `-${perk.level * 5}%`;
                                                nextEffect = `-${(perk.level + 1) * 5}%`;
                                            } else if (perk.id === 'bouclier_cyber') {
                                                currentEffect = `-${perk.level * 10}%`;
                                                nextEffect = `-${(perk.level + 1) * 10}%`;
                                            } else if (perk.id === 'extracteur_potassium') {
                                                currentEffect = `+${perk.level * 3}%`;
                                                nextEffect = `+${(perk.level + 1) * 3}%`;
                                            }

                                            return (
                                                <div key={perk.id} className="border border-white/5 bg-black/35 p-3 rounded-sm space-y-2 hover:border-white/10 transition-colors">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="text-xs font-bold uppercase text-banan-primary tracking-tight font-sans">
                                                                {perk.name}
                                                            </h4>
                                                            <p className="text-[9px] text-white/50 leading-relaxed mt-1 font-mono">
                                                                {perk.description}
                                                            </p>
                                                        </div>
                                                        <span className="text-[10px] text-white/80 font-bold bg-white/10 px-1.5 py-0.5 rounded-sm">
                                                            Lvl {perk.level}/{perk.max_level}
                                                        </span>
                                                    </div>

                                                    {/* Level blocks indicator */}
                                                    <div className="flex gap-1 py-1">
                                                        {Array.from({ length: perk.max_level }).map((_, i) => (
                                                            <div 
                                                                key={i} 
                                                                className={`h-1.5 flex-1 rounded-sm border ${
                                                                    i < perk.level 
                                                                        ? 'bg-banan-primary border-banan-primary shadow-[0_0_4px_rgba(250,255,0,0.4)]' 
                                                                        : 'border-white/10 bg-transparent'
                                                                }`}
                                                            />
                                                        ))}
                                                    </div>

                                                    <div className="flex justify-between items-center text-[10px] mt-1 pt-1 border-t border-white/5 font-mono">
                                                        <div>
                                                            <span className="text-white/40">EFFET : </span>
                                                            <span className="text-white font-bold">{currentEffect}</span>
                                                            {!isMax && (
                                                                <>
                                                                    <span className="text-white/40"> → </span>
                                                                    <span className="text-banan-primary font-bold">{nextEffect}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        
                                                        {!isMax && perk.cost !== null ? (
                                                            <button
                                                                onClick={() => handleUpgradePerk(perk.id)}
                                                                disabled={!canAfford}
                                                                className={`px-3 py-1 font-black uppercase text-[9px] tracking-wider transition-all rounded-sm border ${
                                                                    canAfford 
                                                                        ? 'bg-banan-primary text-black border-banan-primary hover:bg-white hover:border-white cursor-pointer' 
                                                                        : 'text-red-500 border-red-500/20 bg-red-500/5 opacity-55 cursor-not-allowed'
                                                                }`}
                                                            >
                                                                AMÉLIORER ({formatNumber(perk.cost)})
                                                            </button>
                                                        ) : (
                                                            <span className="text-banan-primary font-black uppercase tracking-widest text-[9px] py-1 px-3 bg-banan-primary/10 border border-banan-primary/20 rounded-sm">
                                                                MAXIMUM
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </GameSection>
                        </div>

                        {/* Member List */}
                        <GameSection title="LISTE DES EFFECTIFS" icon={Users}>
                            {/* Tableau d'Honneur (Top 3 Donateurs) */}
                            {members.length > 0 && (
                                <div className="mb-6 border border-banan-primary/20 bg-banan-primary/5 p-4 rounded-sm">
                                    <div className="text-[10px] font-mono text-banan-primary uppercase font-bold tracking-widest mb-3 flex items-center gap-1.5">
                                        🥇 TABLEAU D'HONNEUR (TOP DONATEURS)
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {members.slice(0, 3).map((m, idx) => {
                                            const titles = [
                                                "🥇 Mécène Bananier",
                                                "🥈 Grand Donateur",
                                                "🥉 Singe Solidaire"
                                            ];
                                            return (
                                                <div key={m.user_id} className="p-3 border border-white/10 bg-black/40 flex flex-col justify-between space-y-2">
                                                    <div>
                                                        <div className="text-[9px] font-mono text-banan-primary font-bold uppercase">{titles[idx]}</div>
                                                        <div className="text-sm font-black uppercase text-white truncate">{m.username}</div>
                                                    </div>
                                                    <div className="text-[10px] font-mono text-white/50">
                                                        DONNÉ : <span className="text-banan-primary font-sans font-bold">{formatNumber(m.total_donated)} 🍌</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {members.map((m, idx) => (
                                    <div key={m.user_id} className="p-4 border border-white/10 bg-white/5 flex items-center justify-between group hover:border-banan-primary transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 bg-white/10 flex items-center justify-center font-black text-xs text-white/50 group-hover:text-banan-primary transition-colors">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-white uppercase">{m.username} {m.user_id === gameState.userId && <span className="text-[10px] text-banan-primary opacity-50">(VOUS)</span>}</div>
                                                <div className="text-[10px] font-mono text-banan-primary">DON: {formatNumber(m.total_donated)} 🍌</div>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {m.user_id !== gameState.userId && (
                                                <>
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedTransferRecipient(m);
                                                            setTransferModalOpen(true);
                                                        }}
                                                        title="Transférer des Bananes (Prêt)"
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-banan-primary hover:bg-banan-primary/10 transition-all rounded animate-pulse"
                                                    >
                                                        <Send className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleBuyStarterPack(m.user_id, m.username)}
                                                        title="Acheter un Pack Nouveau (5B 🍌)"
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-banan-primary hover:bg-banan-primary/10 transition-all rounded"
                                                    >
                                                        <Gift className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => startVote('KICK', m.user_id)}
                                                        title="Lancer un vote d'expulsion"
                                                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-500/10 transition-all rounded"
                                                    >
                                                        <LogOut className="h-4 w-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GameSection>

                        {/* Invite Member */}
                        <GameSection title="INVITER UN AGENT" icon={UserPlus}>
                            <div className="p-6 border border-white/10 bg-white/5 space-y-4">
                                <div className="flex gap-2">
                                    <input 
                                        type="text" 
                                        value={inviteUsername}
                                        onChange={(e) => setInviteUsername(e.target.value)}
                                        className="flex-1 bg-black/40 border border-white/10 p-3 text-sm font-mono text-white focus:border-banan-primary outline-none"
                                        placeholder="Nom d'utilisateur de l'agent..."
                                    />
                                    <button 
                                        onClick={handleInvite}
                                        disabled={!inviteUsername}
                                        className="px-6 bg-banan-primary text-black font-bold uppercase text-xs hover:bg-white transition-colors disabled:opacity-50"
                                    >
                                        ENVOYER INVITATION
                                    </button>
                                </div>
                                <p className="text-[10px] font-mono text-white/30 uppercase italic">
                                    Note: L'agent doit exister dans le réseau global pour recevoir une invitation.
                                </p>
                            </div>
                        </GameSection>
                    </div>
                )}
            </div>

            {/* Banana Transfer Modal */}
            <AnimatePresence>
                {transferModalOpen && selectedTransferRecipient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0B0B0B] border border-banan-primary p-6 max-w-md w-full space-y-6"
                        >
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <h3 className="text-lg font-black text-banan-primary uppercase tracking-tighter flex items-center gap-2">
                                    <Send className="h-5 w-5" />
                                    TRANSFÉRER DES BANANES (PRÊT)
                                </h3>
                                <button 
                                    onClick={() => {
                                        setTransferModalOpen(false);
                                        setTransferAmount(0);
                                    }}
                                    className="text-white/50 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            <div className="space-y-4">
                                <p className="text-xs font-mono text-white/50 uppercase leading-relaxed">
                                    Envoyer des ressources de votre solde personnel directement à : <span className="text-white font-bold">{selectedTransferRecipient.username}</span>.
                                </p>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-white/50 uppercase tracking-widest">Montant à Transférer</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            value={transferAmount || ''}
                                            onChange={(e) => setTransferAmount(Math.max(0, parseInt(e.target.value) || 0))}
                                            className="w-full bg-black/40 border border-white/10 p-3 pr-12 text-sm font-mono text-white focus:border-banan-primary outline-none"
                                            placeholder="Montant..."
                                        />
                                        <span className="absolute right-3 top-3.5 text-xs font-mono text-banan-primary">🍌</span>
                                    </div>
                                    <div className="flex justify-between text-[9px] font-mono text-white/30 uppercase">
                                        <span>Votre solde : {formatNumber(gameState.bananas)} 🍌</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-4">
                                <button 
                                    onClick={handleExecuteTransfer}
                                    disabled={transferAmount <= 0 || transferAmount > gameState.bananas}
                                    className="flex-1 bg-banan-primary text-black py-3 font-bold uppercase text-xs hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    SÉCURISER LE TRANSFERT
                                </button>
                                <button 
                                    onClick={() => {
                                        setTransferModalOpen(false);
                                        setTransferAmount(0);
                                    }}
                                    className="px-4 border border-white/10 text-white/50 uppercase text-xs hover:text-white hover:border-white transition-colors"
                                >
                                    ANNULER
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Dividends & Transactions Modal */}
            <AnimatePresence>
                {dividendsModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#0B0B0B] border border-banan-primary p-6 max-w-lg w-full space-y-6 max-h-[85vh] flex flex-col justify-between"
                        >
                            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                                <h3 className="text-lg font-black text-banan-primary uppercase tracking-tighter flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    DIVIDENDES & TRANSACTIONS
                                </h3>
                                <button 
                                    onClick={() => setDividendsModalOpen(false)}
                                    className="text-white/50 hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                            
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 border border-white/10 bg-black/40 p-4 font-mono text-[10px]">
                                <div className="space-y-1">
                                    <p className="text-white/40 uppercase">Trésor Total</p>
                                    <p className="text-xs font-bold text-white">
                                        {formatNumber(clanData?.treasury_balance || 0)} 🍌
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-white/40 uppercase">Intérêt Quotidien (1%)</p>
                                    <p className="text-xs font-bold text-banan-primary">
                                        +{formatNumber(Math.floor((clanData?.treasury_balance || 0) * 0.01))} 🍌
                                    </p>
                                </div>
                                <div className="space-y-1 pt-2 border-t border-white/10">
                                    <p className="text-white/40 uppercase">Votre Part de Dons</p>
                                    <p className="text-xs font-bold text-white">
                                        {(() => {
                                            const totalDonated = members.reduce((acc, m) => acc + m.total_donated, 0);
                                            const me = members.find(m => m.user_id === gameState.userId);
                                            return totalDonated > 0 ? `${((me?.total_donated || 0) / totalDonated * 100).toFixed(2)}%` : '0.00%';
                                        })()}
                                    </p>
                                </div>
                                <div className="space-y-1 pt-2 border-t border-white/10">
                                    <p className="text-white/40 uppercase">Dividende Estimé / Jour</p>
                                    <p className="text-xs font-bold text-green-500">
                                        +{(() => {
                                            const totalDonated = members.reduce((acc, m) => acc + m.total_donated, 0);
                                            const me = members.find(m => m.user_id === gameState.userId);
                                            const totalInterest = Math.floor((clanData?.treasury_balance || 0) * 0.01);
                                            if (totalDonated > 0) {
                                                return formatNumber(Math.floor(totalInterest * ((me?.total_donated || 0) / totalDonated)));
                                            } else {
                                                return members.length > 0 ? formatNumber(Math.floor(totalInterest / members.length)) : '0';
                                            }
                                        })()} 🍌
                                    </p>
                                </div>
                            </div>

                            <div className="text-[9px] font-mono text-white/50 bg-white/5 p-2.5 border border-white/10 leading-relaxed rounded-sm">
                                💡 <span className="text-banan-primary font-bold">FONCTIONNEMENT :</span> Les dividendes de 1% d'intérêt sont calculés et distribués automatiquement toutes les 24 heures à minuit. Votre versement est proportionnel à votre contribution globale au Trésor.
                            </div>

                            {/* Transactions History */}
                            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[150px]">
                                <h4 className="text-[10px] font-mono font-bold uppercase text-white/40 tracking-wider mb-2">
                                    HISTORIQUE DES MOUVEMENTS DE L'UNITÉ
                                </h4>
                                {transactions.length === 0 ? (
                                    <p className="text-[10px] font-mono text-white/30 text-center py-6">Aucune transaction enregistrée.</p>
                                ) : (
                                    transactions.map((tx) => {
                                        const isPositive = ['DEPOSIT', 'OSINT_REWARD', 'DIVIDEND'].includes(tx.type);
                                        let typeLabel = tx.type;
                                        if (tx.type === 'DEPOSIT') typeLabel = 'Dépôt';
                                        if (tx.type === 'DIVIDEND') typeLabel = 'Dividendes';
                                        if (tx.type === 'UPGRADE') typeLabel = 'Perk Acheté';
                                        if (tx.type === 'OSINT_REWARD') typeLabel = 'Opération OSINT';

                                        return (
                                            <div key={tx.id} className="flex justify-between items-center bg-black/20 border border-white/5 p-2 rounded-sm font-mono text-[9px]">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`font-bold px-1 py-0.2 rounded-sm text-[8px] ${
                                                            isPositive ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'
                                                        }`}>
                                                            {typeLabel.toUpperCase()}
                                                        </span>
                                                        <span className="text-white/60">par {tx.username}</span>
                                                    </div>
                                                    <p className="text-white/30 text-[8px]">
                                                        {new Date(tx.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <span className={`text-[10px] font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                                                    {isPositive ? '+' : '-'}{formatNumber(tx.amount)} 🍌
                                                </span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            
                            <button 
                                onClick={() => setDividendsModalOpen(false)}
                                className="w-full border border-white/10 text-white/50 py-3 uppercase text-xs hover:text-white hover:border-white transition-colors"
                            >
                                FERMER
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,255,0,0.05); }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,255,0,0.3); border-radius: 4px; }
            `}</style>
        </div>
    );
}
