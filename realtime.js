module.exports = function(server){

//////////////////////////////////////////////////////////////////////////////////////////////////////
	var io = require("socket.io")(server); // WWW 
	var _ = require('lodash');
	var app = require('./server');
	var passportSocketIo = require("passport.socketio");
	var session = require("express-session");
	var MongoStore = require('connect-mongo')(session);
	var mongoose = require('mongoose'); 
	
	var User = require('./models/user').user;
	var Game = require("./models/game").game;
	var Player = require("./models/player").player;
	var Round = require("./models/round").round;
	var Card = require("./models/card").card;   
	
	var users = {};
	var games = [];

////////////////////////////////////////////////////////////////////////////////////////////
	io.use(passportSocketIo.authorize({
		cookieParser: require('cookie-parser'), //optional your cookie-parser middleware function. Defaults to require('cookie-parser')
		key:          'express.sid',       //make sure is the same as in your session settings in app.js
		secret:       'keyboard cat',      //make sure is the same as in your session settings in app.js
		store:      new MongoStore ({ mongooseConnection: mongoose.connection }),     
		success:      onAuthorizeSuccess,  // *optional* callback on success
		fail:         onAuthorizeFail,     // *optional* callback on fail/error
	}));

////////////////////////////////////////////////////////////////////////////////////////////
	function onAuthorizeSuccess(data, accept){
		console.log('successful connection to socket.io');
		accept(null, true);
	}

////////////////////////////////////////////////////////////////////////////////////////////
	function onAuthorizeFail(data, message, error, accept){
		if(error)
		throw new Error(message);
		console.log('failed connection to socket.io:', message);
		accept(null, false);
	}

////////////////////////////////////////////////////////////////////////////////////////////        
	io.on('connection', function(socket){ 
		var user = {socket: socket.id, id: socket.request.user._id, username: socket.request.user.username,
					playing: socket.request.user.playing}

		users[socket.id] = user;
		
		socket.emit("welcome", user, users);
		socket.emit("notify", "Bienvenido, " + user.username);

		io.emit("user_joined", user);


////////////////////////////////////////////////////////////////////////////////////////////            
		socket.on('send_invite', function (player) {
			if (!users[player].playing) {
				io.to(player).emit("receive_invite", users[socket.id], users[player]);
			} else {
				socket.emit('notify', 'Jugador en otro juego.');
			}
		});

////////////////////////////////////////////////////////////////////////////////////////////
		socket.on('accept_invite', function (player_id, game_id) {

			var aux1=(JSON.stringify(users[player_id].username)).split('"').join("");
			var aux2= (JSON.stringify(users[game_id].username)).split('"').join("");

			var j1 = new Player({
				nickname : aux1,
				});    
			j1.__proto__=Player.prototype;

			var j2 = new Player({
				nickname : aux2,
				});  
			j2.__proto__=Player.prototype;

////////////////////////////////////////////////////////////////////////////////////////////            
			var game = new Game ({
				player1: j1,
				player2: j2, 
				currentHand: j1.nickname,
				currentTurn:j1.nickname,
				currentState: 'init',
				usuario: users[player_id],
				invitado: users[game_id]
			});

			users[player_id].playing = true;
			users[game_id].playing = true;

			console.log("el jugador 1 cuando lo crea: "+j1);
			console.log("el jugador 2 cuando lo crea: "+j2);

			game.deal();
			game.currentRound = game.newRound('init');
			game.transitions = game.currentRound.fsm.transitions();

			game.save(function(err,game){
			if(err){
				console.log("ERROR AL GUARDAR EL JUEGO: " + err);
				}
			}); 

////////////////////////////////////////////////////////////////////////////////////////////
			var gameid = game._id;
			games[gameid] = game;
			console.log("Gameid del juego creado: " + gameid);

			var c1 = game.currentRound.cartasp1;
			var c2 = game.currentRound.cartasp2;

////////////////////////////////////////////////////////////////////////////////////////////
			var t = JSON.stringify(game.currentRound.currentTurn).split('"').join("");
			var tr = [];
			game.transitions = _.uniq(game.currentRound.fsm.transitions());; 
			tr = game.transitions;

			console.log("TRANSITIONS: " + tr);            
			console.log("TURNO: " + t);

			var tp1 = game.currentRound.tablep1;
			var tp2 = game.currentRound.tablep2;

			var mienvp= game.player1.envidoPoints;
			var opoenvp= game.player2.envidoPoints;

///////////////////////////////////////////////////////////////////////////////////////////     
			io.to(player_id).emit("getPoints", 0,0, aux1,aux2,mienvp);
			io.to(game_id).emit("getPoints", 0,0, aux2,aux1,opoenvp);

			io.to(player_id).emit("sendCards",c1, tp1, tp2);
			io.to(game_id).emit("sendCards",c2, tp2, tp1 );

			io.to(player_id).emit("muestra",JSON.stringify(game),game._id, game_id, t ,tr );
			io.to(game_id).emit("muestra",JSON.stringify(game),game._id, player_id, t, tr);

		});


////////////////////////////////////////////////////////////////////////////////////////////
		socket.on('jugando',function(gameid,jugador,accion,idopo, value){
			var miid= jugador.socket; // ID del jugador que envia la partida.
			jugador=jugador.username;
			var checkwinner = false;
			///////////7santi
			io.to(miid).emit("agregaAlHistorial",accion);
			io.to(idopo).emit("agregaAlHistorial",accion);
			/////////////////////////////////////////////////////////////
			var winner = false;
			
			console.log("Entro al jugando de REALTIME");
			console.log("El gameid es: "+gameid);
			console.log("El jugador es: "+jugador);
			console.log("El accion es: "+accion);
			console.log("El value(carta) es: "+value);

////////////////////////////////////////////////////////////////////////////////////////////
			Game.findOne( { _id :gameid }, function(err,game){    

				var round = game.newRound(game.currentState);
				round.__proto__ = Round.prototype;

				round.player1 = game.player1.nickname;  
				round.player2 = game.player2.nickname;
				round.currentTurn = game.currentTurn;///
				round.currentHand = game.currentHand;
				round.score = game.currentRound.score;
				round.turnWin = game.currentRound.turnWin;
				round.tablep1 =  game.currentRound.tablep1;
				round.tablep2 =  game.currentRound.tablep2;
				round.flagTruco =  game.currentRound.flagTruco;
				round.flagRetruco =  game.currentRound.flagRetruco;
				round.flagValeCuatro =  game.currentRound.flagValeCuatro;
				round.flagNoCanto=   game.currentRound.flagNoCanto;
				round.auxWin =  game.currentRound.auxWin;
				round.cartasp1 =  game.currentRound.cartasp1;
				round.cartasp2 =  game.currentRound.cartasp2;
				round.pardas =  game.currentRound.pardas;
				
				game.currentRound = round;
				
//////////////////////////////////////santi////////////////////////////////////////
				if (accion=="mazo") {
					game.currentRound.auxWin = true
					var indJugador=(jugador==game.player1.nickname)?1:0;
					if(!(game.currentRound.flagTruco||game.currentRound.flagRetruco||game.currentRound.flagValeCuatro)){
						var cant1=(game.currentRound.cartasp1).length;
						var cant2=(game.currentRound.cartasp2).length;
						if (cant1==3 ||cant2==3) {
							game.currentRound.score[indJugador]+=2;
						} else {
							game.currentRound.score[indJugador]+=1;
						}
						
					}else{
						
						if (game.currentRound.flagValeCuatro){
					         game.currentRound.score[indJugador]+=4;
					      }else{
					        if (game.currentRound.flagRetruco){
					          game.currentRound.score[indJugador]+=3;
					        }else{
					          if (game.currentRound.flagTruco){
					            game.currentRound.score[indJugador]+=2;
					        	}
					        }
					      }	
					}

				}else{
					console.log("###########################");
					game.currentRound=game.play(jugador,accion,value);
				};

///////////////////////////////////////////////////////////////////////////////////////////

				if(game.currentRound.auxWin == true){
					//////////////7santi
					io.to(miid).emit("borraHistorial");
					io.to(idopo).emit("borraHistorial");
					//////////7santi
					winner = true;
					//game.switchPlayer(game.currentHand);
				
/////////////////////////////////////////////////////////////////////////////////////////
					game.deal();
					game.score = game.currentRound.score;
					
					game.currentState ='init';
					var round2 = game.newRound('init');
					round2.__proto__ = Round.prototype;



 					round2.pointsEnvidoP1 = game.player1.envidoPoints;
  					round2.pointsEnvidoP2 = game.player2.envidoPoints;
					round2.player1 = game.player1.nickname;  
					round2.player2 = game.player2.nickname;
					round2.currentTurn = game.currentTurn;
					round2.currentHand = game.currentHand;
					round2.score = game.score;
					round2.turnWin = [];
					round2.tablep1 =  [];
					round2.tablep2 =  [];
					round2.flagTruco =  false;
					round2.flagRetruco=false;
					round2.flagValeCuatro=false;
					round2.flagNoCanto=false;
					round2.auxWin =  false;
					round2.pardas = false; 
					round2.cartasp1 =  game.player1.cards;
					round2.cartasp2 =  game.player2.cards;
					game.currentRound = round2;
					game.transitions = _.uniq(game.currentRound.fsm.transitions());

//////////////////////////////////////////////////////////////////////////////////////////////////////				
					}else{  

					  var pardas = false;
					  if ((game.currentRound.turnWin[0]==-1) && (game.currentRound.pardas == false)){
						 pardas = true;
						 game.currentRound.pardas = true;
					  }
					  if (pardas == false){
						  game.switchPlayer();
					  }

					  game.currentTurn = game.currentRound.currentTurn ;
					  game.score = game.currentRound.score;
					  game.currentState = game.currentRound.fsm.current;
					  game.transitions = _.uniq(game.currentRound.fsm.transitions());
				}

///////////////////////////////////////////////////////////////////////////////
				game.save(function (err,resultado){ 

				if(err){
					console.log("ERROR AL GUARDAR DESPUES DE PLAY: " + err);
			  
				}else{

					console.log("lo que tiene el resultado: " + resultado);
					var imCards;
					var otherCards;
					var imTable;
					var otherTable; 
					var oponente;
					var score1;
					var score2;

////////////////////////////////////////////////////////////////////////////////////////
					if (jugador == game.currentRound.player1){

						oponente = game.currentRound.player2;

						imCards = game.currentRound.cartasp1;
						otherCards = game.currentRound.cartasp2;

						imTable = game.currentRound.tablep1;
						otherTable = game.currentRound.tablep2;

						miscore = resultado.score[0];
						oposcore = resultado.score[1];

						ienvidoPoints = resultado.player1.envidoPoints
						opoenvidoPoints = resultado.player2.envidoPoints;
						if(miscore >= 3){
							io.to(miid).emit("winner", jugador);
							io.to(idopo).emit("loser", oponente);
							io.to(miid).emit("getPoints", miscore,oposcore, jugador,oponente, ienvidoPoints, winner);
							io.to(idopo).emit("getPoints", oposcore,miscore, oponente,jugador, opoenvidoPoints, winner);
							checkwinner = true;
						}


					}else{

						oponente = game.currentRound.player1;

						imCards = game.currentRound.cartasp2;
						otherCards = game.currentRound.cartasp1;

						imTable = game.currentRound.tablep2;
						otherTable = game.currentRound.tablep1;

						miscore = resultado.score[1];
						oposcore = resultado.score[0];
						ienvidoPoints = resultado.player1.envidoPoints;
						opoenvidoPoints = resultado.player2.envidoPoints;							
						if(miscore >= 3){
							io.to(miid).emit("winner", jugador)
							io.to(idopo).emit("loser", oponente);
							io.to(miid).emit("getPoints", miscore,oposcore, jugador,oponente, ienvidoPoints, winner);
							io.to(idopo).emit("getPoints", oposcore,miscore, oponente,jugador, opoenvidoPoints, winner);
							checkwinner = true;	
						}
					}

//////////////////////////////////////////////////////////////////////////////////////////////////////

						var t = JSON.stringify(resultado.currentRound.currentTurn).split('"').join("");
						var tr = []; 


						tr =  _.uniq(resultado.currentRound.fsm.transitions());


//==============================
//_.pull(array, 'a', 'c');_.pull(array, 'a', 'c');
		var f_t = game.currentRound.flagTruco;
		var f_rt =game.currentRound.flagRetruco;
		var f_v4 =game.currentRound.flagValeCuatro;


//==============================
						
						console.log("TRANSITIONS: " + tr);
						console.log("TURNO: " + t);

						console.log("currentRound.flagTruco: " +    f_t   );
		                console.log("currentRound.flagRetruco: " +  f_rt );
		                console.log("currentRound.flagValeCuatro: " +  f_v4  );

//////////////////////////////////////////////////////////////////////////////////////////////////////
						if(!checkwinner){
							io.to(miid).emit("getPoints", miscore,oposcore, jugador,oponente, ienvidoPoints,winner);
							io.to(idopo).emit("getPoints", oposcore,miscore, oponente,jugador, opoenvidoPoints,winner);

							io.to(miid).emit("sendCards",imCards, imTable, otherTable );
							io.to(idopo).emit("sendCards",otherCards, otherTable, imTable );

							io.to(miid).emit("muestra",JSON.stringify(resultado),game._id, idopo, t, tr);
							io.to(idopo).emit("muestra",JSON.stringify(resultado),game._id, miid, t, tr, accion, jugador);
						}
					}   
				}); 
			});
		});

//////////////////////////////////////////////////////////////////////////////////////////////////////
		socket.on('decline_invite', function (player_id, game_id) {
			io.to(player_id).emit("notify", "Invitación rechazada.");
		});

//////////////////////////////////////////////////////////////////////////////////////////////////////
		socket.on('disconnect', function () {   

			io.emit("user_left", socket.id);
			for (var key in games) {
				console.log(games);

				if (games.hasOwnProperty(key)) {
					var game = games[key];

					if (game) {
						if (game.usuario.socket == socket.id) {
							io.to(game.invitado.socket).emit("game_crash", game.usuario.username);
							//users[game.invitado.socket].playing = false;
						} else if (game.invitado.socket == socket.id) {
							io.to(game.usuario.socket).emit("game_crash", game.invitado.username);
							//users[game.usuario.socket].playing = false;
						}
						console.log("Tamaño del arreglo games antes de eliminar:  " + _.size(games));
						delete games[game];
						console.log("Tamaño del arreglo games después de eliminar:  " + _.size(games));
					}
				}
			}           
			console.log("Tamaño del arreglo users antes de eliminar:  " + _.size(users));
			delete users[socket.id];            
			console.log("Tamaño del arreglo users después de eliminar:  " + _.size(users));         
		});
	});
}