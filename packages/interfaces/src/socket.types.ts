import type constTypes = require("./const.types")

export type JOIN_ROOM ={
    
    room_id:string
}
export type CREATE_ROOM=
{
     
    room_name:string,
    max_size:number,
}
export type  START_GAME={
    
}
//later imprort type from game-logic

export type opponent={
        id:string,
        name:string,
        cardCount:number,
        avatarUrl:string,
        isTurn:boolean,
        isUnoSaid:boolean
}
export type GAME_STATE={
    roomName:string,
    playerName:string,
    direction:boolean,
    isMyturn:boolean,
    activeContext:constTypes.COLORS,
    topCard:any,
    myCards:any,
    allowchangeContextPlayerIndex:boolean,
    opponents:opponent[],
    chnageContextColors:boolean,
    isUnoSaid:boolean,
    avatarId:string,
    isEnd:boolean
}


