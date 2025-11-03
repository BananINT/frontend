import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { GameService } from '../../services/game/game';

@Component({
  selector: 'app-clicker',
  imports: [RouterLink, FormsModule],
  templateUrl: './clicker.html',
  styleUrl: './clicker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Clicker {
  gameService = inject(GameService);
  clickAnimation = signal(false);
  playerNameInput = '';

  constructor() {
    this.gameService.initGame();
    
    // Sync input with service
    effect(() => {
      this.playerNameInput = this.gameService.playerName();
    });
  }

  async handleClick(): Promise<void> {
    await this.gameService.handleClick();
    this.clickAnimation.set(true);
    setTimeout(() => this.clickAnimation.set(false), 200);
  }

  async buyUpgrade(cost: number, multiplier: number): Promise<void> {
    await this.gameService.buyUpgrade(cost, multiplier);
  }

  async submitScore(): Promise<void> {
    const success = await this.gameService.submitScore(this.playerNameInput);
    if (success) {
      alert('Score soumis avec succès ! 🍌');
    } else {
      alert('Entre ton nom pour soumettre ton score !');
    }
  }

  onNameChange(name: string): void {
    this.gameService.updatePlayerName(name);
  }

  async resetGame(): Promise<void> {
    if (confirm('Veux-tu vraiment recommencer à zéro ? 🍌')) {
      await this.gameService.resetGame();
    }
  }

  formatNumber(num: number): string {
    return num.toLocaleString();
  }

  getMedal(index: number): string {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}.`;
  }

  getLeaderboardClass(index: number): string {
    if (index === 0) return 'bg-gradient-to-r from-yellow-400 to-yellow-300';
    if (index === 1) return 'bg-gradient-to-r from-gray-300 to-gray-200';
    if (index === 2) return 'bg-gradient-to-r from-orange-300 to-orange-200';
    return 'bg-gray-100';
  }
}