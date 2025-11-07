import { Component, OnInit, OnDestroy, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Game, UpgradeType } from '../../services/game/game';

@Component({
  selector: 'app-clicker',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './clicker.html',
  styleUrl: './clicker.scss'
})
export class Clicker implements OnInit, OnDestroy {
  gameService = inject(Game);
  
  playerName = '';
  clickAnimation = signal(false);
  isBuying = signal(false);
  isSubmitting = signal(false);
  isSyncing = signal(false);
  showResetConfirm = signal(false);
  showWelcomeBack = signal(false);
  offlineEarnings = signal(0);
  upgradeFilter = signal<'all' | 'click' | 'auto'>('all');
  
  private lastSyncTime = Date.now();
  timeSinceSync = signal(0);
  
  filteredUpgrades = computed(() => {
    const upgrades = Array.from(this.gameService.upgrades().values());
    const filter = this.upgradeFilter();
    
    if (filter === 'all') {
      return upgrades;
    }
    
    return upgrades.filter(u => u.type === filter);
  });

  ngOnInit() {
    this.gameService.initGame().then(() => {
      this.checkOfflineEarnings();
    });
    
    // Update sync timer display
    setInterval(() => {
      this.timeSinceSync.set(Math.floor((Date.now() - this.lastSyncTime) / 1000));
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
    
    // Show click animation
    this.clickAnimation.set(true);
    setTimeout(() => this.clickAnimation.set(false), 800);
  }

  async buyUpgrade(upgrade: UpgradeType) {
    if (this.isBuying() || !this.canAfford(upgrade)) {
      return;
    }
    
    this.isBuying.set(true);
    
    try {
      const success = await this.gameService.buyUpgrade(upgrade.id);
      if (!success) {
        // Could show error message
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
        // Success feedback
        this.playerName = '';
        alert('🎉 Score soumis avec succès !');
      } else {
        // Show error message from server
        alert(`❌ ${result.message || 'Échec de la soumission du score'}`);
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

  canAfford(upgrade: UpgradeType): boolean {
    return this.gameService.canAffordUpgrade()(this.getCost(upgrade));
  }

  getCost(upgrade: UpgradeType): number {
    return this.gameService.calculateUpgradeCost(upgrade);
  }

  formatNumber(num: number): string {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(2) + 'Md';
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return Math.floor(num).toString();
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