import { Injectable, signal, computed, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// Determine API URL based on environment
// Backend mounts routers under the '/api' prefix (see backend/src/main.py)
const API_BASE_URL = isDevMode()
  ? 'http://localhost/api/game'
  : 'https://bananint.fr/api/game';

const WS_BASE_URL = isDevMode()
  ? 'ws://localhost/api/websocket'
  : 'wss://bananint.fr/api/websocket';


export interface GameState {
  sessionId: string;
  sessionName: string | null;
  createdAt: string;
  totalClicks: number;
  totalBananasEarned: number;
  bananas: number;
  bananasPerClick: number;
  bananasPerSecond: number;
  bananaDna: number;
  prestigeCount: number;
  ownedSkins: string;
  lastSyncTime: number;
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string | null;
  prestigeCount: number;
}

export interface UpgradeType {
  upgradeId: string;
  name: string;
  baseCost: number;
  multiplier: number;
  upgradeType: 'click' | 'auto' | 'synergy' | 'prestige';
  owned: number;
  description: string;
}

export interface Achievement {
  achievementId: string;
  name: string;
  description: string;
  requirementType: string;
  requirementValue: number;
  rewardType: string;
  rewardValue: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

/**
 * Normalize server-side snake_case game state to client-side camelCase shape.
 */
function normalizeGameState(serverState: any, sessionId?: string): GameState {
  if (!serverState) {
    return {
      sessionId: sessionId || '',
      sessionName: 'Anonymous',
      createdAt: '',
      totalClicks: 0,
      totalBananasEarned: 0,
      bananas: 0,
      bananasPerClick: 1,
      bananasPerSecond: 0,
      bananaDna: 0,
      prestigeCount: 0,
      ownedSkins: '',
      lastSyncTime: Date.now()
    };
  }

  return {
    sessionId: sessionId || serverState.sessionId || serverState.id || '',
    sessionName: serverState.session_name ?? serverState.sessionName ?? null,
    createdAt: serverState.created_at ?? serverState.createdAt ?? '',
    totalClicks: serverState.total_clicks ?? serverState.totalClicks ?? 0,
    totalBananasEarned: serverState.total_bananas_earned ?? serverState.totalBananasEarned ?? 0,
    bananas: serverState.bananas ?? 0,
    bananasPerClick: serverState.bananas_per_click ?? serverState.bananasPerClick ?? 1,
    bananasPerSecond: serverState.bananas_per_second ?? serverState.bananasPerSecond ?? 0,
    bananaDna: serverState.banana_dna ?? serverState.bananaDna ?? serverState.bananaDNA ?? 0,
    prestigeCount: serverState.prestige_count ?? serverState.prestigeCount ?? 0,
    ownedSkins: serverState.owned_skins ?? serverState.ownedSkins ?? '',
    lastSyncTime: serverState.last_sync_time ?? serverState.lastSyncTime ?? Date.now()
  };
}

function normalizeUpgrade(u: any): UpgradeType {
  return {
    upgradeId: u.upgrade_id ?? u.upgradeId ?? u.id,
    name: u.name,
    baseCost: u.base_cost ?? u.baseCost ?? 0,
    multiplier: u.multiplier ?? 1,
    upgradeType: (u.upgrade_type ?? u.upgradeType) as any ?? 'click',
    owned: u.owned ?? 0,
    description: u.description ?? ''
  };
}

function normalizeAchievement(a: any): Achievement {
  return {
    achievementId: a.achievement_id ?? a.achievementId ?? a.id,
    name: a.name,
    description: a.description,
    requirementType: a.requirement_type ?? a.requirementType ?? '',
    requirementValue: a.requirement_value ?? a.requirementValue ?? 0,
    rewardType: a.reward_type ?? a.rewardType ?? '',
    rewardValue: a.reward_value ?? a.rewardValue ?? 0,
    unlocked: Boolean(a.unlocked),
    unlockedAt: a.unlocked_at ?? a.unlockedAt ?? null
  };
}

@Injectable({ providedIn: 'root' })
export class Game {
  private readonly http = inject(HttpClient);
  
  // WebSocket connection
  private ws: WebSocket | null = null;
  private reconnectTimeout: any = null;
  private readonly RECONNECT_DELAY = 3000;
  
  // Signals for state management
  private readonly gameStateSignal = signal<GameState>({
    sessionId: '',
    sessionName: 'Anonymous',
    createdAt: '',
    totalClicks: 0,
    totalBananasEarned: 0,
    bananas: 0,
    bananasPerClick: 1,
    bananasPerSecond: 0,
    bananaDna: 0,
    prestigeCount: 0,
    ownedSkins: '',
    lastSyncTime: Date.now()
  });

  private readonly upgradesSignal = signal<UpgradeType[]>([]);
  private readonly achievementsSignal = signal<Achievement[]>([]);
  private readonly leaderboardSignal = signal<LeaderboardEntry[]>([]);
  private readonly loadingSignal = signal(true);
  private readonly errorSignal = signal(false);
  private readonly connectedSignal = signal(false);
  private readonly playerNameSignal = signal('');
  private readonly clickCooldownSignal = signal(false);

  // Public computed signals
  readonly gameState = this.gameStateSignal.asReadonly();
  readonly upgrades = this.upgradesSignal.asReadonly();
  readonly achievements = this.achievementsSignal.asReadonly();
  readonly leaderboard = this.leaderboardSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly connected = this.connectedSignal.asReadonly();
  readonly playerName = this.playerNameSignal.asReadonly();
  readonly clickCooldown = this.clickCooldownSignal.asReadonly();
  offlineEarnings: number = 0;
  
  // Computed values
  readonly canAffordUpgrade = computed(() => {
    const state = this.gameState();
    return (cost: number, upgradeType?: string) => {
      if (upgradeType === 'prestige') {
        return (state.bananaDna || 0) >= cost;
      }
      return state.bananas >= cost;
    };
  });
  
  readonly totalBananasPerSecond = computed(() => {
    return this.gameState().bananasPerSecond;
  });
  
  // Sync settings
  private readonly SYNC_INTERVAL_MS = 5000; // Sync every 5 seconds via WebSocket
  private readonly CLICK_COOLDOWN_MS = 100; // 100ms between clicks
  private pendingClicks = 0;
  private syncInterval: any = null;
  
  constructor() {
    // Start auto-generation timer
    this.startAutoGeneration();
  }

  async initGame(): Promise<void> {
    this.loadingSignal.set(true);
    
    try {
      const sessionId = this.getSessionIdFromStorage();
      
      // Initialize via HTTP first
      const response = await firstValueFrom(
        this.http.post<{
          sessionId: string;
          gameState: GameState;
          upgrades: UpgradeType[];
          achievements: Achievement[];
          leaderboard: LeaderboardEntry[];
        }>(`${API_BASE_URL}/init`, { sessionId })
      );

      // Persist session id
      localStorage.setItem('banana-session-id', response.sessionId);

      // Normalize game state fields coming from the server (snake_case -> camelCase)
      const normalizedState = normalizeGameState(response.gameState, response.sessionId);
      this.gameStateSignal.set({ ...this.gameStateSignal(), ...normalizedState });

      // Transform upgrades into a simple array
      const upgradesArray: UpgradeType[] = (response.upgrades || []).map((u: any) => 
        normalizeUpgrade(u)
      );
      this.upgradesSignal.set(upgradesArray);

      // Normalize achievements
      const achievements = (response.achievements || []).map((a: any) => normalizeAchievement(a));
      this.achievementsSignal.set(achievements);

      // Leaderboard can be passed through (server already uses camelCase keys there)
      this.leaderboardSignal.set(response.leaderboard || []);

      // Connect WebSocket after HTTP init
      this.connectWebSocket(response.sessionId);
      
      // Start periodic sync
      this.startPeriodicSync();
    } catch (error) {
      this.errorSignal.set(true);
      throw error;
    } finally {
      this.loadingSignal.set(false);
    }
  }

  private connectWebSocket(sessionId: string): void {
    // Close existing connection
    if (this.ws) {
      this.ws.close();
    }

    const wsUrl = `${WS_BASE_URL}/ws/${sessionId}`;
    console.log('Connecting to WebSocket');
    
    this.ws = new WebSocket(wsUrl);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.connectedSignal.set(true);
      this.errorSignal.set(false);
      
      // Clear reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      this.syncViaWebSocket();
    };
    
    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleWebSocketMessage(message);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.errorSignal.set(true);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      this.connectedSignal.set(false);
      
      // Attempt to reconnect
      if (!this.reconnectTimeout) {
        this.reconnectTimeout = setTimeout(() => {
          console.log('Attempting to reconnect WebSocket...');
          this.connectWebSocket(sessionId);
        }, this.RECONNECT_DELAY);
      }
    };
  }

  private handleWebSocketMessage(message: any): void {
    switch (message.type) {
      case 'game_update':
        if (message.data) {
          // merge update (message.data already uses camelCase from server ws sync)
          this.gameStateSignal.update(state => ({
            ...state,
            ...message.data,
            lastSyncTime: message.data.lastSyncTime || state.lastSyncTime
          }));
        }
        break;
        
      case 'leaderboard_update':
        if (message.data) {
          this.leaderboardSignal.set(message.data);
        }
        break;
        
      case 'upgrade_purchased':
        if (message.data) {
          // Update game state
          // Normalize potential variants for DNA field and other keys
          const dna = message.data.bananaDNA ?? message.data.bananaDna ?? message.data.banana_dna ?? null;
          const bananasPerClick = message.data.bananasPerClick ?? message.data.bananas_per_click;
          const bananasPerSecond = message.data.bananasPerSecond ?? message.data.bananas_per_second;

          this.gameStateSignal.update(state => ({
            ...state,
            bananas: message.data.bananas ?? state.bananas,
            bananaDna: dna ?? state.bananaDna,
            bananasPerClick: bananasPerClick ?? state.bananasPerClick,
            bananasPerSecond: bananasPerSecond ?? state.bananasPerSecond
          }));
          
          // Update specific upgrade
          const upgradeId = message.data.upgradeId;
          this.upgradesSignal.update(list => {
            const newList = list.map(upg => {
              if (upg.upgradeId === upgradeId) {
                return { ...upg, owned: message.data.owned };
              }
              return upg;
            });
            return newList;
          });
        }
        break;
        
      case 'achievement_unlocked':
        // Handle achievement unlock
        if (message.data) {
          this.achievementsSignal.update(achievements => 
            achievements.map(a => 
              a.achievementId === message.data.achievementId 
                ? { ...a, unlocked: true }
                : a
            )
          );
        }
        break;
        
      case 'global_event':
        // Handle global events (could show notification)
        console.log('Global event:', message.data);
        break;
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
      this.syncViaWebSocket();
    }
  }

  /**
   * Buy an upgrade via HTTP
   */
  async buyUpgrade(upgradeId: string): Promise<boolean> {
    const upgrade = this.upgradesSignal().find(upg => upg.upgradeId === upgradeId);
    if (!upgrade) return false;

    const cost = this.calculateUpgradeCost(upgrade);
    
    if (!this.canAffordUpgrade()(cost, upgrade.upgradeType)) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
        }>(`${API_BASE_URL}/upgrade`, {
          sessionId: this.gameStateSignal().sessionId,
          upgradeId
        })
      );
      
      // WebSocket will handle the state update via 'upgrade_purchased' message
      return response.success;
    } catch (error) {
      console.error('Upgrade error:', error);
      return false;
    }
  }

  async submitScore(name: string): Promise<{ success: boolean; message?: string }> {
    const trimmedName = name.trim();
    if (!trimmedName) return { success: false, message: 'Le nom ne peut pas être vide' };

    try {
      // Sync before submitting
      await this.syncViaWebSocket();

      // Submit score; server will broadcast leaderboard updates via WebSocket
      const response = await firstValueFrom(
        this.http.post<{ success: boolean; message?: string }>(
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
        // Do NOT set leaderboard here; server will push updates via WebSocket
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

  async prestige(): Promise<{ success: boolean; message?: string; dnaGained?: number }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          message?: string;
          dnaGained?: number;
        }>(`${API_BASE_URL}/prestige`, {
          sessionId: this.gameStateSignal().sessionId
        })
      );

      if (response.success) {
        // Reload game state after prestige
        await this.initGame();
      }

      return response;
    } catch (error: any) {
      console.error('Prestige error:', error);
      return {
        success: false,
        message: error?.error?.detail || 'Erreur lors du prestige'
      };
    }
  }

  async buySkin(skinId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          message?: string;
        }>(`${API_BASE_URL}/buy-skin`, {
          sessionId: this.gameStateSignal().sessionId,
          skinId
        })
      );

      return response;
    } catch (error: any) {
      console.error('Buy skin error:', error);
      return {
        success: false,
        message: error?.error?.detail || 'Erreur lors de l\'achat'
      };
    }
  }

  /**
   * Sync game state via WebSocket
   */
  private syncViaWebSocket(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected, cannot sync');
      return;
    }

    try {
      this.ws.send(JSON.stringify({
        type: 'sync',
        pendingClicks: this.pendingClicks
      }));
      
      // Reset pending clicks after sending
      this.pendingClicks = 0;
    } catch (error) {
      console.error('WebSocket sync error:', error);
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
    }, 1000);
  }

  /**
   * Periodic sync via WebSocket
   */
  private startPeriodicSync(): void {
    // Clear existing interval
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.pendingClicks > 0 || Date.now() - this.gameStateSignal().lastSyncTime > 10000) {
        this.syncViaWebSocket();
      }
    }, this.SYNC_INTERVAL_MS);
  }

  /**
   * Calculate upgrade cost
   */
  calculateUpgradeCost(upgrade: UpgradeType): number {
    if (upgrade.upgradeType === 'prestige') {
      return upgrade.baseCost; // Fixed cost for prestige upgrades
    }
    return Math.floor(upgrade.baseCost * Math.pow(1.15, upgrade.owned));
  }

  private getSessionIdFromStorage(): string | null {
    try {
      return localStorage.getItem('banana-session-id');
    } catch {
      return null;
    }
  }

  async buyMeme(prompt: string, insta: string): Promise<{ success: boolean; message?: string }> {
    const sessionId = this.gameStateSignal().sessionId;
    const devMode = isDevMode();

    try {
      // Sync before spending
      this.syncViaWebSocket();
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait for sync

      const response = await firstValueFrom(
        this.http.post<{
          success: boolean;
          message?: string;
        }>(`${API_BASE_URL}/buy-meme`, {
          sessionId,
          prompt,
          insta,
          devMode
        })
      );

      return response;
    } catch (error: any) {
      console.error("Buy meme error:", error);
      return { 
        success: false, 
        message: error?.error?.detail || "Erreur lors de l'envoi." 
      };
    }
  }

  ngOnDestroy(): void {
    // Clean up
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}