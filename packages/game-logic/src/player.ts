import { Card } from "./card.js"

export class Player
{
    Userid:string
    Username:string
    socketId:string
    Hand:Card[]
    isUnoSaid:boolean
    isReady:boolean
    index:number
    gameId:string
    avatarId:string

    constructor(userid:string,username:string,socketId:string,avatarId:string)
    {
        this.Userid=userid
        this.index=0
        this.Username=username
        this.socketId=socketId
        this.Hand=[]
        this.isUnoSaid=false
        this.isReady=false
        this.gameId=""
        this.avatarId=avatarId
    }


}