/** Canned REST payloads so the clan pages have real content in the lab. */

const CLAN = {
    id: 'clan-lab',
    name: 'LAB_SQUAD',
    description: 'Unité de test du laboratoire de mise en page.',
    privacy: 'OPEN',
    treasury_balance: 74_000_000_000,
    created_at: new Date().toISOString(),
};

const MEMBERS = Array.from({ length: 9 }, (_, i) => ({
    user_id: i === 0 ? 'lab' : `u-${i}`,
    username: `AGENT_${i.toString().padStart(2, '0')}`,
    total_donated: (9 - i) * 3_000_000_000,
    joined_at: new Date().toISOString(),
}));

const VOTES = [
    {
        id: 1,
        clan_id: 'clan-lab',
        vote_type: 'POLICY',
        target_id: 'INVITE',
        status: 'OPEN',
        yes_votes: 3,
        no_votes: 1,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 3600_000).toISOString(),
        initiator_id: 'lab',
    },
];

const PERKS = [
    {
        id: 'turbo_murissement',
        name: 'Turbo-Mûrissement',
        description: 'Réduit le coût des upgrades individuelles de 5% par niveau.',
        level: 2,
        max_level: 5,
        cost: 20_000_000_000,
        effect_per_level: 0.05,
    },
    {
        id: 'bouclier_cyber',
        name: 'Bouclier Cyber',
        description: 'Réduit de 10% par niveau les pertes lors des attaques cyber.',
        level: 0,
        max_level: 5,
        cost: 8_000_000_000,
        effect_per_level: 0.1,
    },
    {
        id: 'extracteur_potassium',
        name: 'Extracteur de Potassium',
        description: 'Augmente la production de tous les membres de 3% par niveau.',
        level: 5,
        max_level: 5,
        cost: null,
        effect_per_level: 0.03,
    },
];

const CLANS = Array.from({ length: 6 }, (_, i) => ({
    ...CLAN,
    id: `clan-${i}`,
    name: `UNITE_${i}`,
    privacy: i % 3 === 1 ? 'INVITE' : 'OPEN',
    treasury_balance: (i + 1) * 9_000_000_000,
}));

const TRANSACTIONS = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    clan_id: 'clan-lab',
    user_id: 'lab',
    username: `AGENT_0${i % 4}`,
    amount: (i + 1) * 1_500_000_000,
    type: ['DEPOSIT', 'TAX', 'UPGRADE', 'OSINT_REWARD'][i % 4],
    timestamp: new Date().toISOString(),
}));

const ROUTES: Record<string, unknown> = {
    '/clan/': CLANS,
    '/clan/invites/me': [],
    '/clan/perks': PERKS,
    '/clan/transactions': TRANSACTIONS,
    '/clan/clan-lab': CLAN,
    '/clan/clan-lab/members': MEMBERS,
    '/clan/clan-lab/votes': VOTES,
};

export const api = {
    get: (url: string) => Promise.resolve({ data: ROUTES[url] ?? [] }),
    post: (url: string, body?: unknown) => Promise.resolve({ data: { success: true, ...(body as object) } }),
};
