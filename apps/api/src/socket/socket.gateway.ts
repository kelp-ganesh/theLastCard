import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import {UnoGame,Player,Waiting} from 'game-logic'
import type { SUBMIT_CARD ,DRAW_CARD} from "game-logic";
import type { JOIN_ROOM ,CREATE_ROOM,START_GAME,GAME_STATE,opponent, COLORS,CHANGE_CONTEXT_COLOR} from "interfaces";
import { AuthGuard ,} from '@nestjs/passport';
import { PlayerModel } from 'database';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';


interface IAuthenticatedSocket extends Socket {
   user: {
      userId: string;
      email: string;
    };
   
}


@WebSocketGateway(3002,{
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})


export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect{
  
  @WebSocketServer() server: Server;
  activeUsers:Player[]=[];
  Games:UnoGame[]=[];
  Lobby:Waiting[]=[];

  constructor( @InjectModel(PlayerModel)
      private playerModel: typeof PlayerModel, 
      private jwt: JwtService,
      public configService:ConfigService)
     {
       
     }

 
  
  getGameState(client:string):GAME_STATE[]
  {
    const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client));

    const res:GAME_STATE[]=[];
    const opponents:opponent[]=[]
    game?.players.forEach((player,index)=>{
    
     const opponent:opponent={
        id:player.Userid,
        name:player.Username,
        cardCount:player.Hand.length,
        avatarUrl:player.avatarId,
        isTurn:game.currentPlayerIndex==index,
        isUnoSaid:player.isUnoSaid
        
     }

     opponents.push(opponent);
   })
   game?.players.forEach((player,index)=>{
     const rightSide=opponents.slice(index+1);
     const leftSide=opponents.slice(0,index);
     const local:GAME_STATE={
      direction:(game.direction == 1)?true:false,
      isMyturn:game.currentPlayerIndex==index,
      activeContext:game.activeContext,
      topCard:game.discardPile[0],
      myCards:player.Hand,
      allowchangeContextPlayerIndex:game.allowchangeContextPlayerIndex == index,
      chnageContextColors: game.allowchangeContextPlayerIndex != -1,
      opponents:[...rightSide,...leftSide],
      isUnoSaid:player.isUnoSaid,
      roomName:game.name,
      playerName:player.Username,
      avatarId:player.avatarId,
      isEnd:game.isEnd,
      
     }
      res.push(local)
   }
   
  )
   return res;
  }

  sendToGame(gameId:string,games:UnoGame[]):string[]
  {
    const game=games.find((game)=>game.id === gameId);
    const ans:string[]=[];
    if(game)
    {
      for(let i=0;i<game.players.length;i++)
      {
        ans.push(game.players[i].socketId);
      }
    }
    return ans;
    
  }
  finduser(socket:string)
  {
    return this.activeUsers.find((player)=> player.socketId === socket);
  }

  findlobby(id:string)
  {
    return this.Lobby.find((lobby)=>lobby.id===id);
  }

  findgame(id:string)
  {
    return this.Lobby.find((lobby)=>lobby.id===id);
  }
  
  //socket auth logic
  async handleConnection(client: IAuthenticatedSocket) {
       try {

      const token = client.handshake.auth?.token;
    
      const payload = this.jwt.verify(token);
      client.user = payload;
      const playerInfo= await this.playerModel.findOne({where: {email:client.user.email}});
      const player:Player=new Player(client.user.userId,playerInfo!.dataValues.name,client.id,playerInfo!.dataValues.avatarId);
      this.activeUsers.push(player);
      client.emit('lobby_update', { lobby: this.Lobby,player:player });
      
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: IAuthenticatedSocket) {
    
    this.activeUsers=this.activeUsers.filter((player)=> player.socketId !== client.id);
  }


  // health check 
  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() data: any,
    @ConnectedSocket() client: Socket,
  ) {
    
    client.emit('message', {
      text: 'Hello from server',
      received: data,
    });
  }
  
  //Updates should send to all user 
  @SubscribeMessage('CREATE_ROOM')
  onCreateRoom(
    @MessageBody() data: CREATE_ROOM,
    @ConnectedSocket() client: Socket,)
    {    
       
       const player = this.finduser(client.id);
       
       
       if(player)
      { player.gameId = client.id;
        const waiting_room = new Waiting(client.id, data.room_name, player, data.max_size);
        
        this.Lobby.push(waiting_room);
        client.emit('room_created', { room_id: waiting_room.id });
        this.server.emit('lobby_update', { lobby: this.Lobby });
         
      } else {
        console.log("Player not found for socket:", client.id);
      }
    }
    
    //Updates should send to all uses
    @SubscribeMessage('JOIN_ROOM')
    onJoinRoom(
      @MessageBody() data:JOIN_ROOM,
      @ConnectedSocket() client:Socket
    )
    { 
      const lobby=this.findlobby(data.room_id);
      const player=this.finduser(client.id);
      if(player)
      {
      player.gameId=data.room_id;
      lobby?.players.push(player);
      this.server.emit('lobby_update', { lobby: this.Lobby,player:player });
      if(lobby && lobby?.max_size===lobby?.players.length)
      {  
        this.Lobby=this.Lobby.filter((lb)=> lb.id!=lobby.id);
        const game=new UnoGame(lobby.players,lobby.name);
        this.Games.push(game);
        const sockets=this.sendToGame(game.id,this.Games);
        sockets.forEach((socket)=>this.server.to(socket).emit("ROUTE_GAMEPAGE", {msg: "route to game page"}))
        //Update should send to all users
        //lobby should close
        
      }
       
      }
    }
    
    //Update should send to all users
    @SubscribeMessage('LOBBY_INIT')
    onLobbyInit(
      @MessageBody() data:START_GAME,
      @ConnectedSocket() client:Socket
    ){  
       const player=this.finduser(client.id);
      
       if(player)
       { 
       client.emit('lobby_update', { lobby: this.Lobby,player:player });
       }
      }
    

  
    @SubscribeMessage('submitToDiscardedPile')
    onSubmitToDiscardedPile(
      @MessageBody() data:SUBMIT_CARD,
      @ConnectedSocket() client:Socket
    ){  
     const player=this.finduser(client.id);
     if(player)
     {
       const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
      if(game)
      {  
          game.submitToDiscarded(data.card,player);
         const gameState:GAME_STATE[]=this.getGameState(client.id);
 
           
           
            const sockets=this.sendToGame(game!.id,this.Games);
          
            sockets.forEach((value,index)=>{
              this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
               
            });
     }
    }
  }

    @SubscribeMessage('getFromDrawnPile')
    ongetFromDrawnPile(
      @MessageBody() data:DRAW_CARD,
      @ConnectedSocket() client:Socket
    ){
       
      const player=this.finduser(client.id);
      if(player)
      {
         const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
        if(game)
        {
          const state=game.getFromDrawPile(player);
           const gameState:GAME_STATE[]=this.getGameState(client.id);
           
          
            const sockets=this.sendToGame(game!.id,this.Games);
          
            sockets.forEach((value,index)=>{
              this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
             });
        }
      }
    }


    @SubscribeMessage('time_exceeded')
    onTimeExceeded(
      @ConnectedSocket() client:Socket
    ){

      const player=this.finduser(client.id);
      if(player)
      {
        const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
        if(game)
        {
          const state=game.timeExceeded();
          const gameState:GAME_STATE[]=this.getGameState(client.id);
           
            console.log("game found for skipping turn "+game!.id);
            const sockets=this.sendToGame(game!.id,this.Games);
          
            sockets.forEach((value,index)=>{
              this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
       
            });
     
        }
      }
    }

    //game end
    @SubscribeMessage('end_game')
    onEndGame(
      @ConnectedSocket() client:Socket
    ){
        const game=this.Games.find((g)=>g.id===client.id);
        if(game)
        {
          this.Games=this.Games.filter((g)=>g.id!==game.id);
        }

    }

     @SubscribeMessage('challenge_player')
    onChallenge(
      @ConnectedSocket() client:Socket
    ){

      const player=this.finduser(client.id);
      if(player)
      {
        const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
        if(game)
        {
          const state=game.onChallenge();
          const gameState:GAME_STATE[]=this.getGameState(client.id);
           
            
            const sockets=this.sendToGame(game!.id,this.Games);
          
            sockets.forEach((value,index)=>{
              this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
              //console.log("getting to player "+index+" "+gameState[index].direction,gameState[index].isMyturn,gameState[index].activeContext,gameState[index].topCard,gameState[index].myCards)
      
            });
     
        }
      }
    }

 @SubscribeMessage('Uno_said')
    onUno(
      @ConnectedSocket() client:Socket
    ){

      const player=this.finduser(client.id);
      if(player)
      {
        const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
        if(game)
        {
          const state=game.onUno(player);
          const gameState:GAME_STATE[]=this.getGameState(client.id);
           
           
            const sockets=this.sendToGame(game!.id,this.Games);
          
            sockets.forEach((value,index)=>{
              this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
              //console.log("getting to player "+index+" "+gameState[index].direction,gameState[index].isMyturn,gameState[index].activeContext,gameState[index].topCard,gameState[index].myCards)
      
            }
          );
     
        }
      }
    }

    //sending game state after game init
    @SubscribeMessage('GAME_INIT')
    onGameInit(
      @ConnectedSocket() client:Socket
    ){   
       
      const gameState:GAME_STATE[]=this.getGameState(client.id);
      const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
      const sockets=this.sendToGame(game!.id,this.Games);
      sockets.forEach((value,index)=>{
        this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
        
      });


    }
  
    @SubscribeMessage('CHANGE_CONTEXT_COLOR')
    onChangeContextColor(
      @MessageBody() data:CHANGE_CONTEXT_COLOR,
      @ConnectedSocket() client:Socket
    ){
       
      const player=this.finduser(client.id);
      if(player)
      {
        const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
       if(game)
       {
         const state=game.changeActiveContext(data.color,player);
          const gameState:GAME_STATE[]=this.getGameState(client.id);
            
             
             const sockets=this.sendToGame(game!.id,this.Games);
           
             sockets.forEach((value,index)=>{
                const stateState=
                {
                  ...gameState[index],
                  chnageContextColors:false,
                  allowchangeContextPlayerIndex:false,
                  topCard:{
                    ...gameState[index].topCard,
                    color:data.color
                  }
                }
               this.server.to(value).emit("GAME_STATE", {state:stateState})
             })};}
            }

    
     @SubscribeMessage('GET_LEADERBOARD_DATA')
    onGameEnd(
      @ConnectedSocket() client:Socket
    ){

      const player=this.finduser(client.id);
      if(player)
      {
        const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
        if(game && game.isEnd)
        {
             
            client.emit("GAME_RESULT", {state:game,playerId:player.Userid});
            this.Games.filter((g)=>g.id == game.id);
        }
      }
 

    
               
}
}


