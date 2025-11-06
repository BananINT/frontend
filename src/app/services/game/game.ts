import { Injectable, signal, computed, inject, effect, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Determine API URL based on environment
const API_BASE_URL = isDevMode() 
  ? 'http://localhost:5000/api/game'
  : 'https://bananint.fr/api/game';

export interface GameState {
  sessionId: string;
  bananas: number;
  bananasPerClick: number;
  bananasPerSecond: number;
  totalClicks: number;
  lastSyncTime: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}

export interface SyncResponse {
  success: boolean;
  gameState: GameState;
  message?: string;
}

export interface UpgradeType {
  id: string;
  name: string;
  baseCost: number;
  multiplier: number;
  type: 'click' | 'auto';
  owned: number;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly http = inject(HttpClient);
  
  // Signals for state management
  private readonly gameStateSignal = signal<GameState>({
    sessionId: '',
    bananas: 0,
    bananasPerClick: 1,
    bananasPerSecond: 0,
    totalClicks: 0,
    lastSyncTime: Date.now()
  });

  private readonly upgradesSignal = signal<Map<string, UpgradeType>>(new Map());
  private readonly leaderboardSignal = signal<LeaderboardEntry[]>([]);
  private readonly loadingSignal = signal(true);
  private readonly playerNameSignal = signal('');
  private readonly clickCooldownSignal = signal(false);
  private readonly lastSyncSignal = signal(Date.now());

  // Public computed signals
  readonly gameState = this.gameStateSignal.asReadonly();
  readonly upgrades = this.upgradesSignal.asReadonly();
  readonly leaderboard = this.leaderboardSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly playerName = this.playerNameSignal.asReadonly();
  readonly clickCooldown = this.clickCooldownSignal.asReadonly();

  // Computed values
  readonly canAffordUpgrade = computed(() => {
    const state = this.gameState();
    return (cost: number) => state.bananas >= cost;
  });

  readonly totalBananasPerSecond = computed(() => {
    return this.gameState().bananasPerSecond;
  });

  // Auto-save interval and sync settings
  private autoSyncInterval: any;
  private readonly SYNC_INTERVAL_MS = 30000; // Sync every 30 seconds
  private readonly CLICK_COOLDOWN_MS = 100; // 100ms between clicks (10 clicks/sec max)
  private pendingClicks = 0;

  constructor() {
    console.log('🍌 Banana Clicker API URL:', API_BASE_URL);
    console.log('🍌 Dev Mode:', isDevMode());
    
    // Start auto-generation timer
    this.startAutoGeneration();
    
    // Start auto-sync timer
    this.startAutoSync();

    // Effect to calculate offline earnings on state changes
    effect(() => {
      const state = this.gameState();
      if (state.bananasPerSecond > 0) {
        this.calculateOfflineEarnings();
      }
    });
  }

  async initGame(): Promise<void> {
    this.loadingSignal.set(true);
    
    try {
      const sessionId = this.getSessionIdFromStorage();
      
      const response = await firstValueFrom(
        this.http.post<{
          sessionId: string;
          gameState: GameState;
          upgrades: UpgradeType[];
          leaderboard: LeaderboardEntry[];
          playerName: string;
        }>(`${API_BASE_URL}/init`, { sessionId })
      );

      if (response.sessionId) {
        localStorage.setItem('banana-session-id', response.sessionId);
      }

      this.gameStateSignal.set(response.gameState);
      
      // Convert upgrades array to Map
      const upgradesMap = new Map<string, UpgradeType>();
      response.upgrades.forEach(upgrade => {
        upgradesMap.set(upgrade.id, upgrade);
      });
      this.upgradesSignal.set(upgradesMap);
      
      this.leaderboardSignal.set(response.leaderboard);
      this.playerNameSignal.set(response.playerName);
      this.lastSyncSignal.set(Date.now());

      // Calculate any offline earnings
      this.calculateOfflineEarnings();

    } catch (error) {
      console.error('Game initialization error:', error);
      this.gameStateSignal.set({
        sessionId: this.generateSessionId(),
        bananas: 0,
        bananasPerClick: 1,
        bananasPerSecond: 0,
        totalClicks: 0,
        lastSyncTime: Date.now()
      });
      this.initializeDefaultUpgrades();
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * Handle banana click with client-side cooldown
   */
  handleClick(): void {
    // Check cooldown
    if (this.clickCooldown()) {
      return;
    }

    // Set cooldown
    this.clickCooldownSignal.set(true);
    setTimeout(() => {
      this.clickCooldownSignal.set(false);
    }, this.CLICK_COOLDOWN_MS);

    // Increment pending clicks for batch sync
    this.pendingClicks++;

    // Update UI immediately (optimistic update)
    this.gameStateSignal.update(state => ({
      ...state,
      bananas: state.bananas + state.bananasPerClick,
      totalClicks: state.totalClicks + 1
    }));

    // If we have many pending clicks, sync immediately
    if (this.pendingClicks >= 10) {
      this.syncWithServer();
    }
  }

  /**
   * Buy an upgrade (click multiplier or auto-generator)
   */
  async buyUpgrade(upgradeId: string): Promise<boolean> {
    const upgrade = this.upgradesSignal().get(upgradeId);
    if (!upgrade) return false;

    const cost = this.calculateUpgradeCost(upgrade);
    
    if (this.gameState().bananas < cost) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          gameState: GameState;
          upgrades: UpgradeType[];
        }>(`${API_BASE_URL}/upgrade`, {
          sessionId: this.gameStateSignal().sessionId,
          upgradeId
        })
      );
      
      if (response.success) {
        this.gameStateSignal.set(response.gameState);
        
        // Update upgrades
        const upgradesMap = new Map<string, UpgradeType>();
        response.upgrades.forEach(u => upgradesMap.set(u.id, u));
        this.upgradesSignal.set(upgradesMap);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Upgrade error:', error);
      return false;
    }
  }

  async submitScore(name: string): Promise<{ success: boolean; message?: string }> {
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, message: 'Le nom ne peut pas être vide' };

    try {
      // Sync before submitting to ensure accurate score
      await this.syncWithServer();

      const response = await firstValueFrom(
        this.http.post<{ 
          success: boolean; 
          leaderboard: LeaderboardEntry[];
          message?: string;
        }>(
          `${API_BASE_URL}/submit-score`,
          {
            sessionId: this.gameStateSignal().sessionId,
            name: trimmedName,
            score: Math.floor(this.gameStateSignal().bananas)
          }
        )
      );
      
      if (response.success) {
        localStorage.setItem('banana-player-name', trimmedName);
        this.playerNameSignal.set(trimmedName);
        this.leaderboardSignal.set(response.leaderboard);
      }
      
      return { 
        success: response.success, 
        message: response.message 
      };
    } catch (error) {
      console.error('Score submission error:', error);
      return { 
        success: false, 
        message: 'Erreur de connexion au serveur' 
      };
    }
  }

  updatePlayerName(name: string): void {
    this.playerNameSignal.set(name);
  }

  async resetGame(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ 
          success: boolean; 
          gameState: GameState;
          upgrades: UpgradeType[];
        }>(
          `${API_BASE_URL}/reset`,
          { sessionId: this.gameStateSignal().sessionId }
        )
      );
      
      if (response.success) {
        this.gameStateSignal.set(response.gameState);
        
        const upgradesMap = new Map<string, UpgradeType>();
        response.upgrades.forEach(u => upgradesMap.set(u.id, u));
        this.upgradesSignal.set(upgradesMap);
      }
    } catch (error) {
      console.error('Reset error:', error);
    }
  }

  /**
   * Sync game state with server (batched clicks + time-based generation)
   */
  private async syncWithServer(): Promise<void> {
    if (this.pendingClicks === 0 && Date.now() - this.lastSyncSignal() < 10000) {
      return; // Don't sync too frequently if no changes
    }

    try {
      const response = await firstValueFrom(
        this.http.post<SyncResponse>(`${API_BASE_URL}/sync`, {
          sessionId: this.gameStateSignal().sessionId,
          pendingClicks: this.pendingClicks,
          clientBananas: this.gameStateSignal().bananas,
          lastSyncTime: this.gameStateSignal().lastSyncTime
        })
      );
      
      if (response.success) {
        // Use server's authoritative state
        this.gameStateSignal.set(response.gameState);
        this.pendingClicks = 0;
        this.lastSyncSignal.set(Date.now());
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  /**
   * Auto-generate bananas every second based on bananasPerSecond
   */
  private startAutoGeneration(): void {
    setInterval(() => {
      const state = this.gameState();
      if (state.bananasPerSecond > 0) {
        this.gameStateSignal.update(s => ({
          ...s,
          bananas: s.bananas + s.bananasPerSecond
        }));
      }
    }, 1000); // Update every second
  }

  /**
   * Auto-sync with server periodically
   */
  private startAutoSync(): void {
    this.autoSyncInterval = setInterval(() => {
      this.syncWithServer();
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Calculate offline earnings when player returns
   */
  private calculateOfflineEarnings(): void {
    const state = this.gameState();
    const now = Date.now();
    const timeDiff = (now - state.lastSyncTime) / 1000; // seconds
    
    if (timeDiff > 60 && state.bananasPerSecond > 0) {
      // Cap offline earnings to 8 hours
      const maxOfflineTime = 8 * 60 * 60; // 8 hours in seconds
      const offlineTime = Math.min(timeDiff, maxOfflineTime);
      const offlineEarnings = Math.floor(offlineTime * state.bananasPerSecond);
      
      if (offlineEarnings > 0) {
        this.gameStateSignal.update(s => ({
          ...s,
          bananas: s.bananas + offlineEarnings
        }));
        
        console.log(`Welcome back! You earned ${offlineEarnings} bananas while away!`);
      }
    }
  }

  /**
   * Calculate upgrade cost (increases with each purchase)
   */
  calculateUpgradeCost(upgrade: UpgradeType): number {
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
  }

  private initializeDefaultUpgrades(): void {
    const upgrades = new Map<string, UpgradeType>([
      ['click_1', {
        id: 'click_1',
        name: 'Meilleurs Doigts',
        baseCost: 10,
        multiplier: 1,
        type: 'click',
        owned: 0
      }],
      ['auto_1', {
        id: 'auto_1',
        name: 'Bananier',
        baseCost: 50,
        multiplier: 1,
        type: 'auto',
        owned: 0
      }],
      ['click_2', {
        id: 'click_2',
        name: 'Bras Musclés',
        baseCost: 100,
        multiplier: 5,
        type: 'click',
        owned: 0
      }],
      ['auto_2', {
        id: 'auto_2',
        name: 'Ferme à Bananes',
        baseCost: 500,
        multiplier: 5,
        type: 'auto',
        owned: 0
      }]
    ]);
    
    this.upgradesSignal.set(upgrades);
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

  ngOnDestroy(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
  }
}