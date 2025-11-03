import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

declare global {
  interface Window {
    storage: {
      get: (key: string, global?: boolean) => Promise<{ value: string } | null>;
      set: (key: string, value: string, global?: boolean) => Promise<void>;
    };
  }
}

export interface GameState {
  sessionId: string;
  bananas: number;
  bananasPerClick: number;
  totalClicks: number;
  lastClickTime: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export interface ClickResponse {
  success: boolean;
  newBananas: number;
  message?: string;
}

export interface UpgradeResponse {
  success: boolean;
  newBananas: number;
  newBananasPerClick: number;
  message?: string;
}

interface BackendAPI {
  validateClick: (sessionId: string) => Promise<ClickResponse>;
  validateUpgrade: (sessionId: string, cost: number, multiplier: number) => Promise<UpgradeResponse>;
  getLeaderboard: () => Promise<LeaderboardEntry[]>;
  submitScore: (name: string, score: number) => Promise<boolean>;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly http = inject(HttpClient);
  
  // Signals for state management
  private readonly gameStateSignal = signal<GameState>({
    sessionId: '',
    bananas: 0,
    bananasPerClick: 1,
    totalClicks: 0,
    lastClickTime: 0
  });

  private readonly leaderboardSignal = signal<LeaderboardEntry[]>([]);
  private readonly loadingSignal = signal(true);
  private readonly playerNameSignal = signal('');

  // Public computed signals
  readonly gameState = this.gameStateSignal.asReadonly();
  readonly leaderboard = this.leaderboardSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly playerName = this.playerNameSignal.asReadonly();

  // Computed values
  readonly canAffordUpgrade = computed(() => {
    const state = this.gameState();
    return (cost: number) => state.bananas >= cost;
  });

  // Backend simulation (in real app, replace with actual API calls)
  private createBackendAPI(): BackendAPI {
    // In production, this would be actual HTTP calls to your backend
    // For now, we'll use window.storage to simulate backend validation
    return {
      validateClick: async (sessionId: string): Promise<ClickResponse> => {
        try {
          const state = await window.storage.get(`session:${sessionId}`);
          if (!state) {
            return { success: false, newBananas: 0, message: 'Invalid session' };
          }

          const gameData: GameState = JSON.parse(state.value);
          const now = Date.now();
          
          // Anti-cheat: max 20 clicks per second
          if (now - gameData.lastClickTime < 50) {
            return { success: false, newBananas: gameData.bananas, message: 'Too fast!' };
          }

          const newBananas = gameData.bananas + gameData.bananasPerClick;
          const newState: GameState = {
            ...gameData,
            bananas: newBananas,
            totalClicks: gameData.totalClicks + 1,
            lastClickTime: now
          };

          await window.storage.set(`session:${sessionId}`, JSON.stringify(newState));
          return { success: true, newBananas };
        } catch (error) {
          console.error('Click validation error:', error);
          return { success: false, newBananas: 0, message: 'Server error' };
        }
      },

      validateUpgrade: async (sessionId: string, cost: number, multiplier: number): Promise<UpgradeResponse> => {
        try {
          const state = await window.storage.get(`session:${sessionId}`);
          if (!state) {
            return { success: false, newBananas: 0, newBananasPerClick: 1, message: 'Invalid session' };
          }

          const gameData: GameState = JSON.parse(state.value);
          
          if (gameData.bananas < cost) {
            return { 
              success: false, 
              newBananas: gameData.bananas, 
              newBananasPerClick: gameData.bananasPerClick,
              message: 'Not enough bananas' 
            };
          }

          const newState: GameState = {
            ...gameData,
            bananas: gameData.bananas - cost,
            bananasPerClick: gameData.bananasPerClick + multiplier
          };

          await window.storage.set(`session:${sessionId}`, JSON.stringify(newState));
          return { 
            success: true, 
            newBananas: newState.bananas, 
            newBananasPerClick: newState.bananasPerClick 
          };
        } catch (error) {
          console.error('Upgrade validation error:', error);
          return { success: false, newBananas: 0, newBananasPerClick: 1, message: 'Server error' };
        }
      },

      getLeaderboard: async (): Promise<LeaderboardEntry[]> => {
        try {
          const result = await window.storage.get('leaderboard', true);
          return result ? JSON.parse(result.value) : [];
        } catch (error) {
          console.error('Leaderboard fetch error:', error);
          return [];
        }
      },

      submitScore: async (name: string, score: number): Promise<boolean> => {
        try {
          const leaderboard = await this.leaderboard();
          const newEntry: LeaderboardEntry = {
            name,
            score,
            date: new Date().toISOString()
          };

          const updated = [...leaderboard, newEntry]
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

          await window.storage.set('leaderboard', JSON.stringify(updated), true);
          return true;
        } catch (error) {
          console.error('Score submission error:', error);
          return false;
        }
      }
    };
  }

  async initGame(): Promise<void> {
    this.loadingSignal.set(true);
    
    try {
      // Generate or retrieve session ID
      const sessionId = await this.getOrCreateSessionId();
      await window.storage.set('current-session', sessionId);

      // Load game state from backend
      const gameState = await this.loadGameState(sessionId);
      this.gameStateSignal.set(gameState);

      // Load leaderboard
      const backend = this.createBackendAPI();
      const leaderboard = await backend.getLeaderboard();
      this.leaderboardSignal.set(leaderboard);

      // Load player name
      await this.loadPlayerName();
    } catch (error) {
      console.error('Game initialization error:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async handleClick(): Promise<void> {
    const backend = this.createBackendAPI();
    const response = await backend.validateClick(this.gameStateSignal().sessionId);
    
    if (response.success) {
      this.gameStateSignal.update(state => ({
        ...state,
        bananas: response.newBananas,
        totalClicks: state.totalClicks + 1,
        lastClickTime: Date.now()
      }));
    } else if (response.message) {
      console.warn(response.message);
    }
  }

  async buyUpgrade(cost: number, multiplier: number): Promise<boolean> {
    const backend = this.createBackendAPI();
    const response = await backend.validateUpgrade(this.gameStateSignal().sessionId, cost, multiplier);
    
    if (response.success) {
      this.gameStateSignal.update(state => ({
        ...state,
        bananas: response.newBananas,
        bananasPerClick: response.newBananasPerClick
      }));
      return true;
    }
    return false;
  }

  async submitScore(name: string): Promise<boolean> {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    const backend = this.createBackendAPI();
    const success = await backend.submitScore(trimmedName, this.gameStateSignal().bananas);
    
    if (success) {
      await window.storage.set('player-name', trimmedName);
      this.playerNameSignal.set(trimmedName);
      
      const leaderboard = await backend.getLeaderboard();
      this.leaderboardSignal.set(leaderboard);
    }
    
    return success;
  }

  updatePlayerName(name: string): void {
    this.playerNameSignal.set(name);
  }

  async resetGame(): Promise<void> {
    const sessionId = this.gameStateSignal().sessionId;
    const initialState = this.createInitialState(sessionId);
    
    await window.storage.set(`session:${sessionId}`, JSON.stringify(initialState));
    this.gameStateSignal.set(initialState);
  }

  private async getOrCreateSessionId(): Promise<string> {
    try {
      const sessionResult = await window.storage.get('current-session');
      return sessionResult ? sessionResult.value : this.generateSessionId();
    } catch {
      return this.generateSessionId();
    }
  }

  private async loadGameState(sessionId: string): Promise<GameState> {
    try {
      const state = await window.storage.get(`session:${sessionId}`);
      if (state) {
        return JSON.parse(state.value);
      }
    } catch {
      // Fall through to create new state
    }

    // Initialize new session
    const initialState = this.createInitialState(sessionId);
    await window.storage.set(`session:${sessionId}`, JSON.stringify(initialState));
    return initialState;
  }

  private async loadPlayerName(): Promise<void> {
    try {
      const nameResult = await window.storage.get('player-name');
      if (nameResult) {
        this.playerNameSignal.set(nameResult.value);
      }
    } catch {
      // No saved name, ignore error
    }
  }

  private createInitialState(sessionId: string): GameState {
    return {
      sessionId,
      bananas: 0,
      bananasPerClick: 1,
      totalClicks: 0,
      lastClickTime: 0
    };
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}