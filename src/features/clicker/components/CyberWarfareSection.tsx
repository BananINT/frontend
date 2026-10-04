import { useState, useEffect, useRef } from 'react';
import { 
    Shield, Crosshair, Skull, Banana, AlertTriangle, Fingerprint, 
    Zap, Cpu, Key, ShieldAlert, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GameSection from '@app/components/shared/GameSection';
import { socketManager } from '@app/lib/socket';
import { formatNumber } from '@app/utils/format';
import { useGame } from '@app/context/GameContext';
import type { CyberState, AttackConfig, CorpNode } from '@app/types/game';

interface Props {
    retaliationTarget?: { id: string; name: string } | null;
    onClearRetaliation?: () => void;
}

const DEFAULT_ATTACKS: Record<string, AttackConfig> = {
    brute_force: { name: "Brute-Force Potassium", cost: 10000, success_rate: 0.70, steal_pct: 0.05, bypass: 0.0 },
    trojan: { name: "Cheval de Troie Télécom", cost: 50000, success_rate: 0.85, steal_pct: 0.15, bypass: 0.40 },
    zeroday: { name: "Exploit Zero-Day TorBanana", cost: 250000, success_rate: 0.95, steal_pct: 0.25, bypass: 0.75 }
};

const DEFAULT_CORP_NODES: CorpNode[] = [
    { id: "banque_potassium", name: "Banque Centrale du Potassium", difficulty: 2, base_reward: 85000, ip: "10.42.0.1" },
    { id: "telecom_datacenter", name: "Datacenter Télécom SudParis", difficulty: 4, base_reward: 380000, ip: "157.159.22.10" },
    { id: "satellite_intv", name: "Satellite Orbital INTv", difficulty: 5, base_reward: 1250000, ip: "203.0.113.88" }
];

export default function CyberWarfareSection({ retaliationTarget, onClearRetaliation }: Props) {
    const { gameState } = useGame();
    const [state, setState] = useState<CyberState | null>(null);
    const [raidAlert, setRaidAlert] = useState<number | null>(null);
    const [attackTab, setAttackTab] = useState<'pvp' | 'pve'>('pve');
    const [selectedTargetId, setSelectedTargetId] = useState<string>('banque_potassium');
    const [selectedAttack, setSelectedAttack] = useState<string>('brute_force');
    const [isAttacking, setIsAttacking] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([
        '> Terminal Cyber-Guerre BananINT v3.2 initialisé.',
        '> Nœuds de réseau synchronisés. Prêt pour les opérations offensives.'
    ]);
    const terminalRef = useRef<HTMLDivElement>(null);
    const [prevRetaliationId, setPrevRetaliationId] = useState<string | null>(null);

    // Adjust state during render when retaliation target changes
    if (retaliationTarget && retaliationTarget.id !== prevRetaliationId) {
        setPrevRetaliationId(retaliationTarget.id);
        setAttackTab('pvp');
        setSelectedTargetId(retaliationTarget.id);
    }

    const addLog = (line: string) => {
        setTerminalLogs(prev => [...prev.slice(-18), `> ${line}`]);
    };

    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [terminalLogs]);

    useEffect(() => {
        socketManager.send('get_cyber_state', {});
    }, []);

    useEffect(() => {
        const handleMessage = (msg: { type: string; data: unknown }) => {
            if (msg.type === 'cyber_state') {
                setState(msg.data as CyberState);
            } else if (msg.type === 'darknet_result') {
                const data = msg.data as { raid: boolean; loss: number; item_id?: string };
                if (data.raid) {
                    setRaidAlert(data.loss);
                    addLog(`[POLICE] 🚨 Saisie douanière ! -${formatNumber(data.loss)} 🍌 confisquées.`);
                    setTimeout(() => setRaidAlert(null), 8000);
                } else if (data.item_id) {
                    addLog(`[DARKNET] Acquisition réussie : ${data.item_id}.`);
                }
            } else if (msg.type === 'cyber_attack_result') {
                setIsAttacking(false);
                const res = msg.data as { 
                    success: boolean; 
                    honeypot_backfire?: boolean; 
                    reward?: number; 
                    lost?: number; 
                    target_name: string; 
                    message: string 
                };
                if (res.honeypot_backfire) {
                    addLog(`[HONEYPOT PIÈGE] ⚡ ${res.target_name} a contre-attaqué ! -${formatNumber(res.lost || 0)} 🍌 perdues.`);
                } else if (res.success) {
                    addLog(`[SUCCÈS] Infiltration de ${res.target_name} : +${formatNumber(res.reward || 0)} 🍌.`);
                } else {
                    addLog(`[ÉCHEC] L'attaque contre ${res.target_name} a été neutralisée.`);
                }
            } else if (msg.type === 'overclock_result') {
                addLog('[KERNEL] ⚡ Frénésie CPU activée ! Production ×2 pendant 45 secondes.');
            } else if (msg.type === 'error') {
                setIsAttacking(false);
                addLog(`[ERREUR] ${(msg as { message?: string }).message || 'Requête refusée.'}`);
            }
        };
        socketManager.subscribe(handleMessage);
        return () => socketManager.unsubscribe(handleMessage);
    }, []);

    // Local 1s tick for smooth real-time countdown display
    useEffect(() => {
        const timer = setInterval(() => {
            setState(prev => {
                if (!prev) return prev;
                let changed = false;
                const next = { ...prev };
                if (next.attack_cooldown_remaining && next.attack_cooldown_remaining > 0) {
                    next.attack_cooldown_remaining = next.attack_cooldown_remaining - 1;
                    changed = true;
                }
                if (next.overclock_remaining && next.overclock_remaining > 0) {
                    next.overclock_remaining = next.overclock_remaining - 1;
                    if (next.overclock_remaining === 0) next.overclock_active = false;
                    changed = true;
                }
                if (next.overclock_cooldown_remaining && next.overclock_cooldown_remaining > 0) {
                    next.overclock_cooldown_remaining = next.overclock_cooldown_remaining - 1;
                    changed = true;
                }
                if (next.corp_cooldowns) {
                    const newCds: Record<string, number> = {};
                    let cdChanged = false;
                    for (const [k, v] of Object.entries(next.corp_cooldowns)) {
                        if (v > 1) {
                            newCds[k] = v - 1;
                            cdChanged = true;
                        } else if (v === 1) {
                            cdChanged = true;
                        }
                    }
                    if (cdChanged) {
                        next.corp_cooldowns = newCds;
                        changed = true;
                    }
                }
                return changed ? next : prev;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const mercCost = state ? 100000 * Math.pow(2, state.mercenaries) : 100000;
    const fwCost = state ? 50000 * Math.pow(2, state.firewall_level) : 50000;
    const ownedItems = state?.darknet_items || [];
    const hasHoneypot = ownedItems.includes('honeypot');
    const hasOverclock = ownedItems.includes('overclock_kernel');
    const attacks = state?.attacks || DEFAULT_ATTACKS;
    const corpNodes = state?.corp_nodes || DEFAULT_CORP_NODES;
    const selectedAttackConfig = attacks[selectedAttack] || attacks.brute_force;

    const handleLaunchAttack = () => {
        if (!selectedTargetId || isAttacking) return;
        if (gameState.bananas < selectedAttackConfig.cost) return;

        setIsAttacking(true);
        addLog(`[ATTAQUE] Déploiement de ${selectedAttackConfig.name}...`);
        
        socketManager.send('launch_cyber_attack', {
            target_id: selectedTargetId,
            target_type: attackTab === 'pvp' ? 'player' : 'corp',
            attack_type: selectedAttack
        });

        if (onClearRetaliation) onClearRetaliation();
    };

    const handleActivateOverclock = () => {
        socketManager.send('activate_overclock', {});
    };

    // Leaderboard players excluding self
    const rivalPlayers = (gameState.leaderboard || [])
        .filter(entry => entry.name !== gameState.username && entry.name !== `BANANIER_${gameState.userId?.substring(0, 4)}`)
        .slice(0, 8);

    return (
        <GameSection 
            title="CENTRE DE CYBER-GUERRE & MARCHÉ NOIR" 
            icon={Fingerprint} 
            className="w-full border-t border-white/10 p-0"
            headerClassName="p-4 mb-0"
            rightElement={
                <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="flex items-center gap-1.5 text-white/50">
                        <Flame className={`h-3 w-3 ${state && state.police_heat > 0.4 ? 'text-red-500 animate-pulse' : 'text-banan-primary'}`} />
                        HEAT POLICE : <span className="font-bold text-white">{Math.round((state?.police_heat || 0) * 100)}%</span>
                    </span>
                    {state?.overclock_active && (
                        <span className="flex items-center gap-1 text-banan-primary bg-banan-primary/10 border border-banan-primary/30 px-2 py-0.5 rounded animate-pulse font-bold">
                            <Zap className="h-3 w-3" /> FRÉNÉSIE ({state.overclock_remaining}s)
                        </span>
                    )}
                </div>
            }
        >
            {/* Raid Alert Banner */}
            <AnimatePresence>
                {raidAlert !== null && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-red-900/90 border-b-2 border-red-500 text-center relative overflow-hidden"
                    >
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-1 animate-pulse" />
                        <div className="text-white font-black text-lg uppercase tracking-widest">
                            🚨 SAISIE DOUANIÈRE SUR TORBANANA 🚨
                        </div>
                        <div className="text-xs font-mono text-red-200">
                            La Cyber-Police a intercepté votre transaction illégale.
                        </div>
                        <div className="text-base font-mono font-bold text-red-400 mt-1">
                            AMENDE: -{formatNumber(raidAlert)} <Banana className="inline h-4 w-4" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 2-Column Responsive Grid Deck */}
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10 w-full">
                
                {/* COLUMN 1: CONSOLE DE FRAPPES CYBER */}
                <div className="p-4 md:p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                            <Crosshair className="h-4 w-4 text-banan-primary" />
                            <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                                Vecteurs de Frappe Tactique
                            </h3>
                        </div>
                        <div className="flex border border-white/10">
                            <button
                                onClick={() => { setAttackTab('pve'); setSelectedTargetId('banque_potassium'); }}
                                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-colors ${
                                    attackTab === 'pve' ? 'bg-banan-primary text-black' : 'text-white/40 hover:text-white'
                                }`}
                            >
                                Nœuds Corporatifs
                            </button>
                            <button
                                onClick={() => { setAttackTab('pvp'); if (rivalPlayers[0]) setSelectedTargetId(rivalPlayers[0].name); }}
                                className={`px-3 py-1 text-[10px] font-mono font-bold uppercase transition-colors ${
                                    attackTab === 'pvp' ? 'bg-banan-primary text-black' : 'text-white/40 hover:text-white'
                                }`}
                            >
                                Joueurs Rivaux
                            </button>
                        </div>
                    </div>

                    {/* Target Selector */}
                    <div>
                        <div className="text-[10px] font-mono text-white/40 uppercase mb-2">Sélectionner la Cible</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {attackTab === 'pve' ? (
                                corpNodes.map(node => {
                                    const nodeCd = state?.corp_cooldowns?.[node.id] || 0;
                                    const isLocked = nodeCd > 0;
                                    return (
                                        <button
                                            key={node.id}
                                            onClick={() => setSelectedTargetId(node.id)}
                                            className={`p-3 border text-left flex flex-col justify-between transition-all ${
                                                selectedTargetId === node.id 
                                                    ? 'bg-banan-primary/10 border-banan-primary text-white shadow-[0_0_12px_rgba(var(--banan-primary-rgb),0.15)]' 
                                                    : isLocked
                                                    ? 'bg-red-950/20 border-red-500/30 text-white/40'
                                                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                                            }`}
                                        >
                                            <div className="font-mono text-[11px] font-bold truncate flex items-center justify-between">
                                                <span>{node.name}</span>
                                                {isLocked && <span className="text-[9px] text-red-400 font-bold">LOCK {nodeCd}s</span>}
                                            </div>
                                            <div className="flex justify-between items-center mt-2 text-[9px] font-mono">
                                                <span className="flex items-center text-red-400">
                                                    {'★'.repeat(node.difficulty)}
                                                </span>
                                                <span className="text-banan-primary font-bold">~{formatNumber(node.base_reward)}🍌</span>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : rivalPlayers.length > 0 ? (
                                rivalPlayers.map((player, idx) => (
                                    <button
                                        key={`${player.name}-${idx}`}
                                        onClick={() => setSelectedTargetId(player.name)}
                                        className={`p-3 border text-left flex flex-col justify-between transition-all ${
                                            selectedTargetId === player.name 
                                                ? 'bg-banan-primary/10 border-banan-primary text-white shadow-[0_0_12px_rgba(var(--banan-primary-rgb),0.15)]' 
                                                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                                        }`}
                                    >
                                        <div className="font-mono text-[11px] font-bold truncate">{player.name}</div>
                                        <div className="flex justify-between items-center mt-2 text-[9px] font-mono">
                                            <span className="text-white/40">Solde :</span>
                                            <span className="text-banan-primary font-bold">{formatNumber(player.score)}🍌</span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="col-span-3 text-center py-4 text-xs font-mono text-white/30">
                                    Aucun rival détecté dans le secteur.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payload Selector */}
                    <div>
                        <div className="text-[10px] font-mono text-white/40 uppercase mb-2">Sélectionner la Charge Offensive</div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {Object.entries(attacks).map(([key, cfg]) => {
                                const isSelected = selectedAttack === key;
                                const canAfford = gameState.bananas >= cfg.cost;
                                return (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedAttack(key)}
                                        className={`p-3 border text-left transition-all ${
                                            isSelected 
                                                ? 'bg-red-500/10 border-red-500 text-white' 
                                                : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                                        }`}
                                    >
                                        <div className="font-mono text-[11px] font-black uppercase text-red-400 truncate">
                                            {cfg.name}
                                        </div>
                                        <div className="text-[9px] font-mono text-white/40 mt-1">
                                            Percée : {Math.round(cfg.success_rate * 100)}% • Siphon : {Math.round(cfg.steal_pct * 100)}%
                                        </div>
                                        <div className={`mt-2 text-[10px] font-mono font-bold ${canAfford ? 'text-banan-primary' : 'text-red-400'}`}>
                                            {formatNumber(cfg.cost)} 🍌
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Launch Attack Action Button */}
                    <button
                        onClick={handleLaunchAttack}
                        disabled={
                            isAttacking || 
                            gameState.bananas < selectedAttackConfig.cost || 
                            ((state?.attack_cooldown_remaining || 0) > 0) ||
                            (attackTab === 'pve' && ((state?.corp_cooldowns?.[selectedTargetId] || 0) > 0))
                        }
                        className={`w-full py-3.5 border font-mono text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                            isAttacking 
                                ? 'bg-red-900/40 border-red-500 text-red-400 animate-pulse'
                                : (state?.attack_cooldown_remaining || 0) > 0
                                ? 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed'
                                : attackTab === 'pve' && ((state?.corp_cooldowns?.[selectedTargetId] || 0) > 0)
                                ? 'bg-red-950/20 border-red-500/30 text-red-400/50 cursor-not-allowed'
                                : gameState.bananas < selectedAttackConfig.cost
                                ? 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed'
                                : 'bg-red-600/20 border-red-500 hover:bg-red-600 hover:text-black text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                        }`}
                    >
                        <Zap className={`h-4 w-4 ${isAttacking ? 'animate-spin' : ''}`} />
                        {isAttacking 
                            ? 'INJECTION DU PAYLOAD EN COURS...' 
                            : (state?.attack_cooldown_remaining || 0) > 0
                            ? `RECHARGE TACTIQUE (${state?.attack_cooldown_remaining}s)`
                            : attackTab === 'pve' && ((state?.corp_cooldowns?.[selectedTargetId] || 0) > 0)
                            ? `NŒUD VERROUILLÉ (${state?.corp_cooldowns?.[selectedTargetId]}s)`
                            : gameState.bananas < selectedAttackConfig.cost
                            ? `FONDS INSUFFISANTS (${formatNumber(selectedAttackConfig.cost)} 🍌)`
                            : `LANCER LA CYBER-FRAPPE (${formatNumber(selectedAttackConfig.cost)} 🍌)`}
                    </button>

                    {/* Visual Hacking Terminal Output */}
                    <div className="bg-black/90 border border-green-500/30 p-3 font-mono text-xs overflow-hidden flex flex-col flex-1 min-h-[180px] relative shadow-[inset_0_0_20px_rgba(0,255,0,0.05)]">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500/30 animate-pulse" />
                        <div ref={terminalRef} className="flex-1 overflow-y-auto space-y-1 text-green-400/80 pr-1 text-[11px]">
                            {terminalLogs.map((line, i) => (
                                <div key={i} className="break-all">{line}</div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: DÉFENSE ACTIVE & MARCHÉ NOIR (TORBANANA V2) */}
                <div className="p-4 md:p-6 flex flex-col gap-6">
                    
                    {/* Défense & Mercenaires */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-400" />
                                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                                    Défense Système & Mercenaires
                                </h3>
                            </div>
                            {hasHoneypot && (
                                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                    <Zap className="h-2.5 w-2.5" /> PIÈGE HONEYPOT ICE ACTIF
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Firewall Card */}
                            <div className="p-3 border border-blue-500/30 bg-blue-950/10 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-xs font-bold text-blue-400 uppercase">Pare-feu Bananier</span>
                                        <span className="font-mono text-xs font-black text-white">Niveau {state?.firewall_level || 0}</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-white/50 mt-1">
                                        Mitigation des attaques ennemies : <span className="text-blue-300 font-bold">{Math.min(90, (state?.firewall_level || 0) * 10)}%</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => socketManager.send('upgrade_firewall', {})}
                                    disabled={gameState.bananas < fwCost}
                                    className="mt-3 w-full py-2 bg-blue-600/20 border border-blue-500 hover:bg-blue-600 hover:text-black text-blue-100 font-mono text-[10px] font-bold uppercase transition-colors disabled:opacity-30"
                                >
                                    Améliorer ({formatNumber(fwCost)} 🍌)
                                </button>
                            </div>

                            {/* Mercenaries Card */}
                            <div className="p-3 border border-red-500/30 bg-red-950/10 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-mono text-xs font-bold text-red-400 uppercase">Cyber-Mercenaires</span>
                                        <span className="font-mono text-xs font-black text-white">{state?.mercenaries || 0} Unités</span>
                                    </div>
                                    <div className="text-[10px] font-mono text-white/50 mt-1">
                                        Siphon automatique sur le Leaderboard toutes les 60s.
                                    </div>
                                </div>
                                <button
                                    onClick={() => socketManager.send('hire_mercenary', {})}
                                    disabled={gameState.bananas < mercCost}
                                    className="mt-3 w-full py-2 bg-red-600/20 border border-red-500 hover:bg-red-600 hover:text-black text-red-100 font-mono text-[10px] font-bold uppercase transition-colors disabled:opacity-30"
                                >
                                    Recruter ({formatNumber(mercCost)} 🍌)
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TorBanana V2 Marché Noir */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <div className="flex items-center gap-2">
                                <Skull className="h-4 w-4 text-purple-400" />
                                <h3 className="font-mono text-xs font-black uppercase tracking-wider text-white">
                                    Marché Noir TorBanana V2
                                </h3>
                            </div>
                            <div className="text-[10px] font-mono text-white/40">
                                Risque de descente : <span className={state && state.police_heat > 0.4 ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{Math.round((0.12 + (state?.police_heat || 0) * 0.35) * 100)}%</span>
                            </div>
                        </div>

                        {/* Police Heat Gauge Bar */}
                        <div>
                            <div className="flex justify-between text-[9px] font-mono text-white/40 mb-1">
                                <span>INDICE DE RECHERCHE CYBER-POLICE</span>
                                <span>{Math.round((state?.police_heat || 0) * 100)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-black border border-white/10 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${
                                        (state?.police_heat || 0) > 0.6 ? 'bg-red-500' : (state?.police_heat || 0) > 0.3 ? 'bg-amber-400' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(100, (state?.police_heat || 0) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Contraband Catalog */}
                        <div className="space-y-2">
                            {state?.catalog && Object.entries(state.catalog).map(([itemId, item]) => {
                                const isOwned = ownedItems.includes(itemId) || (itemId === 'ogm_banana' && state.ogm_active);
                                const canAfford = gameState.bananas >= item.cost;
                                return (
                                    <div
                                        key={itemId}
                                        className="p-3 bg-white/5 border border-white/10 hover:border-purple-500/40 transition-colors flex items-center justify-between gap-3"
                                    >
                                        <div className="flex-1">
                                            <div className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                                                {itemId === 'ogm_banana' && <Banana className="h-3.5 w-3.5 text-banan-primary" />}
                                                {itemId === 'ip_scrambler' && <ShieldAlert className="h-3.5 w-3.5 text-cyan-400" />}
                                                {itemId === 'honeypot' && <Zap className="h-3.5 w-3.5 text-yellow-400" />}
                                                {itemId === 'overclock_kernel' && <Cpu className="h-3.5 w-3.5 text-red-400" />}
                                                {itemId === 'tsp_usb_key' && <Key className="h-3.5 w-3.5 text-purple-400" />}
                                                {item.name}
                                            </div>
                                            <div className="text-[10px] font-mono text-white/50 mt-0.5 leading-snug">
                                                {item.desc}
                                            </div>
                                        </div>

                                        <div className="shrink-0">
                                            {isOwned ? (
                                                <span className="text-[10px] font-mono font-bold text-purple-400 border border-purple-500/40 bg-purple-950/20 px-3 py-1 uppercase tracking-wider">
                                                    ACQUIS
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => socketManager.send('buy_darknet_item', { item_id: itemId })}
                                                    disabled={!canAfford}
                                                    className="font-mono text-xs font-bold text-black bg-purple-400 hover:bg-purple-300 px-3 py-1.5 uppercase transition-colors disabled:opacity-20 shadow-[0_0_10px_rgba(192,132,252,0.2)]"
                                                >
                                                    {formatNumber(item.cost)} 🍌
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Overclock Kernel Trigger Action */}
                        {hasOverclock && (
                            <button
                                onClick={handleActivateOverclock}
                                disabled={state?.overclock_active || ((state?.overclock_cooldown_remaining || 0) > 0)}
                                className={`w-full py-3 border font-mono text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
                                    state?.overclock_active
                                        ? 'bg-banan-primary/20 border-banan-primary text-banan-primary animate-pulse'
                                        : (state?.overclock_cooldown_remaining || 0) > 0
                                        ? 'bg-white/5 border-white/10 text-white/40 cursor-not-allowed'
                                        : 'bg-banan-primary text-black border-banan-primary hover:bg-white shadow-[0_0_20px_rgba(250,222,0,0.4)]'
                                }`}
                            >
                                <Cpu className="h-4 w-4" />
                                {state?.overclock_active
                                    ? `FRÉNÉSIE KERNEL ACTIVE : +100% PRODUCTIONS (${state.overclock_remaining}s)`
                                    : (state?.overclock_cooldown_remaining || 0) > 0
                                    ? `REFROIDISSEMENT CPU (${Math.floor((state?.overclock_cooldown_remaining || 0) / 60)}m ${(state?.overclock_cooldown_remaining || 0) % 60}s)`
                                    : 'ENCLENCHER LA FRÉNÉSIE KERNEL (BOOST ×2 PENDANT 45s)'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </GameSection>
    );
}
