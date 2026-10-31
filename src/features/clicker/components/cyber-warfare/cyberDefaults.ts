import type { AttackConfig, CorpNode } from '@app/types/game';

export const DEFAULT_ATTACKS: Record<string, AttackConfig> = {
    brute_force: { name: "Brute-Force Potassium", cost: 10000, success_rate: 0.70, steal_pct: 0.05, bypass: 0.0 },
    trojan: { name: "Cheval de Troie Télécom", cost: 50000, success_rate: 0.85, steal_pct: 0.15, bypass: 0.40 },
    zeroday: { name: "Exploit Zero-Day TorBanana", cost: 250000, success_rate: 0.95, steal_pct: 0.25, bypass: 0.75 }
};

export const DEFAULT_CORP_NODES: CorpNode[] = [
    { id: "banque_potassium", name: "Banque Centrale du Potassium", difficulty: 2, base_reward: 85000, ip: "10.42.0.1" },
    { id: "telecom_datacenter", name: "Datacenter Télécom SudParis", difficulty: 4, base_reward: 380000, ip: "157.159.22.10" },
    { id: "satellite_intv", name: "Satellite Orbital INTv", difficulty: 5, base_reward: 1250000, ip: "203.0.113.88" }
];
