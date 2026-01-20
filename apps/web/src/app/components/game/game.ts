import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card, Player } from './card.interface';
import { GameSocket } from '../../services/socket-client/game-socket';
import { single, Subscription } from 'rxjs';
import type  { COLORS } from 'interfaces';
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
  imports: [CommonModule,CardCompnent,Leaderboard,Spinner],
  templateUrl: './game.html',
  styleUrls: ['./game.scss'],
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
        animate('600ms ease-in', style({
          opacity: 0,
          transform: 'translate({{x}}px, {{y}}px) scale(0.8) rotate(45deg)'
        }))
      ])
    ])
  ]
})
export class GameRoomComponent {
   
  private gameStateSub!:Subscription;
  private gameResultSub!:Subscription;
  direction = signal<'CW' | 'CCW'>('CCW');
  isMyTurn = signal<boolean>(true);
  activeContext=signal<COLORS>('GREEN');
  allowchangeContextPlayerIndex=signal<boolean>(false);
  chnageContextColors=signal<boolean>(false);
  isGameEnd=signal<boolean>(false);
  isLoading=signal<boolean>(false);
  drawnCard=signal<Card|undefined>(undefined);
@ViewChild('discardPile', { read: ElementRef })
discardPile!: ElementRef<HTMLElement>;
drawnCardHTML=signal<HTMLElement|undefined>(undefined);


lastDiscardVector = { x: 0, y: 0 };
  
  
  
  constructor
  ( private socketService:GameSocket ) {
    console.log("game component loaded");
  }

  
  myHand = signal<Card[]>([
    { id: '1', color: "BLUE", value: '2',points:2 },
    { id: '2', color: 'BLUE', value: 'skip',points:20 },
    { id: '3', color: 'GREEN', value: "skip" ,points:9},
    { id: '4', color: "BLACK", value: 'skip' ,points:50},
    { id: '5', color: 'BLACK', value: "skip" ,points:8},
    { id: '6', color: 'BLACK', value: "skip" ,points:0},
     
  ]);
 
   
  opponents = signal<Player[]>(Array.from({ length: 4}).map((_, i) => ({
    id: `p-${i}`,
    name: `Player ${i + 2}`,
    cardCount: Math.floor(Math.random() * 7) + 1,
    avatarUrl: `4`,
    isTurn: i === 4  ,
    position:'top',
    isUnoSaid:true
  })));

  topCard = signal<Card>({ id: 'top', color: 'BLACK', value: 'wild-draw-four' ,points:8});
  roomName=signal<string>("demo_room");
  isUnoSaid=signal<boolean>(true);
  playerName=signal<string>("Me");
  avatarId=signal<string>("2");
  isEnd=signal<boolean>(true);
  gameResult=signal<UnoGame|undefined>(undefined);
  playerId=signal<string>('');


  
  getPositionClass(pos: string): string {

  switch (pos) {

    case 'top':       return 'top-4 left-1/2 -translate-x-1/2';

    case 'left':      return 'left-4 top-1/2 -translate-y-1/2 flex-row-reverse'; 

    case 'right':     return 'right-4 top-1/2 -translate-y-1/2 flex-row';

    case 'top-left':  return 'top-10 left-20';

    case 'top-right': return 'top-10 right-20';

    default: return '';

  }

}
 
  ngOnInit()
  { this.isLoading.set(true);
    setTimeout(()=>{
      this.isLoading.set(false);
    },2000)
    this.socketService.gameInit();

    this.gameStateSub=this.socketService.onGameState("GAME_STATE")
    .subscribe({
      next:(data)=>{
        //console.log("game state updated"+data);
        this.direction.set((data.state.direction ==1)? "CW" : "CCW" );
        //console.log("direction :"+data.state.direction);
        this.isMyTurn.set(data.state.isMyturn);
        //console.log("is my turn :"+data.state.isMyturn);
        this.activeContext.set(data.state.activeContext);
        //console.log("active context :"+data.state.activeContext);
        this.topCard.set(data.state.topCard);
         
        //console.log("top card :"+data.state.topCard);
        this.myHand.set(data.state.myCards);
      
        data.state.myCards.forEach((element:any) => {
          //console.log("card: "+element.id);
        });
        this.allowchangeContextPlayerIndex.set(data.state.allowchangeContextPlayerIndex);
        //console.log("allow change context player index :"+data.state.allowchangeContextPlayerIndex);
        this.opponents.set(data.state.opponents)
       // console.log("opponents :"+data.state.opponents);
        this.chnageContextColors.set(data.state.chnageContextColors);
        //console.log("change context colors :"+data.state.chnageContextColors);
        this.playerName.set(data.state.playerName)
        //console.log("player Name",this.playerName);
        this.roomName.set(data.state.roomName);
        this.avatarId.set(data.state.avatarId);
        this.isUnoSaid.set(data.state.isUnoSaid);
        this.isEnd.set(data.state.isEnd);
       
        console.log("isGame end: ",this.isEnd())
         if(this.isEnd())
      {
        this.socketService.gameEnds();
      }
        
        
        
      },
      error:(err)=>{
        console.log("error while updating game state")
      }
    })

    this.gameResultSub=this.socketService.onGameResult("GAME_RESULT")
    .subscribe({
      next:(data)=>{
        this.gameResult.set(data.state);
        console.log("gameReuslt"+this.gameResult);
        this.playerId.set(data.playerId);
        console.log("player id: ",this.playerId());
        console.log("updating game result");
        
      },
      error:(err)=>{
        console.log("error while updating game result state")
      }
    })
    
  }
  
  


  drawCard() {
    if (!this.isMyTurn()) return;
    console.log('Drawing a card...');
    this.socketService.drawCard();
  }

  playCard(card: Card , cardEl: HTMLElement) {
    if (!this.isMyTurn()) return;
    console.log('Playing:', card);
    this.drawnCard.set(card);
    this.drawnCardHTML.set(cardEl)
    this.socketService.submitCard({ card});
    const discardRect = this.discardPile.nativeElement.getBoundingClientRect();
        const cardRect = this.drawnCardHTML()!.getBoundingClientRect();
        console.log(  "cordinates of pixel" , discardRect.left-cardRect.left,
            discardRect.top - cardRect.top);
        this.lastDiscardVector = {
            x: discardRect.left - cardRect.left,
            y: discardRect.top - cardRect.top
          };
   
   
      
     
  }

  callUno() {
   if (!this.isMyTurn()) return;
    console.log('uno for .ts a card...');
    this.socketService.onUno(); 
  }

  callSkip()
  {
     if (!this.isMyTurn()) return;
    console.log('Drawing a card...');
    this.socketService.timeExceed(); 
  }

  callChallenge()
  {
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

getCardLoop(count:number):number[]
{
  return Array(count).fill(0);
}

getOpponentStyle(index: number, total: number) {
  
if(total ==1)
{
  return {
    'transform': `rotate(${90}deg) translate(${-20}vh) rotate(-${90}deg)`, 
    'left': '48%',
    'top': '0%',
    'margin-bottom': '70'
  };
}

  const startAngle = 180; 
  const endAngle = 360;   
  const step = (endAngle - startAngle) / (total -1);
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

isNumber(value:string):boolean
{
  return !isNaN(Number(value));
}

isActionCard(value:string):boolean
{
  return value==='SKIP' || value==='REVERSE' || value==='DRAW_TWO';
}

isWildCard(value:string):boolean
{
  return value==='WILD' || value==='WILD_DRAW_FOUR';
}

onColorSelect(color:COLORS)
{
   
   if(this.allowchangeContextPlayerIndex())
   {
     this.socketService.submitColor(color);
     this.chnageContextColors.set(false);
     this.allowchangeContextPlayerIndex.set(false);
   }
}







}

  