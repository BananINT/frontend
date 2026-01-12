import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useInterval } from '@/hooks/useInterval';
import { ACHIEVEMENTS_DATA, MISSIONS_DATA } from '@/data/gameData';

export interface GameState {
  bananas: number;
  clickCount: number;
  autoClickers: number;
  clickValue: number;
  userId: string;
  team: string | null;
  unlockedAchievements: string[];
  missionProgress: Record<string, { progress: number; completed: boolean }>;
  stocks: Record<string, number>;
  prestigeCount: number;
}

interface GameContextType {
  gameState: GameState;
  clickBanana: () => void;
  buyUpgrade: (cost: number, value: number, type: 'click' | 'auto') => boolean;
  setUserId: (id: string) => void;
  joinTeam: (teamId: string) => void;
  claimMission: (missionId: string) => void;
  buyStock: (symbol: string, quantity: number, price: number) => boolean;
  sellStock: (symbol: string, quantity: number, price: number) => boolean;
}

const defaultState: GameState = {
  bananas: 0,
  clickCount: 0,
  autoClickers: 0,
  clickValue: 1,
  userId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'GUEST-' + Math.floor(Math.random() * 10000),
  team: null,
  unlockedAchievements: [],
  missionProgress: {},
  stocks: {},
  prestigeCount: 0
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state function to load from localStorage
  const initializeState = (): GameState => {
    // 1. Check for stored bananaId
    let storedId = localStorage.getItem('bananaId');
    if (!storedId) {
      storedId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'OPERATOR-' + Math.floor(Math.random() * 100000);
      localStorage.setItem('bananaId', storedId);
    }

    // 2. Try to load state for this ID
    const savedState = localStorage.getItem(`bananint_state_${storedId}`);
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        return {
          ...defaultState,
          ...parsed,
          // Merge data structures safely
          missionProgress: { ...defaultState.missionProgress, ...(parsed.missionProgress || {}) },
          userId: storedId
        };
      } catch (e) {
        console.error("Failed to parse saved state", e);
      }
    }

    return { ...defaultState, userId: storedId };
  };

  const [gameState, setGameState] = useState<GameState>(initializeState);

  // Persistence Effect
  useEffect(() => {
    if (gameState.userId) {
      localStorage.setItem(`bananint_state_${gameState.userId}`, JSON.stringify(gameState));
    }
  }, [gameState]);

  // Achievement & Mission Monitoring Loop
  useInterval(() => {
    setGameState(prev => {
      let newState = { ...prev };
      let changed = false;

      // Auto-increment bananas
      if (prev.autoClickers > 0) {
        newState.bananas += prev.autoClickers;
        changed = true;
      }

      // Check Achievements
      const checkAchievement = (id: string, condition: boolean) => {
        if (condition && !prev.unlockedAchievements.includes(id)) {
          newState.unlockedAchievements = [...newState.unlockedAchievements, id];
          changed = true;
          // Could emit a toast here
          console.log("ACHIEVEMENT UNLOCKED:", id);
        }
      };

      checkAchievement('first_click', prev.clickCount >= 1);
      checkAchievement('banana_beginner', prev.bananas >= 100);
      checkAchievement('banana_hoarder', prev.bananas >= 1000);
      checkAchievement('automation_start', prev.autoClickers > 0);

      // Update Mission Progress (Basic Sync)
      MISSIONS_DATA.forEach(mission => {
        if (mission.type === 'personal') {
          const currentProgress = newState.missionProgress[mission.id]?.progress || 0;
          let newProgress = currentProgress;

          if (mission.id === 'click_100') newProgress = prev.clickCount;
          if (mission.id === 'earn_500') newProgress = Math.max(newProgress, prev.bananas); // 'max' because bananas fluctuate

          if (newProgress !== currentProgress) {
            newState.missionProgress = {
              ...newState.missionProgress,
              [mission.id]: {
                progress: newProgress,
                completed: newProgress >= mission.goal
              }
            };
            changed = true;
          }
        }
      });

      return changed ? newState : prev;
    });
  }, 1000);

  const clickBanana = () => {
    setGameState(prev => ({
      ...prev,
      bananas: prev.bananas + prev.clickValue,
      clickCount: prev.clickCount + 1
    }));
  };

  const buyUpgrade = (cost: number, value: number, type: 'click' | 'auto'): boolean => {
    if (gameState.bananas >= cost) {
      setGameState(prev => ({
        ...prev,
        bananas: prev.bananas - cost,
        clickValue: type === 'click' ? prev.clickValue + value : prev.clickValue,
        autoClickers: type === 'auto' ? prev.autoClickers + value : prev.autoClickers
      }));
      return true;
    }
    return false;
  };

  const setUserId = (newId: string) => {
    if (!newId) return;
    localStorage.setItem('bananaId', newId);
    window.location.reload();
  };

  const joinTeam = (teamId: string) => {
    setGameState(prev => ({
      ...prev,
      team: teamId
    }));
  };

  const claimMission = (missionId: string) => {
    setGameState(prev => {
      const mission = MISSIONS_DATA.find(m => m.id === missionId);
      const userMissionState = prev.missionProgress[missionId];

      if (mission && userMissionState && userMissionState.completed) {
        return {
          ...prev,
          bananas: prev.bananas + mission.reward
        };
      }
      return prev;
    });
  };

  const buyStock = (symbol: string, quantity: number, price: number) => {
    const totalCost = quantity * price;
    if (gameState.bananas >= totalCost) {
      setGameState(prev => ({
        ...prev,
        bananas: prev.bananas - totalCost,
        stocks: {
          ...prev.stocks,
          [symbol]: (prev.stocks[symbol] || 0) + quantity
        }
      }));
      return true;
    }
    return false;
  };

  const sellStock = (symbol: string, quantity: number, price: number) => {
    const currentHolding = gameState.stocks[symbol] || 0;
    if (currentHolding >= quantity) {
      setGameState(prev => ({
        ...prev,
        bananas: prev.bananas + (quantity * price),
        stocks: {
          ...prev.stocks,
          [symbol]: currentHolding - quantity
        }
      }));
      return true;
    }
    return false;
  };

  return (
    <GameContext.Provider value={{ gameState, clickBanana, buyUpgrade, setUserId, joinTeam, claimMission, buyStock, sellStock }}>
      {children}
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
