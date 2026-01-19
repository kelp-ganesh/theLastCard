import { Component, Input } from '@angular/core';
import type { Card } from '../game/card.interface';

@Component({
  selector: 'app-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
})
export class CardCompnent {
 @Input({required:true}) card!:Card;


 isNumber(value:string):boolean
{
  return !isNaN(Number(value));
}
}
