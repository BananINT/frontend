import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
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
  session_name: string | null;
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
  changeName: (name: string) => void;
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
  session_name: null,
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

  const { authenticated, token, loading: authLoading } = useAuth();

  // Initialize Game
  useEffect(() => {
    if (authLoading) return;
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
  }, [authLoading]);

  // Handle Authentication Sync
  useEffect(() => {
    if (authenticated && token) {
      socketManager.send('authenticate', { token });
    }
  }, [authenticated, token]);

  // Socket Listeners
  useEffect(() => {
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
        session_name: serverState.session_name || null,
        team: serverState.team || null,
        unlockedAchievements: achievements.map((a: any) => a.achievement_id),
        missionProgress: {}, // Will implement later with backend
        stocks: {}, // Handled separately or below
        prestigeCount: serverState.prestige_count || 0,
        banana_dna: serverState.banana_dna || 0,
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
          session_name: data.session_name || prev.session_name,
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

    const handleAuthSuccess = (response: any) => {
      const { gameState } = response;
      if (gameState && gameState.sessionId) {
        setGameState(prev => ({
          ...prev,
          userId: gameState.sessionId
        }));
        localStorage.setItem('bananaId', gameState.sessionId);
      }
      
      if (gameState) {
        handleInitSuccess(gameState);
      }
    };
    
    socketManager.on('auth_success', handleAuthSuccess);

    const handleUpgradeSuccess = (response: any) => {
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

    const handleTradeSuccess = (response: any) => {
      if (response.success && response.new_balance !== undefined) {
        setGameState(prev => ({
          ...prev,
          bananas: response.new_balance
        }));
      }
    };

    const handlePortfolioUpdate = (data: any) => {
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

    const handleNameChangeSuccess = (data: any) => {
      if (data && data.name) {
        setGameState(prev => ({
          ...prev,
          session_name: data.name
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
    socketManager.on('name_change_success', handleNameChangeSuccess);
    socketManager.on('error', handleError);

    return () => {
      socketManager.off('game_update', handleGameUpdate);
      socketManager.off('purchase_success', handleUpgradeSuccess);
      socketManager.off('trade_success', handleTradeSuccess);
      socketManager.off('portfolio_update', handlePortfolioUpdate);
      socketManager.off('leaderboard_update', handleLeaderboardUpdate);
      socketManager.off('market_history', handleMarketHistory);
      socketManager.off('auth_success', handleAuthSuccess);
      socketManager.off('name_change_success', handleNameChangeSuccess);
      socketManager.off('error', handleError);
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
    localStorage.setItem('bananaId', newId);
    window.location.reload();
  };

  const changeName = (name: string) => {
    socketManager.send('change_name', { name });
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
      changeName,
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
