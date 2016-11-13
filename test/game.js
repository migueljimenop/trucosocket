var utils = require('./utils');
var expect = require("chai").expect;
var playerModel = require("../models/player");
var gameModel   = require("../models/game");
var gameCard    = require("../models/card");

var Game = gameModel.game;
var Card = gameCard.card;
var Player = playerModel.player;

describe('Game', function(){
  var game = new Game();

  it('Should have two players', function(){
    expect(game).to.have.property('player1');
    expect(game).to.have.property('player2');
  });
});

describe('Game#play', function(){
  var game;
  beforeEach(function(){
    game = new Game({ currentHand: 'player1' });
    game.player1 = new Player({ nickname: 'J' });
    game.player2 = new Player({ nickname: 'X' });
    game.newRound();
    /*
    // Force to have the following cards and envidoPoints
    game.player1.setCards([
        new Card(1, 'copa'),
        new Card(7, 'oro'),
        new Card(2, 'oro')
    ]);

    game.player2.setCards([
        new Card(6, 'copa'),
        new Card(7, 'copa'),
        new Card(2, 'basto')
    ]);
        */
  });
    it('should save a game', function(done){
    var game = new Game({ currentHand: 'player1' });
    player1 = new Player({ nickname: 'J' });
    player2 = new Player({ nickname: 'X' });

    player1.save(function(err, player1) {
      if(err)
        done(err)
      game.player1 = player1;
      player2.save(function(err, player2) {
        if(err)
            done(err)
        game.player2 = player2;
        game.save(function(err, model){
          if(err)
            done(err)
            expect(model.player1.nickname).to.be.eq('J');
            expect(model.player2.nickname).to.be.eq('X');
            done();
            });
        })
    });
    });

/*
describe('Game#play', function(){
  var game;

  beforeEach(function(){
    game = new Game({ currentHand: 'player1' });
    game.player1 = new Player({ nickname: 'J' });
    game.player2 = new Player({ nickname: 'X' });
    game.newRound();
*/
    // Force to have the following cards and envidoPoints

  it('=============================================4', function(){

    console.log("*********** ronda 1 **********************");
   game.player1.setCards([
        new Card(4, 'oro'),
        new Card(3, 'basto'),
        new Card(4, 'basto')
    ]);    
    game.player2.setCards([
        new Card(5, 'copa'),
        new Card(1, 'copa'),
        new Card(6, 'espada')
    ]);
 
    game.play('player1', 'playcard','3-basto');

    //console.log(game.player1.cards[0].number + " " + game.player1.cards[0].suit);
    //console.log(game.player1.cards[1].number + " " + game.player1.cards[1].suit);
    //console.log(game.player1.cards[2].number + " " + game.player1.cards[2].suit); 

    game.play('player2', 'playcard','5-copa');

    game.play('player1', 'truco'); 
    game.play('player2', 'quiero');

    game.play('player1', 'playcard','4-oro'); 
    game.play('player2', 'playcard','6-espada');

    game.play('player2', 'playcard','1-copa'); 
    game.play('player1', 'playcard','4-basto');    

    console.log("score: "+ game.score);
    expect(game.score).to.deep.equal([0,2]);

    console.log("*********** ronda 2 **********************");

    game.newRound();
    game.player1.setCards([
        new Card(12, 'copa'),
        new Card(5, 'espada'),
        new Card(3, 'basto')
    ]);    
    game.player2.setCards([
        new Card(5, 'oro'),
        new Card(3, 'copa'),
        new Card(12, 'espada')
    ]);
    game.play('player2', 'playcard','3-copa'); 
    game.play('player1', 'playcard','5-espada');
    game.play('player2', 'playcard','5-oro'); 
    game.play('player1', 'playcard','3-basto');
    game.play('player1', 'playcard','12-copa');
    game.play('player2', 'playcard','12-espada');

    console.log("score: "+ game.score);
    expect(game.score).to.deep.equal([0,3]);

    console.log("*********** ronda 3 **********************");

    game.newRound();
    game.player1.setCards([
        new Card(4, 'copa'),
        new Card(6, 'basto'),
        new Card(3, 'basto')
    ]);    
    game.player2.setCards([
        new Card(5, 'espada'),
        new Card(3, 'copa'),
        new Card(4, 'espada')
    ]);

    game.play('player1', 'envido'); 
    game.play('player2', 'quiero'); 

    console.log("score: 1-3 "+ game.score);

    game.play('player1', 'playcard','4-copa'); 
    game.play('player2', 'playcard','5-espada');   

    game.play('player2', 'playcard','4-espada');
    game.play('player1', 'playcard','6-basto');

    console.log("turnWin: " + game.currentRound.turnWin);
    console.log("currentTurn : " + game.currentRound.currentTurn);
    console.log("bandera: " + game.currentRound.bandera);
    game.play('player1', 'truco'); 
    game.play('player2', 'quiero'); 

    game.play('player1', 'playcard','3-basto');
    game.play('player2', 'playcard','3-copa'); 
    

    console.log("score: "+ game.score);
    
    
    expect(game.score).to.deep.equal([0,7]);
//    game.newRound();
  //  game.play('player2', 'playcard','3-copa');



    console.log("*********** ronda 4 **********************");

    game.newRound();
    game.player1.setCards([
        new Card(12, 'copa'),
        new Card(5, 'espada'),
        new Card(3, 'basto')
    ]);    
    game.player2.setCards([
        new Card(5, 'oro'),
        new Card(3, 'copa'),
        new Card(12, 'espada')
    ]);
    game.play('player2', 'playcard','3-copa'); 
    game.play('player1', 'mazo');


    console.log("score: "+ game.score);
    expect(game.score).to.deep.equal([0,9]);

 
 

    console.log("*********** ronda 5 **********************");

    game.newRound();
    game.player1.setCards([
        new Card(4, 'copa'),
        new Card(6, 'basto'),
        new Card(3, 'basto')
    ]);    
    game.player2.setCards([
        new Card(5, 'espada'),
        new Card(3, 'copa'),
        new Card(4, 'espada')
    ]);

    game.play('player1', 'envido'); 
    game.play('player2', 'mazo'); 
    

    console.log("score: "+ game.score);
    
    
    expect(game.score).to.deep.equal([2,9]);



    console.log("*********** ronda 6 **********************");

    game.newRound();
    game.player1.setCards([
        new Card(12, 'copa'),
        new Card(5, 'espada'),
        new Card(3, 'basto')
    ]);    
    game.player2.setCards([
        new Card(5, 'oro'),
        new Card(3, 'copa'),
        new Card(12, 'espada')
    ]);

    game.play('player2', 'playcard','3-copa'); 
    game.play('player1', 'envido');

    game.play('player2', 'mazo'); 


    console.log("score: "+ game.score);
    expect(game.score).to.deep.equal([4,9]);

  console.log("*********** ronda 7 **********************");

    game.newRound();
    game.player1.setCards([
        new Card(4, 'copa'),
        new Card(6, 'basto'),
        new Card(3, 'basto')
    ]);    
    game.player2.setCards([
        new Card(5, 'espada'),
        new Card(3, 'copa'),
        new Card(4, 'espada')
    ]);

    game.play('player1', 'envido'); 
    game.play('player2', 'quiero'); 

    console.log("score: 1-3 "+ game.score);

    game.play('player1', 'playcard','4-copa'); 
    game.play('player2', 'mazo'); 
    
    console.log("score: "+ game.score);
    
    expect(game.score).to.deep.equal([6,11]);


  console.log("*********** ronda 8 **********************");

    game.newRound();
    game.player1.setCards([
        new Card(12, 'copa'),
        new Card(5, 'espada'),
        new Card(3, 'basto')
    ]);    
    game.player2.setCards([
        new Card(5, 'oro'),
        new Card(3, 'copa'),
        new Card(12, 'espada')
    ]);

    game.play('player2', 'playcard','3-copa');    
    game.play('player1', 'playcard','3-basto'); 
    game.play('player1', 'playcard','12-copa'); 
    //game.play('player2', 'playcard','5-oro'); 
    game.play('player2', 'mazo');
    

    console.log("score: "+ game.score);
    expect(game.score).to.deep.equal([7,11]);


  });
});
