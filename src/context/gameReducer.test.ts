import { describe, it, expect } from 'vitest';
import {
  ackOldestSync,
  defaultGameState,
  IN_FLIGHT_TTL_MS,
  parseGameMessage,
  reduceGameState,
  reduceUpgrades,
  unackedClicks,
  unseenMissions,
  type GameMessage,
  type InitResponse,
} from './gameReducer';
import type { GameState, MarketStock, Upgrade } from '@app/types/game';

const init: InitResponse = {
  userId: 'u1',
  gameState: {
    bananas: 500,
    total_clicks: 42,
    bananas_per_second: 3,
    bananas_per_click: 2,
    username: 'SINGE',
    clan_id: null,
    prestige_count: 1,
    banana_dna: 7,
    owned_themes: 'default,neon',
    total_bananas_earned: 900,
  },
  upgrades: [
    { upgrade_id: 'click1', name: 'Click', base_cost: 10, multiplier: 1, upgrade_type: 'click', description: 'd', owned: 2 },
    { upgrade_id: 'dna1', name: 'DNA', base_cost: 5, multiplier: 1, upgrade_type: 'prestige', description: 'd', owned: 1 },
  ],
  achievements: [{ achievement_id: 'first', name: 'First' }],
  leaderboard: [{ name: 'SINGE', score: 500, date: '', prestigeCount: 1 }],
};

const parse = (type: string, data?: unknown, message?: string): GameMessage => {
  const msg = parseGameMessage({ type, data, message });
  if (!msg) throw new Error(`${type} did not parse`);
  return msg;
};

const upgrades: Upgrade[] = reduceUpgrades([], parse('init_success', init));

describe('parseGameMessage', () => {
  it('rejects empty frames and unknown types', () => {
    expect(parseGameMessage(null)).toBeNull();
    expect(parseGameMessage({ type: '' })).toBeNull();
    expect(parseGameMessage({ type: 'slots_result', data: {} })).toBeNull();
  });

  it('rejects an init snapshot missing the fields the mapper reads', () => {
    expect(parseGameMessage({ type: 'init_success', data: { userId: 'u1' } })).toBeNull();
    expect(parseGameMessage({ type: 'init_success', data: { ...init, upgrades: undefined } })).toBeNull();
  });

  it('unwraps auth_success to the init snapshot', () => {
    const msg = parse('auth_success', { gameState: init });
    expect(msg).toEqual({ type: 'auth_success', data: init });
    expect(parseGameMessage({ type: 'auth_success', data: {} })).toBeNull();
  });

  it('keeps an empty game_update so it still acknowledges a sync', () => {
    expect(parse('game_update', {})).toEqual({ type: 'game_update', data: null });
    expect(parse('game_update', undefined)).toEqual({ type: 'game_update', data: null });
  });

  it('drops mistyped game_update fields instead of trusting them', () => {
    const msg = parse('game_update', { bananas: '12', stocks: 'nope', isSooty: 1, sootRemaining: 30 });
    expect(msg).toMatchObject({ type: 'game_update', data: { bananas: undefined, stocks: undefined, isSooty: undefined, sootRemaining: 30 } });
  });

  it('ignores trades without a balance and failed purchases', () => {
    expect(parseGameMessage({ type: 'trade_success', data: { success: true } })).toBeNull();
    expect(parseGameMessage({ type: 'trade_success', data: { success: false, new_balance: 3 } })).toBeNull();
    expect(parseGameMessage({ type: 'purchase_success', data: { success: false, upgrade_id: 'x', new_level: 1 } })).toBeNull();
  });

  it('reads the error text from the frame, then from data', () => {
    expect(parse('error', undefined, 'boom')).toEqual({ type: 'error', message: 'boom' });
    expect(parse('error', { message: 'legacy' })).toEqual({ type: 'error', message: 'legacy' });
    expect(parseGameMessage({ type: 'error', data: {} })).toBeNull();
  });

  it('defaults mission rewards and mission lists', () => {
    expect(parse('mission_claimed', {})).toEqual({ type: 'mission_claimed', data: { reward: 0 } });
    expect(parse('missions_state', null)).toEqual({ type: 'missions_state', data: [] });
  });
});

describe('in-flight click FIFO', () => {
  it('acknowledges the oldest sync and expires stale ones', () => {
    const now = 100_000;
    const inFlight = [
      { clicks: 5, sentAt: now - 100 },
      { clicks: 3, sentAt: now - IN_FLIGHT_TTL_MS - 1 },
      { clicks: 2, sentAt: now - 10 },
    ];
    expect(ackOldestSync(inFlight, now)).toEqual([{ clicks: 2, sentAt: now - 10 }]);
    expect(ackOldestSync([], now)).toEqual([]);
  });

  it('counts pending and in-flight clicks together', () => {
    expect(unackedClicks(4, [{ clicks: 5, sentAt: 0 }, { clicks: 1, sentAt: 0 }])).toBe(10);
  });

  it('announces each completed mission once', () => {
    const notified = new Set(['a']);
    expect(unseenMissions({ newlyCompletedMissions: ['a', 'b'] }, notified)).toEqual(['b']);
    expect(unseenMissions({}, notified)).toEqual([]);
  });
});

describe('reduceGameState', () => {
  const loaded: GameState = reduceGameState(defaultGameState, parse('init_success', init));

  it('maps the init snapshot', () => {
    expect(loaded).toMatchObject({
      bananas: 500,
      clickCount: 42,
      autoClickers: 3,
      clickValue: 2,
      userId: 'u1',
      username: 'SINGE',
      unlockedAchievements: ['first'],
      ownedThemes: ['default', 'neon'],
      prestigeCount: 1,
      banana_dna: 7,
      totalBananasEarned: 900,
    });
    expect(upgrades.map(u => [u.id, u.owned, u.cost])).toEqual([['click1', 2, 10], ['dna1', 1, 5]]);
  });

  it('re-applies unacknowledged clicks on top of a game_update', () => {
    const next = reduceGameState(
      loaded,
      parse('game_update', { bananas: 1000, bananasPerClick: 3, bananasPerSecond: 4, totalClicks: 50, stocks: {} }),
      { unacked: 2 },
    );
    expect(next.bananas).toBe(1000 + 2 * 3);
    expect(next.clickCount).toBe(52);
    expect(next.clickValue).toBe(3);
    expect(next.autoClickers).toBe(4);
  });

  it('keeps fields a partial game_update leaves out', () => {
    const next = reduceGameState(loaded, parse('game_update', { isSooty: true, sootRemaining: 120, ownedThemes: 'a,b' }));
    expect(next.bananas).toBe(loaded.bananas);
    expect(next.stocks).toBe(loaded.stocks);
    expect(next.isSooty).toBe(true);
    expect(next.sootRemaining).toBe(120);
    expect(next.ownedThemes).toEqual(['a', 'b']);
    expect(reduceGameState(loaded, parse('game_update', {}))).toBe(loaded);
  });

  it('applies purchase stats and the new upgrade level', () => {
    const msg = parse('purchase_success', {
      success: true, upgrade_id: 'click1', new_level: 3, next_cost: 20,
      data: { bananas: 400, bananasPerClick: 5, bananasPerSecond: 3 },
    });
    expect(reduceGameState(loaded, msg)).toMatchObject({ bananas: 400, clickValue: 5, banana_dna: 7 });
    expect(reduceUpgrades(upgrades, msg)[0]).toMatchObject({ owned: 3, cost: 20 });
    const noStats = parse('purchase_success', { success: true, upgrade_id: 'click1', new_level: 3 });
    expect(reduceGameState(loaded, noStats)).toBe(loaded);
    expect(reduceUpgrades(upgrades, noStats)[0].cost).toBe(10);
  });

  it('resets the run on prestige', () => {
    const msg = parse('prestige_success', { success: true, dnaGained: 4 });
    expect(reduceGameState(loaded, msg)).toMatchObject({
      bananas: 0, clickCount: 0, totalBananasEarned: 0, prestigeCount: 2, banana_dna: 11, autoClickers: 0, clickValue: 2,
    });
    expect(reduceUpgrades(upgrades, msg).map(u => u.owned)).toEqual([0, 1]);
  });

  it('updates balance, portfolio, name, leaderboard and missions', () => {
    expect(reduceGameState(loaded, parse('trade_success', { success: true, new_balance: 77 })).bananas).toBe(77);
    const withStock = reduceGameState(loaded, parse('portfolio_update', { symbol: 'BG', shares: 3, averageBuyPrice: 10 }));
    expect(withStock.stocks.BG).toEqual({ shares: 3, averageBuyPrice: 10 });
    expect(reduceGameState(withStock, parse('portfolio_update', { symbol: 'BG', shares: 1 })).stocks.BG).toEqual({ shares: 1, averageBuyPrice: 10 });
    expect(reduceGameState(loaded, parse('name_change_success', { name: 'KONG' })).username).toBe('KONG');
    expect(reduceGameState(loaded, parse('leaderboard_update', [])).leaderboard).toEqual([]);
    expect(reduceGameState(loaded, parse('missions_state', [{ id: 'm' }])).missions).toEqual([{ id: 'm' }]);
  });

  it('merges market ticks into known stocks only', () => {
    const stock: MarketStock = {
      symbol: 'BG', name: 'BG', current_price: 1, change_24h: 0, day_high: 1, day_low: 1, volatility: 1, lastCandle: null,
    };
    const withMarket = { ...loaded, marketData: [stock] };
    const candle = { time: 1, open: 1, high: 2, low: 1, close: 2 };
    const next = reduceGameState(withMarket, parse('market_update', {
      stocks: [{ symbol: 'BG', current_price: 2, change: 5, high: 3, low: 1, candle }],
    }));
    expect(next.marketData[0]).toMatchObject({ current_price: 2, change_24h: 5, day_high: 3, day_low: 1, lastCandle: candle });
    const unknown = parse('market_update', { stocks: [{ symbol: 'ZZZ', current_price: 2, change: 0, high: 0, low: 0, candle: null }] });
    expect(reduceGameState(withMarket, unknown)).toBe(withMarket);
  });

  it('leaves state alone for messages that only notify', () => {
    expect(reduceGameState(loaded, parse('mission_claimed', { reward: 5 }))).toBe(loaded);
    expect(reduceGameState(loaded, parse('error', undefined, 'x'))).toBe(loaded);
  });
});
