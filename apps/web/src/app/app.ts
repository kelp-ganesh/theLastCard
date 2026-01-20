import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameRoomComponent } from "./components/game/game";
import { PrimeNG } from 'primeng/config'; 

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('web');
  constructor(private primeng: PrimeNG) {}

    ngOnInit() {
        this.primeng.ripple.set(true);
    }

  // @HostListener('window:keydown', ['$event'])
  // blockRefresh(event: KeyboardEvent) {
  //   if (
  //     event.key === 'F5' ||
  //     (event.ctrlKey && event.key.toLowerCase() === 'r') ||
  //     (event.metaKey && event.key.toLowerCase() === 'r')
  //   ) {
  //     event.preventDefault();
  //   }
  // }
}
