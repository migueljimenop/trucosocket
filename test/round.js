var utils = require('./utils');
var expect = require("chai").expect;
var playerModel = require("../models/player");
var gameModel   = require("../models/game");
var roundModel   = require("../models/round");

var Game  = gameModel.game;
var Round = roundModel.round;
var Player = playerModel.player;

describe('Round', function(){
 var game;

  beforeEach(function(){
    game = new Game();
    game.player1 = new Player({ name: 'J' });
    game.player2 = new Player({ name: 'X' });
    game.newRound();
  });

  describe("#deal", function(){
    it("should populate player1 cards", function(){
      var round = new Round(game);
      round.deal();

      expect(game.player1.cards.length).to.be.equal(3);
    });

    it("should populate player2 cards", function(){
      var round = new Round(game);
      round.deal();

      expect(game.player2.cards.length).to.be.equal(3);
    });
  });
});
