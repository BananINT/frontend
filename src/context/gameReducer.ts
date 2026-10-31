/**
 * The game socket protocol as the GameProvider sees it: typed messages, light
 * runtime guards on the fields it actually reads, and pure state transitions.
 * Nothing here touches React, the socket or the network, so it is unit-tested
 * directly (gameReducer.test.ts).
 */
import type { GameState, LeaderboardEntry, MarketStock, Mission, Upgrade } from '@app/types/game';

/* ------------------------------------------------------------ backend shapes */

export interface BackendGameState {
  bananas: number;
  total_clicks: number;
  bananas_per_second: number;
  bananas_per_click: number;
  username: string | null;
  clan_id: string | null;
  prestige_count: number;
  banana_dna: number;
  owned_themes: string;
  total_bananas_earned: number;
}

export interface BackendUpgrade {
  upgrade_id: string;
  name: string;
  base_cost: number;
  multiplier: number;
  upgrade_type: 'click' | 'auto' | 'synergy' | 'prestige';
  description: string;
  owned: number;
}

export interface BackendAchievement {
  achievement_id: string;
  name: string;
}

export interface InitResponse {
  userId: string;
  gameState: BackendGameState;
  upgrades: BackendUpgrade[];
  achievements: BackendAchievement[];
  leaderboard?: LeaderboardEntry[];
}

export interface GameUpdatePayload {
  bananas?: number;
  bananasPerClick?: number;
  bananasPerSecond?: number;
  stocks?: Record<string, { shares: number; averageBuyPrice: number }>;
  ownedThemes?: string | string[];
  totalClicks?: number;
  newlyCompletedMissions?: string[];
  clan_id?: string | null;
  totalBananasEarned?: number;
  prestigeCount?: number;
  bananaDNA?: number;
  isSooty?: boolean;
  sootRemaining?: number;
  taxRate?: number;
  totalDonated?: number;
}

export interface UpgradeSuccessPayload {
  success: true;
  upgrade_id: string;
  new_level: number;
  next_cost?: number | null;
  data?: {
    bananas: number;
    bananasPerClick: number;
    bananasPerSecond: number;
    bananaDNA?: number;
  };
}

export interface PrestigeSuccessPayload {
  success?: boolean;
  dnaGained?: number;
  bananaDNA?: number;
  prestigeCount?: number;
  bananasPerClick?: number;
  bananasPerSecond?: number;
  upgrades?: BackendUpgrade[];
}

export interface MarketTick {
  symbol: string;
  current_price: number;
  change: number;
  high: number;
  low: number;
  candle: MarketStock['lastCandle'];
}

/* ------------------------------------------------------------ message union */

export type GameMessage =
  | { type: 'init_success'; data: InitResponse }
  /** auth_success carries the same snapshot as init_success, one level down. */
  | { type: 'auth_success'; data: InitResponse }
  /** null when the frame had no fields: it still acknowledges a sync. */
  | { type: 'game_update'; data: GameUpdatePayload | null }
  | { type: 'purchase_success'; data: UpgradeSuccessPayload }
  | { type: 'prestige_success'; data: PrestigeSuccessPayload }
  | { type: 'trade_success'; data: { new_balance: number } }
  | { type: 'portfolio_update'; data: { symbol: string; shares?: number; averageBuyPrice?: number } }
  | { type: 'leaderboard_update'; data: LeaderboardEntry[] }
  | { type: 'market_update'; data: { stocks: MarketTick[] } }
  | { type: 'name_change_success'; data: { name: string } }
  | { type: 'missions_state'; data: Mission[] }
  | { type: 'mission_claimed'; data: { reward: number } }
  | { type: 'error'; message: string };

export type GameMessageType = GameMessage['type'];

export const GAME_MESSAGE_TYPES: readonly GameMessageType[] = [
  'init_success', 'auth_success', 'game_update', 'purchase_success', 'prestige_success',
  'trade_success', 'portfolio_update', 'leaderboard_update', 'market_update',
  'name_change_success', 'missions_state', 'mission_claimed', 'error',
];

/** A frame as it comes off the socket, before any checking. */
export interface RawSocketMessage {
  type: string;
  data?: unknown;
  message?: string;
}

/* ------------------------------------------------------------------- guards */

type Obj = Record<string, unknown>;

const isObject = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const isNumber = (v: unknown): v is number => typeof v === 'number' && !Number.isNaN(v);
const optNumber = (v: unknown): number | undefined => (isNumber(v) ? v : undefined);

const parseInit = (v: unknown): InitResponse | null => {
  if (!isObject(v) || !isObject(v.gameState)) return null;
  if (!Array.isArray(v.upgrades) || !Array.isArray(v.achievements)) return null;
  return v as unknown as InitResponse;
};

const parseGameUpdate = (v: unknown): GameUpdatePayload | null => {
  if (!isObject(v) || Object.keys(v).length === 0) return null;
  const themes = v.ownedThemes;
  return {
    bananas: optNumber(v.bananas),
    bananasPerClick: optNumber(v.bananasPerClick),
    bananasPerSecond: optNumber(v.bananasPerSecond),
    stocks: isObject(v.stocks) ? (v.stocks as GameUpdatePayload['stocks']) : undefined,
    ownedThemes: typeof themes === 'string' || Array.isArray(themes) ? (themes as string | string[]) : undefined,
    totalClicks: optNumber(v.totalClicks),
    newlyCompletedMissions: Array.isArray(v.newlyCompletedMissions)
      ? v.newlyCompletedMissions.filter((id): id is string => typeof id === 'string')
      : undefined,
    clan_id: typeof v.clan_id === 'string' || v.clan_id === null ? v.clan_id : undefined,
    totalBananasEarned: optNumber(v.totalBananasEarned),
    prestigeCount: optNumber(v.prestigeCount),
    bananaDNA: optNumber(v.bananaDNA),
    isSooty: typeof v.isSooty === 'boolean' ? v.isSooty : undefined,
    sootRemaining: optNumber(v.sootRemaining),
    taxRate: optNumber(v.taxRate),
    totalDonated: optNumber(v.totalDonated),
  };
};

/**
 * Checks a raw frame and narrows it to a GameMessage. Returns null for types
 * the provider does not handle and for frames that would have been ignored
 * (or would have crashed the handler) because a field it reads is missing.
 */
export function parseGameMessage(raw: RawSocketMessage | null | undefined): GameMessage | null {
  if (!raw || !raw.type) return null;
  const data = raw.data;

  switch (raw.type) {
    case 'init_success': {
      const init = parseInit(data);
      return init ? { type: 'init_success', data: init } : null;
    }
    case 'auth_success': {
      const init = isObject(data) ? parseInit(data.gameState) : null;
      return init ? { type: 'auth_success', data: init } : null;
    }
    case 'game_update':
      return { type: 'game_update', data: parseGameUpdate(data) };
    case 'purchase_success': {
      if (!isObject(data) || !data.success || typeof data.upgrade_id !== 'string' || !isNumber(data.new_level)) return null;
      const stats = isObject(data.data) && isNumber(data.data.bananas) ? (data.data as UpgradeSuccessPayload['data']) : undefined;
      return {
        type: 'purchase_success',
        data: {
          success: true,
          upgrade_id: data.upgrade_id,
          new_level: data.new_level,
          next_cost: optNumber(data.next_cost),
          data: stats,
        },
      };
    }
    case 'prestige_success': {
      if (!isObject(data)) return null;
      return {
        type: 'prestige_success',
        data: {
          dnaGained: optNumber(data.dnaGained),
          bananaDNA: optNumber(data.bananaDNA),
          prestigeCount: optNumber(data.prestigeCount),
          bananasPerClick: optNumber(data.bananasPerClick),
          bananasPerSecond: optNumber(data.bananasPerSecond),
          upgrades: Array.isArray(data.upgrades) ? (data.upgrades as BackendUpgrade[]) : undefined,
        },
      };
    }
    case 'trade_success':
      return isObject(data) && data.success && isNumber(data.new_balance)
        ? { type: 'trade_success', data: { new_balance: data.new_balance } }
        : null;
    case 'portfolio_update':
      return isObject(data) && typeof data.symbol === 'string' && data.symbol
        ? {
            type: 'portfolio_update',
            data: { symbol: data.symbol, shares: optNumber(data.shares), averageBuyPrice: optNumber(data.averageBuyPrice) },
          }
        : null;
    case 'leaderboard_update':
      return Array.isArray(data) ? { type: 'leaderboard_update', data: data as LeaderboardEntry[] } : null;
    case 'market_update':
      return isObject(data) && Array.isArray(data.stocks)
        ? { type: 'market_update', data: { stocks: data.stocks.filter(isObject) as unknown as MarketTick[] } }
        : null;
    case 'name_change_success':
      return isObject(data) && typeof data.name === 'string' && data.name
        ? { type: 'name_change_success', data: { name: data.name } }
        : null;
    case 'missions_state':
      return { type: 'missions_state', data: Array.isArray(data) ? (data as Mission[]) : [] };
    case 'mission_claimed':
      return { type: 'mission_claimed', data: { reward: (isObject(data) && isNumber(data.reward) && data.reward) || 0 } };
    case 'error': {
      // The backend sends {type: 'error', message}; older frames nested it in data.
      const text = raw.message ?? (isObject(data) ? data.message : undefined);
      return typeof text === 'string' && text ? { type: 'error', message: text } : null;
    }
    default:
      return null;
  }
}

/* -------------------------------------------------------- in-flight clicks */

/** A sync sent to the server whose game_update has not come back yet. */
export interface InFlightSync {
  clicks: number;
  sentAt: number;
}

// A sync the server dropped (error, replay guard) never gets a game_update,
// so stop counting its clicks after this long rather than inflating forever.
export const IN_FLIGHT_TTL_MS = 5000;

/** Every game_update answers the oldest sync still in flight. */
export const ackOldestSync = (inFlight: InFlightSync[], now: number): InFlightSync[] =>
  inFlight.slice(1).filter(s => now - s.sentAt < IN_FLIGHT_TTL_MS);

/** Clicks the server's banana count does not include yet. */
export const unackedClicks = (pending: number, inFlight: InFlightSync[]): number =>
  pending + inFlight.reduce((sum, s) => sum + s.clicks, 0);

/* ---------------------------------------------------------------- mappers */

export const mapUpgrade = (u: BackendUpgrade): Upgrade => ({
  id: u.upgrade_id,
  name: u.name,
  cost: u.base_cost,
  value: u.multiplier,
  type: u.upgrade_type,
  desc: u.description,
  owned: u.owned,
});

export const defaultGameState: GameState = {
  bananas: 0,
  clickCount: 0,
  autoClickers: 0,
  clickValue: 1,
  userId: '',
  username: null,
  clan_id: null,
  unlockedAchievements: [],
  missionProgress: {},
  stocks: {},
  prestigeCount: 0,
  banana_dna: 0,
  leaderboard: [],
  marketData: [],
  ownedThemes: ['default'],
  missions: [],
  isSooty: false,
  sootRemaining: 0,
  taxRate: 0.0,
  totalDonated: 0,
  totalBananasEarned: 0,
};

/** Maps the init snapshot to frontend state. It replaces the state wholesale. */
export function mapInitResponse(response: InitResponse): GameState {
  const { userId, gameState: serverState, achievements, leaderboard } = response;
  return {
    bananas: serverState.bananas,
    clickCount: serverState.total_clicks,
    autoClickers: serverState.bananas_per_second,
    clickValue: serverState.bananas_per_click,
    userId: userId,
    username: serverState.username || null,
    clan_id: serverState.clan_id || null,
    unlockedAchievements: achievements.map((a: BackendAchievement) => a.achievement_id),
    missionProgress: {}, // Will implement later with backend
    stocks: {}, // Handled separately or below
    prestigeCount: serverState.prestige_count || 0,
    banana_dna: serverState.banana_dna || 0,
    leaderboard: leaderboard || [],
    marketData: [],
    ownedThemes: serverState.owned_themes?.split(',') || ['default'],
    missions: [],
    totalBananasEarned: serverState.total_bananas_earned || 0,
  };
}

/** Mission ids completed by this update that have not been announced yet. */
export const unseenMissions = (data: GameUpdatePayload, notified: ReadonlySet<string>): string[] =>
  (data.newlyCompletedMissions ?? []).filter(id => !notified.has(id));

/* --------------------------------------------------------------- reducers */

export interface ReduceContext {
  /** Clicks counted locally that the server has not acknowledged. */
  unacked: number;
}

/**
 * Applies one message to the game state. Messages that do not touch the game
 * state (or carry nothing to apply) return `state` unchanged, so a functional
 * setState bails out.
 */
export function reduceGameState(state: GameState, msg: GameMessage, ctx: ReduceContext = { unacked: 0 }): GameState {
  switch (msg.type) {
    case 'init_success':
    case 'auth_success':
      return mapInitResponse(msg.data);

    case 'game_update': {
      const data = msg.data;
      if (!data) return state;
      const prev = state;
      const clickValue = data.bananasPerClick ?? prev.clickValue;
      // Clicks the server has not counted yet are re-applied on top of its
      // value, so the counter doesn't roll back while a sync is in flight.
      return {
        ...prev,
        bananas: data.bananas !== undefined ? data.bananas + ctx.unacked * clickValue : prev.bananas,
        clickValue,
        autoClickers: data.bananasPerSecond ?? prev.autoClickers,
        stocks: data.stocks ?? prev.stocks,
        ownedThemes: (typeof data.ownedThemes === 'string' ? data.ownedThemes.split(',') : data.ownedThemes) || prev.ownedThemes,
        clickCount: data.totalClicks !== undefined ? data.totalClicks + ctx.unacked : prev.clickCount,
        clan_id: data.clan_id !== undefined ? data.clan_id : prev.clan_id,
        totalBananasEarned: data.totalBananasEarned !== undefined ? data.totalBananasEarned : prev.totalBananasEarned,
        prestigeCount: data.prestigeCount !== undefined ? data.prestigeCount : prev.prestigeCount,
        banana_dna: data.bananaDNA !== undefined ? data.bananaDNA : prev.banana_dna,
        // Clan/soot fields: the server is authoritative on every sync tick,
        // so the casino tables and the clan tax selector stay in step.
        isSooty: data.isSooty !== undefined ? data.isSooty : prev.isSooty,
        sootRemaining: data.sootRemaining !== undefined ? data.sootRemaining : prev.sootRemaining,
        taxRate: data.taxRate !== undefined ? data.taxRate : prev.taxRate,
        totalDonated: data.totalDonated !== undefined ? data.totalDonated : prev.totalDonated,
      };
    }

    case 'purchase_success': {
      const stats = msg.data.data;
      if (!stats) return state;
      return {
        ...state,
        bananas: stats.bananas,
        clickValue: stats.bananasPerClick,
        autoClickers: stats.bananasPerSecond,
        banana_dna: stats.bananaDNA !== undefined ? stats.bananaDNA : state.banana_dna,
      };
    }

    case 'prestige_success': {
      const res = msg.data;
      return {
        ...state,
        bananas: 0,
        clickCount: 0,
        totalBananasEarned: 0,
        prestigeCount: res.prestigeCount !== undefined ? res.prestigeCount : state.prestigeCount + 1,
        banana_dna: res.bananaDNA !== undefined ? res.bananaDNA : state.banana_dna + (res.dnaGained || 0),
        clickValue: res.bananasPerClick !== undefined ? res.bananasPerClick : state.clickValue,
        autoClickers: res.bananasPerSecond !== undefined ? res.bananasPerSecond : 0,
      };
    }

    case 'trade_success':
      return { ...state, bananas: msg.data.new_balance };

    case 'portfolio_update': {
      const data = msg.data;
      return {
        ...state,
        stocks: {
          ...state.stocks,
          [data.symbol]: {
            shares: data.shares || 0,
            averageBuyPrice: data.averageBuyPrice || state.stocks[data.symbol]?.averageBuyPrice || 0,
          },
        },
      };
    }

    case 'leaderboard_update':
      return { ...state, leaderboard: msg.data };

    case 'market_update': {
      const updatedStocks = [...state.marketData];
      let hasChanges = false;
      msg.data.stocks.forEach(update => {
        const index = updatedStocks.findIndex(s => s.symbol === update.symbol);
        if (index !== -1) {
          updatedStocks[index] = {
            ...updatedStocks[index],
            current_price: update.current_price,
            change_24h: update.change,
            day_high: update.high,
            day_low: update.low,
            // Update with candle if provided (useful for charts)
            lastCandle: update.candle,
          };
          hasChanges = true;
        }
      });
      return hasChanges ? { ...state, marketData: updatedStocks } : state;
    }

    case 'name_change_success':
      return { ...state, username: msg.data.name };

    case 'missions_state':
      return { ...state, missions: msg.data };

    default:
      return state;
  }
}

/** Applies one message to the upgrade catalogue; unrelated messages return it unchanged. */
export function reduceUpgrades(upgrades: Upgrade[], msg: GameMessage): Upgrade[] {
  switch (msg.type) {
    case 'init_success':
    case 'auth_success':
      return msg.data.upgrades.map(mapUpgrade);

    case 'purchase_success': {
      const payload = msg.data;
      return upgrades.map(u =>
        u.id === payload.upgrade_id
          ? { ...u, owned: payload.new_level, cost: payload.next_cost !== undefined && payload.next_cost !== null ? payload.next_cost : u.cost }
          : u
      );
    }

    case 'prestige_success':
      return msg.data.upgrades
        ? msg.data.upgrades.map(mapUpgrade)
        : upgrades.map(u => (u.type !== 'prestige' ? { ...u, owned: 0 } : u));

    default:
      return upgrades;
  }
}
