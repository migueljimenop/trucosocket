var _ = require('lodash');
var playerModel = require("./player");
var roundModel = require("./round");
var deckModel = require('./deck');
var cardModel = require('./card');
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deckModel = require("./deck");
var Deck  = deckModel.deck;
var Player = playerModel.player;
var Round  = roundModel.round;



var GameSchema = new Schema({
	player1:      Object,
	player2:      Object,
	currentHand:  String,
	currentTurn:  String,
	currentState: Object,
	currentRound: Object,
	score:        { type : Array , default : [0,0] },
	transitions: Object,
	usuario: Object,
	invitado: Object
});

var Game = mongoose.model('Game', GameSchema);

/*
 * Check if it's valid move and play in the current round
 */

Game.prototype.play = function(player, action, value){	
	/*
	if(value == '' && action == 'playcard')
		throw new Error("[ERROR] INVALID PLAY...");*/
//
/*
console.log("=======en el modelo===========");
console.log("el player en game es: "+player);
console.log("el action en game es: "+action);
console.log("el value en game es: "+value);
console.log("el ct en game es: "+this.currentRound.currentTurn);
console.log("el auxwin en game es: "+this.currentRound.auxWin);
//console.log("el this.currentRound en game es: "+JSON.stringify(this.currentRound));
console.log("==========================");*/

//	
	
	if(this.currentRound.currentTurn !== player  || (this.currentRound.currentTurn == player && this.currentRound.auxWin==true))   
		throw new Error("[ERROR] INVALID TURN...");
	
	if(this.currentRound.fsm.cannot(action))
		throw new Error("[ERROR] INVALID MOVE...");	

	return this.currentRound.play(this,player,action, value);
};

Game.prototype.newRound = function(state){
	var round = new Round(this, this.currentHand);
	round.fsm=round.newTrucoFSM(state);
	return round;
}

Game.prototype.deal = function(){

  var deck = new Deck().mix();
  this.player1.cards = (_.pullAt(deck, 0, 2, 4));
  this.player2.cards = (_.pullAt(deck, 1, 3, 5));

	var j1 = new Player({
	    playerid : this.player1.playerid,
	    nickname : this.player1.nickname,
	    cards: this.player1.cards,
	    envidoPoints: 0
	});    

	var j2 = new Player({
	    playerid : this.player2.playerid,
	    nickname : this.player2.nickname,
	    cards: this.player2.cards,
	    envidoPoints: 0
	});  
	 
	 j1.__proto__ = Player.prototype;
	 j2.__proto__ = Player.prototype;

	 j1.setCards(this.player1.cards);
	 j2.setCards(this.player2.cards);

	 this.player1.envidoPoints = j1.envidoPoints;
	 this.player2.envidoPoints = j2.envidoPoints;


}

Game.prototype.setPoints = function(){ 
  this.score[0] += this.currentRound.score[0];
  this.score[1] += this.currentRound.score[1];
}

Game.prototype.switchPlayer=function() {

	  if(this.currentRound.player1==this.currentTurn){
          this.currentTurn = this.currentRound.player2;
        }else{
          this.currentTurn = this.currentRound.player1;
        }
};

//module.exports = mongoose.model('Game', GameSchema);
module.exports.game = Game;