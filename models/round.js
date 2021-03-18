var _ = require('lodash');
var StateMachine = require("../node_modules/javascript-state-machine/dist/state-machine.js");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var deckModel = require("./deck");
var cardModel = require("./card");
var playerModel = require("./player");
var Deck  = deckModel.deck;
var Card = cardModel.card;
var Player = playerModel.player;


var turnWin = [];  //lista con el ganador de cada turno
var tablep1 = [];  //cartas jugadas j1
var tablep2 = [];  //cartas jugadas j2


var flagNoCanto = false; //flagTruco para partidos sin cantar truco
var auxWin = false;//ganador del truco  

//Coleccion con todas las posibilidades de estados de envido.
var posiblesE=[
				{'p': "envido"},{'p': "envido-envido"},{'p': "real-envido"},{'p': "envido-real"},
				{'p': "envido-envido-real"},{'p': "falta-envido"},{'p': "envido-falta"},{'p': "envido-envido-falta"},
				{'p': "envido-envido-real-falta"},{'p': "real-envido-falta"},{'p': "envido-real-falta"}
		];

//Coleccion con todas las posibilidades de estados de truco.
var posiblesT=[{'t':"truco"},{'t':"retruco"},{'t':"valecuatro"}];


Round.prototype.newTrucoFSM=function(estadoInic){
	var initialState = estadoInic || 'init'; 

		//var fsm = StateMachine.create({
		var fsm = new StateMachine({
		initial: initialState,
		events: [

		{ name: 'playcard',           from: 'init',                           to: 'primer-carta' },
		{ name: 'envido',             from: ['init', 'primer-carta'],         to: 'envido' },
		{ name: 'envido-envido',      from: ['envido'],         to: 'envido-envido' },
		{ name: 'envido-real',        from: ['envido'],         to: 'envido-real' },
		{ name: 'envido-envido-real', from: ['envido-envido'],         to: 'envido-envido-real' },
		{ name: 'real-envido',        from: [ 'init','primer-carta'],         to: 'real-envido' },
		{ name: 'falta-envido',       from: ['init','primer-carta','envido','envido-envido', 
																					'real-envido','envido-envido-real','envido-real'],   to: 'falta-envido' },
		{ name: 'envido-falta',    from: ['envido'],         to: 'envido-falta' },
		{ name: 'envido-envido-falta',    from: ['envido-envido'],         to: 'envido-envido-falta' },
		{ name: 'envido-real-falta',    from: ['envido-real'],         to: 'envido-real-falta' },
		{ name: 'envido-envido-real-falta',    from: ['envido-envido-real'],         to: 'envido-envido-real-falta' },
		{ name: 'real-envido-falta',    from: [ 'real-envido'],         to: 'real-envido-falta' },  
		{ name: 'truco',     from: ['init', 'played-card',
																'playcard','primer-carta',
																'quiero','no-quiero'],           to: 'truco'  },
		{ name: 'retruco',   from: ['truco', 'quiero','playcard','played-card'],                    to: 'retruco'  },
		{ name: 'valecuatro',     from: ['retruco', 'quiero','playcard','played-card'],               to: 'valecuatro'  },
		{ name: 'playcard',  from: ['quiero', 'no-quiero',
																'primer-carta', 'played-card',
																'envido', 'truco', 'retruco','valecuatro'],                       to: 'played-card' },   
		{ name: 'quiero',    from: ['envido','envido-envido','envido-envido-real','envido-real',
																'real-envido','real-envido','falta-envido',
																'envido-falta','envido-envido-falta',
																'envido-real-falta','envido-envido-real-falta',
																'real-envido-falta', 'truco','retruco','valecuatro'],             to: 'quiero'  },
		{ name: 'no-quiero', from: ['envido','envido-envido','envido-envido-real','envido-real',
																'real-envido','real-envido','falta-envido',
																'envido-falta','envido-envido-falta',
																'envido-real-falta','envido-envido-real-falta',
																'real-envido-falta', 'truco','retruco','valecuatro'],             to: 'no-quiero' },
	]});
	return fsm;
}

function Round(game, turn){
	this.player1 = game.player1.nickname;  

	this.player2 = game.player2.nickname;

	this.currentHand = game.currentHand;

	this.currentTurn = game.currentTurn;
 
	this.fsm = this.newTrucoFSM(game.currentState);

	this.status = 'running';

	this.score = game.score;

	this.turnWin = [];

	this.tablep1 = [];

	this.tablep2 = [];

	this.flagTruco =  false;

	this.flagRetruco =  false;

	this.flagValeCuatro =  false;

	this.flagNoCanto=  false;

	this.auxWin = false;

	this.cartasp1 = game.player1.cards;

	this.cartasp2 = game.player2.cards;

	this.pointsEnvidoP1 = game.player1.envidoPoints;

	this.pointsEnvidoP2 = game.player2.envidoPoints;

	this.pardas = false; 

}
//Intercambia los jugadores.
Round.prototype.switchPlayer=function (player) {

	return this.player1 === player ? this.player2 : this.player1;
};
//Retorna el palo de la carta.
Round.prototype.returnSuit = function(value) {
	var s = _.last(_.split(value, '-'));
	return s;
}
Round.prototype.returnNumber = function(value){
	var n = _.head(_.split(value, '-'));
	return n; 
}
Round.prototype.returnValueComplete = function(value){
	return this.returnNumber(value).concat(this.returnSuit(value));
}
Round.prototype.actionCurrent = function (){
	return this.fsm.current;
}
//Obtiene la accion previa.
Round.prototype.actionPrevious = function (){
	var actionPrevious = this.fsm.current;
	return actionPrevious;
}

Round.prototype.distHamming = function(arr1,arr2){
	if (_.size(arr1) != _.size(arr2)){ return -1; }
	var counter = 0;
	for (var i = 0; i < _.size(arr1); i++){ if (arr1[i] != arr2[i]){ counter++; } }
	return counter;
}

//Metodo que confronta las cartas.
Round.prototype.confrontScore = function(tablep1,tablep2){  
	switch(_.size(this.turnWin)){
		case 0:
			if(this.tablep1[0]!=undefined && this.tablep2[0]!=undefined){
				var card1 = this.tablep1[0];
				card1.__proto__ = Card.prototype;
				var card2 = this.tablep2[0];
				card2.__proto__ = Card.prototype;
				var conf = card1.confront(card2);
				this.selectWin(conf);                  
			}
			break;
		case 1:
			if(this.tablep1[1]!=undefined && this.tablep2[1]!=undefined){
				var card1 = this.tablep1[1];
				card1.__proto__ = Card.prototype;
				var card2 = this.tablep2[1];
				card2.__proto__ = Card.prototype;
				var conf = card1.confront(card2);
				this.selectWin(conf);                  
			}
			break;
		case 2:
			if(this.tablep1[2]!=undefined && this.tablep2[2]!=undefined){
				var card1 = this.tablep1[2];
				card1.__proto__ = Card.prototype;
				var card2 = this.tablep2[2];
				card2.__proto__ = Card.prototype;
				var conf = card1.confront(card2);
				this.selectWin(conf);                  
			}
	}
	return this;
}

//Metodo que selecciona el ganador de cada mano.
Round.prototype.selectWin= function(conf){
	switch(conf){
		case -1:
			return this.turnWin.push(1);
			break;
		case 0:
			return this.turnWin.push(-1);
			break;
		case 1:
			return this.turnWin.push(0);
			break;
	} 
	return this;
}

//Metodo que cambia el turno corriente.
Round.prototype.changeTurn = function(){
	if((_.size(this.tablep1)!=_.size(this.tablep2))||(this.fsm.current == 'truco') || (this.fsm.current == 'retruco')|| (this.fsm.current == 'valecuatro')){
		 return this.currentTurn = this.switchPlayer(this.currentTurn);
		}
	if(_.size(this.turnWin)!=0){//el que gana sigue jugando

		switch(_.last(this.turnWin)){
			case 0:
				return this.currentTurn = this.player1;
				break;
			case 1:
				return this.currentTurn = this.player2;
				break;
			case -1:
				return this.currentTurn = this.currentHand;
				break;
		}
	}
	return this.currentTurn = this.switchPlayer(this.currentTurn);

}

//Calcula el puntaje de la ronda jugada.
Round.prototype.calculateScore = function(game,action,prev,value,player){
	//cuando se tira una carta
	if (((action == "played-card")||(action == "playcard"))&&(this.auxWin==false)){							
		this.setTable(value,player);//cargo la carta corespondiente al jugador
		//si puedo. confronto las cartas y cargo ganador del enfrentamiento
		this.confrontScore(tablep1,tablep2);
		//si se canto truco y tengo almenos 4 cartas en mesa busco ganador
		if((this.flagTruco==true) && (_.size(this.tablep1)>1) && (_.size(this.tablep2)>1)) { 
			 this.calculateScoreTruco(action,player); 
		} 
		//en el caso que no se canto nada le sumo uno al ganador
		if((this.flagTruco==false) &&  (this.flagNoCanto==false) && (_.size(this.tablep1)>1) && (_.size(this.tablep2)>1)) { 
			//console.log("no se canto nada");
			 var p1 = this.score[0]; 
			 var p2 = this.score[1]; 
			 this.calculateScoreTruco(action,player); 
		 } 
	}
	//cuando se canta envido
	if((action == "quiero" || action == "no-quiero")&&(_.find(posiblesE,'p',prev))!=undefined) {          
			console.log("player con el que entra en calculateScore: "+player);
			this.calculateScoreEnvido(action,prev,player);        
	}
	//cuando se canta truco
	if((action == "quiero" || action == "no-quiero") && prev == "truco"){  

		if(action == "quiero")    //si se acepta se activa la flagTruco
				this.flagTruco = true; 
		if((_.size(this.tablep1) <2)||(_.size(this.tablep2) <2)) //si hay 4  o mas cartas en la mesa
				this.calculateScoreTruco(action,player,value);    
	}
	//cuando se canta retruco
	if((action == "quiero" || action == "no-quiero" ) && prev == "retruco"){  
		this.flagRetruco = true; 
		//console.log("hola she truco");
		if((_.size(this.tablep1) <2)||(_.size(this.tablep2) <2)) //si hay 4  o mas cartas en la mesa
				this.calculateScoreTruco(action,player,value);
	}
	//cuando se canta valecuatro
	if((action == "quiero" || action == "no-quiero") && prev == "valecuatro"){  
		this.flagValeCuatro = true; 
		if((_.size(this.tablep1) <2)||(_.size(this.tablep2) <2)) //si hay 4  o mas cartas en la mesa
				this.calculateScoreTruco(action,player,value);
	}
	
	return this;
}     

//Metodo que calcula los puntos correspondientes a cada jugador despues de cantarse.
Round.prototype.calculateScoreEnvido = function(action,prev,player){
	console.log("player con el que entra en el calculateScoreEnvido: "+player);
	//el siguiente valor variara de acuerdo a si el juego es a 9/15/18/30
	var total=9;
	if (action == "quiero"){
		switch(prev) {
		case "envido":
				this.assignPoints(action,2,player);
				break;
		case "real-envido":
				this.assignPoints(action,3,player);
				break;
		case "envido-envido":
				this.assignPoints(action,4,player);
				break;
		case "envido-real":
			 this.assignPoints(action,5,player);
			 break;
		case "envido-envido-real":
			 this.assignPoints(action,7,player);
			 break;
		case "falta-envido":
				if(player==this.player1){this.assignPoints(action,total-(this.score[1]),player);}

					if(player==this.player2){this.assignPoints(action,total-(this.score[0]),player);}
				break;
		case "envido-falta":
				if(player==this.player1){this.assignPoints(action,total-(this.score[1]),player);}

					if(player==this.player2){this.assignPoints(action,total-(this.score[0]),player);}
				break;
		case "envido-real-falta":
				if(player==this.player1){this.assignPoints(action,total-(this.score[1]),player);}

					if(player==this.player2){this.assignPoints(action,total-(this.score[0]),player);}
				break;
		case "envido-envido-falta":
				if(player==this.player1){this.assignPoints(action,total-(this.score[1]),player);}

					if(player==this.player2){this.assignPoints(action,total-(this.score[0]),player);}
				break;
		case "envido-envido-real-falta":
				if(player==this.player1){this.assignPoints(action,total-(this.score[1]),player);}

					if(player==this.player2){this.assignPoints(action,total-(this.score[0]),player);}
				break;
		case "real-envido-falta":
				if(player==this.player1){this.assignPoints(action,total-(this.score[1]),player);}

					if(player==this.player2){this.assignPoints(action,total-(this.score[0]),player);}
				break;
		}

	}

	if (action == "no-quiero"){
		switch(prev) {
		case "envido":
			 this.assignPoints(action,1,player);
				break;
		case "real-envido":
				this.assignPoints(action,1,player);
				break;
		case "envido-envido":
				this.assignPoints(action,2,player);
				break;
		case "envido-real":
				this.assignPoints(action,2,player);
			 break;
		case "envido-envido-real":
				this.assignPoints(action,4,player);
			 break;
		case "falta-envido":
				this.assignPoints(action,1,player);
				break;
		case "envido-falta":
				this.assignPoints(action,2,player);
				break;
		case "envido-real-falta":
				this.assignPoints(action,5,player);
				break;
		case "envido-envido-falta":
				this.assignPoints(action,4,player);
				break;
		case "envido-envido-real-falta":
				this.assignPoints(action,7,player);
				break;
		case "real-envido-falta":
				this.assignPoints(action,3,player);
				break;
	}
	}
}

//Metodo que asigna puntos del resultado de la confrontacion del envido.
Round.prototype.assignPoints =function(action,num,player){
	if(action=="quiero"){
		if (this.pointsEnvidoP1 > this.pointsEnvidoP2){
			if (this.currentHand==this.player1) {this.score[0]+=num;  } else {this.score[1]+=num; }
		 }
		if (this.pointsEnvidoP2 > this.pointsEnvidoP1){
		 
			 if (this.currentHand==this.player2) {this.score[0]+=num;  } else {this.score[1]+=num;  }
		}
		if (this.pointsEnvidoP1 == this.pointsEnvidoP2 && this.currentHand == this.player1){this.score[0] +=num;}
		if (this.pointsEnvidoP1 == this.pointsEnvidoP2 && this.currentHand == this.player2){this.score[1] +=num;}
	}
		
	if(action=="no-quiero"){
		if (player == this.player1){ this.score[1] += num; }
		if (player == this.player2){ this.score[0] += num; }
	}
}

//Verifica ganador del truco (con sus variantes) y asigna puntos.
Round.prototype.checkWinner =function(arr, num){
	var i=0; 
	while(i<_.size(arr) && this.auxWin==false){
		var elem=arr[i];
		if (( this.distHamming(elem,this.turnWin))==0){
			this.auxWin=true;
			if (this.flagValeCuatro == true){
				 this.score[num]+=4;
			}else{
				if (this.flagRetruco == true){
					this.score[num]+=3;
				}else{
					if (this.flagTruco == true){
						this.score[num]+=2;
					}else{
						this.score[num]+=1;
						this.flagNoCanto =true;
					}
				}
			}
		}  
		i++;
	}
}

//Metodo que determina el ganador del truco
Round.prototype.calculateScoreTruco = function (action,player,value){ 
	if((action == "quiero"||action == "playcard")&&(this.auxWin==false)){

		//  0 cooresponde jugador 1  
		//  1 corresponde al jugador 2   
		//  -1 corresponde al empate
		
		//posibilodades ganar player1
		var fst= [[0,0],[-1,0],[1,0,0],[0,-1],[-1,-1,0],[0,1,0],[0,1,-1]];
		//posibilodades ganar player2  
		var snd = [[1,1],[-1,1],[0,1,1],[1,-1],[-1,-1,1],[1,0,1],[1,0,-1]];
		//posibilidad de triple empate  
		var ch= [-1,-1,-1];

		if((this.distHamming(ch,this.turnWin))==0){this.calculateScoreTruco(action,player,value);
			//en caso de triple empate le sumo 2 al jugador mano
			if(this.player1 == this.currentHand){ 
				this.score[0]+=2; 
			}else{
				this.score[1]+=2; 
			}
			this.auxWin=true; 

		}else{         
				this.checkWinner(fst,0);//chequeo si gana jugador 1 
				this.checkWinner(snd,1);//chequeo si gana jugador 2
		}
	} 

	if (action == "no-quiero"){

			 this.auxWin=true;   
			 if (player == this.player1){ this.score[1]+=1; }
			 if (player == this.player2){ this.score[0]+=1; }

			 if (this.flagRetruco == true){
				 if (player == this.player1){ this.score[1]+=1; }
				 if (player == this.player2){ this.score[0]+=1; }
			 }
			 if (this.flagValeCuatro == true){
				 if (player == this.player1){ this.score[1]+=2; }
				 if (player == this.player2){ this.score[0]+=2; }
			 }
	}

}

//Metodo que setea las tablas de las cartas jugadas de cada jugador.
Round.prototype.setTable = function(value,player){
	var encontrado = false;
	if(player == this.player1){
	var card = new Card (this.returnNumber(value),this.returnSuit(value));
		var aux = undefined;
		var i = 0;
		while (i < _.size(this.cartasp1)){
			
			if(this.cartasp1[i].number == card.number && this.cartasp1[i].suit == card.suit){
				
				aux = i;
				encontrado = true;
				this.tablep1.push(card);     
			}
			i++;
		}

		if(aux!=undefined){ 
			_.pullAt(this.cartasp1, [aux]);
		}
	}      
	if(player == this.player2){
		
		var card = new Card (this.returnNumber(value),this.returnSuit(value));
		var aux = undefined;
		var i = 0;
		while (i < _.size(this.cartasp2)){
			if(this.cartasp2[i].number == card.number && this.cartasp2[i].suit == card.suit){
				aux = i;
				encontrado=true;
				this.tablep2.push(card);            
			}
			i++;
		}
		if(aux!=undefined){
			_.pullAt(this.cartasp2, [aux]);
		}
	}
}  


Round.prototype.play = function(game,player,action, value){
		// save the last state 
		var prev = this.actionPrevious(); 
		// move to the next state  
		this.fsm[action]();
		// check if is needed sum score
		console.log("player con el que entra en round: "+player);
		this.calculateScore(game,action,prev,value,player);
	 
		this.changeTurn();
		
		return this;
};

module.exports.round = Round;
