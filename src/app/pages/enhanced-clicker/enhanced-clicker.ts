import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EnhancedGame, UpgradeType, Achievement, ActiveEvent } from '../../services/enhanced-game/enhanced-game';

@Component({
  selector: 'app-enhanced-clicker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './enhanced-clicker.html',
  styleUrl: './enhanced-clicker.scss'
})
export class EnhancedClicker implements OnInit, OnDestroy {
  gameService = inject(EnhancedGame);
  
  playerName = '';
  clickAnimation = signal(false);
  isBuying = signal(false);
  isSubmitting = signal(false);
  showResetConfirm = signal(false);
  showWelcomeBack = signal(false);
  showPrestigeModal = signal(false);
  showAchievementsModal = signal(false);
  showSkinsModal = signal(false);
  offlineEarnings = signal(0);
  upgradeFilter = signal<'all' | 'click' | 'auto' | 'synergy' | 'prestige'>('all');
  achievementTab = signal<'unlocked' | 'locked'>('unlocked');
  
  lastSyncTime = this.gameService.lastSyncSignal;
  timeSinceSync = signal(0);
  
  filteredUpgrades = computed(() => {
    const upgrades = Array.from(this.gameService.upgrades().values());
    const filter = this.upgradeFilter();
    
    if (filter === 'all') {
      return upgrades.filter(u => u.type !== 'prestige');
    }
    
    return upgrades.filter(u => u.type === filter);
  });

  prestigeUpgrades = computed(() => {
    return Array.from(this.gameService.upgrades().values())
      .filter(u => u.type === 'prestige');
  });

  displayedAchievements = computed(() => {
    if (this.achievementTab() === 'unlocked') {
      return this.gameService.unlockedAchievements();
    }
    return this.gameService.lockedAchievements();
  });

  currentSkin = computed(() => {
    const skins = this.gameService.skins();
    const selectedId = this.gameService.gameState().selectedSkin;
    return skins[selectedId] || skins['default'];
  });

  availableSkins = computed(() => {
    return Object.entries(this.gameService.skins());
  });

  ownedSkins = computed(() => {
    return this.gameService.gameState().ownedSkins;
  });

  activeRainEvent = computed(() => {
    return this.gameService.activeEvents().find(e => e.type === 'rain');
  });

  activeGoldenEvent = computed(() => {
    return this.gameService.activeEvents().find(e => e.type === 'golden');
  });

  activeFestivalEvent = computed(() => {
    return this.gameService.activeEvents().find(e => e.type === 'festival');
  });

  ngOnInit() {
    this.gameService.initGame().then(() => {
      this.checkOfflineEarnings();
    });
    
    setInterval(() => {
      this.timeSinceSync.set(Math.floor((Date.now() - this.lastSyncTime()) / 1000));
    }, 1000);
  }

  ngOnDestroy() {
    // Cleanup handled by service
  }

  onBananaClick() {
    if (this.gameService.clickCooldown()) {
      return;
    }
    
    this.gameService.handleClick();
    
    this.clickAnimation.set(true);
    setTimeout(() => this.clickAnimation.set(false), 800);
  }

  async buyUpgrade(upgrade: UpgradeType) {
    if (this.isBuying() || !this.canAfford(upgrade)) {
      return;
    }
    
    this.isBuying.set(true);
    
    try {
      const result = await this.gameService.buyUpgrade(upgrade.id);
      if (!result.success && result.message) {
        alert(result.message);
      }
    } finally {
      this.isBuying.set(false);
    }
  }

  async submitScore() {
    if (!this.playerName.trim() || this.isSubmitting()) {
      return;
    }
    
    this.isSubmitting.set(true);
    
    try {
      const result = await this.gameService.submitScore(this.playerName);
      if (result.success) {
        this.playerName = '';
        alert('🎉 Score soumis avec succès !');
      } else {
        alert(`❌ ${result.message || 'Échec de la soumission'}`);
      }
    } finally {
      this.isSubmitting.set(false);
    }
  }

  confirmReset() {
    this.showResetConfirm.set(true);
  }

  async resetGame() {
    this.showResetConfirm.set(false);
    await this.gameService.resetGame();
  }

  openPrestigeModal() {
    this.showPrestigeModal.set(true);
  }

  async confirmPrestige() {
    const result = await this.gameService.prestige();
    if (result.success) {
      this.showPrestigeModal.set(false);
      alert(`🌟 ${result.message}`);
    } else {
      alert(`❌ ${result.message}`);
    }
  }

  openAchievementsModal() {
    this.showAchievementsModal.set(true);
  }

  openSkinsModal() {
    this.showSkinsModal.set(true);
  }

  async buySkin(skinId: string, cost: number) {
    const owned = this.ownedSkins().includes(skinId);
    
    if (!owned && this.gameService.gameState().bananas < cost) {
      alert('Pas assez de bananes !');
      return;
    }
    
    const result = await this.gameService.buySkin(skinId);
    if (result.success) {
      alert(`✨ ${result.message}`);
    } else {
      alert(`❌ ${result.message}`);
    }
  }

  async clickGoldenBanana(eventId: string) {
    const result = await this.gameService.clickGoldenBanana(eventId);
    if (result.success) {
      alert(`🌟 Banane dorée ! +${this.gameService.formatNumber(result.reward)} bananes !`);
    }
  }

  dismissAchievement(achievementId: string) {
    this.gameService.dismissAchievementNotification(achievementId);
  }

  canAfford(upgrade: UpgradeType): boolean {
    const cost = this.getCost(upgrade);
    const isDNA = upgrade.type === 'prestige';
    return this.gameService.canAffordUpgrade()(cost, isDNA);
  }

  getCost(upgrade: UpgradeType): number {
    return this.gameService.calculateUpgradeCost(upgrade);
  }

  formatNumber(num: number): string {
    return this.gameService.formatNumber(num);
  }

  getAchievementProgress(achievement: Achievement): number {
    const state = this.gameService.gameState();
    const reqType = achievement.requirement.type;
    const reqValue = achievement.requirement.value;
    
    if (reqType === 'clicks') {
      return Math.min((state.totalClicks / reqValue) * 100, 100);
    } else if (reqType === 'bananas') {
      return Math.min((state.totalBananasEarned / reqValue) * 100, 100);
    } else if (reqType === 'prestige') {
      return Math.min((state.prestigeCount / reqValue) * 100, 100);
    }
    
    return 0;
  }

  private checkOfflineEarnings() {
    const state = this.gameService.gameState();
    const timeDiff = (Date.now() - state.lastSyncTime) / 1000;
    
    if (timeDiff > 60 && state.bananasPerSecond > 0) {
      const maxOfflineTime = 8 * 60 * 60;
      const offlineTime = Math.min(timeDiff, maxOfflineTime);
      const earnings = Math.floor(offlineTime * state.bananasPerSecond);
      
      if (earnings > 0) {
        this.offlineEarnings.set(earnings);
        this.showWelcomeBack.set(true);
      }
    }
  }
}