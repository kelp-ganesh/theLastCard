import type { Card } from "./card.js"
import { Player } from "./player.js";


//submited by player
export type SUBMIT_CARD=
{
    card:Card;
}


//drawnn by player
export type DRAW_CARD=
{
     
}

//response after submiting card
export type END_TURN=
{
    players:Player[];
    currentPlayerIndex: number;
    direction: 1 | -1;
    drawPile: Card[];
    discardPile: Card[];
    activeContext: string;
    pendingAction: { Type: "drawTwo" | "none" | "skip"; count: number };
}


  export type DRAW_RESPONSE=
  {
      players:Player[];
      drawPile: Card[];
      pendingAction: { Type: "drawTwo" | "none" | "skip"; count: number };
  }