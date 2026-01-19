import { inject, Inject, Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class GameSocket {
    private routerLink=inject(Router);
  constructor(private socket: Socket, @Inject(DOCUMENT) private document: Document) { }
  
  // Helper method to get token from localStorage
  private getTokenFromStorage(): string | null {
     
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    
    try {
      const token = localStorage.getItem('authToken');
     // console.log("Token from localStorage:", token);
      return token;
    } catch (error) {
      console.error('Error reading auth token from localStorage:', error);
    }
    return null;
  }

  connect():boolean
  {
    const token = this.getTokenFromStorage();
   // console.log("token " + token);
    if (token) {
      this.socket.ioSocket.auth = { token };
      this.socket.connect();
      return true;
    }
    else
    { 
      return true;
    }
   
  }



  lobbyInit():void
  { console.log("lobby_init method called");
    this.socket.emit('LOBBY_INIT',{});

  }
  emit(event: string, data?: any): void {
    this.socket.emit(event, data);
  }

  on(event: string): Observable<any> {
    return this.socket.fromEvent(event);
  }




  onLobbyUpdate(lobby_update:string):Observable<any>
  {
   return this.socket.fromEvent<any>(lobby_update);
  }
  onRouteToGame(ROUTE_GAMEPAGE:string):Observable<any>
  {
   return this.socket.fromEvent<any>(ROUTE_GAMEPAGE);
  }

  onGameState(GAME_STATE:string):Observable<any>
  {
    return this.socket.fromEvent<any>(GAME_STATE);
  }

  joinRoom(room_Id:string)
  {
    this.socket.emit('JOIN_ROOM',{room_id:room_Id});
  }

  createRoom(room_Name:string,max_Players:number)
  { console.log("req send from")
    this.socket.emit('CREATE_ROOM',{room_name:room_Name,max_size:max_Players});
  }

  startGame()
  {
    this.socket.emit('START_GAME',{});
  }

  disconnect()
  {
    this.socket.disconnect();
  }

  submitCard(card:any)
  {
    this.socket.emit('submitToDiscardedPile',card);
  }

  drawCard()
  {
    this.socket.emit('getFromDrawnPile',{});
  }
  

  timeExceed()
  {
    this.socket.emit('time_exceeded');
  }
  //when user route to /game page game state should be shared


 onChallenge()
 {
  this.socket.emit("challenge_player");
 }

 onUno()
 {
  this.socket.emit("Uno_said");
 }

  gameInit()
  {
    this.socket.emit("GAME_INIT",{});
  }

  submitColor(color:string)
  {
    this.socket.emit('CHANGE_CONTEXT_COLOR',{color:color});
  }

  
}