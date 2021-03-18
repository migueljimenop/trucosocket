var express = require('express');
var passport = require('passport');
var router = express.Router();
var _ = require('lodash');
var User = require('../models/user');
var Game = require("../models/game").game;
var Player = require("../models/player").player;
var Round = require("../models/round").round;
var Card = require("../models/card").card;
var StateMachine = require("../node_modules/javascript-state-machine/dist/state-machine.js");

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { user : req.user });
});

// ===================================================================================================================
// ROUTER GET / POST LOGIN, IT'S WORKING.
router.get('/login', function(req, res) {
    res.render('login', { user : req.user });
});

router.post('/login', function(req, res) {
    User.findOne({ username : req.body.username}, function(err, user) {
        if (user === null){
            return res.render("login", { message: 'Usuario no registrado.'});
        }        
        else{
            if(user.connected){
                return res.render("login", { message: 'Usuario conectado.'});
            }
            if (user.password !== req.body.password) {
                return res.render("login", { message: 'Contraseña incorrecta.' });
            }        
            passport.authenticate('local')(req, res, function () {
                user.connected = true;
                user.save(function(){
                    if(err) { console.log(err);}
                });
                req.session.name = user.username;
                req.session._id = user._id;
                res.redirect('/truco');
            });
        }
    });
});

// ROUTER GET / POST REGISTER, IT'S WORKING.
router.get('/register',function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    User.register(new User({ username : req.body.username, password:req.body.password }), req.body.password, function(err, user) {
        if(err) {
            return res.render("register", { info: "Usuario ya registrado."});
        }else{
            if(err){
                return res.render("register", { info: 'Usuario o clave incorrecto.' });  
            }
            passport.authenticate('local')(req, res, function () {
                user.connected = true;
                user.save(function(){
                    if(err) { console.log(err);}
                });
                req.session.name = user.username;
                req.session._id = user._id;
                res.redirect('/truco');
            });
        }
    });
});

router.get('/truco',function(req, res){
  Player.findOne( {nickname: req.session.name}, function (err, player) {
      if (!err) {
        if (!player) {
        var player = new Player({
            playerid : req.session._id,
            nickname : req.session.name,
            cards: [],
            envidoPoints: 0
        });             
        player.save(function(err) {
            req.session.player = player;
            return res.render('truco',  {user: req.session.player.nickname });     
        });
          } else {  
            req.session.player = player;
            return res.render('truco',  {user: req.session.player.nickname });
          }
      }
  });  
});

router.post('/truco'), function(req,res) {  
  res.render('truco', {});
}

// ===================================================================================================================
// ROUTER GET / POST MYACC, WORKING.
router.get('/myacc', function(req, res){
    res.render('myacc', {user: req.user });
});

router.post('/myacc'), function(req,res) {
    res.render('myacc', { user: req.user } );
}

// ===================================================================================================================
// ROUTER GET LOGOUT / WORKING 
router.get('/logout', function(req, res) {
    User.findOne( { username : req.session.name}, function(err, user) {
        user.connected = false;
        user.save(function(){
            if(err) { console.log(err);}
        });
    });  
    req.session.destroy();  
    req.logout();
    res.redirect('/');
});


module.exports = router;

// ===================================================================================================================