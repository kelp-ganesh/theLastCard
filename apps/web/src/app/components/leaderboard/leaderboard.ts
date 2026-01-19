import { Component, Input, signal, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, Player } from 'game-logic';
import { GameSocket } from '../../services/socket-client/game-socket';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css',
})
export class Leaderboard {
  

  constructor(){}
  @Input({required:true} ) players!:Player[];
  leaderboardData = signal<any[]>([]);
  isLoading=signal<boolean>(false);


  ngOnInit()
  { this.isLoading.set(true);
    setTimeout(()=>{
      this.isLoading.set(false);
    },3000)
    
    this.processResults();
    for(let i=0;i<this.players.length;i++)
    {
      console.log("player",this.players[i].Username)
    }
  }

  private processResults() {

    const results = this.players.map(player => {
      const score = player.Hand.length === 0 ? 0 : calculateHandScore(player.Hand);
      console.log("from leaderborad"+score,player);
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

// ?when user go to game page up to 3 seconds he have to show Game loading.. and them should render the acual ui means we have to mask the ui intially for 3 seconds so how to do that 
