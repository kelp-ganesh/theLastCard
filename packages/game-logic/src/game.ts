import type { COLORS } from "interfaces";
import { Card } from "./card.js";
import { Deck } from "./deck.js";
import { Player } from "./player.js";
import { isImportEqualsDeclaration } from "typescript";

export class UnoGame {
  name:string
   id:string;
  players: Player[] = [];
  drawPile: Card[] = [];
  discardPile: Card[] = [];
  // from which the player teh game starts
  currentPlayerIndex: number = 0;
  direction: 1 | -1 = 1;
  activeContext: COLORS = 'RED';
  pendingAction: { Type: "drawTwo" | "none" | "skip"; count: number };

  //drawn card in the turn which should be equed to false after each turn
    cardDrawn:boolean=false;
    drawnCard:Card|undefined;

    allowchangeContextPlayerIndex:number=-1;





    constructor(players:Player[],name:string)
    {   
        //in future should be replaced by extenal lib that creates random numbers
        this.id=players[0]!.Userid;
        this.players=players;
        this.direction=1;
        this.pendingAction={Type:"none",count:0};
        this.name=name;

         //deck init
          const deck=new Deck();
          const cards=deck.shuffle();


          for(let i=0;i<players.length;i++)
          {
            players[i]!.Hand=cards.slice(7*i,7*(i+1));
           // console.log("dealt cards to player "+i+" :",players[i]!.Hand);
            players[i]!.index=i;
          }

          let lastCardIndex:number=players.length*7;
          //this.activeContext=cards[lastCardIndex]?.color;

          this.discardPile.push(cards[lastCardIndex]!);
          this.activeContext=this.discardPile[0]!.color;
          this.drawPile=cards.slice(lastCardIndex+1,cards.length);

          //this.show();

    }

    show()
    {
        console.log("discard pile",this.discardPile);
        console.log("draw pile",this.drawPile);
        for(let i=0;i<this.players.length;i++)
        {
            console.log("player "+i+" hand:",this.players[i]!.Hand);
        }

    }

    timeExceeded()
    {  this.cardDrawn=true;
       if(this.pendingAction.Type === "drawTwo")
              {
                for(let i=0;i<this.pendingAction.count;i++)
                {
                  this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
                }
              }
        this.pendingAction={Type:"none",count:0};
      this.currentPlayerIndex=(((this.currentPlayerIndex+this.direction)%this.players.length)+this.players.length)%this.players.length;
      return {
        players:this.players,
        currentPlayerIndex:this.currentPlayerIndex,
        direction:this.direction,
        drawPile:this.drawPile,
        discardPile:this.discardPile,
        activeContext:this.activeContext,
        pendingAction:this.pendingAction
      }
    }

    isValidMatch(card1:Card,card2:Card)
    { 
      if( (this.pendingAction.Type==='drawTwo' && card1.value==='draw-two') ||  card1.color === this.activeContext || card1.value === card2.value || card1.color === 'WILD')
      {
        return true;
      }
      else
      {
        return false;
      }
    }

    getFromDrawPile(player:Player)
    {
      if(player.index === this.currentPlayerIndex && !this.cardDrawn )
      {
        const card= this.drawPile.pop();
        console.log("poped card:",card);
        player.Hand.push(card!);
        this.drawnCard=card;
        this.cardDrawn=true;
        //this.discardPile.unshift(card!);

        

       
      }
      else
      {
        return "Not Valid Move";
      }
    }
    
    cardSubmitted(card:Card)
    { this.cardDrawn=true;
        if(card.value === "skip")
        {
          //currentINdex+=2;
            this.currentPlayerIndex=(((this.currentPlayerIndex+(this.direction*2))%this.players.length)+this.players.length)%this.players.length;
          this.discardPile.unshift(card);
          return "skip";
        }
        else if(card.value === "reverse" )
        {
           //dir=dir*-1;
            this.direction=this.direction*-1 as 1 | -1;
            this.currentPlayerIndex=(((this.currentPlayerIndex+this.direction)%this.players.length)+this.players.length)%this.players.length;
            this.discardPile.unshift(card);
            return "reverse";
        }
        else if(card.value === "draw-two" )
        {
          this.pendingAction={Type:"drawTwo",count:2};
            this.currentPlayerIndex=(((this.currentPlayerIndex+this.direction)%this.players.length)+this.players.length)%this.players.length;
          this.discardPile.unshift(card);

          return "draw-two";
        }
        else if(card.value === "wild" )
        {
          //set active context to chosen color
          this.discardPile.unshift(card);
          this.pendingAction={Type:"none",count:0};
          this.allowchangeContextPlayerIndex=this.currentPlayerIndex;
          //this.currentPlayerIndex=(this.currentPlayerIndex+1*this.direction)%this.players.length;
          return "wild";
        }
        else if(card.value=== "wild-draw-four")
        {
          //set active context to chosen color
          this.allowchangeContextPlayerIndex=this.currentPlayerIndex;
          this.discardPile.unshift(card);
          this.pendingAction={Type:"drawTwo",count:4};

          // this.currentPlayerIndex=(this.currentPlayerIndex+1*this.direction)%this.players.length;
          // this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
          // this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
          // this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
          // this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
          // this.currentPlayerIndex=(this.currentPlayerIndex+1*this.direction)%this.players.length;
         
          return "wild-draw-four";
        }
        // else
        // {
        //   console.log("Normal Card");
        // }
    }

    changeActiveContext(color:COLORS ,player:Player)
    {
      if(player.index === this.currentPlayerIndex && this.discardPile[0]!.value === "wild" || this.discardPile[0]!.value === "wild-draw-four")
      {
        this.activeContext=color;
         this.allowchangeContextPlayerIndex=-1;
      }
      if(this.pendingAction.Type == "none")
      { 
        this.currentPlayerIndex=(this.currentPlayerIndex+1*this.direction)%this.players.length;
       
       
        
      }
      if(this.pendingAction.Type === "drawTwo")
      {   
           
          this.currentPlayerIndex=(((this.currentPlayerIndex+this.direction)%this.players.length)+this.players.length)%this.players.length;

          this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
          this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
          this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
          this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
          this.currentPlayerIndex=(((this.currentPlayerIndex+this.direction)%this.players.length)+this.players.length)%this.players.length;

      }

    }


    submitToDiscarded(card:Card,player:Player)
    { //console.log("hey i am in staring of submittodiscarded pile 1")
      if(player.index === this.currentPlayerIndex)
      { // console.log("2")
        if(this.cardDrawn && card===this.drawnCard || !this.cardDrawn)
        {//console.log("3")
            
            if(this.isValidMatch(card,this.discardPile[0]!))
            
            {   //console.log("4")
              
            //  const c=player.Hand.splice(player.Hand.indexOf(card),1);
            //  console.log("index of removed card: ",player.Hand.indexOf(card));
            //  console.log("removed card: ",c[0]?.id);

              player.Hand=player.Hand.filter((c)=>c.id !=card.id );
              console.log(player.Hand);
              // player.Hand.filter((c)=>c.id!=card.id);
              if(card.value !=="skip" && card.value !=="reverse" && card.value !=="draw-two" && card.value !=="wild" && card.value !=="wild-draw-four")
              {
                this.activeContext=card.color;
                this.discardPile.unshift(card);
                this.cardDrawn=false;
                this.drawnCard=undefined;
                           this.currentPlayerIndex=(((this.currentPlayerIndex+this.direction)%this.players.length)+this.players.length)%this.players.length;

                return {
                  players:this.players,
                  currentPlayerIndex:this.currentPlayerIndex,
                  direction:this.direction,
                  drawPile:this.drawPile,
                  discardPile:this.discardPile,
                  activeContext:this.activeContext,
                  pendingAction:this.pendingAction,
                  allowchangeContextPlayerIndex:this.allowchangeContextPlayerIndex
                }
              }
              else
              {
                const result=this.cardSubmitted(card);
                return {
                  players:this.players,
                  currentPlayerIndex:this.currentPlayerIndex,
                  direction:this.direction,
                  drawPile:this.drawPile,
                  discardPile:this.discardPile,
                  activeContext:this.activeContext,
                  pendingAction:this.pendingAction,
                  allowchangeContextPlayerIndex:this.allowchangeContextPlayerIndex
                }


              }
             // this.discardPile.unshift(card);
            }
            if(this.pendingAction.Type !== "none")
            {  
              if(this.pendingAction.Type === "drawTwo")
              {
                for(let i=0;i<this.pendingAction.count;i++)
                {
                  this.players[this.currentPlayerIndex]!.Hand.push(this.drawPile.pop()!);
                }
              }
              this.pendingAction={Type:"none",count:0};
              this.currentPlayerIndex=(this.currentPlayerIndex+1*this.direction)%this.players.length;
              return {
                players:this.players,
                currentPlayerIndex:this.currentPlayerIndex,
                direction:this.direction,
                drawPile:this.drawPile,
                discardPile:this.discardPile,
                activeContext:this.activeContext,
                pendingAction:this.pendingAction,
                allowchangeContextPlayerIndex:this.allowchangeContextPlayerIndex
              }
            }

            //check for pending action
            //upadate currentIndex
          }
          else
          {
            return "Not Valid Move";
          }
        }
        
      }


      onChallenge()
      {
        this.players.forEach((player)=>
        {
          if(player.Hand.length == 1 && !player.isUnoSaid)
          {
             let card= this.drawPile.pop();
              console.log("poped for pently card:",card);
              player.Hand.push(card!);
              card= this.drawPile.pop();
              console.log("poped for pently card:",card);
              player.Hand.push(card!);
              
          }
        })
      }

      onUno(player:Player)
      {
        if(player.index == this.direction && player.Hand.length ==1 && !player.isUnoSaid)
        {
          player.isUnoSaid=true;
        }
      }
    }






 