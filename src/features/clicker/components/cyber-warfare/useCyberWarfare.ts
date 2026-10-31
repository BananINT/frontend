import { useEffect, useRef, useState } from 'react';
import { socketManager } from '@app/lib/socket';
import { useSocketMessage } from '@app/hooks/useSocketMessage';
import { formatNumber } from '@app/utils/format';
import { useGame } from '@app/context/GameContext';
import type { CyberState } from '@app/types/game';
import { DEFAULT_ATTACKS, DEFAULT_CORP_NODES } from './cyberDefaults';

interface RetaliationOptions {
    retaliationTarget?: { id: string; name: string } | null;
    onClearRetaliation?: () => void;
}

/** Cyber-warfare state: server snapshot, local countdowns, terminal log and attack flow. */
export function useCyberWarfare({ retaliationTarget, onClearRetaliation }: RetaliationOptions) {
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

    useSocketMessage<CyberState>('cyber_state', data => setState(data));
    useSocketMessage<{ raid: boolean; loss: number; item_id?: string }>('darknet_result', data => {
        if (data.raid) {
            setRaidAlert(data.loss);
            addLog(`[POLICE] 🚨 Saisie douanière ! -${formatNumber(data.loss)} 🍌 confisquées.`);
            setTimeout(() => setRaidAlert(null), 8000);
        } else if (data.item_id) {
            addLog(`[DARKNET] Acquisition réussie : ${data.item_id}.`);
        }
    });
    useSocketMessage<{
        success: boolean;
        honeypot_backfire?: boolean;
        reward?: number;
        lost?: number;
        target_name: string;
        message: string
    }>('cyber_attack_result', res => {
        setIsAttacking(false);
        if (res.honeypot_backfire) {
            addLog(`[HONEYPOT PIÈGE] ⚡ ${res.target_name} a contre-attaqué ! -${formatNumber(res.lost || 0)} 🍌 perdues.`);
        } else if (res.success) {
            addLog(`[SUCCÈS] Infiltration de ${res.target_name} : +${formatNumber(res.reward || 0)} 🍌.`);
        } else {
            addLog(`[ÉCHEC] L'attaque contre ${res.target_name} a été neutralisée.`);
        }
    });
    useSocketMessage('overclock_result', () => {
        addLog('[KERNEL] ⚡ Frénésie CPU activée ! Production ×2 pendant 45 secondes.');
    });
    useSocketMessage('error', (_data, msg) => {
        setIsAttacking(false);
        addLog(`[ERREUR] ${msg.message || 'Requête refusée.'}`);
    });

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

    return {
        state, raidAlert, attackTab, setAttackTab, selectedTargetId, setSelectedTargetId,
        selectedAttack, setSelectedAttack, isAttacking, terminalLogs, terminalRef,
        mercCost, fwCost, ownedItems, hasHoneypot, hasOverclock, attacks, corpNodes, selectedAttackConfig,
        handleLaunchAttack, handleActivateOverclock, rivalPlayers, bananas: gameState.bananas,
    };
}

export type CyberWarfare = ReturnType<typeof useCyberWarfare>;
