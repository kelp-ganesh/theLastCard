import type { COLORS, VALUE } from 'interfaces';

export class Card {
  id: string;
  color: COLORS;
  value: VALUE;
  points: number;

  constructor(color: COLORS, value: VALUE, points: number,id:string) {
    this.color = color;
    this.value = value;
    this.points = points;
    this.id=id;
    
  }
}
