import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Banana, Cpu, Globe, Radar, Shield, Skull, StopCircle, Target, Terminal, Zap,
} from 'lucide-react';
import { useGame } from '@app/context/GameContext';
import { api } from '@app/lib/api';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import FloatingIcons from '@app/components/ui/FloatingIcons';
import ConfirmDialog, { type ConfirmRequest } from '@app/components/shared/ConfirmDialog';
import SootBanner from '@app/components/shared/SootBanner';
import { useSootStatus } from '@app/hooks/useSootStatus';
import ClanHeader from './components/ClanHeader';
import Panel from './components/Panel';

/* ------------------------------------------------------------------ types */

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

interface EliteContract {
    contract_key: string;
    name: string;
    description: string;
    goal_type: string;
    goal_amount: number;
    progress?: number;
    reward: number;
    deadline?: string;
    completed?: boolean;
}

interface EliteContractsState {
    active_contract: EliteContract | null;
    available_contracts: EliteContract[];
    error?: string;
}

interface MassHackState {
    status: 'active' | 'success' | 'cooldown';
    target_name: string;
    required_cpu: number;
    current_cpu: number;
    deadline: number;
    top_clans: { clan_id: string; name: string; amount: number }[];
}

interface RouletteState {
    remaining_chambers: number;
    dud_chance: number;
    play_cost?: number;
    safe_payout?: number;
}

const SCAN_COST = 100_000_000;

/* ------------------------------------------------------------------- page */

export default function ClanOpsPage() {
    const { gameState } = useGame();
    const soot = useSootStatus();
    const clanId = gameState.clan_id;

    const [osintState, setOsintState] = useState<OsintState | null>(null);
    const [osintReward, setOsintReward] = useState<number | null>(null);
    const [contracts, setContracts] = useState<EliteContractsState | null>(null);
    const [massHack, setMassHack] = useState<MassHackState | null>(null);
    const [roulette, setRoulette] = useState<RouletteState | null>(null);
    const [cpuInject, setCpuInject] = useState(10_000_000);
    const [terminalLines, setTerminalLines] = useState<string[]>([]);
    const [treasury, setTreasury] = useState<number | null>(null);
    const [confirmRequest, setConfirmRequest] = useState<ConfirmRequest | null>(null);
    const [confirmBusy, setConfirmBusy] = useState(false);
    const terminalRef = useRef<HTMLDivElement>(null);

    const addLog = useCallback((line: string) => {
        setTerminalLines(prev => [...prev.slice(-40), `> ${line}`]);
    }, []);

    // Treasury-funded actions need to show what is left; the socket state does
    // not carry the balance, so it comes over REST.
    const loadTreasury = useCallback(async () => {
        if (!clanId) return;
        try {
            const res = await api.get<{ treasury_balance: number }>(`/clan/${clanId}`);
            setTreasury(res.data?.treasury_balance ?? null);
        } catch {
            setTreasury(null);
        }
    }, [clanId]);

    const requestState = useCallback(() => {
        socketManager.send('get_mass_hack_state', {});
        if (clanId) {
            socketManager.send('get_osint_state', {});
            socketManager.send('get_elite_contracts', {});
            socketManager.send('get_ape_roulette_state', {});
        }
        void loadTreasury();
    }, [clanId, loadTreasury]);

    useEffect(() => {
        // Asking the server for the room's state on mount is what effects are
        // for; the treasury fetch it kicks off resolves asynchronously.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        requestState();
    }, [requestState]);

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

    useEffect(() => {
        const onMessage = (msg: { type: string; data?: unknown; message?: string }) => {
            switch (msg.type) {
                case 'osint_state':
                    setOsintState(msg.data as OsintState);
                    break;
                case 'osint_scan':
                    addLog('[RESEAU] Nouveau scan de clan terminé.');
                    break;
                case 'osint_hack_complete': {
                    const data = msg.data as { reward: number };
                    setOsintReward(data.reward);
                    addLog(`[SUCCES] Opération terminée. +${formatNumber(data.reward)} 🍌 au trésor.`);
                    requestState();
                    break;
                }
                case 'elite_contracts_state':
                    setContracts(msg.data as EliteContractsState);
                    break;
                case 'mass_hack_state':
                    setMassHack(msg.data as MassHackState);
                    break;
                case 'ape_roulette_state':
                    setRoulette(msg.data as RouletteState);
                    break;
                case 'ape_roulette_member_pulled': {
                    const data = msg.data as { username: string; outcome: string };
                    addLog(
                        `[ROULETTE] ${data.username} a tiré : ${data.outcome === 'SAFE' ? 'SAIN 🍌' : 'BOOM 💥'}`
                    );
                    break;
                }
                case 'error':
                    if (msg.message) addLog(`[ERREUR] ${msg.message}`);
                    break;
            }
        };
        socketManager.subscribe(onMessage);
        return () => socketManager.unsubscribe(onMessage);
    }, [addLog, requestState]);

    // Local countdown for the running hack; the server owns the completion.
    useEffect(() => {
        const hack = osintState?.active_hack;
        if (!hack) return;
        if (hack.completed) {
            if (osintReward === null) socketManager.send('complete_osint_hack', {});
            return;
        }

        const interval = setInterval(() => {
            setOsintState(prev => {
                if (!prev?.active_hack) return prev;
                const remaining = prev.active_hack.remaining_time - 1;
                if (remaining <= 0) {
                    return { ...prev, active_hack: { ...prev.active_hack, remaining_time: 0, completed: true } };
                }
                return { ...prev, active_hack: { ...prev.active_hack, remaining_time: remaining } };
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [osintState?.active_hack, osintReward]);

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalLines]);

    /* --------------------------------------------------------------- actions */

    const scanNetwork = () => {
        setConfirmRequest({
            title: 'Scanner le réseau',
            message: "Le scan renouvelle la liste des cibles. Il est facturé à la trésorerie de l'unité, même si aucune cible ne vous plaît.",
            cost: SCAN_COST,
            purse: 'treasury',
            balance: treasury ?? undefined,
            confirmLabel: 'Scanner',
            onConfirm: () => {
                addLog("Lancement du scanner réseau de l'unité...");
                socketManager.send('scan_osint_network', {});
            },
        });
    };

    const startHack = (target: OsintTarget) => {
        setOsintReward(null);
        addLog(`Ciblage de l'IP : ${target.ip}`);
        socketManager.send('start_osint_hack', { target_id: target.id });
    };

    const helpHack = () => {
        addLog('Injection de puissance de calcul supplémentaire...');
        socketManager.send('help_osint_hack', {});
    };

    const cancelHack = () => {
        addLog("Abandon de l'opération...");
        socketManager.send('cancel_osint_hack', {});
    };

    const acceptContract = (key: string) => {
        addLog("Négociation du contrat d'élite...");
        socketManager.send('accept_elite_contract', { contract_key: key });
    };

    const claimContract = () => {
        addLog('Réclamation de la récompense du contrat...');
        socketManager.send('claim_elite_contract', {});
    };

    const injectCpu = () => {
        const amount = cpuInject;
        if (amount <= 0) return;
        setConfirmRequest({
            title: 'Injecter de la puissance CPU',
            message: "Les bananes sortent de votre solde personnel et sont consommées par la cible mondiale. La récompense n'est versée qu'en cas de succès collectif.",
            cost: amount,
            purse: 'personal',
            balance: gameState.bananas,
            confirmLabel: 'Injecter',
            onConfirm: () => {
                addLog(`Injection de ${formatNumber(amount)} 🍌 dans la cible mondiale...`);
                socketManager.send('inject_mass_hack_cpu', { amount });
            },
        });
    };

    /* ----------------------------------------------------------------- views */

    if (!clanId) {
        return (
            <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
                <FloatingIcons icons={[Radar, Shield]} count={12} className="text-banan-osint/[0.05]" />
                <ClanHeader
                    title="Chambre d'opérations"
                    subtitle="Les opérations de groupe sont réservées aux unités constituées."
                    room="ops"
                    showTabs={false}
                />
                <div className="flex-1 flex items-start justify-center p-6 md:p-12 relative z-10">
                    <div className="max-w-md w-full p-8 rounded-2xl border border-white/10 bg-white/5 text-center space-y-4">
                        <Shield className="h-14 w-14 text-banan-primary mx-auto animate-pulse" />
                        <h3 className="text-base font-black uppercase text-white tracking-widest">Clan requis</h3>
                        <p className="text-[11px] font-mono text-white/50 uppercase leading-relaxed">
                            Hacking OSINT, contrats d'élite et Ape Roulette sont des activités coopératives.
                            Rejoignez ou fondez une unité pour y accéder.
                        </p>
                        <Link
                            to="/clan"
                            className="inline-block px-5 py-3 rounded-lg bg-banan-primary text-black font-black uppercase text-xs tracking-widest hover:bg-white transition-colors"
                        >
                            Trouver une unité
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const activeHack = osintState?.active_hack ?? null;
    const activeContract = contracts?.active_contract ?? null;
    const massProgress = massHack
        ? Math.min(100, (massHack.current_cpu / Math.max(1, massHack.required_cpu)) * 100)
        : 0;

    return (
        <div className="flex flex-col h-full bg-black/50 overflow-y-auto relative">
            <FloatingIcons icons={[Radar, Terminal, Target, Skull]} count={16} className="text-banan-osint/[0.05]" />

            <ClanHeader
                title="Chambre d'opérations"
                subtitle="Missions de groupe : infiltration OSINT, contrats d'élite, cible mondiale et barillet partagé."
                room="ops"
                stats={[
                    {
                        label: 'Trésor',
                        value: treasury === null ? '—' : formatNumber(treasury),
                        icon: Banana,
                        accent: 'text-banan-primary',
                    },
                    {
                        label: 'Opération',
                        value: activeHack ? `${activeHack.remaining_time}s` : 'Aucune',
                        accent: activeHack ? 'text-banan-osint' : 'text-white/40',
                    },
                    {
                        label: 'Barillet',
                        value: `${roulette?.remaining_chambers ?? 6}/6`,
                        accent: 'text-purple-300',
                    },
                ]}
            />

            <div className="flex-1 p-4 md:p-10 relative z-10 w-full max-w-7xl mx-auto flex flex-col gap-6 md:gap-8">
                {soot.isSooty && <SootBanner />}

                {/* OSINT ------------------------------------------------------ */}
                <Panel
                    title="Terminal OSINT de groupe"
                    icon={Terminal}
                    accent="green"
                    subtitle="Scannez le réseau, choisissez une cible, et faites contribuer toute l'unité."
                    aside={
                        activeHack ? (
                            <span className="text-[10px] font-mono text-banan-osint animate-pulse uppercase">
                                {activeHack.remaining_time}s
                            </span>
                        ) : null
                    }
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div
                            ref={terminalRef}
                            className="bg-black/80 border border-banan-osint/30 rounded-xl p-3 font-mono text-[10px] text-banan-osint/80 h-56 overflow-y-auto overscroll-contain space-y-1"
                        >
                            <div className="text-white/30 uppercase border-b border-white/5 pb-1 mb-1 font-bold">
                                Flux du terminal
                            </div>
                            {terminalLines.length === 0 ? (
                                <div className="text-white/20 italic">
                                    {'> TERMINAL PRÊT. ATTENTE DE COMMANDES...'}
                                </div>
                            ) : (
                                terminalLines.map((line, i) => (
                                    <div key={i} className="break-all">
                                        {line}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="flex flex-col justify-between gap-3">
                            <AnimatePresence mode="wait">
                                {osintReward !== null ? (
                                    <motion.div
                                        key="reward"
                                        initial={{ opacity: 0, scale: 0.96 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="rounded-xl border border-banan-primary bg-banan-primary/10 p-5 text-center flex-1 flex flex-col justify-center gap-2"
                                    >
                                        <div className="text-lg font-black text-banan-primary uppercase">
                                            Opération réussie
                                        </div>
                                        <div className="text-2xl font-bold text-white flex items-center justify-center gap-2 tabular-nums">
                                            +{formatNumber(osintReward)} <Banana className="h-6 w-6" />
                                        </div>
                                        <button
                                            onClick={() => setOsintReward(null)}
                                            className="text-[10px] font-mono text-white/50 hover:text-white uppercase underline"
                                        >
                                            Fermer
                                        </button>
                                    </motion.div>
                                ) : activeHack ? (
                                    <motion.div
                                        key="active"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="rounded-xl border border-banan-osint/40 bg-banan-osint/5 p-4 space-y-3 flex-1"
                                    >
                                        <div className="flex justify-between items-center gap-2">
                                            <div className="text-[11px] font-mono text-banan-osint animate-pulse flex items-center gap-2 min-w-0">
                                                <Cpu className="h-3.5 w-3.5 shrink-0" />
                                                <span className="truncate">{activeHack.target.corp}</span>
                                            </div>
                                            <button
                                                onClick={cancelHack}
                                                title="Abandonner l'opération"
                                                className="text-red-500 hover:text-red-400 transition-colors"
                                            >
                                                <StopCircle className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <div className="text-[10px] font-mono text-white/40">
                                            {activeHack.target.ip}
                                        </div>
                                        <div className="w-full h-2 bg-black rounded-full border border-white/10 overflow-hidden">
                                            <div
                                                className="h-full bg-banan-osint transition-all duration-1000 ease-linear"
                                                style={{
                                                    width: `${Math.max(
                                                        0,
                                                        Math.min(
                                                            100,
                                                            100 -
                                                                (activeHack.remaining_time /
                                                                    Math.max(1, activeHack.total_duration)) *
                                                                    100
                                                        )
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center gap-2">
                                            <span className="text-[10px] font-mono text-white/40">
                                                {activeHack.remaining_time}s restantes
                                            </span>
                                            <button
                                                onClick={helpHack}
                                                className="px-3 py-1.5 rounded-lg bg-banan-osint/20 border border-banan-osint text-banan-osint text-[10px] font-bold uppercase hover:bg-banan-osint hover:text-black transition-colors flex items-center gap-1.5"
                                            >
                                                <Zap className="h-3 w-3" /> Aider ({activeHack.helpers})
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div key="targets" className="space-y-2 flex-1">
                                        {osintState?.targets?.length ? (
                                            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                                                {osintState.targets.map(t => (
                                                    <div
                                                        key={t.id}
                                                        className="p-2.5 rounded-xl border border-white/10 bg-black/30 flex items-center justify-between gap-2 hover:border-banan-osint/60 transition-colors group"
                                                    >
                                                        <div className="min-w-0">
                                                            <div className="text-[11px] font-mono text-white/80 group-hover:text-banan-osint transition-colors">
                                                                {t.ip}
                                                            </div>
                                                            <div className="text-[9px] font-mono text-white/30 truncate">
                                                                {t.corp} · {t.duration}s
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => startHack(t)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-banan-osint/20 border border-banan-osint text-banan-osint text-[9px] font-bold uppercase hover:bg-banan-osint hover:text-black transition-colors shrink-0"
                                                        >
                                                            Hack ×{t.reward_multiplier.toFixed(1)}
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-6 rounded-xl border border-white/5 bg-black/30 text-center text-[10px] font-mono text-white/30 uppercase">
                                                Aucune cible en mémoire — lancez un scan
                                            </div>
                                        )}
                                    </div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={scanNetwork}
                                disabled={!!activeHack}
                                className="w-full py-2.5 rounded-lg border border-dashed border-banan-osint/40 text-banan-osint/70 text-[10px] font-bold uppercase hover:text-banan-osint hover:border-banan-osint transition-colors disabled:opacity-30"
                            >
                                Scan réseau ({formatNumber(SCAN_COST)} 🍌)
                            </button>
                        </div>
                    </div>
                </Panel>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                    {/* Elite contracts ---------------------------------------- */}
                    <Panel
                        title="Contrats d'élite"
                        icon={Target}
                        subtitle="Objectifs à durée limitée, récompense versée au trésor."
                    >
                        {activeContract ? (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="text-xs font-bold text-banan-primary uppercase">
                                        {activeContract.name}
                                    </div>
                                    <div className="text-[10px] font-mono text-white/40 shrink-0">
                                        +{formatNumber(activeContract.reward)} 🍌
                                    </div>
                                </div>
                                <p className="text-[10px] font-mono text-white/50 leading-relaxed">
                                    {activeContract.description}
                                </p>
                                <div className="w-full h-2.5 bg-black rounded-full border border-white/10 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-banan-primary"
                                        animate={{
                                            width: `${Math.min(
                                                100,
                                                ((activeContract.progress ?? 0) /
                                                    Math.max(1, activeContract.goal_amount)) *
                                                    100
                                            )}%`,
                                        }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-mono text-white/40">
                                    <span className="tabular-nums">
                                        {formatNumber(activeContract.progress ?? 0)} /{' '}
                                        {formatNumber(activeContract.goal_amount)}
                                    </span>
                                    {activeContract.deadline && (
                                        <span>
                                            Échéance : {new Date(activeContract.deadline).toLocaleString()}
                                        </span>
                                    )}
                                </div>
                                {activeContract.completed && (
                                    <button
                                        onClick={claimContract}
                                        className="w-full py-2.5 rounded-lg bg-banan-primary text-black text-[11px] font-black uppercase tracking-widest hover:bg-white transition-colors"
                                    >
                                        Réclamer {formatNumber(activeContract.reward)} 🍌
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {contracts?.available_contracts?.length ? (
                                    contracts.available_contracts.map(c => (
                                        <div
                                            key={c.contract_key}
                                            className="p-3 rounded-xl border border-white/10 bg-black/30 flex items-center justify-between gap-3 hover:border-banan-primary/50 transition-colors group"
                                        >
                                            <div className="min-w-0">
                                                <div className="text-[11px] font-bold text-white/80 uppercase group-hover:text-banan-primary transition-colors truncate">
                                                    {c.name}
                                                </div>
                                                <div className="text-[9px] font-mono text-white/30">
                                                    {c.description} · +{formatNumber(c.reward)} 🍌
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => acceptContract(c.contract_key)}
                                                className="px-3 py-1.5 rounded-lg bg-banan-primary/20 border border-banan-primary text-banan-primary text-[9px] font-bold uppercase hover:bg-banan-primary hover:text-black transition-colors shrink-0"
                                            >
                                                Accepter
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 rounded-xl border border-white/5 bg-black/30 text-center text-[10px] font-mono text-white/30 uppercase">
                                        Aucun contrat disponible
                                    </div>
                                )}
                            </div>
                        )}
                    </Panel>

                    {/* Mass hack ---------------------------------------------- */}
                    <Panel
                        title="Hacking de masse (mondial)"
                        icon={Globe}
                        accent="cyan"
                        subtitle="Tous les clans du réseau visent la même cible."
                        aside={
                            massHack ? (
                                <span
                                    className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${
                                        massHack.status === 'active'
                                            ? 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10'
                                            : 'text-white/40 border-white/10'
                                    }`}
                                >
                                    {massHack.status}
                                </span>
                            ) : null
                        }
                    >
                        {massHack ? (
                            <div className="space-y-3">
                                <div className="text-[11px] font-mono text-cyan-300 uppercase truncate">
                                    Cible : {massHack.target_name}
                                </div>
                                <div className="w-full h-3 bg-black rounded-full border border-white/10 overflow-hidden">
                                    <motion.div
                                        className="h-full bg-cyan-400"
                                        animate={{ width: `${massProgress}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[9px] font-mono text-white/40">
                                    <span className="tabular-nums">
                                        {formatNumber(massHack.current_cpu)} / {formatNumber(massHack.required_cpu)} CPU
                                    </span>
                                    <span>
                                        Échéance : {new Date(massHack.deadline * 1000).toLocaleDateString()}
                                    </span>
                                </div>

                                {massHack.status === 'active' && (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={cpuInject || ''}
                                            onChange={e => setCpuInject(Math.max(0, parseInt(e.target.value, 10) || 0))}
                                            className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg text-white text-[11px] font-mono px-2.5 py-2 focus:border-cyan-400 outline-none"
                                        />
                                        <button
                                            onClick={injectCpu}
                                            disabled={cpuInject <= 0 || cpuInject > gameState.bananas}
                                            className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[9px] font-bold uppercase hover:bg-cyan-400 hover:text-black transition-colors flex items-center gap-1.5 disabled:opacity-40 shrink-0"
                                        >
                                            <Cpu className="h-3 w-3" /> Injecter
                                        </button>
                                    </div>
                                )}

                                {massHack.top_clans.length > 0 && (
                                    <div className="space-y-1 pt-2 border-t border-white/5">
                                        {massHack.top_clans.slice(0, 5).map((c, i) => (
                                            <div
                                                key={c.clan_id}
                                                className="flex items-center justify-between text-[9px] font-mono text-white/50"
                                            >
                                                <span className="truncate">
                                                    #{i + 1} {c.name}
                                                </span>
                                                <span className="tabular-nums shrink-0">
                                                    {formatNumber(c.amount)} 🍌
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-[10px] font-mono text-white/30 uppercase animate-pulse">
                                Chargement de la cible mondiale...
                            </div>
                        )}
                    </Panel>
                </div>

                {/* Ape Roulette ------------------------------------------------ */}
                <Panel
                    title="Ape Roulette"
                    icon={Skull}
                    accent="purple"
                    subtitle="Barillet partagé par toute l'unité — la table vit au Casino Potassium."
                    aside={
                        <span className="text-[10px] font-mono text-purple-300">
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
            </div>

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
        </div>
    );
}
