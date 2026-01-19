import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class LandingComponent {
  
  features = [
    {
      title: 'Real-Time Multiplayer',
      desc: 'Zero lag. Play with friends or get matched with opponents worldwide in milliseconds via WebSockets.',
      icon: '⚡',
      color: 'text-yellow-400'
    },
    {
      title: 'Custom House Rules',
      desc: 'Want to stack +4 cards? Play with "Jump-in"? Customize every aspect of your game lobby.',
      icon: '🛠️',
      color: 'text-blue-400'
    },
    {
      title: 'Global Leaderboards',
      desc: 'Climb the ranks. Earn XP for every win, unlock exclusive avatars, and become the Uno King.',
      icon: '👑',
      color: 'text-red-500'
    }
  ];
}