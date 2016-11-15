var express = require('express'); // OK
var bodyParser = require('body-parser'); // OK
var User = require('./models/user'); // OK
var session = require("express-session"); // OK

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan'); 
var cookieParser = require('cookie-parser');
var mongoose = require('mongoose'); 
var passport = require('passport');
var flash = require('connect-flash');
var LocalStrategy = require('passport-local').Strategy;
var MongoStore = require('connect-mongo')(session);
var app = express();


var routes = require('./routes/index');
var users = require('./routes/users');

app.use(session({
  key: 'express.sid',
  url: 'mongodb://migueljimeno:trucoteam@ds023054.mlab.com:23054/truco-development',
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true     
}));

app.use(function(req,res,next){ 
  res.locals.login = req.isAuthenticated(); 
  res.locals.user = req.user; 
  next(); 
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
 
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use('/static', express.static('/public'));
app.use(express.static(__dirname + "/public/images"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
//app.use(connect.session({ secret: 'keyboard cat' })); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
//passport.serializeUser(User.serializeUser());
//passport.deserializeUser(User.deserializeUser());

// mongoose
//mongoose.promise = global.promise;
mongoose.connect('mongodb://migueljimeno:trucoteam@ds023054.mlab.com:23054/truco-development');


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
