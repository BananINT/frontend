import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE_URL = '/api/game';

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

export interface InitResponse {
  sessionId: string;
  gameState: GameState;
  leaderboard: LeaderboardEntry[];
  playerName: string;
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

  async initGame(): Promise<void> {
    this.loadingSignal.set(true);
    
    try {
      // Get or create session from backend
      const sessionId = this.getSessionIdFromStorage();
      
      const response = await firstValueFrom(
        this.http.post<InitResponse>(`${API_BASE_URL}/init`, { sessionId })
      );

      // Store session ID in localStorage
      if (response.sessionId) {
        localStorage.setItem('banana-session-id', response.sessionId);
      }

      // Update all signals with backend data
      this.gameStateSignal.set(response.gameState);
      this.leaderboardSignal.set(response.leaderboard);
      this.playerNameSignal.set(response.playerName);

    } catch (error) {
      console.error('Game initialization error:', error);
      // Initialize with default state if backend fails
      this.gameStateSignal.set({
        sessionId: this.generateSessionId(),
        bananas: 0,
        bananasPerClick: 1,
        totalClicks: 0,
        lastClickTime: 0
      });
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async handleClick(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<ClickResponse>(`${API_BASE_URL}/click`, {
          sessionId: this.gameStateSignal().sessionId
        })
      );
      
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
    } catch (error) {
      console.error('Click error:', error);
    }
  }

  async buyUpgrade(cost: number, multiplier: number): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<UpgradeResponse>(`${API_BASE_URL}/upgrade`, {
          sessionId: this.gameStateSignal().sessionId,
          cost,
          multiplier
        })
      );
      
      if (response.success) {
        this.gameStateSignal.update(state => ({
          ...state,
          bananas: response.newBananas,
          bananasPerClick: response.newBananasPerClick
        }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Upgrade error:', error);
      return false;
    }
  }

  async submitScore(name: string): Promise<boolean> {
    const trimmedName = name.trim();
    if (!trimmedName) return false;

    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; leaderboard: LeaderboardEntry[] }>(
          `${API_BASE_URL}/submit-score`,
          {
            sessionId: this.gameStateSignal().sessionId,
            name: trimmedName,
            score: this.gameStateSignal().bananas
          }
        )
      );
      
      if (response.success) {
        localStorage.setItem('banana-player-name', trimmedName);
        this.playerNameSignal.set(trimmedName);
        this.leaderboardSignal.set(response.leaderboard);
      }
      
      return response.success;
    } catch (error) {
      console.error('Score submission error:', error);
      return false;
    }
  }

  updatePlayerName(name: string): void {
    this.playerNameSignal.set(name);
  }

  async resetGame(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; gameState: GameState }>(
          `${API_BASE_URL}/reset`,
          { sessionId: this.gameStateSignal().sessionId }
        )
      );
      
      if (response.success) {
        this.gameStateSignal.set(response.gameState);
      }
    } catch (error) {
      console.error('Reset error:', error);
    }
  }

  private getSessionIdFromStorage(): string | null {
    try {
      return localStorage.getItem('banana-session-id');
    } catch {
      return null;
    }
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}