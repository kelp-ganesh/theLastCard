import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { RouterLink ,Router} from '@angular/router';
import { GameSocket } from '../../services/socket-client/game-socket';
import { MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";
import { Subscription } from 'rxjs';

interface Room {
  id: string;
  name: string;
  host: string;
  hostAvatar: string;
  players: number;
  maxPlayers: number;
  status: 'WAITING' | 'PLAYING';
  isPrivate: boolean;
}

@Component({
  selector: 'app-lobby',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink,Toast,ReactiveFormsModule],
  templateUrl: './lobby.html',
  styleUrls: [] // Reusing common animations
})
export class LobbyComponent {
    private routerLink=inject(Router);
     private messageService=inject(MessageService);
     private lobbySub!: Subscription;
     private routeSub!:Subscription;
     private roomCreatedSub!: Subscription;

  constructor
  ( private sokcetService:GameSocket ) {}
  
  
 
  
  ngOnInit() {
      const connect=this.sokcetService.connect();
      
      if(!connect)
      { 
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Auth Failed' });
        setTimeout(() => {
             this.routerLink.navigate(['/signup']);
            }, 1500);
      }
    
      this.sokcetService.lobbyInit(); 
      this.lobbySub = this.sokcetService.onLobbyUpdate('lobby_update')
      .subscribe({
        next: (data) => {
         
          const player=data.player;
          if(player)
          {
            this.joinedLobby.set(player.isReady);
            this.username.set(player.Username);
            this.avatarId.set(player.avatarId);
          }
          const lobby:Room[]=[];
          for(let i=0;i<data.lobby.length;i++)
          { const res=data.lobby[i];
            const lb:Room={
              id:res.id,
              name:res.name,
              host:res.id,
              players:res.players.length,
              maxPlayers:res.max_size,
              status:'WAITING',
              isPrivate:false,
              hostAvatar:""

            }
            lobby.push(lb);
          }
          this.rooms.set(lobby);
        },
        error: (err) => console.error('Socket error:', err)
      });

      this.routeSub=this.sokcetService.onRouteToGame('ROUTE_GAMEPAGE').subscribe({
        next:(data)=>
        {
          this.routerLink.navigate(['/game']);
        },
        error:(err)=>
        {
          console.log(" err in res of route to gamepage")
        }
      })
  }
  
  showCreateModal = signal(false);
  searchQuery = signal('');
  joinedLobby=signal('');
  username=signal("user")
  avatarId=signal('1');

  rooms = signal<Room[]>([]);


  toggleModal() {
    this.showCreateModal.update(v => !v);
  }

  onLogout() {
    
    localStorage.removeItem('authToken');
    this.routerLink.navigate(['/']);
    this.sokcetService.disconnect();
   
  }

  createRoom(name: string, max: string, isPrivate: boolean) {
     this.sokcetService.createRoom(name,+max);
    this.joinedLobby.set('admin')
    this.toggleModal();
    
  }

  joinRoom(id: string) {
    
    this.sokcetService.joinRoom(id);
    this.joinedLobby.set(id);
     
  }
}