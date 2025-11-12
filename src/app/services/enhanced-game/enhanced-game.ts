import { Injectable, signal, computed, inject, effect, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

const API_BASE_URL = isDevMode() 
  ? 'http://localhost/api/enhanced-game'
  : 'https://bananint.fr/api/enhanced-game';

export interface GameState {
  sessionId: string;
  bananas: number;
  bananasPerClick: number;
  bananasPerSecond: number;
  totalClicks: number;
  lastSyncTime: number;
  bananaDNA: number;
  totalBananasEarned: number;
  prestigeCount: number;
  selectedSkin: string;
  ownedSkins: string[];
  activeBoosts: any[];
  lastEventCheck: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
  prestigeCount: number;
}

export interface UpgradeType {
  id: string;
  name: string;
  baseCost: number;
  multiplier: number;
  type: 'click' | 'auto' | 'boost' | 'prestige' | 'synergy';
  owned: number;
  description?: string;
  unlockRequirement?: any;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  requirement: any;
  reward: any;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ActiveEvent {
  id: string;
  type: 'rain' | 'golden' | 'festival';
  startTime: number;
  duration: number;
  multiplier?: number;
  active: boolean;
}

export interface Skin {
  name: string;
  cost: number;
  emoji: string;
}

@Injectable({ providedIn: 'root' })
export class EnhancedGame {
  private readonly http = inject(HttpClient);
  
  private readonly gameStateSignal = signal<GameState>({
    sessionId: '',
    bananas: 0,
    bananasPerClick: 1,
    bananasPerSecond: 0,
    totalClicks: 0,
    lastSyncTime: Date.now(),
    bananaDNA: 0,
    totalBananasEarned: 0,
    prestigeCount: 0,
    selectedSkin: 'default',
    ownedSkins: ['default'],
    activeBoosts: [],
    lastEventCheck: Date.now()
  });

  private readonly upgradesSignal = signal<Map<string, UpgradeType>>(new Map());
  private readonly leaderboardSignal = signal<LeaderboardEntry[]>([]);
  private readonly achievementsSignal = signal<Achievement[]>([]);
  private readonly activeEventsSignal = signal<ActiveEvent[]>([]);
  private readonly skinsSignal = signal<Record<string, Skin>>({});
  private readonly loadingSignal = signal(true);
  private readonly playerNameSignal = signal('');
  private readonly clickCooldownSignal = signal(false);
  private readonly newAchievementsSignal = signal<Achievement[]>([]);
  
  readonly gameState = this.gameStateSignal.asReadonly();
  readonly upgrades = this.upgradesSignal.asReadonly();
  readonly leaderboard = this.leaderboardSignal.asReadonly();
  readonly achievements = this.achievementsSignal.asReadonly();
  readonly activeEvents = this.activeEventsSignal.asReadonly();
  readonly lastSyncSignal = signal(Date.now());
  readonly skins = this.skinsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly playerName = this.playerNameSignal.asReadonly();
  readonly clickCooldown = this.clickCooldownSignal.asReadonly();
  readonly newAchievements = this.newAchievementsSignal.asReadonly();

  readonly canAffordUpgrade = computed(() => {
    const state = this.gameState();
    return (cost: number, isDNA: boolean = false) => {
      if (isDNA) {
        return state.bananaDNA >= cost;
      }
      return state.bananas >= cost;
    };
  });

  readonly totalBananasPerSecond = computed(() => {
    return this.gameState().bananasPerSecond;
  });

  readonly canPrestige = computed(() => {
    return this.gameState().totalBananasEarned >= 1_000_000_000;
  });

  readonly prestigeDNAReward = computed(() => {
    return Math.floor(this.gameState().totalBananasEarned / 100_000_000);
  });

  readonly unlockedAchievements = computed(() => {
    return this.achievements().filter(a => a.unlocked);
  });

  readonly lockedAchievements = computed(() => {
    return this.achievements().filter(a => !a.unlocked);
  });

  private autoSyncInterval: any;
  private readonly SYNC_INTERVAL_MS = 30000;
  private readonly CLICK_COOLDOWN_MS = 100;
  private pendingClicks = 0;

  constructor() {
    this.startAutoGeneration();
    this.startAutoSync();
    this.loadSkins();

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
          achievements: Achievement[];
          activeEvents: ActiveEvent[];
        }>(`${API_BASE_URL}/init`, { sessionId })
      );

      if (response.sessionId) {
        localStorage.setItem('banana-session-id', response.sessionId);
      }

      this.gameStateSignal.set(response.gameState);
      
      const upgradesMap = new Map<string, UpgradeType>();
      response.upgrades.forEach(upgrade => {
        upgradesMap.set(upgrade.id, upgrade);
      });
      this.upgradesSignal.set(upgradesMap);
      
      this.leaderboardSignal.set(response.leaderboard);
      this.playerNameSignal.set(response.playerName);
      this.achievementsSignal.set(response.achievements);
      this.activeEventsSignal.set(response.activeEvents);
      this.lastSyncSignal.set(Date.now());

      this.calculateOfflineEarnings();

    } catch (error) {
      console.error('Game initialization error:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async loadSkins(): Promise<void> {
    try {
      const skins = await firstValueFrom(
        this.http.get<Record<string, Skin>>(`${API_BASE_URL}/skins`)
      );
      this.skinsSignal.set(skins);
    } catch (error) {
      console.error('Failed to load skins:', error);
    }
  }

  handleClick(): void {
    if (this.clickCooldown()) {
      return;
    }

    this.clickCooldownSignal.set(true);
    setTimeout(() => {
      this.clickCooldownSignal.set(false);
    }, this.CLICK_COOLDOWN_MS);

    this.pendingClicks++;

    this.gameStateSignal.update(state => ({
      ...state,
      bananas: state.bananas + state.bananasPerClick,
      totalClicks: state.totalClicks + 1,
      totalBananasEarned: state.totalBananasEarned + state.bananasPerClick
    }));

    if (this.pendingClicks >= 10) {
      this.syncWithServer();
    }
  }

  async buyUpgrade(upgradeId: string): Promise<{ success: boolean; message?: string }> {
    const upgrade = this.upgradesSignal().get(upgradeId);
    if (!upgrade) return { success: false, message: 'Upgrade not found' };

    const cost = this.calculateUpgradeCost(upgrade);
    const isDNA = upgrade.type === 'prestige';
    
    if (!this.canAffordUpgrade()(cost, isDNA)) {
      return { success: false, message: `Not enough ${isDNA ? 'DNA' : 'bananas'}` };
    }

    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          gameState: GameState;
          upgrades: UpgradeType[];
          achievements: Achievement[];
          message?: string;
        }>(`${API_BASE_URL}/upgrade`, {
          sessionId: this.gameStateSignal().sessionId,
          upgradeId
        })
      );
      
      if (response.success) {
        this.gameStateSignal.set(response.gameState);
        
        const upgradesMap = new Map<string, UpgradeType>();
        response.upgrades.forEach(u => upgradesMap.set(u.id, u));
        this.upgradesSignal.set(upgradesMap);

        this.checkNewAchievements(response.achievements);
        
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      console.error('Upgrade error:', error);
      return { success: false, message: 'Network error' };
    }
  }

  async prestige(): Promise<{ success: boolean; dnaGained: number; message: string }> {
    if (!this.canPrestige()) {
      return { success: false, dnaGained: 0, message: 'Need 1 billion lifetime bananas' };
    }

    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          gameState: GameState;
          upgrades: UpgradeType[];
          bananaDNAGained: number;
          message: string;
        }>(`${API_BASE_URL}/prestige`, {
          sessionId: this.gameStateSignal().sessionId
        })
      );
      
      if (response.success) {
        this.gameStateSignal.set(response.gameState);
        
        const upgradesMap = new Map<string, UpgradeType>();
        response.upgrades.forEach(u => upgradesMap.set(u.id, u));
        this.upgradesSignal.set(upgradesMap);
        
        return {
          success: true,
          dnaGained: response.bananaDNAGained,
          message: response.message
        };
      }
      return { success: false, dnaGained: 0, message: response.message };
    } catch (error) {
      console.error('Prestige error:', error);
      return { success: false, dnaGained: 0, message: 'Network error' };
    }
  }

  async buySkin(skinId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          message: string;
          gameState: GameState;
        }>(`${API_BASE_URL}/buy-skin`, {
          sessionId: this.gameStateSignal().sessionId,
          skinId
        })
      );
      
      if (response.success) {
        this.gameStateSignal.set(response.gameState);
      }
      
      return { success: response.success, message: response.message };
    } catch (error: any) {
      return { success: false, message: error.error?.detail || 'Failed to buy skin' };
    }
  }

  async clickGoldenBanana(eventId: string): Promise<{ success: boolean; reward: number }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          reward: number;
          message: string;
        }>(`${API_BASE_URL}/click-event`, {
          sessionId: this.gameStateSignal().sessionId,
          eventId
        })
      );
      
      if (response.success) {
        // Remove event from active events
        this.activeEventsSignal.update(events => 
          events.filter(e => e.id !== eventId)
        );
        
        // Update bananas
        this.gameStateSignal.update(state => ({
          ...state,
          bananas: state.bananas + response.reward,
          totalBananasEarned: state.totalBananasEarned + response.reward
        }));
      }
      
      return { success: response.success, reward: response.reward };
    } catch (error) {
      return { success: false, reward: 0 };
    }
  }

  async submitScore(name: string): Promise<{ success: boolean; message?: string }> {
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, message: 'Name cannot be empty' };

    try {
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
            name: trimmedName
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
        message: 'Network error' 
      };
    }
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

  dismissAchievementNotification(achievementId: string): void {
    this.newAchievementsSignal.update(achs => 
      achs.filter(a => a.id !== achievementId)
    );
  }

  private checkNewAchievements(latestAchievements: Achievement[]): void {
    const currentUnlocked = new Set(
      this.achievements()
        .filter(a => a.unlocked)
        .map(a => a.id)
    );
    
    const newlyUnlocked = latestAchievements.filter(
      a => a.unlocked && !currentUnlocked.has(a.id)
    );
    
    if (newlyUnlocked.length > 0) {
      this.newAchievementsSignal.set(newlyUnlocked);
    }
    
    this.achievementsSignal.set(latestAchievements);
  }

  private async syncWithServer(): Promise<void> {
    if (this.pendingClicks === 0 && Date.now() - this.lastSyncSignal() < 10000) {
      return;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          gameState: GameState;
          achievements: Achievement[];
          activeEvents: ActiveEvent[];
          leaderboard: LeaderboardEntry[];
        }>(`${API_BASE_URL}/sync`, {
          sessionId: this.gameStateSignal().sessionId,
          pendingClicks: this.pendingClicks,
          clientBananas: this.gameStateSignal().bananas,
          lastSyncTime: this.gameStateSignal().lastSyncTime
        })
      );
      
      if (response.success) {
        this.gameStateSignal.set(response.gameState);
        this.checkNewAchievements(response.achievements);
        this.activeEventsSignal.set(response.activeEvents);
        this.leaderboardSignal.set(response.leaderboard);
        this.pendingClicks = 0;
        this.lastSyncSignal.set(Date.now());
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  }

  private startAutoGeneration(): void {
    setInterval(() => {
      const state = this.gameState();
      if (state.bananasPerSecond > 0) {
        this.gameStateSignal.update(s => ({
          ...s,
          bananas: s.bananas + s.bananasPerSecond,
          totalBananasEarned: s.totalBananasEarned + s.bananasPerSecond
        }));
      }
    }, 1000);
  }

  private startAutoSync(): void {
    this.autoSyncInterval = setInterval(() => {
      this.syncWithServer();
    }, this.SYNC_INTERVAL_MS);
  }

  private calculateOfflineEarnings(): void {
    const state = this.gameState();
    const now = Date.now();
    const timeDiff = (now - state.lastSyncTime) / 1000;
    
    if (timeDiff > 60 && state.bananasPerSecond > 0) {
      const maxOfflineTime = 8 * 60 * 60;
      const offlineTime = Math.min(timeDiff, maxOfflineTime);
      const offlineEarnings = Math.floor(offlineTime * state.bananasPerSecond);
      
      if (offlineEarnings > 0) {
        this.gameStateSignal.update(s => ({
          ...s,
          bananas: s.bananas + offlineEarnings,
          totalBananasEarned: s.totalBananasEarned + offlineEarnings
        }));
      }
    }
  }

  calculateUpgradeCost(upgrade: UpgradeType): number {
    if (upgrade.type === 'prestige') {
      return upgrade.baseCost; // Flat DNA cost
    }
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
  }

  formatNumber(num: number): string {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
  }

  getSessionIdFromStorage(): string | null {
    try {
      return localStorage.getItem('banana-session-id');
    } catch {
      return null;
    }
  }

  ngOnDestroy(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
  }
}