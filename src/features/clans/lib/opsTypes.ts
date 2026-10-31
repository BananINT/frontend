export interface OsintTarget {
    id: string;
    ip: string;
    corp: string;
    difficulty: number;
    duration: number;
    reward_multiplier: number;
}

export interface ActiveHack {
    target: OsintTarget;
    remaining_time: number;
    total_duration: number;
    completed: boolean;
    helpers: number;
}

export interface OsintState {
    targets: OsintTarget[];
    active_hack: ActiveHack | null;
    error?: string;
}

export interface EliteContract {
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

export interface EliteContractsState {
    active_contract: EliteContract | null;
    available_contracts: EliteContract[];
    error?: string;
}

export interface MassHackState {
    status: 'active' | 'success' | 'cooldown';
    target_name: string;
    required_cpu: number;
    current_cpu: number;
    deadline: number;
    top_clans: { clan_id: string; name: string; amount: number }[];
}

export interface RouletteState {
    remaining_chambers: number;
    dud_chance: number;
    play_cost?: number;
    safe_payout?: number;
}

export const SCAN_COST = 100_000_000;
