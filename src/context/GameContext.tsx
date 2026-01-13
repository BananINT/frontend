import { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { socketManager } from '@/lib/socket';
import Modal from '@/components/shared/Modal';
import { useInterval } from '@/hooks/useInterval';

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  prestigeCount: number;
}

// Backend types
export interface GameState {
  bananas: number;
  clickCount: number;
  autoClickers: number;
  clickValue: number;
  userId: string;
  team: string | null;
  unlockedAchievements: string[];
  missionProgress: Record<string, { progress: number; completed: boolean }>; // Kept for UI compatibility, even if not fully synced
  stocks: Record<string, number>;
  prestigeCount: number;
  banana_dna: number; // Added from backend
  leaderboard_rank?: number;
  leaderboard: LeaderboardEntry[];
  marketHistory: Record<string, any[]>;
}

export interface Upgrade {
  id: string;
  name: string;
  cost: number;
  value: number;
  type: 'click' | 'auto' | 'synergy' | 'prestige';
  icon?: any;
  desc?: string;
  owned: number;
}

interface GameContextType {
  gameState: GameState;
  availableUpgrades: Upgrade[];
  isLoading: boolean;
  clickBanana: () => void;
  buyUpgrade: (upgradeId: string) => Promise<boolean>;
  setUserId: (id: string) => void;
  joinTeam: (teamId: string) => void;
  claimMission: (missionId: string) => void;
  buyStock: (symbol: string, quantity: number) => Promise<boolean>;
  sellStock: (symbol: string, quantity: number) => Promise<boolean>;
}

const defaultState: GameState = {
  bananas: 0,
  clickCount: 0,
  autoClickers: 0,
  clickValue: 1,
  userId: '',
  team: null,
  unlockedAchievements: [],
  missionProgress: {},
  stocks: {},
  prestigeCount: 0,
  banana_dna: 0,
  leaderboard: [],
  marketHistory: {}
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState>(defaultState);
  const [availableUpgrades, setAvailableUpgrades] = useState<Upgrade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const pendingClicks = useRef(0);
  const lastServerState = useRef<Partial<GameState>>({});

  // Initialize Game
  useEffect(() => {
    const initGame = async () => {
      let storedId = localStorage.getItem('bananaId');

      if (!storedId) {
        storedId = crypto.randomUUID();
        localStorage.setItem('bananaId', storedId);
      }

      try {
        socketManager.connect(storedId);
        await socketManager.waitForConnection();
        socketManager.send('init_session', { sessionId: storedId });
      } catch (error) {
        console.error("Failed to connect socket:", error);
        setIsLoading(false);
      }
    };

    initGame();

    // Socket Listeners
    const handleInitSuccess = (response: any) => {
      // socket.ts unwraps message.data, so response IS the data object
      const { sessionId, gameState: serverState, upgrades, achievements, leaderboard } = response;

      // Map backend state to frontend state
      const mappedState: GameState = {
        bananas: serverState.bananas,
        clickCount: serverState.total_clicks,
        autoClickers: serverState.bananas_per_second,
        clickValue: serverState.bananas_per_click,
        userId: sessionId,
        team: null,
        unlockedAchievements: achievements?.filter((a: any) => a.unlocked).map((a: any) => a.achievement_id) || [],
        missionProgress: {},
        stocks: {}, // Portfolio will be synced via separate portfolio_update or next sync
        prestigeCount: serverState.prestige_count,
        banana_dna: serverState.banana_dna,
        leaderboard: leaderboard || [],
        marketHistory: {} // Initial synced state
      };

      lastServerState.current = mappedState;
      setGameState(mappedState);

      // Process Upgrades
      const mappedUpgrades = upgrades.map((u: any) => ({
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

      setIsLoading(false);
    };

    const handleGameUpdate = (data: any) => {
      if (!data || Object.keys(data).length === 0) return;

      setGameState(prev => {
        const newState = {
          ...prev,
          bananas: Math.max(prev.bananas, data.bananas),
          clickValue: data.bananasPerClick,
          autoClickers: data.bananasPerSecond,
          clickCount: data.totalClicks,
          stocks: data.stocks || prev.stocks
        };
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

    const handleMarketHistory = (response: any) => {
      // response: { type: 'market_history', data: { SYMBOL: [candles], ... } }
      // socket unwraps data if we rely on standard message handler, but socket.ts handles raw message?
      // No, socket.ts line 105: handler(message.data !== undefined ? message.data : message);
      // Backend: await websocket.send_json({ "type": "market_history", "data": history_data })
      // So response passed here is history_data which is { SYMBOL: [candles] }

      if (!response) return;

      setGameState(prev => ({
        ...prev,
        marketHistory: {
          ...prev.marketHistory,
          ...response
        }
      }));
    };

    socketManager.on('init_success', handleInitSuccess);

    const handleUpgradeSuccess = (response: any) => {
      // response is { type: 'purchase_success', data: { success: true, ..., data: { ...stats } } }
      // OR direct data if socket unwraps it. Socket.ts passes message.data.
      // So payload is { success: true, ..., data: { ...stats } }
      const payload = response;
      if (!payload.success) return;

      // Update available upgrades
      setAvailableUpgrades(prev => prev.map(u =>
        u.id === payload.upgrade_id
          ? { ...u, owned: payload.new_level, cost: payload.next_cost || u.cost }
          : u
      ));

      // Update Game State from server response (Source of Truth)
      const stats = payload.data;
      if (stats) {
        setGameState(prev => {
          const newState = {
            ...prev,
            bananas: stats.bananas,
            clickValue: stats.bananasPerClick, // Ensure backend sends camelCase or map it
            autoClickers: stats.bananasPerSecond,
            banana_dna: stats.bananaDNA || prev.banana_dna
          };
          lastServerState.current = newState;
          return newState;
        });
      }
    };

    const handleTradeSuccess = (response: any) => {
      // response: { success, new_balance, ... }
      if (response.success && response.new_balance !== undefined) {
        setGameState(prev => ({
          ...prev,
          bananas: response.new_balance
        }));
      }
    };

    const handlePortfolioUpdate = (data: any) => {
      // data: { symbol, shares }
      if (data && data.symbol) {
        setGameState(prev => ({
          ...prev,
          stocks: {
            ...prev.stocks,
            [data.symbol]: data.shares
          }
        }));
      }
    };

    const handleError = (data: any) => {
      if (data && data.message) setErrorMessage(data.message);
    };

    socketManager.on('game_update', handleGameUpdate);
    socketManager.on('purchase_success', handleUpgradeSuccess);
    socketManager.on('trade_success', handleTradeSuccess);
    socketManager.on('portfolio_update', handlePortfolioUpdate);
    socketManager.on('leaderboard_update', handleLeaderboardUpdate);
    socketManager.on('market_history', handleMarketHistory);
    socketManager.on('error', handleError);

    return () => {
      socketManager.off('game_update', handleGameUpdate);
      socketManager.off('purchase_success', handleUpgradeSuccess);
      socketManager.off('trade_success', handleTradeSuccess);
      socketManager.off('portfolio_update', handlePortfolioUpdate);
      socketManager.off('leaderboard_update', handleLeaderboardUpdate);
      socketManager.off('market_history', handleMarketHistory);
      socketManager.off('error', handleError);
    };
  }, []);

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
    localStorage.setItem('bananaId', newId);
    window.location.reload();
  };

  const joinTeam = (teamId: string) => {
    socketManager.send('join_team', { teamId });
    setGameState(prev => ({ ...prev, team: teamId }));
  };

  const claimMission = (missionId: string) => {
    console.log("Claim mission:", missionId);
  };

  const buyStock = async (symbol: string, quantity: number): Promise<boolean> => {
    socketManager.send('buy_stock', { symbol, shares: quantity });
    return true;
  };

  const sellStock = async (symbol: string, quantity: number): Promise<boolean> => {
    socketManager.send('sell_stock', { symbol, shares: quantity });
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
      joinTeam,
      claimMission,
      buyStock,
      sellStock
    }}>
      {children}
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

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
