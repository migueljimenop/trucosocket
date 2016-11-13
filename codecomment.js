router.post('/register', function(req, res) {
	//console.log(JSON.stringify(user.username));
	var user = new User({username: req.body.username, 
						password: req.body.password,
					});		
	user.save(function(err,user){
		if(err){
			return res.render("register", { info: "Usuario ya registrado."});
		}
		passport.authenticate('local'), function(req, res) {
			// If this function gets called, authentication was successful.
			// `req.user` contains the authenticated user.
			console.log("Todo ok")
			//res.redirect();
		};
		/*
		app.post('/login',
		  passport.authenticate('local'),
		  function(req, res) {
			// If this function gets called, authentication was successful.
			// `req.user` contains the authenticated user.
			res.redirect('/users/' + req.user.username);
		});



		passport.authenticate('local')(req, res, function () {
			res.redirect('/myacc');
		});*/
	});
});


/*
router.post('/register', function(req, res) {
	User.register(new User({ username : req.body.username , password : req.body.password }), req.body.password, function(err, user) {
		if (err) {
			//return res.render('register', { user : user });
			return res.render("register", { info: "Usuario ya registrado."});
		}
		passport.authenticate('local')(req, res, function () {
			res.redirect('/myacc');
		});
	});
});
*/


/*
router.post('/login', 
	passport.authenticate('local', 
	{ successRedirect : '/myacc',    
	failureRedirect: '/login' })
);
*/
/*
router.post('/login', 
	passport.authenticate('local',{ failureRedirect: '/login' , failureFlash: 'Invalid login or password' }), 
	function(req, res) {
	User.find({username:req.body.username, password:req.body.password}, function(err){
	if(err){ throw err; }
	else{
		req.user = new User({username:req.body.username, password:req.body.password});
	}
	res.redirect('/myacc');        
	});
});
*/

/*
router.post('/register', function(req, res) {
	//console.log(JSON.stringify(user.username));
	var user = new User({username: req.body.username, 
						password: req.body.password
					});		
	user.save(function(err,user){
		if(err){
			return res.render("register", { info: "Usuario ya registrado."});
		}
		console.log("Todo ok");
	});
});
*/

  	var user = new User({username: req.body.username, 
						password: req.body.password
					}); 
	User.findOne({username: req.body.username},function(err) {
		/*
		if(err) {
			return res.render("login", { message: 'Usuario o clave incorrecto.' });
		}
		req.login(user, function(err) {
			return res.redirect('/myacc');
		});
		*/
		if(err) {
			return res.render("register", { info: "Usuario ya registrado."});
		} else {
	  		//console.log('user: ' + user.username + " saved.");
	  		req.login(user, function(err) {
			if (err) {
		  		return res.render("login", { message: 'Usuario o clave incorrecto.' });
			}
				return res.redirect('/myacc');
	  		});
		}		
	});

router.post('/login', function(req, res) {   
	User.findOne({username: req.body.username},function(err,user) {
		console.log("Contraseña guardada en la bd: "+ user.password);
		console.log("Contraseña ingresada en el login: "+req.body.password);
		// if user = null es porque no existe en la bd
		if (user === null){
			return res.render("login", { message: 'Usuario no registrado.' });
		}else{
			req.login(user,function(err){
			if (user.password !== req.body.password) {
				return res.render("login", { message: 'Contraseña incorrecta.' });
			}				
			return res.redirect('/myacc');
			});			
		}
		//console.log(JSON.stringify(user.password));
	});
});

		/*
		if (user.username !== req.body.username){
			return res.render("login", { message: 'Usuario no registrado.' });
		}*/



	User.findOne({username: req.body.username},function(err,user) {	
		//console.log(user.username);
	});
	var player = new Player({
					pl: { type: req.body._id },
					username: req.user.username
					});	
	player.save(function(err) {
		res.send("Guardamos los datos correctamente.");
	});


router.get('/lobby', function(req, res){
	User.find({ _id: req.session.user_id},function(err,user){		
		console.log("ENCONTRADO");
		console.log("ESTE ES EL USUARIO: " + JSON.stringify(user));
		var player = new Player({
						pl : user._id,
						username : user.username
		});			
		console.log("ESTE ES EL PLAYER: " + JSON.stringify(player));			
		player.save(function(err) {		
			if(err) {
				console.log("PLAYER NO GUARDADO!");
				res.render('lobby', {});			
			}else{
				console.log("PLAYER GUARDADO!: " + player);
				res.render('lobby', {});
			}
		});			
	});			
});


function Game(player1, player2){
	/*
	 * Player 1
	 */
	this.player1 = player1;

	/*
	 * Player 2
	 */
	this.player2 = player2;

	/*
	 * sequence of previous Rounds
	 */
	this.rounds = [];

	/*
	 * Game's hand
	 */
	this.currentHand = player1;

	/*
	 * Game's hand
	 */
	this.currentRound = undefined;

	/*
	 * Game' score
	 */
	this.score = [0,0];
}


function Player(name) {
  /*
   * the player's name
   */
  this.name = name;

  /*
   * cards of this user
   */
  this.cards = [];

  /*
   * user envido points
   */
  this.envidoPoints = 0;
  
}

		Player.findOne( { _id : gameplay.player1 }, function(err, player1){
			var p1 = new Player(player1);
			Player.findOne( { _id : gameplay.player2 }, function(err,player2){
				var p2 = new Player(player2);       
				gameplay.newRound();
				gameplay.currentRound.deal(p1,p2);
				console.log("Cartas del jugador numero 1: " + p1.cards);
				//console.log(p2.cards);
				//console.log("El estado del juego luego del deal es: "+ JSON.stringify(req.session.game));		
				res.render('play', { g : gameplay, player1 : p1, player2: p2 });
			});
		//console.log(JSON.stringify(gameplay));
		//var g = new Game(gameplay);
		//g.player1 = new Player(gameplay.player1);
		//g.player2 = new Player(gameplay.player2);
		//console.log("Encontré juego de id: " + req.session.gameid + " y del jugador: " +  req.session.name);
		//console.log(JSON.stringify(g));

		  Player.findOne( { _id : game.player1 }, function(err, player1){
    console.log("Entro a buscar al primer jugador: " + player1);
    //var p1 = new Player(player);
    player1.setCards(_.pullAt(deck, 0, 2, 4));
    console.log("Le seteo las cartas al p1:" + player1.cards);
    //console.log("ESTE ES EL PLAYER 1: " + JSON.stringify(p1));
      Player.findOne( { _id : game.player2 }, function(err,player2){
        console.log("Entro a buscar al segundo jugador: " + player2);
        //var p2 = new Player(player);
        player2.setCards(_.pullAt(deck, 1, 3, 5));
        console.log("Le seteo las cartas al p2:" + player2.cards);
      // console.log("ESTE ES EL PLAYER 2: " + JSON.stringify(p2));        
        return this; 
    });
  });


		  =================



		  	Player.findOne( {nickname: req.session.name}, function (err, player) {
	    if (!err) {
	        if (!player) {
				var player = new Player({
					playerid : req.session.user_id,
					nickname : req.session.name,
					cards: [],
					envidoPoints: 0
				});		        	
				player.save(function(err) {
					req.session.player = player;
					req.session.p_id = player._id;
					return res.render('lobby', {});			
				});
	        } else { 
	        	req.session.p_id = player._id;   	
	        	req.session.player = player;
	        	return res.render('lobby', {});
	        }
	    }
	});


		  		
	console.log("El juego: " + JSON.stringify(game));
	if (game.currentRound == undefined){
	    game.newRound();
	    game.save(function(err,game2){
	        if (err){
	            console.log(err);
	        }
	        res.render('play', {g : game2});
	    });
	}

	//Game.findOne( { _id : req.session.gameid }, function(err,gameplay){
    var r = game.currentRound;
    r.__proto__ = Round.prototype;    
    r.fsm = r.fsm.current;
    //console.log(r.fsm);
	res.render('play', { g : game});


var express = require('express');
var session = require("express-session");
var passport = require('passport');
var router = express.Router();

var User = require('../models/user');
var Game = require("../models/game").game;
var Player = require("../models/player").player;
var Round = require("../models/round").round;
var Deck = require("../models/deck").deck;
var Card = require("../models/card").card;
var g = undefined;
// ============================================================================
/* GET home page. */
router.get('/', function (req, res) {
	res.render('index', { user : req.user });
});

//https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications
//https://scotch.io/tutorials/a-realtime-room-chat-app-using-node-webkit-socket-io-and-mean

//http://socket.io/get-started/chat/

// ============================================================================
// ROUTER GET / POST REGISTER, IT'S WORKING.
router.get('/register', function(req, res) {
	res.render('register', {});
});

router.post('/register', function(req, res) {
	var user = new User({username: req.body.username, 
						password: req.body.password
					});	
	user.save(function(err) {
	if(err) {
		return res.render("register", { info: "Usuario ya registrado."});
	}else{			
		req.login(user, function(err) {
			if (err) {
				return res.render("register", { info: 'Usuario o clave incorrecto.' });
			}
			req.session.user_id = user._id;
			req.session.name = user.username;				
			return res.redirect('/lobby');
		});
		}
	});
});

// ===================================================================================================================
// ROUTER GET / POST LOGIN, IT'S WORKING.

router.get('/login', function(req, res) {
	res.render('login', {});
});

router.post('/login', function(req, res) {   
	User.findOne({username: req.body.username},function(err,user) {
		if (user === null){
			return res.render("login", { message: 'Usuario no registrado.'});
		}
		if (user.password !== req.body.password) {
			return res.render("login", { message: 'Contraseña incorrecta.' });
		}
		else{			
			req.login(user,function(err){		
				req.session.user_id = user._id;
				req.session.name = user.username;			
				return res.redirect('/lobby');
			});			
		}
	});
});
// ===================================================================================================================
// ROUTER GET / POST MYACC, WORKING.
router.get('/lobby', function(req, res){
	Player.findOne( {nickname: req.session.name}, function (err, player) {
	    if (!err) {
	        if (!player) {
				var player = new Player({
					playerid : req.session.user_id,
					nickname : req.session.name	
				});		        	
				player.save(function(err) {
					req.session.player = player;
					req.session.p_id = player._id;
					return res.render('lobby', {});			
				});
	        } else { 
	        	req.session.p_id = player._id;   	
	        	req.session.player = player;
	        	return res.render('lobby', {});
	        }
	    }
	});
});

router.post('/lobby'), function(req,res) {
	res.render('lobby', {});
}

// ===================================================================================================================
// ROUTER GET / POST NEW GAME , IT'S WORKING. :)))))))

router.get('/newgame', function(req,res){  	
	var newgame = new Game({player1: req.session.p_id, player2: req.session.p_id, currentRound:undefined, currentTurn: undefined});
	newgame.newRound();
	newgame.save(function(err,game){
		if(err){
			console.log("No he creado el juego :c");
			//return res.render("lobby", { info: "No se pudo crear el juego."});
			//res.redirect('/play');
		}
		else{
			console.log("He creado el juego correctamente "+ game);
			req.session.gameid = game._id;
			req.session.game = game;
			res.redirect('/play');
		}
	});
});
// ===================================================================================================================

router.get('/play', function(req, res){
	var g = Game.findOne( { _id : req.session.gameid }, function(err,gameplay){
		var r = gameplay.currentRound;
		r.__proto__ = ound.prototype;    
    	r.fsm = r.newTrucoFSM(r.fsm.current);
    	res.render('play', { g : game});	
	});
});

router.post('/play', function(req, res){
	// MODIFICAR EL PLAY PARA QUE SE JUEGUE CON LA BD.
	//console.log(req.session.game.currentRound.fsm.cannot(req.body.action));

	res.send("post play");
	/*if(g.currentRound.fsm.cannot(req.body.action)){
		res.redirect('notmove');  
	}
	if(req.body.value == '' && req.body.action == 'playcard'){
		res.redirect('notmove'); 
	}
	g.play(g.currentRound.currentTurn, req.body.action, req.body.value);
	if(g.score[0] >= 30){
		res.redirect('win');
	}
	else if(g.score[1] >= 30){
	   res.redirect('win'); 
	}else{
		if(g.currentRound.auxWin == true){
			g.newRound();
			//g.currentRound.deal();
		}
		res.render('play', { g : g }); 
	} */
});


// ===================================================================================================================
// ROUTER GET / POST MYACC, WORKING.
router.get('/myacc', function(req, res){
	res.render('myacc', {user: req.user});
});

router.post('/myacc'), function(req,res) {
	res.render('myacc', { user: req.user} );
}

// ===================================================================================================================
// ROUTER GET / POST , WORKING.
router.get('/win', function(req, res){
	res.render('win', { g : g , user: req.user });
});

router.post('/win'), function(req,res) {
	res.render('win');
}

// ===================================================================================================================
// ROUTER GET LOGOUT / WORKING 
router.get('/logout', function(req, res) {
	req.logout();
	//console.log("Session actual: " + req.session.name);
    req.session.destroy();
	//console.log("Session destruida: " + req.session.name);    
	res.redirect('/');
});

router.get('/meme', function(req, res) {
	res.render('meme');
});

router.get('/notmove', function(req, res) {
	res.render('notmove');
});

module.exports = router;
// ===================================================================================================================
/*
router.get('/ping', function(req, res){
	res.status(200).send("pong!");
});
*/

/*
router.post('/login', passport.authenticate('local'), function(req, res) {
	res.redirect('/');
});
*/
/*
router.post("/sessions", function(req,res){
	User.findOne({email: req.body.email ,password:req.body.password},function(err,user){
		req.session.user_id = user._id;
		res.redirect("/");
		// _id , asignacion de mongo unica para la base de datos.       
	});
});*/

/*
router.post('/login', 
	passport.authenticate('local', 
	{successRedirect : '/',
	successFlash: 'Welcome!',     
	failureRedirect: '/login', 
	failureFlash: true 
}));*/

/*
app.post('/login', passport.authenticate('local', { successRedirect: '/',
													failureRedirect: '/login' }));

router.post('/login', function(req,res){
	if (err) {
		return res.render('login', { user : user });
	}
	passport.authenticate('local')(req, res, function () {
		res.redirect('/register');
	});
});
*/






var express = require('express');
var session = require("express-session");
var passport = require('passport');
var router = express.Router();

var User = require('../models/user');
var Game = require("../models/game").game;
var Player = require("../models/player").player;
var Round = require("../models/round").round;
var Deck = require("../models/deck").deck;
var Card = require("../models/card").card;
var StateMachine = require("../node_modules/javascript-state-machine/state-machine.js");
var g = undefined;
// ============================================================================
/* GET home page. */
router.get('/', function (req, res) {
  res.render('index', { user : req.user });
});

//https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications
//https://scotch.io/tutorials/a-realtime-room-chat-app-using-node-webkit-socket-io-and-mean

//http://socket.io/get-started/chat/

// ============================================================================
// ROUTER GET / POST REGISTER, IT'S WORKING.
router.get('/register', function(req, res) {
  res.render('register', {});
});

router.post('/register', function(req, res) {
  var user = new User({username: req.body.username, 
            password: req.body.password
          }); 
  user.save(function(err) {
  if(err) {
    return res.render("register", { info: "Usuario ya registrado."});
  }else{      
    req.login(user, function(err) {
      if (err) {
        return res.render("register", { info: 'Usuario o clave incorrecto.' });
      }
      req.session.user_id = user._id;
      req.session.name = user.username;       
      return res.redirect('/lobby');
    });
    }
  });
});

// ===================================================================================================================
// ROUTER GET / POST LOGIN, IT'S WORKING.

router.get('/login', function(req, res) {
  res.render('login', {});
});

router.post('/login', function(req, res) {   
  User.findOne({username: req.body.username},function(err,user) {
    if (user === null){
      return res.render("login", { message: 'Usuario no registrado.'});
    }
    if (user.passwor !== req.body.password) {
      return res.render("login", { message: 'Contraseña incorrecta.' });
    }
    else{     
      req.login(user,function(err){   
        req.session.user_id = user._id;
        req.session.name = user.username;     
        return res.redirect('/lobby');
      });     
    }
  });
});
// ===================================================================================================================
// ROUTER GET / POST MYACC, WORKING.
router.get('/lobby', function(req, res){
  Player.findOne( {nickname: req.session.name}, function (err, player) {
      if (!err) {
          if (!player) {
        var player = new Player({
          playerid : req.session.user_id,
          nickname : req.session.name,
          cards: [],
          envidoPoints: 0
        });             
        player.save(function(err) {
          req.session.player = player;
          //req.session.p_id = player._id;
          return res.render('lobby', {});     
        });
          } else { 
            //req.session.p_id = player._id;    
            req.session.player = player;
            return res.render('lobby', {});
          }
      }
  });
});

router.post('/lobby'), function(req,res) {
  res.render('lobby', {});
}

// ===================================================================================================================
// ROUTER GET / POST NEW GAME , IT'S WORKING. :)))))))

router.get('/newgame', function(req,res){   
  var newgame = new Game({player1: req.session.player, player2: req.session.player});
  newgame.newRound();
  newgame.save(function(err,game){
    if(err){
      //console.log("No he creado el juego :c");
      //return res.render("lobby", { info: "No se pudo crear el juego."});
      //res.redirect('/play');
    }
    console.log("He creado el juego correctamente "+ game);
    console.log(game);
    req.session.gameid = game._id;
    req.session.game = game;
    res.redirect('/play');
  });
});
// ===================================================================================================================

router.get('/play', function(req, res){
  var g = Game.findOne( { _id : req.session.gameid }, function(err,gameplay){
    var r = gameplay.currentRound;
    r.__proto__ = Round.prototype;    
      r.fsm = r.newTrucoFSM(r.fsm.current);
      res.render('play', { g : game});  
  });
});

router.post('/play', function(req, res){
  // MODIFICAR EL PLAY PARA QUE SE JUEGUE CON LA BD.
  //console.log(req.session.game.currentRound.fsm.cannot(req.body.action));

  res.send("post play");
  /*if(g.currentRound.fsm.cannot(req.body.action)){
    res.redirect('notmove');  
  }
  if(req.body.value == '' && req.body.action == 'playcard'){
    res.redirect('notmove'); 
  }
  g.play(g.currentRound.currentTurn, req.body.action, req.body.value);
  if(g.score[0] >= 30){
    res.redirect('win');
  }
  else if(g.score[1] >= 30){
     res.redirect('win'); 
  }else{
    if(g.currentRound.auxWin == true){
      g.newRound();
      //g.currentRound.deal();
    }
    res.render('play', { g : g }); 
  } */
});


// ===================================================================================================================
// ROUTER GET / POST MYACC, WORKING.
router.get('/myacc', function(req, res){
  res.render('myacc', {user: req.user});
});

router.post('/myacc'), function(req,res) {
  res.render('myacc', { user: req.user} );
}

// ===================================================================================================================
// ROUTER GET / POST , WORKING.
router.get('/win', function(req, res){
  res.render('win', { g : g , user: req.user });
});

router.post('/win'), function(req,res) {
  res.render('win');
}

// ===================================================================================================================
// ROUTER GET LOGOUT / WORKING 
router.get('/logout', function(req, res) {
  req.logout();
  //console.log("Session actual: " + req.session.name);
    req.session.destroy();
  //console.log("Session destruida: " + req.session.name);    
  res.redirect('/');
});

router.get('/meme', function(req, res) {
  res.render('meme');
});

router.get('/notmove', function(req, res) {
  res.render('notmove');
});

module.exports = router;
// ===================================================================================================================
/*
router.get('/ping', function(req, res){
  res.status(200).send("pong!");
});
*/

/*
router.post('/login', passport.authenticate('local'), function(req, res) {
  res.redirect('/');
});
*/
/*
router.post("/sessions", function(req,res){
  User.findOne({email: req.body.email ,password:req.body.password},function(err,user){
    req.session.user_id = user._id;
    res.redirect("/");
    // _id , asignacion de mongo unica para la base de datos.       
  });
});*/

/*
router.post('/login', 
  passport.authenticate('local', 
  {successRedirect : '/',
  successFlash: 'Welcome!',     
  failureRedirect: '/login', 
  failureFlash: true 
}));*/

/*
app.post('/login', passport.authenticate('local', { successRedirect: '/',
                          failureRedirect: '/login' }));

router.post('/login', function(req,res){
  if (err) {
    return res.render('login', { user : user });
  }
  passport.authenticate('local')(req, res, function () {
    res.redirect('/register');
  });
});
*/









// ===================================================================================================================

router.get('/play', function(req, res){
    Game.findOne( { _id :req.session.game_id },function(err,gamecreate){
        //console.log("Entré aqui por: " + i + " vez");
        if(gamecreate.rounds[0] == undefined){
            console.log("Entró en el ilfe");
            gamecreate.newRound();
            gamecreate.currentRound.deal();                      
            var round = gamecreate.currentRound;
            round.__proto__ = Round.prototype;       
            g = gamecreate;
            return res.render('play', { g : gamecreate });   
        }
        else{
            console.log("Entró en el else");            
            gamecreate = g;
            gamecreate.newRound();
            gamecreate.currentRound.deal();            
            var round = gamecreate.currentRound;
            round.__proto__ = Round.prototype;
            return res.render('play', { g : gamecreate })
        }
    });
});

router.post('/play', function(req, res){
    Game.findOne( { _id :req.session.game_id },function(err,gamecurrent){
        gamecurrent = g;
        var round = gamecurrent.currentRound;
        round.__proto__ = Round.prototype;       
        if(round.fsm.cannot(req.body.action)){
            res.redirect('notmove');  
        }
        if(req.body.value == '' && req.body.action == 'playcard'){
            res.redirect('notmove'); 
        }
        gamecurrent.play(round.currentTurn, req.body.action, req.body.value);
        if(gamecurrent.score[0] >= 30){
            res.redirect('win');
        }
        else if(gamecurrent.score[1] >= 30){
            res.redirect('win'); 
        }
        else{
            console.log("auxWin: " + round.auxWin);
            if(round.auxWin == true){               
                console.log("Encontré un ganador, estoy por updatear.");
                /*
                Game.update({ _id :req.session.game_id }, { $set :{score : gamecurrent.score, currentRound:round}},function (err,resultado){   
                    console.log(resultado);              
                    res.redirect ('play');
                });*/                               
                Game.update( { _id :req.session.game_id } ,function (err,resultado){  
                    console.log("Resultado.score: " + gamecurrent.score);
                    //resultado.score = gamecurrent.score;
                    g.score = gamecurrent.score;
                    resultado.score = gamecurrent.score;
                    console.log("Resultado.currentRound: " + round);
                    resultado.currentRound = round;
                    g.currentRound = round;
                    g = resultado;
                    return res.redirect('play');
                });
            }else{
                return res.render('play', { g : gamecurrent });
            }  
        }
    });
});




Game.findById(req.session.game_id, function(err, p) {
if (!p)
    return next(new Error('Could not load Document'));
else {
    // do your updates here
    //p.modified = new Date();
    p.score = gamecurrent.score;
    p.currentRound = round;
    p.save(function(err) {
      if (err){
        //console.log('error');
        res.redirect('play');
      }else{
        console.log('success');
        res.redirect('play');
        }
    });
  }
});


                Game.update({ _id :req.session.game_id }, 
                            { $set : {score : g.score, currentRound: g.currentRound} },
                            {upsert:true,safe:true,multi: true}, //options
                            function (err,resultado){   
                    //console.log(game.score);              
                    //resultado.score = g.score;
                    //resultado.currentRound = g.currentRound;
                    return res.redirect('/play');
                });

                var query = {_id :req.session.game_id },
                    update = {
                        "$set": { score : g.score, currentRound: g.currentRound } 
                    },
                    options = { "upsert":true,"safe":true,"multi": true };
                    console.log("Encontré un ganador, estoy por updatear.");                
                    Game.update(query, update, options, function (err) {
                        if (err){ 
                            return console.error(err);
                        }
                        return res.redirect('play');         
                    });


                        //Game.findOne( { _id :req.session.game_id },function(err,gamecurrent){              
        //game.getRound();
        //var round = game.currentRound;
        //round.__proto__ = Round.prototype;       
        //round.fsm = round.fsm.current;       
        //console.log(round);
        //gamecurrent.currentRound.deal();
        //console.log(gamecurrent.rounds.currentRound)  
        //var round = gamecurrent.rounds.currentRound; 
        //var round = gamecurrent.currentRound;
        //round.__proto__ = Round.prototype;       
        //round.fsm = round.fsm.current;    
      
    //});
    var round = g.currentRound;
    round.__proto__ = Round.prototype;       
    //round.fsm = round.fsm.current; 
    if(round.fsm.cannot(req.body.action)){
        res.redirect('notmove');  
    }
    if(req.body.value == '' && req.body.action == 'playcard'){
        res.redirect('notmove'); 
    }
    g.play(round.currentTurn, req.body.action, req.body.value);
    if(g.score[0] >= 30){
        res.redirect('win');
    }
    else if(g.score[1] >= 30){
        res.redirect('win'); 
    }
    else{
        if(round.auxWin == true){
            Game.update({ _id: game._id }, { $set :{score : g.score ,currentRound:round}},function (err,resultado){ 
                g.newRound();
                g.currentRound.deal(); 
                res.redirect('play');
            });
        }
        res.render('play', { g : g }); 
    }  



            if(round.fsm.cannot(req.body.action)){
            res.redirect('notmove');  
        }
        if(req.body.value == '' && req.body.action == 'playcard'){
            res.redirect('notmove'); 
        }
        gamecurrent.play(round.currentTurn, req.body.action, req.body.value);
        if(gamecurrent.score[0] >= 30){
            res.redirect('win');
        }
        else if(gamecurrent.score[1] >= 30){
            res.redirect('win'); 
        }
        else{
            if(round.auxWin == true){
                gamecreate.newRound();
                gamecreate.currentRound.deal(); 
            }
            res.render('play', { g : gamecurrent }); 
        }  