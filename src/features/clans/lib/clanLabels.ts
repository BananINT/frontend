export const PRIVACY_LABELS: Record<string, string> = {
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

export function perkEffect(perkId: string, level: number, effectPerLevel: number) {
    const sign = PERK_SIGN[perkId] ?? '+';
    return `${sign}${Math.round(level * effectPerLevel * 100)}%`;
}
