import { Component, Input, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, Player } from 'game-logic';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard {

  @Input( ) players!:Player[];
  leaderboardData = signal<any[]>([]);

  ngOnInit()
  {
    this.processResults();
  }

  private processResults() {

    const results = this.players.map(player => {
      const score = player.Hand.length === 0 ? 0 : calculateHandScore(player.Hand);
      return {
        ...player,
       score: score,
      isWinner: player.Hand.length === 0

      };

    });
    results.sort((a, b) => a.score - b.score);

    this.leaderboardData.set(results);

  }

 

  exitGame() {
      window.location.href = '/';
    }

}

export function calculateHandScore(hand: Card[]): number {
    return hand.reduce((total, card) => {
    if (!isNaN(Number(card.value))) {

      return total +card.points;

    }
    return total + card.points;

  }, 0);

}
