var express = require("express");
var bodyParser = require("body-parser");
var User = require("./models/user").User;
//var session = require("express-session");
var cookieSession = require("cookie-session");
var router_app = require("./routes_app");
var session_middleware = require("./middlewares/session");

/* /app/imagenes/ */
var app = express();
/*
	TODO ESTO LO HAGO EN EL user.js POR ESO LO COMENTO.
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// Colecciones => tablas
// Documentos  => filas 

var userSchemaJSON = {
	email: String,
	password: String
};


var user_schema = new Schema(userSchemaJSON);

var User = mongoose.model("User", user_schema);
*/
app.use(express.static('public'));
app.use(bodyParser.json()); // Peticiones applications/json
app.use(bodyParser.urlencoded({extended: true}));
/*
app.use(session({
	secret: "trucounrc",
	resave: false,
	saveUninitialized: false
}));*/
app.use(cookieSession({
	/**/
	name: "session",
	keys: ["llave-1","llave-2"]
}));

app.set("view engine","jade");

// Metodo http GET / POST / PUT / PATCH / OPTIONS / HEADERS / DELETE
app.get("/", function(req,res){
	console.log(req.session.user_id);
	res.render("index");
});

app.get("/signup", function(req,res){
	User.find(function(err,doc){
		console.log(doc);
		res.render("signup");
	});
});

app.get("/login", function(req,res){
	res.render("login");
});

app.post("/users", function(req,res){

	var user = new User({email: req.body.email, 
						password: req.body.password,
						password_confirmation: req.body.password_confirmation	
					});
	//console.log(user.password_confirmation);
	// Metodo asincrono
	/* Callbacks
	user.save(function(err,user,numero){
		if(err){
			console.log(String(err));
		}
		res.send("Gracias, ya estás logueado y guardamos tus datos.");
	});
	*/
	// Promise, este metodo en lugar de recibir un callback
	// reotrna una promesa
	// La primera se ejecuta si todo salió bien, lo segundo si hay error.
	user.save().then(function(){
		res.send("Gracias por vender tu alma");
	}, function(err){
		if(err){
			console.log(String(err));
			res.send("No alcance a cagar tu alma");
		}
	})
});

app.post("/sessions", function(req,res){
	User.findOne({email: req.body.email ,password:req.body.password},function(err,user){
		req.session.user_id = user._id;
		res.redirect("/app");
		// _id , asignacion de mongo unica para la base de datos.		
	});
});

app.use("/app",session_middleware);
app.use("/app",router_app);

app.listen(8080);