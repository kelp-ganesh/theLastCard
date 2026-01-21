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
import type { JOIN_ROOM ,CREATE_ROOM,START_GAME,GAME_STATE,opponent, COLORS} from "interfaces";
import { AuthGuard ,} from '@nestjs/passport';
import { PlayerModel } from 'database';
import { InjectModel } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';


@WebSocketGateway(3002,{
  cors: {
    origin: '*',
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
      private configService:ConfigService)
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
  async handleConnection(client: any, ...args: any[]) {
       try {

      const token = client.handshake.auth?.token;
    //  console.log("token received at socket connection:",token);
      const payload = this.jwt.verify(token);
      client.user = payload;
      const playerInfo= await this.playerModel.findOne({where: {email:client.user.email}});
      //console.log("PlayerInfo: "+playerInfo?.dataValues);
      console.log("playerINfo values" + playerInfo?.dataValues.name+ "  "+ playerInfo?.dataValues.avatarId)
     // console.log("user with id "+client.id+typeof(client.id)+" connected" + " and user info:",payload);

      // const existing_user=this.activeUsers.find((p)=> p.Userid == client.user.userId && p.gameId !='');
      // console.log("info of existing user: "+existing_user?.Username+" "+client?.id)
      // const gameState:GAME_STATE[]=this.getGameState(existing_user!.socketId);
      //   const userGameState:GAME_STATE|undefined=gameState.find((g)=>g.playerName == existing_user?.Username)
      //   console.log("game to reconnet found: ",userGameState?.roomName);
      // if(existing_user && userGameState)
      // { console.log("first");
      //   existing_user.socketId=client?.id;
      //   console.log("updating sokcet id of exisiting user",existing_user.Username);
      //   this.server.to(existing_user.socketId).emit("GAME_STATE", {state:userGameState})

      // }
      // else
      // {
      // const player:Player=new Player(client.user.userId,playerInfo!.dataValues.name,client.id,playerInfo!.dataValues.avatarId);
      // this.activeUsers.push(player);
      // //console.log("new Player with "+ client.user.name + "is added");
      // // for(let i=0;i<this.activeUsers.length;i++)
      // // {
      // //   console.log("active user "+" :"+this.activeUsers[i]!.Username+" User Id: "+this.activeUsers[i]!.avatarId);
      // // }
      // client.emit('lobby_update', { lobby: this.Lobby,player:player });
      // //console.log("from handleconnection"+ player.Username)
      // }
      const player:Player=new Player(client.user.userId,playerInfo!.dataValues.name,client.id,playerInfo!.dataValues.avatarId);
      this.activeUsers.push(player);
      //console.log("new Player with "+ client.user.name + "is added");
      // for(let i=0;i<this.activeUsers.length;i++)
      // {
      //   console.log("active user "+" :"+this.activeUsers[i]!.Username+" User Id: "+this.activeUsers[i]!.avatarId);
      // }
      client.emit('lobby_update', { lobby: this.Lobby,player:player });
      //console.log("from handleconnection"+ player.Username)









      
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: any) {
    console.log("user with id "+client.id+" is left");
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
    {   console.log("Room creation request received:", data);
       
       const player = this.finduser(client.id);
       console.log("Player found:", player);
       
       if(player)
      { player.gameId = client.id;
        const waiting_room = new Waiting(client.id, data.room_name, player, data.max_size);
        
        this.Lobby.push(waiting_room);
        client.emit('room_created', { room_id: waiting_room.id });
        this.server.emit('lobby_update', { lobby: this.Lobby });
        console.log("New room created:", waiting_room);
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
      { console.log("lobby with id "+lobby.name+" is closed");
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
    ){ console.log("backend called")
       const player=this.finduser(client.id);
       //console.log("player in lobby init"+player)
       if(player)
       { //console.log("player info in backend",player)
       client.emit('lobby_update', { lobby: this.Lobby,player:player });
       }
      }
    

  
    @SubscribeMessage('submitToDiscardedPile')
    onSubmitToDiscardedPile(
      @MessageBody() data:SUBMIT_CARD,
      @ConnectedSocket() client:Socket
    ){ console.log("submit card request received from client "+client.id+" with card "+data.card);
     const player=this.finduser(client.id);
     if(player)
     {
       const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
      if(game)
      { console.log("before the func call ")
          game.submitToDiscarded(data.card,player);
         const gameState:GAME_STATE[]=this.getGameState(client.id);
 
           
            console.log("game found"+game!.id);
            const sockets=this.sendToGame(game!.id,this.Games);
          
            sockets.forEach((value,index)=>{
              this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
              //console.log("getting to player "+index+" "+gameState[index].direction,gameState[index].isMyturn,gameState[index].activeContext,gameState[index].topCard,gameState[index].myCards)
      
            });
     }
    }
  }

    @SubscribeMessage('getFromDrawnPile')
    ongetFromDrawnPile(
      @MessageBody() data:DRAW_CARD,
      @ConnectedSocket() client:Socket
    ){
      console.log("draw card request received from client "+client.id);
      const player=this.finduser(client.id);
      if(player)
      {
         const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
        if(game)
        {
          const state=game.getFromDrawPile(player);
           const gameState:GAME_STATE[]=this.getGameState(client.id);
           
           console.log("req is ongoing of get from")
            const sockets=this.sendToGame(game!.id,this.Games);
          
            sockets.forEach((value,index)=>{
              this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
              //console.log("getting to player "+index+" "+gameState[index].direction,gameState[index].isMyturn,gameState[index].activeContext,gameState[index].topCard,gameState[index].myCards)
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
              //console.log("getting to player "+index+" "+gameState[index].direction,gameState[index].isMyturn,gameState[index].activeContext,gameState[index].topCard,gameState[index].myCards)
      
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
           
            console.log("game found for skipping turn "+game!.id);
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
           
            console.log("game found for skipping turn "+game!.id);
            const sockets=this.sendToGame(game!.id,this.Games);
          
            sockets.forEach((value,index)=>{
              this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
              //console.log("getting to player "+index+" "+gameState[index].direction,gameState[index].isMyturn,gameState[index].activeContext,gameState[index].topCard,gameState[index].myCards)
      
            });
     
        }
      }
    }

    //sending game state after game init
    @SubscribeMessage('GAME_INIT')
    onGameInit(@MessageBody() data:{},
      @ConnectedSocket() client:Socket
    ){   
      console.log("game init backend called");
      const gameState:GAME_STATE[]=this.getGameState(client.id);
      const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
      console.log("game found"+game!.id);
      const sockets=this.sendToGame(game!.id,this.Games);
    
      sockets.forEach((value,index)=>{
        this.server.to(value).emit("GAME_STATE", {state:gameState[index]})
        console.log("getting to player "+index+" "+gameState[index].direction,gameState[index].isMyturn,gameState[index].activeContext,gameState[index].topCard,gameState[index].myCards)
      });


    }
  
    @SubscribeMessage('CHANGE_CONTEXT_COLOR')
    onChangeContextColor(
      @MessageBody() data:{color:COLORS},
      @ConnectedSocket() client:Socket
    ){
      console.log("change context color request received from client "+client.id+" with color "+data.color);
      const player=this.finduser(client.id);
      if(player)
      {
        const game=this.Games.find((game)=>game.players.some((player)=>player.socketId==client.id));
       if(game)
       {
         const state=game.changeActiveContext(data.color,player);
          const gameState:GAME_STATE[]=this.getGameState(client.id);
            
             console.log("game found"+game!.id);
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
            console.log("sending leaderboard state"+game!.id);
            

            client.emit("GAME_RESULT", {state:game,playerId:player.Userid});


            this.Games.filter((g)=>g.id == game.id);
          
            // sockets.forEach((value)=>{
            //   this.server.to(value).emit("GAME_STATE", {state:game.players})
            // });
     
        }
      }
 // how to stop page to refresh so game connected via websocket wont get disconnect temp sol

    
               
}
}


