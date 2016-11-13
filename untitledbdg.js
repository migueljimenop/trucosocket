			Game.findOne({_id:gameid},function(err,game){
				if(err){
					console.log("ERROR AL BUSCAR EN REALTIME: "+err);
				}else{
					console.log("El juego que encuentroooo: "+JSON.stringify(game));
					//game.currentRound.__proto__=Round.prototype;
					
			           game.switchPlayer(game.currentHand);


					var round = game.newRound(game.currentState);
					round.__proto__ = Round.prototype;
					round.player1 = game.player1.nickname;  
					round.player2 = game.player2.nickname;
					round.currentTurn = game.currentTurn;
					round.currentHand = game.currentHand;
					round.score = game.currentRound.score;
					round.turnWin = game.currentRound.turnWin;
					round.tablep1 =  game.currentRound.tablep1;
					round.tablep2 =  game.currentRound.tablep2;
					round.flagTruco =  game.currentRound.flagTruco;
					round.flagNoCanto=   game.currentRound.flagNoCanto;
					round.auxWin =  game.currentRound.auxWin;
					round.cartasp1 =  game.currentRound.cartasp1;
					round.cartasp2 =  game.currentRound.cartasp2;
					round.pardas =  game.currentRound.pardas;
					game.currentRound = round; 

					game.currentRound.__proto__ = Round.prototype;
					//
					game.currentRound=game.play(jugador,accion,value);
					//gamecurrent.transitions = _.uniq(gamecurrent.currentRound.fsm.transitions());
					console.log("despues del play el estado es:"+game.currentState);
					if(game.currentRound.auxWin==true){
						var pp1 = game.score[0];
						var pp2 = game.score[1];

						console.log("el pp1: "+pp1);
						console.log("el pp2: "+pp2);
						game.deal();
						game.switchPlayer(game.currentHand);
						game.currentRound=game.newRound('init');
						console.log("(antes)el game.score[0] : "+game.score[0] );
						console.log("(antes)el game.score[1] : "+game.score[1] );
						game.score[0] += pp1;
						game.score[1] += pp2;
						console.log("(despues)el game.score[0] : "+game.score[0] );
						console.log("(despues)el game.score[1] : "+game.score[1] );

					}
					game.currentTurn = game.currentHand;
            			game.score = game.currentRound.score;
            			game.currentState = game.currentRound.fsm.current;
            		
					game.save(function(errr,resultado){
						if(err){
							console.log("ERROR AL GUARDAR EN REALTIME: "+resultado);
						}else{
							console.log("El juego se guardo correctamente: ");
							console.log("El juego se guardo correctamente: "+resultado);
							//io.to(miid).emit('muestraGame', resultado);
						    //io.to(idopo).emit('muestraGame', resultado);

						var c1 = game.currentRound.cartasp1;
						var c2 = game.currentRound.cartasp2;

						    io.to(miid).emit("muestra",JSON.stringify(resultado),game._id, c1, idopo);
					        io.to(idopo).emit("muestra",JSON.stringify(resultado),game._id, c2,  miid);

						}
					});
					//io.to(player_id).emit("muestra",game);
					//io.to(game_id).emit("muestra",game);
				}

			});