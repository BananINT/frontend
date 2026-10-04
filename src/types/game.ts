
export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  prestigeCount: number;
}

export interface MarketStock {
  symbol: string;
  name: string;
  current_price: number;
  change_24h: number;
  day_high: number;
  day_low: number;
  volatility: number;
  lastCandle: { 
    time: number; 
    open: number; 
    high: number; 
    low: number; 
    close: number; 
    volume?: number 
  } | null;
}

export interface Mission {
  id: string;
  name: string;
  desc: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
  claimed: boolean;
  type: 'personal' | 'clan';
}

export interface GameState {
  bananas: number;
  clickCount: number;
  autoClickers: number;
  clickValue: number;
  userId: string;
  username: string | null;
  clan_id: string | null;
  unlockedAchievements: string[];
  missionProgress: Record<string, { progress: number; completed: boolean }>;
  stocks: Record<string, { shares: number, averageBuyPrice: number }>;
  prestigeCount: number;
  banana_dna: number;
  leaderboard_rank?: number;
  leaderboard: LeaderboardEntry[];
  marketData: MarketStock[];
  ownedThemes: string[];
  missions: Mission[];
  isSooty?: boolean;
  sootRemaining?: number;
  taxRate?: number;
  totalDonated?: number;
  totalBananasEarned: number;
}

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  value: number;
  type: 'click' | 'auto' | 'synergy' | 'prestige';
  desc?: string;
  owned: number;
}

export interface AlgoCultState {
  status: 'idle' | 'demanding' | 'blessed' | 'cursed';
  current_sacrifice: number;
  target_sacrifice: number;
  deadline: number;
}

export interface CyberAttack {
  attacker: string;
  stolen: number;
  mitigated: number;
  attacker_id?: string;
  can_retaliate?: boolean;
}

export interface DarknetCatalogItem {
  name: string;
  cost: number;
  desc: string;
  icon: string;
}

export interface CorpNode {
  id: string;
  name: string;
  difficulty: number;
  base_reward: number;
  ip: string;
}

export interface AttackConfig {
  name: string;
  cost: number;
  success_rate: number;
  steal_pct: number;
  bypass: number;
}

export interface CyberState {
  mercenaries: number;
  firewall_level: number;
  ogm_active: boolean;
  darknet_items: string[];
  police_heat: number;
  overclock_active: boolean;
  overclock_remaining: number;
  overclock_cooldown_remaining?: number;
  attack_cooldown_remaining?: number;
  shield_remaining?: number;
  corp_cooldowns?: Record<string, number>;
  catalog: Record<string, DarknetCatalogItem>;
  corp_nodes: CorpNode[];
  attacks: Record<string, AttackConfig>;
}

export interface CyberCombatLog {
  id: number;
  type: string;
  message: string;
  time: string;
}
