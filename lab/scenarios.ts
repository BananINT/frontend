/** Scripted rounds for the layout lab: what the server would send, and when. */

type Msg = { type: string; data?: unknown; game?: string; message?: string };

export interface Scenario {
    /** Text a landmark element starts with; its page offset is what we track. */
    anchor: string;
    steps: { at: number; label: string; msg?: Msg }[];
    /** When to take each measurement (ms from start). */
    marks: { at: number; label: string }[];
}

const proof = (nonce: number) => ({
    server_seed_hash: 'a'.repeat(64),
    client_seed: 'lab',
    nonce,
});

const gamble = { amount: 2000, chain: 1, max_chain: 5, expires_in: 600 };

export const SCENARIOS: Record<string, Scenario> = {
    dice: {
        anchor: 'Mise (Min',
        steps: [
            {
                at: 300,
                label: 'win',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'dice',
                        bet: 1000,
                        payout: 1840,
                        proof: proof(1),
                        gamble,
                        global_jackpot_won: 0,
                        detail: {
                            roll: 77.51,
                            target: 50,
                            direction: 'over',
                            win_chance: 50,
                            multiplier: 1.84,
                            won: true,
                        },
                    },
                },
            },
            { at: 1600, label: 'error', msg: { type: 'casino_error', game: 'dice', message: 'Solde insuffisant' } },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 1400, label: 'after-win' },
            { at: 2100, label: 'after-error' },
        ],
    },

    plinko: {
        anchor: 'Mise (Min',
        steps: [
            {
                at: 300,
                label: 'drop',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'plinko',
                        bet: 1000,
                        payout: 5600,
                        proof: proof(1),
                        gamble,
                        detail: {
                            risk: 'medium',
                            path: [1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 0],
                            bucket: 12,
                            multiplier: 5.6,
                            table: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
                        },
                    },
                },
            },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 2200, label: 'after-drop' },
        ],
    },

    plinkoMulti: {
        anchor: 'Mise (Min',
        steps: [
            ...[0, 1, 2, 3, 4].map((n) => ({
                at: 300 + n * 220,
                label: `drop-${n}`,
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'plinko',
                        bet: 1000,
                        payout: [5600, 0, 300, 41000, 1000][n],
                        proof: proof(n + 1),
                        gamble,
                        detail: {
                            risk: 'medium',
                            path: Array.from({ length: 16 }, (_, i) => ((i * 7 + n * 3) % 5 < 2 ? 1 : 0)),
                            bucket: [12, 8, 6, 16, 9][n],
                            multiplier: [5.6, 0, 0.3, 41, 1][n],
                            table: [110, 41, 10, 5, 3, 1.5, 1, 0.5, 0.3, 0.5, 1, 1.5, 3, 5, 10, 41, 110],
                        },
                    },
                },
            })),
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 1500, label: 'mid-flight' },
            { at: 3200, label: 'landed' },
        ],
    },

    wheel: {
        anchor: 'Mise (Min',
        steps: [
            {
                at: 300,
                label: 'spin',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'wheel',
                        bet: 1000,
                        payout: 5000,
                        proof: proof(1),
                        gamble,
                        detail: {
                            index: 7,
                            kind: 'win',
                            multiplier: 5,
                            soot_seconds: 0,
                            segments: Array.from({ length: 24 }, (_, i) => ({
                                kind: i === 3 ? 'soot' : 'win',
                                value: i % 6,
                            })),
                        },
                    },
                },
            },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 4200, label: 'after-spin' },
        ],
    },

    mines: {
        anchor: 'Mise (Min',
        steps: [
            {
                at: 300,
                label: 'running',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'mines',
                        status: 'running',
                        bet: 1000,
                        bugs: 3,
                        revealed: [0, 6, 12],
                        multiplier: 1.6,
                        next_multiplier: 1.9,
                        potential: 1600,
                        proof: proof(1),
                    },
                },
            },
            {
                at: 900,
                label: 'busted',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'mines',
                        status: 'busted',
                        bet: 1000,
                        payout: 0,
                        bugs: 3,
                        revealed: [0, 6, 12],
                        bug_tiles: [4, 9, 18],
                        multiplier: 1.6,
                        proof: proof(1),
                    },
                },
            },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 700, label: 'in-round' },
            { at: 1600, label: 'busted' },
        ],
    },

    crash: {
        anchor: 'Mise (Min',
        steps: [
            {
                at: 300,
                label: 'running',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'crash',
                        status: 'running',
                        bet: 1000,
                        multiplier: 1,
                        started_at: Date.now() / 1000,
                        proof: proof(1),
                    },
                },
            },
            {
                at: 1200,
                label: 'busted',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'crash',
                        status: 'busted',
                        bet: 1000,
                        payout: 0,
                        multiplier: 2.31,
                        crash_point: 2.31,
                        proof: proof(1),
                    },
                },
            },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 900, label: 'in-flight' },
            { at: 1900, label: 'busted' },
        ],
    },

    /** Reproduces the real poll cycle: the reply for a live round carries no
     *  `bet`, which used to blank the cash-out amount. */
    crashPoll: {
        anchor: 'Mise (Min',
        steps: [
            {
                at: 300,
                label: 'start',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'crash',
                        status: 'running',
                        bet: 4000,
                        multiplier: 1,
                        started_at: Date.now() / 1000,
                        proof: proof(1),
                    },
                },
            },
            ...[0, 1, 2, 3].map((n) => ({
                at: 700 + n * 400,
                label: `poll-${n}`,
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'crash',
                        status: 'running',
                        multiplier: 1.1 + n * 0.1,
                        started_at: Date.now() / 1000,
                    },
                },
            })),
            {
                at: 2600,
                label: 'cashed',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'crash',
                        status: 'cashed',
                        bet: 4000,
                        payout: 9200,
                        multiplier: 2.3,
                        crash_point: 8.44,
                        proof: proof(1),
                    },
                },
            },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 2400, label: 'after-polls' },
            { at: 3200, label: 'cashed' },
        ],
    },

    blackjack: {
        anchor: 'Mise (Min',
        steps: [
            {
                at: 300,
                label: 'playing',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'blackjack',
                        status: 'playing',
                        bet: 1000,
                        wager: 1000,
                        player: ['K♠', '7♦'],
                        dealer: ['9♥'],
                        player_total: 17,
                        dealer_total: 9,
                        doubled: false,
                        can_double: true,
                        proof: proof(1),
                    },
                },
            },
            {
                at: 1200,
                label: 'finished',
                msg: {
                    type: 'casino_result',
                    data: {
                        game: 'blackjack',
                        status: 'finished',
                        outcome: 'win',
                        bet: 1000,
                        wager: 1000,
                        payout: 1900,
                        player: ['K♠', '7♦'],
                        dealer: ['9♥', 'Q♣', '5♠'],
                        player_total: 17,
                        dealer_total: 24,
                        doubled: false,
                        gamble,
                        proof: proof(1),
                    },
                },
            },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 900, label: 'in-hand' },
            { at: 1900, label: 'finished' },
        ],
    },

    slots: {
        anchor: 'Mise (Min',
        steps: [
            {
                at: 300,
                label: 'spin',
                msg: {
                    type: 'slots_machine_result',
                    data: {
                        grid: [
                            ['banana', 'banana', 'banana', 'banana', 'banana'],
                            ['cherry', 'bell', 'diamond', 'cherry', 'bell'],
                            ['bug', 'cherry', 'bell', 'bug', 'cherry'],
                        ],
                        payout: 25000,
                        win_lines: ['row_0'],
                        skulls_hit: 0,
                        global_jackpot_won: 0,
                    },
                },
            },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 2400, label: 'after-win' },
        ],
    },

    roulette: {
        anchor: 'PRESSER',
        steps: [
            { at: 0, label: 'state', msg: { type: 'ape_roulette_state', data: { remaining_chambers: 4, dud_chance: 25 } } },
            {
                at: 300,
                label: 'pull',
                msg: {
                    type: 'ape_roulette_result',
                    data: { outcome: 'SAFE', payout: 30_000_000 },
                },
            },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 2400, label: 'after-pull' },
        ],
    },

    rouletteDud: {
        anchor: 'PRESSER',
        steps: [
            { at: 0, label: 'state', msg: { type: 'ape_roulette_state', data: { remaining_chambers: 2, dud_chance: 50 } } },
            {
                at: 300,
                label: 'pull',
                msg: { type: 'ape_roulette_result', data: { outcome: 'DUD', payout: 0 } },
            },
        ],
        marks: [
            { at: 200, label: 'idle' },
            { at: 2400, label: 'after-pull' },
        ],
    },

    lottery: {
        anchor: 'Sélectionnez un numéro',
        steps: [
            {
                at: 0,
                label: 'state',
                msg: {
                    type: 'lottery_state',
                    data: {
                        current_draw: {
                            draw_number: 42,
                            jackpot: 1_250_000,
                            total_tickets: 17,
                            created_at: new Date().toISOString(),
                        },
                        global_jackpot: 8_400_000,
                        user_tickets: [],
                        clan_tickets: [],
                        ticket_cost: 5000,
                        clan_ticket_cost: 25000,
                        clan_treasury_balance: 900_000,
                        max_tickets: 5,
                        max_clan_tickets: 5,
                        number_range: [1, 50],
                        history: [],
                    },
                },
            },
            {
                at: 600,
                label: 'draw',
                msg: {
                    type: 'lottery_draw_result',
                    data: { draw_number: 42, winning_number: 27, winner: { name: 'Kong', prize: 1_250_000 } },
                },
            },
        ],
        marks: [
            { at: 400, label: 'idle' },
            { at: 3200, label: 'after-draw' },
        ],
    },
};
