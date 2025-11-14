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
  upgradeFilter = signal<'all' | 'click' | 'auto'>('all');
  offlineEarnings = signal(0);
  
  newSessionId = '';
  currentSessionId = signal('');
  
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
      this.offlineEarnings.set(this.gameService.offlineEarnings);
      this.updateCurrentSessionId();
      this.showWelcomeBack.set(true);
    });
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
      `⚠️ Changer de session ?\n\nVous allez basculer vers la session: ${this.newSessionId}\n\n⚠️ Vous perdrez votre progression sur la session actuelle si vous n'en sauvegardez pas l'ID !`
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
      
      alert('✅ Session changée avec succès !');
    } catch (error) {
      alert('❌ Erreur lors du changement de session');
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
}