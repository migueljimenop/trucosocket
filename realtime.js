module.exports = function(server){

	var io = require("socket.io")(server); // WWW 
	var _ = require('lodash');
	var app = require('./server');
	var passportSocketIo = require("passport.socketio");
	var session = require("express-session");
	var MongoStore = require('connect-mongo')(session);
	var mongoose = require('mongoose'); 
	var User = require('./models/user');
	var Usuario = require('./models/user').usuario;
	var Game = require("./models/game").game;
	var Player = require("./models/player").player;
	var Round = require("./models/round").round;
	var Card = require("./models/card").card; 

	//Arreglo para almacenar los games y la coleccion con todos los usuarios.
	var users = {};
	var games = [];
	
	//Manejo de la autorizacion con passport.
	io.use(passportSocketIo.authorize({
		cookieParser: require('cookie-parser'), //optional your cookie-parser middleware function. Defaults to require('cookie-parser')
		key:          'express.sid',       //make sure is the same as in your session settings in app.js
		secret:       'keyboard cat',      //make sure is the same as in your session settings in app.js
		store:      new MongoStore ({ mongooseConnection: mongoose.connection,
		url: 'mongodb://miguel:1234@ds023054.mlab.com:23054/truco-development' }),     
		success:      onAuthorizeSuccess,  // *optional* callback on success
		fail:         onAuthorizeFail,     // *optional* callback on fail/error
	}));

	//coleccion con todas las posibilidades de estados de envido
	var posiblesE=['envido','envido-envido','real-envido','envido-real','envido-envido-real','falta-envido','envido-falta','envido-envido-falta','envido-envido-real-falta','real-envido-falta','envido-real-falta'];
	var cantoEnvido=false;

	//Funciones de autorizacion de passport.
	function onAuthorizeSuccess(data, accept){
		console.log('successful connection to socket.io');
		accept(null, true);
	}
	function onAuthorizeFail(data, message, error, accept){
		if(error)
		throw new Error(message);
		console.log('failed connection to socket.io:', message);
		accept(null, false);
	}

	//Realiza la conexion de un nuevo usuario con socket.io.        
	io.on('connection', function(socket){ 
		var user = {socket: socket.id, id: socket.request.user._id, username: socket.request.user.username,
					playing: socket.request.user.playing}
		
		var userflag = new User({ username: socket.id });
		
		users[socket.id] = user;

		socket.emit("welcome", user, users);
		socket.emit("notify", "Bienvenido, " + user.username);
		io.emit("user_joined", user);

		//El usuario envia la solicitud a otro para jugar, si este esta jugando se le notifica.             
		socket.on('send_invite', function (player) {
			if (!users[player].playing) {
				io.to(player).emit("receive_invite", users[socket.id], users[player]);
			} else {
				socket.emit('notify', 'Jugador en otro juego.');
			}
		});
		/*
		socket.on('statsUser', function(id, name, bool){
			console.log(name);
			User.findOne( {username: name}, function(err,user){
				console.log("ENTRÉ AL findOne:" +  user);
				if(err){ console.log(err); }else{
					console.log("ENTRÉ AL else:");
					if(bool){
						user.gw+=1;
					}else{
						user.gl+=1;
					}
					user.save(function(err,res){
						io.to(id).emit("graphs", user.gw, user.gl);
					});
				}
			});
		});*/

		//Si el oponente acepta la invitacion, se crea un nuevo juego.
		socket.on('accept_invite', function (player_id, game_id) {
			//player_id: id de socket correspondiente al jugador que realiza la invitacion.
			//game_id: id de socket correspondiente al jugador que acepta la invitacion.
			var aux1=(JSON.stringify(users[player_id].username)).split('"').join("");
			var aux2= (JSON.stringify(users[game_id].username)).split('"').join("");
			//Creacion de los jugadores y su juego.
			var j1 = new Player({ nickname : aux1});    
			j1.__proto__=Player.prototype;
			var j2 = new Player({ nickname : aux2});  
			j2.__proto__=Player.prototype;           
			var game = new Game ({
				player1: j1,
				player2: j2, 
				currentHand: j1.nickname,
				currentTurn:j1.nickname,
				currentState: 'init',
				usuario: users[player_id],
				invitado: users[game_id]
			});
			//Ambos jugadores quedan en estado "jugando" y se reparten las cartas.
			users[player_id].playing = true;
			users[game_id].playing = true;
			game.deal();
			game.currentRound = game.newRound('init');
			game.transitions = game.currentRound.fsm.transitions();
			//Se guarda el nuevo juego
			game.save(function(err,game){
				if(err){console.log("ERROR AL GUARDAR EL JUEGO: " + err);}
			});

			//Se guardan las cartas y el id del juego para posterior tratamiento.
			var gameid = game._id;
			games[gameid] = game;
			var c1 = game.currentRound.cartasp1;
			var c2 = game.currentRound.cartasp2;

			//Se guarda el turno corriente y las transiciones para posterior tratamiento.
			var t = JSON.stringify(game.currentRound.currentTurn).split('"').join("");
			game.transitions = _.uniq(game.currentRound.fsm.transitions());
			var tr = game.transitions;

			//Se guardan las cartas jugadas y y los puntos de envido de cada jugador para posterior tratamiento.
			var tp1 = game.currentRound.tablep1;
			var tp2 = game.currentRound.tablep2;
			var mienvp= game.player1.envidoPoints;
			var opoenvp= game.player2.envidoPoints;

			//Se pasan los puntos,los nombres y puntos de envido de cada jugador para luego ser mostrados.
			io.to(player_id).emit("getPoints", 0,0, aux1,aux2,mienvp);
			io.to(game_id).emit("getPoints", 0,0, aux2,aux1,opoenvp);

			//Se pasan las cartas de cada jugador para luego ser mostrados.
			io.to(player_id).emit("sendCards",c1, tp1, tp2);
			io.to(game_id).emit("sendCards",c2, tp2, tp1 );

			//Se pasan los nombres de los jugadores, el id del juego, el turno corriente y las transiciones.
			io.to(player_id).emit("muestra",JSON.stringify(game),game._id, game_id, t ,tr );
			io.to(game_id).emit("muestra",JSON.stringify(game),game._id, player_id, t, tr);

		});


		//Aqui se escucha la peticion de cuando se ejecuta alguna accion.
		socket.on('jugando',function(gameid,jugador,accion,idopo, value){
			var miid= jugador.socket; // ID del jugador que envia la partida.
			jugador=jugador.username;
			var checkwinner = false; //Variable que se usara para verificar si hay un ganador del juego.
			//Se verifica si se canta envido, para posterior tratamiento de casos
			if (_.indexOf(posiblesE,accion)!=-1) {
				cantoEnvido=true;
			}
			//Se agregan al historial de acciones de cada jugador, la accion corriente.
			io.to(miid).emit("agregaAlHistorial",accion);
			io.to(idopo).emit("agregaAlHistorial",accion);
			
			//Variables utilizadas para tratamientos varios (ej:como pasajes de parametros).
			var winner = false;
			var imCards;//Cartas del jugador corriente.
			var otherCards;//Cartas del oponente.
			var imTable;//Tabla de cartas jugadas por el jugador corriente. 
			var otherTable; //Tabla de cartas jugadas por el oponente.
			var oponente;
			var score1;//Puntos del jugador corriente.
			var score2;//Puntos del oponente.
			var ienvidoPoints;//Puntos de envido del jugador corriente.		
			var opoenvidoPoints//Puntos de envido del oponente.
			//Se recupera el juego buscando en la base de datos.
			Game.findOne( { _id :gameid }, function(err,game){    
				//Creacion de una ronda auxiliar para recuperar los metodos.
				var round = game.newRound(game.currentState);
				round.__proto__ = Round.prototype;
				
				round.pointsEnvidoP1 = game.player1.envidoPoints;
				round.pointsEnvidoP2 = game.player2.envidoPoints;
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
				//Caso especial en el cual la accion es mazo.
				if (accion=="mazo") {
					game.currentRound.auxWin = true;
					var indJugador=(jugador==game.player1.nickname)?1:0;
					//Casos en los que previamente no se canto truco.
					if(!(game.currentRound.flagTruco||game.currentRound.flagRetruco||game.currentRound.flagValeCuatro)){
						var cant1=(game.currentRound.cartasp1).length;
						var cant2=(game.currentRound.cartasp2).length;
						if (cant1==3 ||cant2==3) {
							if(cantoEnvido){
								game.currentRound.score[indJugador]+=1;
							}else{
								game.currentRound.score[indJugador]+=2;
							}
						} else {
							game.currentRound.score[indJugador]+=1;
						}
						
					}else{
						//Casos en los que previamente se canto truco.
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
				//En el caso de que la accion no haya sido mazo.
				}else{
					game.currentRound=game.play(jugador,accion,value);
				}
				//Se pregunta si el jugador 1 llego al puntaje necesario para ganar.
				if(game.currentRound.score[0] >= 9){
					checkwinner = true;
					if(game.currentRound.player1 == jugador){
						io.to(miid).emit("winner",  jugador);//Comunica que el player 1 es el ganador de la partida.
						io.to(idopo).emit("loser",  game.currentRound.player2);//Comunica al oponente que perdio la partida.
						//Comunica los puntos del envido y el puntaje actual de cada jugador al ganar la partida.
						io.to(miid).emit("getPoints", game.currentRound.score[0] ,game.currentRound.score[1], jugador , game.currentRound.player2);
						io.to(idopo).emit("getPoints", game.currentRound.score[1] ,game.currentRound.score[0], game.currentRound.player2 ,jugador);
						//Como se termino la partida se borra la base de datos y los datos de los jugadores locales a ella.
						deleteBD(gameid,game.currentRound.player1,game.currentRound.player2);
					}else if (game.currentRound.player2 == jugador){
							io.to(miid).emit("loser",  jugador);//Comunica al oponente que perdio la partida.
							io.to(idopo).emit("winner",  game.currentRound.player1);//Comunica que el player 2 es el ganador de la partida.
							//Comunica los puntos del envido y el puntaje actual de cada jugador al ganar la partida.
							io.to(miid).emit("getPoints", game.currentRound.score[1] ,game.currentRound.score[0], jugador, game.currentRound.player1);
							io.to(idopo).emit("getPoints", game.currentRound.score[0] ,game.currentRound.score[1], game.currentRound.player1, jugador);
							//Como se termino la partida se borra la base de datos y los datos de los jugadores locales a ella.
							deleteBD(gameid,game.currentRound.player1,game.currentRound.player2);
							}
				//Se pregunta si el jugador 2 llego al puntaje necesario para ganar.
				}else {
						if(game.currentRound.score[1] >= 9){
						checkwinner = true;	
						if(game.currentRound.player2 == jugador){
							io.to(miid).emit("winner", jugador);//Comunica que el player 2 es el ganador de la partida.
							io.to(idopo).emit("loser", game.currentRound.player1);//Comunica al oponente que perdio la partida.
							//Comunica los puntos del envido y el puntaje actual de cada jugador al ganar la partida.
							io.to(miid).emit("getPoints", game.currentRound.score[1] ,game.currentRound.score[0], jugador , game.currentRound.player1);
							io.to(idopo).emit("getPoints", game.currentRound.score[0] ,game.currentRound.score[1], game.currentRound.player1 ,jugador);
							//Como se termino la partida se borra la base de datos y los datos de los jugadores locales a ella.							
							deleteBD(gameid,game.currentRound.player1,game.currentRound.player2);
						}else if (game.currentRound.player1 == jugador){
								io.to(miid).emit("loser",  jugador);//Comunica al oponente que perdio la partida.
								io.to(idopo).emit("winner",  game.currentRound.player2);//Comunica que el player 2 es el ganador de la partida.
								//Comunica los puntos del envido y el puntaje actual de cada jugador al ganar la partida.
								io.to(miid).emit("getPoints", game.currentRound.score[0] ,game.currentRound.score[1], jugador, game.currentRound.player2);
								io.to(idopo).emit("getPoints", game.currentRound.score[1] ,game.currentRound.score[0], game.currentRound.player2, jugador);
								//Como se termino la partida se borra la base de datos y los datos de los jugadores locales a ella.
								deleteBD(gameid,game.currentRound.player1,game.currentRound.player2);
								}
				//Si no existe un ganador de la partida.	
				}else if (!checkwinner){
						//Si se encontro un ganador a la ronda actual.
						if(game.currentRound.auxWin == true){
							//Como se encontro un ganador de la ronda actual se borra el historial de jugadas de cada jugador.
							io.to(miid).emit("borraHistorial");
							io.to(idopo).emit("borraHistorial");
							cantoEnvido=false;
							winner = true;
							//Cambio del turno corriente y la mano de la ronda.
							if(jugador==game.player1.nickname){
								if (game.player1.nickname==game.currentHand) {
									game.currentHand=game.player2.nickname;
									game.currentTurn=game.player2.nickname;
								}else{
									game.currentHand=game.player1.nickname;
									game.currentTurn=game.player1.nickname;
								}
							}
							if(jugador==game.player2.nickname){
								if(game.player2.nickname==game.currentHand){
									game.currentHand=game.player1.nickname;
									game.currentTurn=game.player1.nickname;
									//game.currentHand=game.currentTurn;
								}else{
									game.currentHand=game.player2.nickname;
									game.currentTurn=game.player2.nickname;
								}
							}
							//Se reparten nuevamente cartas y se actualizan los datos de la ronda.
							game.deal();
							game.score = game.currentRound.score;
							game.currentState ='init';
							//Creacion de una ronda auxiliar para recuperar los metodos.
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
							//Se actualizan las transiciones posibles.
							game.currentRound = round2;
							game.transitions = _.uniq(game.currentRound.fsm.transitions());
					//Si no hay un ganador de la ronda.			
					}else{  
						game.currentTurn = game.currentRound.currentTurn;
						game.score = game.currentRound.score;
						game.currentState = game.currentRound.fsm.current;
						game.transitions = _.uniq(game.currentRound.fsm.transitions());
					}
					//Se guarda el juego despues de las modificaciones hechas.
					game.save(function (err,resultado){ 
						if(err){
							console.log("ERROR AL GUARDAR DESPUES DE PLAY: " + err);
						
						}else{
							//Se setean variables para hacer las respuestas(emit) con los datos del juego guardado.
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
								if(miscore >= 9){
									io.to(miid).emit("winner", jugador);
									io.to(idopo).emit("loser", oponente);
									//Comunica los puntos del envido y el puntaje actual de cada jugador.
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
								ienvidoPoints = resultado.player2.envidoPoints;
								opoenvidoPoints =resultado.player1.envidoPoints;						
								if(miscore >= 9){
									io.to(miid).emit("winner", jugador)
									io.to(idopo).emit("loser", oponente);
									//Comunica los puntos del envido y el puntaje actual de cada jugador.
									io.to(miid).emit("getPoints", miscore,oposcore, jugador,oponente, ienvidoPoints, winner);
									io.to(idopo).emit("getPoints", oposcore,miscore, oponente,jugador, opoenvidoPoints, winner);
									checkwinner = true;	
								}
							}
							//Asignacion de las transiciones, turno corriente y banderas de los casos de truco.
							var t = JSON.stringify(resultado.currentRound.currentTurn).split('"').join("");
							var tr = []; 
							tr =  _.uniq(resultado.currentRound.fsm.transitions());
							var f_t = game.currentRound.flagTruco;
							var f_rt =game.currentRound.flagRetruco;
							var f_v4 =game.currentRound.flagValeCuatro;
							//Comunica los puntos del envido y el puntaje actual de cada jugador.
							io.to(miid).emit("getPoints", miscore,oposcore, jugador,oponente, ienvidoPoints,winner);
							io.to(idopo).emit("getPoints", oposcore,miscore, oponente,jugador, opoenvidoPoints,winner);
							//Actualiza las cartas en la mesa
							io.to(miid).emit("sendCards",imCards, imTable, otherTable );
							io.to(idopo).emit("sendCards",otherCards, otherTable, imTable );
							//Actualiza las opciones de cada jugador y sus atributos.
							io.to(miid).emit("muestra",JSON.stringify(resultado),game._id, idopo, t, tr);
							io.to(idopo).emit("muestra",JSON.stringify(resultado),game._id, miid, t, tr, accion, jugador);
						}   
					}); 
				}
				}
			});
		});

		//Si el oponente rechaza la invitación, se le notifica al usuario.
		socket.on('decline_invite', function (player_id, game_id) {
			io.to(player_id).emit("notify", "Invitación rechazada.");
		});

		//Función que al terminar una partida completa borra de la base de datos el juego y los jugadores locales.
		function deleteBD (gameid, player1, player2){
			Game.remove({ _id: gameid }, function(err) {
				if (!err) { console.log("Juego borrado.");
					}else {console.log("Error al borrado."); }
			});
			Player.remove({ nickname: player1}, function(err) {
				if (!err) { console.log("Jugador borrado.");
					}else {console.log("Error al borado."); }
			});	
			Player.remove({ nickname: player2 }, function(err,player2) {
				if (!err) { console.log("Jugador borrado.");
					}else {console.log("Error al borado."); }
			});	
		}

		socket.on('disconnect', function () {   
			io.emit("user_left", socket.id);
			for (var key in games) {
				if (games.hasOwnProperty(key)) {
					var game = games[key];
					if (game) {
						if (game.usuario.socket == socket.id) {
							io.to(game.invitado.socket).emit("game_crash", game.usuario.username);
							io.to(game.invitado.socket).emit("winner", game.invitado.username);//Co
							User.findOne( {username: game.usuario.username }, function(err,user){
								//console.log("ENTRÉ AL findOne:" +  user);
								if(err){ console.log(err); }else{
									//console.log("ENTRÉ AL else:");
									user.connected = false;
									user.save(function(err,res){
										console.log(JSON.stringify(res));
									});
								}
							});
						} else if (game.invitado.socket == socket.id) {
							io.to(game.usuario.socket).emit("game_crash", game.invitado.username);
							io.to(game.usuario.socket).emit("winner", game.usuario.username);
							User.findOne( {username: game.invitado.username }, function(err,user){
								//console.log("ENTRÉ AL findOne:" +  user);
								if(err){ console.log(err); }else{
									//console.log("ENTRÉ AL else:");
									user.connected = false;
									user.save(function(err,res){
										console.log(JSON.stringify(res));
									});
								}
							});
						}
						delete games[game];
					}
				}
			}           
			delete users[socket.id];                  
		});
	});
}