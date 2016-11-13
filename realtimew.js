module.exports = function(server){
	var io = require("socket.io")(server); // WWW 
	var app = require('./server');
	var session = require("express-session"); 
	var cookieParser = require('cookie-parser');
	var passportSocketIo = require("passport.socketio");
	var connections = 0;
	var sessionStore = require('connect-mongo')(session);	
	
	io.use(passportSocketIo.authorize({
	  	//cookieParser: require('cookie-parser'), //optional your cookie-parser middleware function. Defaults to require('cookie-parser')
	  	key:          'express.sid',       //make sure is the same as in your session settings in app.js
	  	secret:       'keyboard cat',      //make sure is the same as in your session settings in app.js
	  	//store:        sessionStore,        //you need to use the same sessionStore you defined in the app.use(session({... in app.js
	  	store: new (require("connect-mongo")(session))({
    	url: "mongodb://localhost/session"
    	})
	}));

	io.on('connection', function(socket){ 
		connections++;
		console.log('connected', connections);
		io.sockets.emit('broadcast',{description: connections + ' jugadores conectados!'}); 	

		console.log(socket.request.user.username);
		//var userId = socket.request.session.passport.user;
        //console.log("Your User ID is", userId);

		socket.on('disconnect', function () {
			connections--;
			console.log('connected', connections);
			io.sockets.emit('broadcast',{description: connections + ' jugadores conectados!'});
		});
	});
}