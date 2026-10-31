import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';
import { socketManager } from '@app/lib/socket';
import { api } from '@app/lib/api';
import Modal from '@app/components/shared/Modal';
import BananLoader from '@app/components/shared/BananLoader';
import { useInterval } from '@app/hooks/useInterval';

import type { LeaderboardEntry, GameState, Upgrade, MarketStock, Mission } from '@app/types/game';

// Backend types
interface BackendGameState {
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

interface BackendUpgrade {
  upgrade_id: string;
  name: string;
  base_cost: number;
  multiplier: number;
  upgrade_type: 'click' | 'auto' | 'synergy' | 'prestige';
  description: string;
  owned: number;
}

const mapUpgrade = (u: BackendUpgrade): Upgrade => ({
  id: u.upgrade_id,
  name: u.name,
  cost: u.base_cost,
  value: u.multiplier,
  type: u.upgrade_type,
  desc: u.description,
  owned: u.owned
});

/** A sync sent to the server whose game_update has not come back yet. */
interface InFlightSync {
  clicks: number;
  sentAt: number;
}

// A sync the server dropped (error, replay guard) never gets a game_update,
// so stop counting its clicks after this long rather than inflating forever.
const IN_FLIGHT_TTL_MS = 5000;

interface BackendAchievement {
  achievement_id: string;
  name: string;
}

interface InitResponse {
  userId: string;
  gameState: BackendGameState;
  upgrades: BackendUpgrade[];
  achievements: BackendAchievement[];
  leaderboard: LeaderboardEntry[];
}


interface GameContextType {
  gameState: GameState;
  availableUpgrades: Upgrade[];
  isLoading: boolean;
  clickBanana: () => void;
  buyUpgrade: (upgradeId: string) => Promise<boolean>;
  changeName: (name: string) => void;
  claimMission: (missionId: string) => void;
  buyStock: (symbol: string, quantity: number, maxPrice?: number) => Promise<boolean>;
  sellStock: (symbol: string, quantity: number, minPrice?: number) => Promise<boolean>;
  buyTheme: (themeId: string) => Promise<boolean>;
  getMissions: () => void;
  setClanTaxRate: (rate: number) => Promise<void>;
}

const defaultState: GameState = {
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
  totalBananasEarned: 0
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [availableUpgrades, setAvailableUpgrades] = useState<Upgrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notice, setNotice] = useState<{ title: string; message: string } | null>(null);
  // Clicks not yet sent, and syncs sent but not yet answered. Their sum is
  // what the server's banana count does not include yet.
  const pendingClicks = useRef(0);
  const inFlightSyncs = useRef<InFlightSync[]>([]);
  const notifiedMissions = useRef<Set<string>>(new Set());

  const { authenticated, token, userId, loading: authLoading } = useAuth();

  // Single effect that manages the WebSocket lifecycle.
  // Rules:
  //  - Wait until Keycloak has resolved (authLoading === false).
  //  - Set the token first so it's baked into the handshake subprotocol.
  //  - Call connect() exactly once per resolved auth state; the manager's
  //    generation counter absorbs any React Strict-Mode double-invoke.
  //  - Do NOT call disconnect() in the cleanup — GameProvider wraps the whole
  //    app and is never unmounted in production, so cleanup only fires during
  //    Strict-Mode's dev double-invoke and would tear down a healthy socket.
  const connectedRef = useRef(false);

  // Keep the manager's token current (initial login and Keycloak silent
  // refresh). Declared before the init effect so the token is set before the
  // first connect() in the same commit.
  useEffect(() => {
    if (!authLoading) socketManager.setToken(token);
  }, [token, authLoading]);

  // Token rotation alone must not re-init the game, so token is not a dep.
  useEffect(() => {
    if (authLoading) return;
    if (!authenticated || !userId) {
      socketManager.disconnect();
      setTimeout(() => setIsLoading(false), 0); // Let the UI decide what to show (e.g., login prompt)
      return;
    }

    // Guard against Strict-Mode's deliberate double-fire.
    if (!connectedRef.current) {
      connectedRef.current = true;
      socketManager.connect(userId);
    }

    // Always send init_game once the socket opens.
    socketManager.waitForConnection().then(() => {
      socketManager.send('init_game', { userId: userId });
    });

    return () => {
      connectedRef.current = false;
    };
  }, [authLoading, authenticated, userId]);

  /** Sends a sync carrying the unsent clicks; they stay pending if the socket is down. */
  const sendSync = useCallback(() => {
    const clicks = pendingClicks.current;
    if (socketManager.send('sync', { pendingClicks: clicks })) {
      pendingClicks.current = 0;
      inFlightSyncs.current.push({ clicks, sentAt: Date.now() });
    }
  }, []);

  // Socket Listeners
  useEffect(() => {
    const handleInitSuccess = (response: InitResponse) => {
      // socket.ts unwraps message.data, so response IS the data object
      const { userId, gameState: serverState, upgrades, achievements, leaderboard } = response;

      // Map backend state to frontend state
      const mappedState: GameState = {
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
        totalBananasEarned: serverState.total_bananas_earned || 0
      };

      // A fresh snapshot supersedes any sync still in flight.
      inFlightSyncs.current = [];
      setGameState(mappedState);

      // Process Upgrades
      setAvailableUpgrades(upgrades.map(mapUpgrade));

      // Also trigger an immediate sync to get latest portfolio/passive/etc
      sendSync();

      // Fetch initial market data via REST API as requested
      api.get('/market/stocks').then(res => {
        setGameState(prev => ({
          ...prev,
          marketData: res.data
        }));
      }).catch(err => console.error("Failed to fetch initial market data:", err));

      setIsLoading(false);
    };

    const handleGameUpdate = (data: {
      bananas: number;
      bananasPerClick: number;
      bananasPerSecond: number;
      stocks: Record<string, { shares: number, averageBuyPrice: number }>;
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
    }) => {
      // Every game_update answers the oldest sync still in flight.
      const now = Date.now();
      inFlightSyncs.current = inFlightSyncs.current
        .slice(1)
        .filter(s => now - s.sentAt < IN_FLIGHT_TTL_MS);

      if (!data || Object.keys(data).length === 0) return;

      // Clicks the server has not counted yet are re-applied on top of its
      // value, so the counter doesn't roll back while a sync is in flight.
      const unacked = pendingClicks.current
        + inFlightSyncs.current.reduce((sum, s) => sum + s.clicks, 0);

      if (data.newlyCompletedMissions && data.newlyCompletedMissions.length > 0) {
        const newMissions = data.newlyCompletedMissions.filter(id => !notifiedMissions.current.has(id));
        if (newMissions.length > 0) {
          newMissions.forEach(id => notifiedMissions.current.add(id));
          // Trigger an immediate fetch of missions state to update the UI
          socketManager.send('get_missions', {});
        }
      }

      setGameState(prev => {
        const clickValue = data.bananasPerClick ?? prev.clickValue;
        return {
          ...prev,
          bananas: data.bananas + unacked * clickValue,
          clickValue,
          autoClickers: data.bananasPerSecond,
          stocks: data.stocks,
          ownedThemes: (typeof data.ownedThemes === 'string' ? data.ownedThemes.split(',') : data.ownedThemes) || prev.ownedThemes,
          clickCount: data.totalClicks !== undefined ? data.totalClicks + unacked : prev.clickCount,
          clan_id: data.clan_id !== undefined ? data.clan_id : prev.clan_id,
          totalBananasEarned: data.totalBananasEarned !== undefined ? data.totalBananasEarned : prev.totalBananasEarned,
          prestigeCount: data.prestigeCount !== undefined ? data.prestigeCount : prev.prestigeCount,
          banana_dna: data.bananaDNA !== undefined ? data.bananaDNA : prev.banana_dna,
          // Clan/soot fields: the server is authoritative on every sync tick,
          // so the casino tables and the clan tax selector stay in step.
          isSooty: data.isSooty !== undefined ? data.isSooty : prev.isSooty,
          sootRemaining: data.sootRemaining !== undefined ? data.sootRemaining : prev.sootRemaining,
          taxRate: data.taxRate !== undefined ? data.taxRate : prev.taxRate,
          totalDonated: data.totalDonated !== undefined ? data.totalDonated : prev.totalDonated
        };
      });
    };

    const handleLeaderboardUpdate = (data: LeaderboardEntry[]) => {
      setGameState(prev => ({
        ...prev,
        leaderboard: data
      }));
    };




    const handleMarketUpdate = (data: { stocks: {
      symbol: string;
      current_price: number;
      change: number;
      high: number;
      low: number;
      candle: unknown;
    }[] }) => {
      if (!data || !data.stocks) return;
      
      setGameState(prev => {
        const updatedStocks = [...prev.marketData];
        let hasChanges = false;

        data.stocks.forEach((update) => {
          const index = updatedStocks.findIndex(s => s.symbol === update.symbol);
          if (index !== -1) {
            updatedStocks[index] = {
              ...updatedStocks[index],
              current_price: update.current_price,
              change_24h: update.change,
              day_high: update.high,
              day_low: update.low,
              // Update with candle if provided (useful for charts)
              lastCandle: update.candle as MarketStock['lastCandle']
            };
            hasChanges = true;
          }
        });

        if (!hasChanges) return prev;
        return { ...prev, marketData: updatedStocks };
      });
    };

    // (Removed direct socketManager.on('init_success') here as it is moved to the switch case below)

    const handleAuthSuccess = (response: { gameState: InitResponse }) => {
      const { gameState } = response;
      if (gameState) {
        handleInitSuccess(gameState);
      }
    };
    
    // (Removed direct socketManager.on('auth_success') here as it is moved to the switch case below)

    const handleUpgradeSuccess = (response: {
      success: boolean;
      upgrade_id: string;
      new_level: number;
      next_cost?: number;
      data?: {
        bananas: number;
        bananasPerClick: number;
        bananasPerSecond: number;
        bananaDNA?: number;
      };
    }) => {
      const payload = response;
      if (!payload.success) return;

      setAvailableUpgrades(prev => prev.map(u =>
        u.id === payload.upgrade_id
          ? { ...u, owned: payload.new_level, cost: payload.next_cost !== undefined && payload.next_cost !== null ? payload.next_cost : u.cost }
          : u
      ));

      const stats = payload.data;
      if (stats) {
        setGameState(prev => ({
          ...prev,
          bananas: stats.bananas,
          clickValue: stats.bananasPerClick,
          autoClickers: stats.bananasPerSecond,
          banana_dna: stats.bananaDNA !== undefined ? stats.bananaDNA : prev.banana_dna
        }));
      }
    };

    const handlePrestigeSuccess = (response: {
      success: boolean;
      dnaGained?: number;
      bananaDNA?: number;
      prestigeCount?: number;
      bananasPerClick?: number;
      bananasPerSecond?: number;
      upgrades?: BackendUpgrade[];
    }) => {
      if (!response) return;

      if (response.upgrades && Array.isArray(response.upgrades)) {
        setAvailableUpgrades(response.upgrades.map(mapUpgrade));
      } else {
        setAvailableUpgrades(prev => prev.map(u => 
          u.type !== 'prestige' ? { ...u, owned: 0 } : u
        ));
      }

      setGameState(prev => ({
          ...prev,
          bananas: 0,
          clickCount: 0,
          totalBananasEarned: 0,
          prestigeCount: response.prestigeCount !== undefined ? response.prestigeCount : prev.prestigeCount + 1,
          banana_dna: response.bananaDNA !== undefined ? response.bananaDNA : prev.banana_dna + (response.dnaGained || 0),
          clickValue: response.bananasPerClick !== undefined ? response.bananasPerClick : prev.clickValue,
          autoClickers: response.bananasPerSecond !== undefined ? response.bananasPerSecond : 0,
      }));
    };

    const handleTradeSuccess = (response: { success: boolean; new_balance?: number }) => {
      if (response.success && typeof response.new_balance === 'number') {
        const balance = response.new_balance;
        setGameState(prev => ({
          ...prev,
          bananas: balance
        }));
      }
    };

    const handlePortfolioUpdate = (data: { symbol: string; shares?: number; averageBuyPrice?: number }) => {
      if (data && data.symbol) {
        setGameState(prev => ({
          ...prev,
          stocks: {
            ...prev.stocks,
            [data.symbol]: {
                shares: data.shares || 0,
                averageBuyPrice: data.averageBuyPrice || prev.stocks[data.symbol]?.averageBuyPrice || 0
            }
          }
        }));
      }
    };

    const handleNameChangeSuccess = (data: { name: string }) => {
      if (data && data.name) {
        setGameState(prev => ({
          ...prev,
          username: data.name
        }));
      }
    };

    const handleError = (text: string | undefined) => {
      if (text) {
        // If it's an auth error, don't show the modal, try to refresh instead
        if (text.toLowerCase().includes('auth failed') || text.toLowerCase().includes('token expired')) {
          console.log("Auth error detected in WebSocket, attempting refresh...");
          // AuthContext handles renewal via periodic sync and token change listeners,
          // so we just log it here.
          return;
        }
        setNotice({ title: 'ERROR', message: text });
      }
    };

    const handleMessage = (message: { type: string; data?: unknown; message?: string }) => {
      if (!message || !message.type) return;
      const data = message.data;

      switch (message.type) {
        case 'init_success':
          handleInitSuccess(data as InitResponse);
          break;
        case 'auth_success':
          handleAuthSuccess(data as { gameState: InitResponse });
          break;
        case 'game_update':
          handleGameUpdate(data as Parameters<typeof handleGameUpdate>[0]);
          break;
        case 'purchase_success':
          handleUpgradeSuccess(data as Parameters<typeof handleUpgradeSuccess>[0]);
          break;
        case 'prestige_success':
          handlePrestigeSuccess(data as Parameters<typeof handlePrestigeSuccess>[0]);
          break;
        case 'trade_success':
          handleTradeSuccess(data as Parameters<typeof handleTradeSuccess>[0]);
          break;
        case 'portfolio_update':
          handlePortfolioUpdate(data as Parameters<typeof handlePortfolioUpdate>[0]);
          break;
        case 'leaderboard_update':
          handleLeaderboardUpdate(data as LeaderboardEntry[]);
          break;
        case 'market_update':
          handleMarketUpdate(data as Parameters<typeof handleMarketUpdate>[0]);
          break;
        case 'name_change_success':
          handleNameChangeSuccess(data as { name: string });
          break;
        case 'missions_state':
          setGameState(prev => ({ ...prev, missions: (data as Mission[]) || [] }));
          break;
        case 'mission_claimed':
          setNotice({
            title: 'MISSION RÉUSSIE',
            message: `MISSION RÉUSSIE ! +${(data as { reward?: number })?.reward || 0} 🍌`
          });
          break;
        case 'error':
          // The backend sends {type: 'error', message}; older frames nested it in data.
          handleError(message.message ?? (data as { message?: string } | undefined)?.message);
          break;
      }
    };

    socketManager.subscribe(handleMessage);

    return () => {
      socketManager.unsubscribe(handleMessage);
    };
  }, [authLoading, sendSync]);

  // Sync Interval: every tick carries the unsent clicks (or none, to pick up
  // passive income). Only runs for a loaded, signed-in player on a live socket.
  useInterval(() => {
    if (socketManager.isConnected()) sendSync();
  }, authenticated && !isLoading ? 1000 : null);

  const clickBanana = useCallback(() => {
    pendingClicks.current += 1;
    setGameState(prev => ({
      ...prev,
      bananas: prev.bananas + prev.clickValue,
      clickCount: prev.clickCount + 1
    }));
  }, []);

  const hasUserId = !!gameState.userId;
  const buyUpgrade = useCallback(async (upgradeId: string): Promise<boolean> => {
    if (!hasUserId) return false;
    socketManager.send('buy_upgrade', { upgradeId });
    return true;
  }, [hasUserId]);

  const changeName = useCallback((name: string) => {
    socketManager.send('change_name', { name });
  }, []);

  const claimMission = useCallback((missionId: string) => {
    socketManager.send('claim_mission', { missionId });
  }, []);

  const getMissions = useCallback(() => {
    socketManager.send('get_missions', {});
  }, []);

  // The clan tax lives on the clan_members row but drives every sync, so the
  // context owns it: the new rate lands in gameState before the next tick.
  const setClanTaxRate = useCallback(async (rate: number) => {
    const res = await api.post('/clan/tax/set', { tax_rate: rate });
    const applied = typeof res.data?.tax_rate === 'number' ? res.data.tax_rate : rate;
    setGameState(prev => ({ ...prev, taxRate: applied }));
    sendSync();
  }, [sendSync]);

  const buyStock = useCallback(async (symbol: string, quantity: number, maxPrice?: number): Promise<boolean> => {
    socketManager.send('buy_stock', { symbol, shares: quantity, maxPrice });
    return true;
  }, []);

  const sellStock = useCallback(async (symbol: string, quantity: number, minPrice?: number): Promise<boolean> => {
    socketManager.send('sell_stock', { symbol, shares: quantity, minPrice });
    return true;
  }, []);

  const buyTheme = useCallback(async (themeId: string) => {
    socketManager.send('buy_theme', { themeId });
    return true;
  }, []);

  const value = useMemo<GameContextType>(() => ({
    gameState,
    availableUpgrades,
    isLoading,
    clickBanana,
    buyUpgrade,
    changeName,
    claimMission,
    buyStock,
    sellStock,
    buyTheme,
    getMissions,
    setClanTaxRate
  }), [gameState, availableUpgrades, isLoading, clickBanana, buyUpgrade, changeName, claimMission, buyStock, sellStock, buyTheme, getMissions, setClanTaxRate]);

  return (
    <GameContext.Provider value={value}>
      {isLoading ? (
        <BananLoader message="IMPORTING_GAME..." />
      ) : (
        children
      )}
      <Modal
        isOpen={!!notice}
        onClose={() => setNotice(null)}
        title={notice?.title ?? 'ERROR'}
      >
        <p className="text-white text-lg font-mono">{notice?.message}</p>
      </Modal>
    </GameContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
