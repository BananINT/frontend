import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  setUserId: (id: string) => void;
  changeName: (name: string) => void;
  claimMission: (missionId: string) => void;
  buyStock: (symbol: string, quantity: number, maxPrice?: number) => Promise<boolean>;
  sellStock: (symbol: string, quantity: number, minPrice?: number) => Promise<boolean>;
  buyTheme: (themeId: string) => Promise<boolean>;
  getMissions: () => void;
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
  totalDonated: 0
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [availableUpgrades, setAvailableUpgrades] = useState<Upgrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingClicks = useRef(0);
  const lastServerState = useRef<Partial<GameState>>({});
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

  useEffect(() => {
    if (authLoading) return;
    if (!authenticated || !userId) {
      socketManager.disconnect();
      setTimeout(() => setIsLoading(false), 0); // Let the UI decide what to show (e.g., login prompt)
      return;
    }

    socketManager.setToken(token);

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
  }, [authLoading, authenticated, userId, token]);

  // When the token rotates (Keycloak silent refresh), keep the manager in sync
  // so that the next reconnect uses the fresh token.
  useEffect(() => {
    if (!authLoading) socketManager.setToken(token);
  }, [token, authLoading]);

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
        missions: []
      };

      lastServerState.current = mappedState;
      setGameState(mappedState);

      // Process Upgrades
      const mappedUpgrades = upgrades.map((u: BackendUpgrade) => ({
        id: u.upgrade_id,
        name: u.name,
        cost: u.base_cost,
        value: u.multiplier,
        type: u.upgrade_type,
        desc: u.description,
        owned: u.owned
      }));
      setAvailableUpgrades(mappedUpgrades);

      // Also trigger an immediate sync to get latest portfolio/passive/etc
      socketManager.send('sync', { pendingClicks: 0 });

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
    }) => {
      if (!data || Object.keys(data).length === 0) return;

      setGameState(prev => {
        const newState = {
          ...prev,
          bananas: data.bananas,
          clickValue: data.bananasPerClick,
          autoClickers: data.bananasPerSecond,
          stocks: data.stocks,
          ownedThemes: (typeof data.ownedThemes === 'string' ? data.ownedThemes.split(',') : data.ownedThemes) || prev.ownedThemes,
          clickCount: data.totalClicks || prev.clickCount,
          clan_id: data.clan_id !== undefined ? data.clan_id : prev.clan_id
        };
        
        if (data.newlyCompletedMissions && data.newlyCompletedMissions.length > 0) {
          const newMissions = data.newlyCompletedMissions.filter(id => !notifiedMissions.current.has(id));
          if (newMissions.length > 0) {
            console.log("Missions completed!", newMissions);
            newMissions.forEach(id => notifiedMissions.current.add(id));
            // Trigger an immediate fetch of missions state to update the UI
            socketManager.send('get_missions', {});
          }
        }

        lastServerState.current = newState;
        return newState;
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
      if (gameState && gameState.userId) {
        setGameState(prev => ({
          ...prev,
          userId: gameState.userId
        }));
        localStorage.setItem('userId', gameState.userId);
      }
      
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
          ? { ...u, owned: payload.new_level, cost: payload.next_cost || u.cost }
          : u
      ));

      const stats = payload.data;
      if (stats) {
        setGameState(prev => {
          const newState = {
            ...prev,
            bananas: stats.bananas,
            clickValue: stats.bananasPerClick,
            autoClickers: stats.bananasPerSecond,
            banana_dna: stats.bananaDNA || prev.banana_dna
          };
          lastServerState.current = newState;
          return newState;
        });
      }
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

    const handleError = (data: { message: string }) => {
      if (data && data.message) {
        // If it's an auth error, don't show the modal, try to refresh instead
        if (data.message.toLowerCase().includes('auth failed') || data.message.toLowerCase().includes('token expired')) {
          console.log("Auth error detected in WebSocket, attempting refresh...");
          // AuthContext handles renewal via periodic sync and token change listeners,
          // so we just log it here.
          return;
        }
        setErrorMessage(data.message);
      }
    };

    const handleMessage = (message: { type: string; data?: unknown }) => {
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
          setErrorMessage(`MISSION RÉUSSIE ! +${(data as { reward?: number })?.reward || 0} 🍌`);
          break;
        case 'error':
          handleError(data as { message: string });
          break;
      }
    };

    socketManager.subscribe(handleMessage);

    return () => {
      socketManager.unsubscribe(handleMessage);
    };
  }, [authLoading]);

  // Sync Interval
  useInterval(() => {
    if (pendingClicks.current > 0) {
      socketManager.send('sync', { pendingClicks: pendingClicks.current });
      pendingClicks.current = 0;
    } else {
      // Send empty sync to get server time/passive income updates
      socketManager.send('sync', { pendingClicks: 0 });
    }
  }, 1000);

  const clickBanana = () => {
    pendingClicks.current += 1;
    setGameState(prev => ({
      ...prev,
      bananas: prev.bananas + prev.clickValue,
      clickCount: prev.clickCount + 1
    }));
  };

  const buyUpgrade = async (upgradeId: string): Promise<boolean> => {
    if (!gameState.userId) return false;
    socketManager.send('buy_upgrade', { upgradeId });
    return true;
  };

  const setUserId = (newId: string) => {
    // Reload to re-init with new ID
    localStorage.setItem('userId', newId);
    window.location.reload();
  };

  const changeName = (name: string) => {
    socketManager.send('change_name', { name });
  };


  const claimMission = (missionId: string) => {
    socketManager.send('claim_mission', { missionId });
  };

  const getMissions = () => {
    socketManager.send('get_missions', {});
  };

  const buyStock = async (symbol: string, quantity: number, maxPrice?: number): Promise<boolean> => {
    socketManager.send('buy_stock', { symbol, shares: quantity, maxPrice });
    return true;
  };

  const sellStock = async (symbol: string, quantity: number, minPrice?: number): Promise<boolean> => {
    socketManager.send('sell_stock', { symbol, shares: quantity, minPrice });
    return true;
  };

  return (
    <GameContext.Provider value={{
      gameState,
      availableUpgrades,
      isLoading,
      clickBanana,
      buyUpgrade,
      setUserId,
      changeName,
      claimMission,
      buyStock,
      sellStock,
      buyTheme: async (themeId: string) => {
        socketManager.send('buy_theme', { themeId });
        return true;
      },
      getMissions
    }}>
      {isLoading ? (
        <BananLoader message="IMPORTING_GAME..." />
      ) : (
        children
      )}
      <Modal
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title="ERROR"
      >
        <p className="text-white text-lg font-mono">{errorMessage}</p>
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
