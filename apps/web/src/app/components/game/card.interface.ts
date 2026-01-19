export type CardColor = 'RED' | 'BLUE' | 'GREEN' | 'YELLOW' | 'BLACK';
export type CardValue = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | 'skip' | 'reverse' | 'draw-two' | 'wild' | 'wild-draw-four';

export interface Card {
  id: string;
  color: CardColor;
  value: CardValue;
  points:number
}

export interface Player {
  id: string;
  name: string;
  cardCount: number;
  avatarUrl: string;
  isTurn: boolean;
  position:'top'|'left'|'right'|'top-left'|'top-right';
  isUnoSaid:boolean
}