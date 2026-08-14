/** Treasury tiers: the collective production bonus every member enjoys. */
export interface Tier {
    name: string;
    target: number;
    bonus: number;
}

export const TREASURY_TIERS: Tier[] = [
    { name: 'Palier 1', target: 10_000_000_000, bonus: 5 },
    { name: 'Palier 2', target: 50_000_000_000, bonus: 10 },
    { name: 'Palier 3', target: 250_000_000_000, bonus: 15 },
    { name: 'Palier 4', target: 1_000_000_000_000, bonus: 20 },
    { name: 'Palier 5', target: 5_000_000_000_000, bonus: 25 },
];

export const MAX_TREASURY_BONUS = TREASURY_TIERS[TREASURY_TIERS.length - 1].bonus;

export function getGroupMultiplier(balance: number): number {
    let bonus = 0;
    for (const tier of TREASURY_TIERS) {
        if (balance >= tier.target) bonus = tier.bonus;
    }
    return bonus;
}

export function getNextTier(balance: number): Tier | null {
    return TREASURY_TIERS.find(t => balance < t.target) ?? null;
}

/** How far the treasury has travelled inside its current bracket, 0 → 1. */
export function getTierProgress(balance: number): number {
    const next = getNextTier(balance);
    if (!next) return 1;
    const index = TREASURY_TIERS.indexOf(next);
    const floor = index === 0 ? 0 : TREASURY_TIERS[index - 1].target;
    const span = next.target - floor;
    if (span <= 0) return 1;
    return Math.max(0, Math.min(1, (balance - floor) / span));
}
