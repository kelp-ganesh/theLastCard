import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, Player } from './card.interface';
import { GameSocket } from '../../services/socket-client/game-socket';
import { single, Subscription } from 'rxjs';
import type { COLORS } from 'interfaces';
import { CardCompnent } from '../card/card';
import { Leaderboard } from '../leaderboard/leaderboard';
import { UnoGame } from 'game-logic';
import { pipeline } from 'stream';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';
import { Sign } from 'crypto';
import { Spinner } from '../spinner/spinner';


@Component({
  selector: 'app-game-room',
  standalone: true,
  imports: [CommonModule, CardCompnent, Leaderboard, Spinner],
  templateUrl: './game.html',
  styleUrls: [],
  animations: [
    trigger('cardAnim', [

      transition(':enter', [

        style({
          opacity: 0,
          transform: 'translate(-400px, -300px) scale(0.4) rotate(-20deg)'
        }),
        animate('1000ms cubic-bezier(.25,.8,.25,1)', style({
          opacity: 1,
          transform: 'translate(0,0) scale(1) rotate(0)'
        }))
      ]),


      transition(':leave', [
        animate('400ms ease-in', style({
          opacity: 0,
          transform: 'translate({{x}}px, {{y}}px) scale(0.8) rotate(45deg)'
        }))
      ])
    ])
  ]
})
export class GameRoomComponent {

  private gameStateSub!: Subscription;
  private gameResultSub!: Subscription;
  direction = signal<'CW' | 'CCW'>('CCW');
  isMyTurn = signal<boolean>(true);
  activeContext = signal<COLORS>('GREEN');
  allowchangeContextPlayerIndex = signal<boolean>(false);
  chnageContextColors = signal<boolean>(false);

  isLoading = signal<boolean>(false);
  drawnCard = signal<Card | undefined>(undefined);
  @ViewChild('discardPile', { read: ElementRef })
  discardPile!: ElementRef<HTMLElement>;
  drawnCardHTML = signal<HTMLElement | undefined>(undefined);


  lastDiscardVector = { x: 0, y: 0 };



  constructor
    (private socketService: GameSocket) {}


  myHand = signal<Card[]>([]);
  opponents = signal<Player[]>([]);

  topCard = signal<Card>({ id: 'top', color: 'BLACK', value: 'wild-draw-four', points: 8 });
  roomName = signal<string>("demo_room");
  isUnoSaid = signal<boolean>(true);
  playerName = signal<string>("Me");
  avatarId = signal<string>("2");
  isEnd = signal<boolean>(true);
  gameResult = signal<UnoGame | undefined>(undefined);
  playerId = signal<string>('');

  ngOnInit() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.isLoading.set(false);
    }, 2000)
    this.socketService.gameInit();

    this.gameStateSub = this.socketService.onGameState("GAME_STATE")
      .subscribe({
        next: (data) => {
          this.direction.set((data.state.direction == 1) ? "CW" : "CCW");
          this.isMyTurn.set(data.state.isMyturn);
          this.activeContext.set(data.state.activeContext);
          this.topCard.set(data.state.topCard);
          this.myHand.set(data.state.myCards);
          data.state.myCards.forEach((element: any) => {
          });
          this.allowchangeContextPlayerIndex.set(data.state.allowchangeContextPlayerIndex);
          this.opponents.set(data.state.opponents)
          this.chnageContextColors.set(data.state.chnageContextColors);
          this.playerName.set(data.state.playerName)
          this.roomName.set(data.state.roomName);
          this.avatarId.set(data.state.avatarId);
          this.isUnoSaid.set(data.state.isUnoSaid);
          this.isEnd.set(data.state.isEnd);


          if (this.isEnd()) {
            this.socketService.gameEnds();
          }
        },
        error: (err) => {
          console.log("error while updating game state")
        }
      })

    this.gameResultSub = this.socketService.onGameResult("GAME_RESULT")
      .subscribe({
        next: (data) => {
          this.gameResult.set(data.state);
          this.playerId.set(data.playerId);


        },
        error: (err) => {
          console.log("error while updating game result state")
        }
      })

    const connect = this.socketService.connect();

    if (!connect) {

      console.log("socket is not connected")
    }


  }




  drawCard() {
    if (!this.isMyTurn()) return;

    this.socketService.drawCard();
  }

  playCard(card: Card, cardEl: HTMLElement) {
    if (!this.isMyTurn()) return;

    this.drawnCard.set(card);
    this.drawnCardHTML.set(cardEl)
    this.socketService.submitCard({ card });
    const discardRect = this.discardPile.nativeElement.getBoundingClientRect();
    const cardRect = this.drawnCardHTML()!.getBoundingClientRect();

    this.lastDiscardVector =
    {
      x: discardRect.left - cardRect.left,
      y: discardRect.top - cardRect.top
    };




  }

  callUno() {
    if (!this.isMyTurn()) return;

    this.socketService.onUno();
  }

  callSkip() {
    if (!this.isMyTurn()) return;

    this.socketService.timeExceed();
  }

  callChallenge() {
    this.socketService.onChallenge();
  }

  getColorClass(color: string): string {
    switch (color) {
      case 'RED': return 'bg-red-600';
      case 'BLUE': return 'bg-blue-600';
      case 'GREEN': return 'bg-green-600';
      case 'YELLOW': return 'bg-yellow-600';
      case 'BLACK': return 'bg-slate-800 border-2 border-white';
      default: return 'bg-gray-400';
    }
  }

  getCardLoop(count: number): number[] {
    return Array(count).fill(0);
  }

  getOpponentStyle(index: number, total: number) {

    if (total == 1) {
      return {
        'transform': `rotate(${90}deg) translate(${-20}vh) rotate(-${90}deg)`,
        'left': '48%',
        'top': '0%',
        'margin-bottom': '70'
      };
    }

    const startAngle = 180;
    const endAngle = 360;
    const step = (endAngle - startAngle) / (total - 1);
    const angle = startAngle + (index * step);


    const radius = 45;

    return {
      'transform': `rotate(${angle}deg) translate(${radius}vh) rotate(-${angle}deg)`,
      'left': '50%',
      'top': '60%',
      'position': 'absolute',
      'margin-left': '-2rem',
      'margin-top': '-2rem'
    };
  }

  isNumber(value: string): boolean {
    return !isNaN(Number(value));
  }

  isActionCard(value: string): boolean {
    return value === 'SKIP' || value === 'REVERSE' || value === 'DRAW_TWO';
  }

  isWildCard(value: string): boolean {
    return value === 'WILD' || value === 'WILD_DRAW_FOUR';
  }

  onColorSelect(color: COLORS) {

    if (this.allowchangeContextPlayerIndex()) {
      this.socketService.submitColor(color);
      this.chnageContextColors.set(false);
      this.allowchangeContextPlayerIndex.set(false);
    }
  }


}

