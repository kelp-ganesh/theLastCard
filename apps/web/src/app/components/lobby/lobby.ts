import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule, RouterLink,Toast],
  templateUrl: './lobby.html',
  styleUrls: ['./lobby.scss'] // Reusing common animations
})
export class LobbyComponent {
    private routerLink=inject(Router);
     private messageService=inject(MessageService);
     private lobbySub!: Subscription;
     private routeSub!:Subscription;
     private roomCreatedSub!: Subscription;

  constructor
  ( private sokcetService:GameSocket ) {}
  
  // User Info (Mock)
  currentUser = {
    name: 'Jatin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jatin&backgroundColor=b6e3f4',
    level: 12,
    wins: 45
  };
  
  ngOnInit() {
      const connect=this.sokcetService.connect();
      if(!connect)
      { 
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Auth Failed' });
        setTimeout(() => {
             this.routerLink.navigate(['/signup']);
            }, 1500);
      }
      console.log("socket Connected");
      this.sokcetService.lobbyInit(); 
     //console.log("joined lobby:  "+this.joinedLobby())

    

      // Listen for room creation response
      // this.roomCreatedSub = this.sokcetService.onRoomCreated().subscribe({
      //   next: (data) => {
      //     console.log('Room created successfully:', data);
      //     this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Room created!' });
      //   },
      //   error: (err) => console.error('Room creation error:', err)
      // });

      this.lobbySub = this.sokcetService.onLobbyUpdate('lobby_update')
      .subscribe({
        next: (data) => {
          console.log('Lobby update received:', data.lobby);
          console.log("player info in loby state: ",data.player);
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
  // UI State
  showCreateModal = signal(false);
  searchQuery = signal('');
  joinedLobby=signal('');
  username=signal("user")
  avatarId=signal('');

  // Mock Data: Active Rooms
  rooms = signal<Room[]>([
    // { id: '1', name: "Friday Night Uno!", host: 'Alex', hostAvatar: 'p1', players: 3, maxPlayers: 5, status: 'WAITING', isPrivate: false },
    // { id: '2', name: "Pro Players Only", host: 'Sarah', hostAvatar: 'p2', players: 4, maxPlayers: 4, status: 'PLAYING', isPrivate: false },
    // { id: '3', name: "Jatin's Lounge", host: 'Jatin', hostAvatar: 'Jatin', players: 1, maxPlayers: 8, status: 'WAITING', isPrivate: true },
    // { id: '4', name: "Lunch Break Quickie", host: 'Mike', hostAvatar: 'p4', players: 2, maxPlayers: 2, status: 'WAITING', isPrivate: false },
    // { id: '5', name: "No Wilds Allowed", host: 'Priya', hostAvatar: 'p5', players: 5, maxPlayers: 6, status: 'PLAYING', isPrivate: false },
    // { id: '6', name: "Late Night Chill", host: 'Sam', hostAvatar: 'p6', players: 2, maxPlayers: 10, status: 'WAITING', isPrivate: false },
  ]);

  // Actions
  toggleModal() {
    this.showCreateModal.update(v => !v);
  }

  onLogout() {
    console.log('Logging out...');
    localStorage.removeItem('authToken');
    this.routerLink.navigate(['/']);
    this.sokcetService.disconnect();
   
  }

  createRoom(name: string, max: string, isPrivate: boolean) {
    console.log('Creating Room:', { name, max, isPrivate });
    this.sokcetService.createRoom(name,+max);
    this.joinedLobby.set('admin')
    this.toggleModal();
    
  }

  joinRoom(id: string) {
    console.log('Joining Room:', id);
    this.sokcetService.joinRoom(id);
    this.joinedLobby.set(id);
     
  }
}