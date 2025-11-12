import { Component, signal, computed, inject } from '@angular/core';
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
export class Clicker {
  gameService = inject(Game);
  
  playerName = '';
  clickAnimation = signal(false);
  isBuying = signal(false);
  isSubmitting = signal(false);
  isSyncing = signal(false);
  isLoading = signal(false);
  showWelcomeBack = signal(false);
  showSessionModal = signal(false);
  showSessionWarning = signal(false);
  offlineEarnings = signal(0);
  upgradeFilter = signal<'all' | 'click' | 'auto'>('all');
  
  newSessionId = '';
  currentSessionId = signal('');
  
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

  constructor() {
    this.gameService.initGame().then(() => {
      this.checkOfflineEarnings();
      this.updateCurrentSessionId();
    });
    
    // Update sync timer display
    setInterval(() => {
      this.timeSinceSync.set(Math.floor((Date.now() - this.lastSyncTime) / 1000));
    }, 1000);

    // Update session ID display periodically
    setInterval(() => {
      this.updateCurrentSessionId();
    }, 5000);
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

  openSessionModal() {
    this.updateCurrentSessionId();
    this.newSessionId = '';
    this.showSessionModal.set(true);
  }

  async changeSession() {
    if (!this.newSessionId.trim()) {
      alert('⚠️ Veuillez entrer un ID de session valide');
      return;
    }

    const confirmed = confirm(
      `⚠️ Changer de session ?\n\nVous allez basculer vers la session: ${this.newSessionId}\n\nVotre session actuelle est sauvegardée automatiquement.`
    );

    if (!confirmed) return;

    try {
      this.isLoading.set(true);
      
      // Change session in localStorage
      localStorage.setItem('banana-session-id', this.newSessionId);
      
      this.updateCurrentSessionId();
      this.showSessionModal.set(false);
      
      // Reload game with new session
      await this.gameService.initGame();
      this.checkOfflineEarnings();
      
      alert('✅ Session changée avec succès !');
    } catch (error) {
      alert('❌ Erreur lors du changement de session');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async createNewSession() {
    const confirmed = confirm(
      `✨ Créer une nouvelle session ?\n\nUne nouvelle partie sera créée avec un ID unique.\nVotre session actuelle reste sauvegardée.`
    );

    if (!confirmed) return;

    try {
      this.isLoading.set(true);
      
      // Remove current session ID to force creation of new one
      localStorage.removeItem('banana-session-id');
      
      this.showSessionModal.set(false);
      
      // Initialize new session
      await this.gameService.initGame();
      this.updateCurrentSessionId();
      this.checkOfflineEarnings();
      
      const newSessionId = this.currentSessionId();
      alert(`✅ Nouvelle session créée !\n\nID: ${newSessionId}\n\n💡 Sauvegardez cet ID pour revenir à cette partie plus tard !`);
    } catch (error) {
      alert('❌ Erreur lors de la création de session');
      console.error(error);
    } finally {
      this.isLoading.set(false);
    }
  }

  copySessionId() {
    const sessionId = this.currentSessionId();
    navigator.clipboard.writeText(sessionId).then(() => {
      alert('📋 ID de session copié dans le presse-papier !');
    }).catch(() => {
      alert('❌ Impossible de copier l\'ID');
    });
  }

  toggleSessionWarning() {
    this.showSessionWarning.set(!this.showSessionWarning());
  }

  private updateCurrentSessionId() {
    const sessionId = this.gameService.gameState().sessionId;
    this.currentSessionId.set(sessionId);
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