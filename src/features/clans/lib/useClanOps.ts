import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '@app/context/GameContext';
import { api } from '@app/lib/api';
import { socketManager } from '@app/lib/socket';
import { useSocketMessage } from '@app/hooks/useSocketMessage';
import { useSootStatus } from '@app/hooks/useSootStatus';
import { formatNumber } from '@app/utils/format';
import type { ConfirmRequest } from '@app/components/shared/ConfirmDialog';
import {
    SCAN_COST,
    type EliteContractsState, type MassHackState, type OsintState, type OsintTarget, type RouletteState,
} from './opsTypes';

/**
 * The operations room: socket-fed state for the OSINT terminal, elite
 * contracts, the world target and the shared barrel, plus every action.
 */
export function useClanOps() {
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

    useSocketMessage<OsintState>('osint_state', data => setOsintState(data));
    useSocketMessage('osint_scan', () => addLog('[RESEAU] Nouveau scan de clan terminé.'));
    useSocketMessage<{ reward: number }>('osint_hack_complete', data => {
        setOsintReward(data.reward);
        addLog(`[SUCCES] Opération terminée. +${formatNumber(data.reward)} 🍌 au trésor.`);
        requestState();
    });
    useSocketMessage<EliteContractsState>('elite_contracts_state', data => setContracts(data));
    useSocketMessage<MassHackState>('mass_hack_state', data => setMassHack(data));
    useSocketMessage<RouletteState>('ape_roulette_state', data => setRoulette(data));
    useSocketMessage<{ username: string; outcome: string }>('ape_roulette_member_pulled', data => {
        addLog(
            `[ROULETTE] ${data.username} a tiré : ${data.outcome === 'SAFE' ? 'SAIN 🍌' : 'BOOM 💥'}`
        );
    });
    useSocketMessage('error', (_data, msg) => {
        if (msg.message) addLog(`[ERREUR] ${msg.message}`);
    });

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


    const activeHack = osintState?.active_hack ?? null;
    const activeContract = contracts?.active_contract ?? null;
    const massProgress = massHack
        ? Math.min(100, (massHack.current_cpu / Math.max(1, massHack.required_cpu)) * 100)
        : 0;

    return {
        clanId, soot, bananas: gameState.bananas,
        osintState, osintReward, setOsintReward, contracts, massHack, roulette,
        cpuInject, setCpuInject, terminalLines, terminalRef, treasury,
        confirmRequest, setConfirmRequest, confirmBusy, runConfirmed,
        activeHack, activeContract, massProgress,
        scanNetwork, startHack, helpHack, cancelHack, acceptContract, claimContract, injectCpu,
    };
}

export type ClanOps = ReturnType<typeof useClanOps>;
