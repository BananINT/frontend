/** Shared shapes for the Casino Potassium WebSocket protocol.
 *
 * The server is authoritative for every outcome: the client only ever sends the
 * choices a real player makes at the table, and renders what comes back.
 */

export interface FairnessProof {
    server_seed_hash: string;
    client_seed: string;
    nonce: number;
}

export interface GambleState {
    amount: number;
    chain: number;
    max_chain: number;
    expires_in: number;
}

/** Fields every `casino_result` carries, whatever the table.
 *
 * Kept separate from the generic `CasinoResult` so hooks can constrain on it:
 * a concrete detail type such as `DiceDetail` has no index signature, so it is
 * not assignable to `CasinoResult<Record<string, unknown>>`.
 */
export interface CasinoResultBase {
    game: string;
    label?: string;
    /** Present on round-based games: running | cashed | busted | playing | finished | holding */
    status?: string;
    bet?: number;
    payout?: number;
    net?: number;
    multiplier?: number;
    new_balance?: number;
    global_jackpot_won?: number;
    gamble?: GambleState | null;
    proof?: FairnessProof;
    [key: string]: unknown;
}

/** Envelope returned by every `casino_result` message. */
export interface CasinoResult<D = Record<string, unknown>> extends CasinoResultBase {
    detail?: D;
}

export interface FairnessRevealed {
    server_seed: string;
    server_seed_hash: string;
    client_seed: string;
    rolls: number;
    revealed_at: number;
}

export interface FairnessState {
    topic: 'fairness';
    server_seed_hash: string;
    client_seed: string;
    nonce: number;
    history: FairnessRevealed[];
    revealed?: FairnessRevealed;
}

export interface SeedCrackState {
    topic: 'seed_crack';
    target_hash: string;
    keyspace: number;
    key_length: number;
    pot: number;
    attempts: number;
    explored_pct: number;
    cost_per_attempt: number;
    max_batch: number;
    last_solved: string;
}

export interface LobbyState {
    topic: 'lobby';
    global_jackpot: number;
    open_round: string | null;
    gamble: GambleState | null;
    min_bet: number;
    max_bet: number;
}

// --- Per-game detail payloads -------------------------------------------------

export interface PlinkoDetail {
    risk: string;
    path: number[];
    bucket: number;
    multiplier: number;
    table: number[];
}

export interface DiceDetail {
    roll: number;
    target: number;
    direction: 'over' | 'under';
    win_chance: number;
    multiplier: number;
    won: boolean;
}

export interface WheelSegment {
    kind: 'soot' | 'miss' | 'win';
    value: number;
}

export interface WheelDetail {
    index: number;
    kind: WheelSegment['kind'];
    multiplier: number;
    segments: WheelSegment[];
    soot_seconds: number;
}

export interface MonteDetail {
    cups: number;
    pick: number;
    winner: number;
    swaps: number[][];
    multiplier: number;
    won: boolean;
}

export interface ScratchLine {
    cells: number[];
    symbol: string;
}

export interface ScratchDetail {
    cells: string[];
    lines: ScratchLine[];
    line_count: number;
    multiplier: number;
    winning_indices: number[];
}

export interface BaccaratDetail {
    player: number[];
    banker: number[];
    player_total: number;
    banker_total: number;
    winner: 'player' | 'banker' | 'tie';
    side: string;
    multiplier: number;
}

export interface KenoDetail {
    picks: number[];
    drawn: number[];
    matched: number[];
    hits: number;
    multiplier: number;
    table: Record<string, number>;
}

export interface SicboDetail {
    dice: number[];
    total: number;
    bet: string;
    multiplier: number;
    payouts: Record<string, number>;
}

export interface RouletteDetail {
    pocket: string;
    kind: string;
    value: string;
    multiplier: number;
    is_red: boolean;
    pockets: string[];
}

export interface PachinkoDetail {
    drops: string[];
    jams: number;
    slot: string;
    multiplier: number;
    jam_bonus: number;
}

export interface BanditDetail {
    reels: string[];
    fault: boolean;
    error_code?: string;
    kind?: string;
    multiplier: number;
}

export interface MegawaysWin {
    symbol: string;
    run: number;
    ways: number;
    pay: number;
}

export interface MegawaysCascade {
    grid: string[][];
    wins: MegawaysWin[];
    multiplier: number;
    raw: number;
}

export interface MegawaysDetail {
    reels: string[][];
    ways: number;
    cascades: MegawaysCascade[];
    chain: number;
    multiplier: number;
}

// --- Round games --------------------------------------------------------------

export interface CrashResult extends CasinoResult {
    status: 'running' | 'cashed' | 'busted';
    rate?: number;
    auto_cashout?: number;
    started_at?: number;
    crash_point?: number;
}

export interface MinesResult extends CasinoResult {
    status: 'running' | 'cashed' | 'busted';
    bugs: number;
    revealed: number[];
    bug_tiles?: number[];
    tile?: number;
    next_multiplier?: number;
    potential?: number;
}

export interface BlackjackResult extends CasinoResult {
    status: 'playing' | 'finished';
    outcome?: 'win' | 'lose' | 'push' | 'bust' | 'blackjack';
    player: string[];
    dealer: string[];
    player_total: number;
    dealer_total: number;
    doubled: boolean;
    can_double?: boolean;
    wager: number;
}

export interface VideoPokerResult extends CasinoResult {
    status: 'holding' | 'finished';
    hand: string[];
    initial?: string[];
    held?: number[];
    rank?: string | null;
    pays: Record<string, number>;
}

export interface HiLoCard {
    rank: string;
    suit: string;
}

export interface HiLoResult extends CasinoResult {
    status: 'running' | 'cashed' | 'busted';
    card?: HiLoCard;
    previous?: HiLoCard;
    streak: number;
    odds?: { higher: number; lower: number };
    potential?: number;
    history?: { rank: string; suit: string; guess: string; won: boolean }[];
}

export interface SeedCrackResult extends CasinoResult {
    cracked: boolean;
    attempts: number;
    cost: number;
    revealed_key: string | null;
    state: SeedCrackState;
}

export interface GambleResult extends CasinoResult {
    won: boolean;
    staked: number;
    chain: number;
}
